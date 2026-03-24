/**
 * app.js — Main Application Controller
 * Manages state and wires together UI, Renderer, and Pathfinder
 */

const App = (() => {

  // ── App State ──────────────────────────────
  const state = {
    campus:      null,
    origin:      null,
    dest:        null,
    animProg:    0,
    cancelAnim:  null,
  };

  // ── Helpers ────────────────────────────────
  function findBuilding(id) {
    return BUILDINGS[state.campus]?.find(b => b.id === id);
  }

  function redraw() {
    Renderer.draw(state.campus, state.origin, state.dest, state.animProg);
  }

  function resize() {
    Renderer.resize(state.campus, state.origin, state.dest, state.animProg);
  }

  // ── Public: Screen Navigation ───────────────
  function goToScreen(id) {
    UI.showScreen(id);
  }

  // ── Public: Load a campus map ───────────────
  function loadMap(campus) {
    // Cancel any running animation
    if (state.cancelAnim) { state.cancelAnim(); state.cancelAnim = null; }

    state.campus   = campus;
    state.origin   = null;
    state.dest     = null;
    state.animProg = 0;

    UI.setTopbar(campus);
    UI.showScreen("map-screen");
    UI.resetAll();

    // Build overlays and chips
    UI.buildOverlays(campus, handleBuildingClick);
    UI.buildChips(campus, handleBuildingClick);

    // Setup resize handler
    window.removeEventListener("resize", window._appResize);
    window._appResize = () => resize();
    window.addEventListener("resize", window._appResize);

    // Wait for canvas to be in the DOM, then render
    setTimeout(() => {
      const img = Renderer.getImage(campus);
      if (img.complete && img.naturalWidth) {
        resize();
      } else {
        img.onload = () => resize();
      }
    }, 60);

    // Auto-set origin from QR code URL param
    const fromParam = new URLSearchParams(window.location.search).get("from");
    if (fromParam) {
      const match = BUILDINGS[campus]?.find(b => b.id === fromParam);
      if (match) setTimeout(() => setOrigin(fromParam), 500);
    }
  }

  // ── Building click handler ──────────────────
  function handleBuildingClick(id) {
    if (!state.origin) {
      setOrigin(id);
    } else if (id !== state.origin) {
      setDest(id);
    }
  }

  // ── Set origin building ─────────────────────
  function setOrigin(id) {
    if (state.cancelAnim) { state.cancelAnim(); state.cancelAnim = null; }

    state.origin   = id;
    state.dest     = null;
    state.animProg = 0;

    const b = findBuilding(id);
    UI.setStatus({
      dotOn: true,
      label: `You are at <strong>${b?.name ?? id}</strong>`,
      showChange: true,
    });
    UI.setChipsLabel("Where do you want to go?");
    UI.hideNavStrip();
    UI.hideDirections();
    UI.updateOverlayStates(state.campus, state.origin, null);
    UI.updateChipStates(state.campus, state.origin, null);
    redraw();
  }

  // ── Set destination building ────────────────
  function setDest(id) {
    if (state.cancelAnim) { state.cancelAnim(); state.cancelAnim = null; }

    state.dest     = id;
    state.animProg = 0;

    const ob = findBuilding(state.origin);
    const db = findBuilding(id);

    UI.showNavStrip(ob?.name ?? state.origin, db?.name ?? id);

    // Pathfinding + directions
    const path  = Pathfinder.findPath(state.origin, id, BUILDINGS[state.campus]);
    const steps = Pathfinder.buildSteps(path, BUILDINGS[state.campus]);
    UI.showDirections(steps);

    UI.updateOverlayStates(state.campus, state.origin, state.dest);
    UI.updateChipStates(state.campus, state.origin, state.dest);

    // Animate path
    state.cancelAnim = Renderer.animatePath(
      state.campus, state.origin, state.dest,
      (prog) => {
        state.animProg = prog;
        redraw();
      },
      () => { state.cancelAnim = null; }
    );
  }

  // ── Reset destination only ──────────────────
  function resetDest() {
    if (state.cancelAnim) { state.cancelAnim(); state.cancelAnim = null; }
    state.dest     = null;
    state.animProg = 0;
    UI.hideNavStrip();
    UI.hideDirections();
    UI.setChipsLabel("Where do you want to go?");
    UI.updateOverlayStates(state.campus, state.origin, null);
    UI.updateChipStates(state.campus, state.origin, null);
    redraw();
  }

  // ── Reset origin (full reset) ───────────────
  function resetOrigin() {
    if (state.cancelAnim) { state.cancelAnim(); state.cancelAnim = null; }
    state.origin   = null;
    state.dest     = null;
    state.animProg = 0;
    UI.resetAll();
    UI.updateOverlayStates(state.campus, null, null);
    UI.updateChipStates(state.campus, null, null);
    redraw();
  }

  // ── Init ────────────────────────────────────
  function init() {
    Renderer.preload();

    // Auto-load from QR param
    const fromParam = new URLSearchParams(window.location.search).get("from");
    if (fromParam) {
      const campus = BUILDINGS.campus2?.find(b => b.id === fromParam)
        ? "campus2"
        : "campus1";
      loadMap(campus);
    }
  }

  return { init, goToScreen, loadMap, resetDest, resetOrigin };
})();

// ── Bootstrap ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => App.init());

/**
 * ui.js — DOM / UI Management
 * Handles overlays, chips, bottom panel, directions display
 */

const UI = (() => {

  /* ── Screens ── */
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

  /* ── Top bar ── */
  function setTopbar(campus) {
    const info = CAMPUS_INFO[campus];
    document.getElementById("tb-campus").textContent = info.label;
    document.getElementById("tb-addr").textContent   = info.address;
  }

  /* ── Building hit overlays ── */
  function buildOverlays(campus, onClickFn) {
    const container = document.getElementById("map-container");
    container.querySelectorAll(".b-hit").forEach(el => el.remove());

    BUILDINGS[campus].forEach(b => {
      const hit = document.createElement("div");
      hit.className = "b-hit";
      hit.id = "hit-" + b.id;
      hit.innerHTML = `<div class="b-btn">${b.name}</div>`;
      hit.addEventListener("click", () => onClickFn(b.id));
      container.appendChild(hit);
    });
  }

  /* ── Chips ── */
  function buildChips(campus, onClickFn) {
    const scroll = document.getElementById("chips-scroll");
    scroll.innerHTML = "";
    BUILDINGS[campus].forEach(b => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.id = "chip-" + b.id;
      chip.textContent = b.name;
      chip.addEventListener("click", () => onClickFn(b.id));
      scroll.appendChild(chip);
    });
  }

  /* ── Overlay state styling ── */
  function updateOverlayStates(campus, originId, destId) {
    BUILDINGS[campus].forEach(b => {
      const el = document.getElementById("hit-" + b.id);
      if (!el) return;
      el.className = "b-hit";
      if (b.id === originId) el.classList.add("origin");
      if (b.id === destId)   el.classList.add("destination");
    });
  }

  function updateChipStates(campus, originId, destId) {
    BUILDINGS[campus].forEach(b => {
      const el = document.getElementById("chip-" + b.id);
      if (!el) return;
      el.className = "chip";
      if (b.id === originId) el.classList.add("is-origin");
      if (b.id === destId)   el.classList.add("is-dest");
    });
  }

  /* ── Status bar ── */
  function setStatus({ dotOn, label, showChange }) {
    document.getElementById("sdot").classList.toggle("on", dotOn);
    document.getElementById("slabel").innerHTML = label;
    document.getElementById("btn-change").style.display = showChange ? "inline-block" : "none";
  }

  /* ── Nav strip (from → to badges) ── */
  function showNavStrip(fromName, toName) {
    document.getElementById("nav-from").textContent = fromName;
    document.getElementById("nav-to").textContent   = toName;
    document.getElementById("nav-strip").classList.add("show");
  }

  function hideNavStrip() {
    document.getElementById("nav-strip").classList.remove("show");
  }

  /* ── Directions panel ── */
  function showDirections(steps) {
    const wrap  = document.getElementById("directions-wrap");
    const stepsEl = document.getElementById("dir-steps");
    stepsEl.innerHTML = "";

    steps.forEach((text, i) => {
      // Step row
      const row = document.createElement("div");
      row.className = "dir-step";
      row.innerHTML = `<div class="dir-num">${i + 1}</div><div>${text}</div>`;
      stepsEl.appendChild(row);

      // Arrow between steps
      if (i < steps.length - 1) {
        const arrow = document.createElement("div");
        arrow.className = "dir-step";
        arrow.innerHTML = `<div style="width:18px;text-align:center;color:#94a3b8;">↓</div><div style="color:#94a3b8;font-size:10px;">continue</div>`;
        stepsEl.appendChild(arrow);
      }
    });

    wrap.classList.add("show");
  }

  function hideDirections() {
    document.getElementById("directions-wrap").classList.remove("show");
  }

  /* ── Chips label ── */
  function setChipsLabel(text) {
    document.getElementById("chips-label").textContent = text;
  }

  /* ── Full reset ── */
  function resetAll() {
    setStatus({ dotOn: false, label: "Tap a building to set your location", showChange: false });
    hideNavStrip();
    hideDirections();
    setChipsLabel("Your location");
  }

  return {
    showScreen, setTopbar,
    buildOverlays, buildChips,
    updateOverlayStates, updateChipStates,
    setStatus, showNavStrip, hideNavStrip,
    showDirections, hideDirections,
    setChipsLabel, resetAll,
  };
})();

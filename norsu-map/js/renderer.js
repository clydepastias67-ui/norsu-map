/**
 * renderer.js — Canvas Map Drawing + Building Overlay Placement
 */

const Renderer = (() => {

  // Preloaded image cache
  const imgCache = {
    campus1: new Image(),
    campus2: new Image(),
  };

  function preload() {
    imgCache.campus1.src = CAMPUS_INFO.campus1.mapSrc;
    imgCache.campus2.src = CAMPUS_INFO.campus2.mapSrc;
  }

  /**
   * Calculate the rendered image rect inside the canvas (object-fit: contain logic)
   */
  function getRect(campus) {
    const canvas = document.getElementById("map-canvas");
    const img = imgCache[campus];
    const W = canvas.width, H = canvas.height;
    if (!img.naturalWidth) return { ox: 0, oy: 0, rw: W, rh: H };
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = W / H;
    let rw, rh, ox, oy;
    if (ir > cr) { rw = W; rh = W / ir; ox = 0; oy = (H - rh) / 2; }
    else         { rh = H; rw = H * ir; ox = (W - rw) / 2; oy = 0; }
    return { ox, oy, rw, rh };
  }

  /**
   * Position building overlay hit areas flush with buildings on the map
   */
  function placeOverlays(campus) {
    const r = getRect(campus);
    BUILDINGS[campus].forEach(b => {
      const el = document.getElementById("hit-" + b.id);
      if (!el) return;
      const cx = r.ox + (b.x + b.w / 2) / 100 * r.rw;
      const cy = r.oy + (b.y + b.h / 2) / 100 * r.rh;
      el.style.left      = cx + "px";
      el.style.top       = cy + "px";
      el.style.transform = "translate(-50%, -50%)";
      el.style.width     = (b.w / 100 * r.rw) + "px";
      el.style.height    = (b.h / 100 * r.rh) + "px";
    });
  }

  /**
   * Draw map image + optional animated path on canvas
   */
  function draw(campus, originId, destId, animProgress) {
    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = imgCache[campus];
    if (!img.complete || !img.naturalWidth) return;

    const r = getRect(campus);
    ctx.drawImage(img, r.ox, r.oy, r.rw, r.rh);

    if (originId && destId && animProgress > 0) {
      _drawPath(ctx, r, campus, originId, destId, animProgress);
    }
  }

  function _center(campus, id, r) {
    const b = BUILDINGS[campus].find(x => x.id === id);
    if (!b) return null;
    return {
      x: r.ox + (b.x + b.w / 2) / 100 * r.rw,
      y: r.oy + (b.y + b.h / 2) / 100 * r.rh,
    };
  }

  function _drawPath(ctx, r, campus, originId, destId, animProgress) {
    const A = _center(campus, originId, r);
    const B = _center(campus, destId, r);
    if (!A || !B) return;

    // L-shaped waypoint path
    const pts = [A, { x: A.x, y: B.y }, B];

    // Total length
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      total += Math.sqrt(dx*dx + dy*dy);
    }
    const drawLen = total * Math.min(animProgress, 1);

    const trace = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      let d = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
        const seg = Math.sqrt(dx*dx + dy*dy);
        if (d + seg >= drawLen) {
          const t = (drawLen - d) / seg;
          ctx.lineTo(pts[i-1].x + dx*t, pts[i-1].y + dy*t);
          return;
        }
        ctx.lineTo(pts[i].x, pts[i].y);
        d += seg;
      }
    };

    // Drop shadow
    trace();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.setLineDash([]); ctx.stroke();

    // White outline
    trace();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 6; ctx.setLineDash([]); ctx.stroke();

    // Gold dashes
    trace();
    ctx.strokeStyle = "#f5c518";
    ctx.lineWidth = 3.5; ctx.setLineDash([9, 5]); ctx.stroke();
    ctx.setLineDash([]);

    // Pins
    _pin(ctx, A.x, A.y, "#16a34a");
    if (animProgress >= 1) _pin(ctx, B.x, B.y, "#dc2626");
  }

  function _pin(ctx, x, y, color) {
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
  }

  /**
   * Resize canvas to container and redraw
   */
  function resize(campus, originId, destId, animProgress) {
    const container = document.getElementById("map-container");
    const canvas    = document.getElementById("map-canvas");
    canvas.width    = container.clientWidth;
    canvas.height   = container.clientHeight;
    placeOverlays(campus);
    draw(campus, originId, destId, animProgress);
  }

  /**
   * Animated path draw — returns a cancel function
   */
  function animatePath(campus, originId, destId, onProgress, onDone) {
    let progress = 0;
    let running = true;
    const step = () => {
      if (!running) return;
      progress += 0.028;
      onProgress(Math.min(progress, 1));
      if (progress < 1) requestAnimationFrame(step);
      else { running = false; onDone && onDone(); }
    };
    requestAnimationFrame(step);
    return () => { running = false; };
  }

  function getImage(campus) { return imgCache[campus]; }

  return { preload, getRect, placeOverlays, draw, resize, animatePath, getImage };
})();

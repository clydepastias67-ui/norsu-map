/**
 * findPath — BFS shortest path between two building IDs.
 */
function findPath(fromId, toId, buildings) {
  if (fromId === toId) return [fromId];
  const queue   = [[fromId]];
  const visited = new Set([fromId]);
  while (queue.length) {
    const path = queue.shift();
    const cur  = path[path.length - 1];
    const node = buildings.find(b => b.id === cur);
    if (!node) continue;
    for (const nb of (node.neighbors || [])) {
      if (visited.has(nb)) continue;
      const newPath = [...path, nb];
      if (nb === toId) return newPath;
      visited.add(nb);
      queue.push(newPath);
    }
  }
  return [];   // no path — caller handles this
}

const App = (() => {
  let currentCampus = null;

  // ── Navigation ────────────────────────────────────────────────────────

  function goTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  // ── Campus loading ────────────────────────────────────────────────────

  function loadCampus(campusKey) {
    currentCampus = campusKey;
    const info = CAMPUS_INFO[campusKey];
    document.getElementById('tb-campus').textContent = info.label;
    document.getElementById('tb-addr').textContent   = info.address;

    const img = document.getElementById('map-img');
    img.src = info.img;
    rebuildSvg();   // viewBox is now % based, no need to wait for image load

    populateSelects(campusKey);
    clearRoute();
    goTo('map-screen');
  }

  function populateSelects(campusKey) {
    const buildings = BUILDINGS[campusKey];
    ['sel-from','sel-to'].forEach(selId => {
      const sel  = document.getElementById(selId);
      const ph   = selId === 'sel-from' ? 'Select starting building…' : 'Select destination…';
      sel.innerHTML = `<option value="">${ph}</option>`;
      sel.className = 'sel-select';
      buildings.forEach(b => {
        const o = document.createElement('option');
        o.value = b.id; o.textContent = b.name;
        sel.appendChild(o);
      });
    });
  }

  // ── SVG overlay ───────────────────────────────────────────────────────

  function getSvg() { return document.getElementById('map-svg'); }

  function rebuildSvg() {
    const svg = getSvg();
    // Use a simple 100x100 viewBox — pos values are already percentages
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
  }

  /**
   * Convert a building's [x%, y%] pos directly to SVG units (0–100 space).
   */
  function toSvgPt(pos) {
    return [pos[0], pos[1]];
  }

  function drawRoute(path, buildings) {
    const svg = getSvg();
    // Clear previous drawings
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    if (!path || path.length < 2) return;

    const pts = path.map(id => {
      const b = buildings.find(x => x.id === id);
      return b ? toSvgPt(b.pos) : null;
    }).filter(Boolean);

    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');

    // ── Shadow / glow ─────────────────────────────────────────────────
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glow.setAttribute('d', d);
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', 'rgba(0,0,0,0.25)');
    glow.setAttribute('stroke-width', '10');
    glow.setAttribute('stroke-linecap', 'round');
    glow.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(glow);

    // ── Main animated line ────────────────────────────────────────────
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', d);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#f5c518');
    line.setAttribute('stroke-width', '7');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(line);
    // Estimate path length in 0-100 space for dash animation
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i-1][0];
      const dy = pts[i][1] - pts[i-1][1];
      len += Math.sqrt(dx*dx + dy*dy);
    }

    line.setAttribute('stroke-dasharray', len);
    line.setAttribute('stroke-dashoffset', len);
    line.style.transition = 'none';
    // Force reflow then animate
    line.getBoundingClientRect();
    line.style.transition = `stroke-dashoffset ${Math.min(2.5, 0.4 + pts.length * 0.3)}s ease-in-out`;
    line.setAttribute('stroke-dashoffset', '0');

    // ── Node dots ─────────────────────────────────────────────────────
    pts.forEach(([cx, cy], i) => {
      const isEnd   = i === pts.length - 1;
      const isStart = i === 0;
      const color   = isStart ? '#16a34a' : isEnd ? '#dc2626' : '#f5c518';
      const r       = isStart || isEnd ? 18 : 10;

      // White border
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', cx); ring.setAttribute('cy', cy);
      ring.setAttribute('r', r + 4);
      ring.setAttribute('fill', '#fff');
      ring.setAttribute('opacity', '0.85');
      svg.appendChild(ring);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
      dot.setAttribute('r', r);
      dot.setAttribute('fill', color);
      svg.appendChild(dot);
    });

    // ── Moving dot (travels along path) ──────────────────────────────
    const traveller = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    traveller.setAttribute('r', '13');
    traveller.setAttribute('fill', '#fff');
    traveller.setAttribute('stroke', '#f5c518');
    traveller.setAttribute('stroke-width', '4');
    svg.appendChild(traveller);

    const dur = Math.min(2500, 400 + pts.length * 300);
    let start = null;
    function animTraveller(ts) {
      if (!start) start = ts;
      const t   = Math.min((ts - start) / dur, 1);
      const idx = Math.floor(t * (pts.length - 1));
      const frac = t * (pts.length - 1) - idx;
      const a = pts[Math.min(idx, pts.length - 1)];
      const b = pts[Math.min(idx + 1, pts.length - 1)];
      const x = a[0] + (b[0] - a[0]) * frac;
      const y = a[1] + (b[1] - a[1]) * frac;
      traveller.setAttribute('cx', x);
      traveller.setAttribute('cy', y);
      if (t < 1) requestAnimationFrame(animTraveller);
      else {
        // Park at end dot
        traveller.setAttribute('cx', pts[pts.length - 1][0]);
        traveller.setAttribute('cy', pts[pts.length - 1][1]);
      }
    }
    requestAnimationFrame(animTraveller);
  }

  function clearSvg() {
    const svg = getSvg();
    if (svg) while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  // ── Select handlers ───────────────────────────────────────────────────

  function onFromChange() {
    const sel = document.getElementById('sel-from');
    sel.className = 'sel-select' + (sel.value ? ' has-val from' : '');
    updateGoBtn(); hideRoute();
  }

  function onToChange() {
    const sel = document.getElementById('sel-to');
    sel.className = 'sel-select' + (sel.value ? ' has-val to' : '');
    updateGoBtn(); hideRoute();
  }

  function updateGoBtn() {
    const from = document.getElementById('sel-from').value;
    const to   = document.getElementById('sel-to').value;
    document.getElementById('btn-go').disabled = !(from && to && from !== to);
  }

  // ── Route logic ───────────────────────────────────────────────────────

  function getDirections() {
    const fromId = document.getElementById('sel-from').value;
    const toId   = document.getElementById('sel-to').value;
    if (!fromId || !toId || fromId === toId) return;

    const buildings = BUILDINGS[currentCampus];
    const path      = findPath(fromId, toId, buildings);

    if (!path.length) {
      alert('No pathway found between these two buildings.');
      return;
    }

    renderRoute(path, buildings);
    drawRoute(path, buildings);
  }

  function renderRoute(path, buildings) {
    const container = document.getElementById('route-path');
    container.innerHTML = path.map((id, i) => {
      const name  = buildings.find(b => b.id === id)?.name ?? id;
      const cls   = i === 0 ? 'start' : i === path.length - 1 ? 'end' : '';
      const arrow = i < path.length - 1 ? '<span class="rarr">→</span>' : '';
      return `<span class="rnode ${cls}">${name}</span>${arrow}`;
    }).join('');
    document.getElementById('route-wrap').classList.add('show');
  }

  function hideRoute() {
    document.getElementById('route-wrap').classList.remove('show');
    clearSvg();
  }

  function clearRoute() {
    document.getElementById('sel-from').value     = '';
    document.getElementById('sel-to').value       = '';
    document.getElementById('sel-from').className = 'sel-select';
    document.getElementById('sel-to').className   = 'sel-select';
    document.getElementById('btn-go').disabled    = true;
    hideRoute();
  }

  return { goTo, loadCampus, onFromChange, onToChange, getDirections, clearRoute };
})();
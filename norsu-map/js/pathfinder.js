/**
 * pathfinder.js — BFS Pathfinding + Human-readable Directions
 */

const Pathfinder = (() => {

  /**
   * BFS shortest path between two building IDs
   * @param {string} fromId
   * @param {string} toId
   * @param {Array}  buildings — array from BUILDINGS[campus]
   * @returns {string[]} ordered array of building IDs
   */
  function findPath(fromId, toId, buildings) {
    if (fromId === toId) return [fromId];

    const queue = [[fromId]];
    const visited = new Set([fromId]);

    while (queue.length) {
      const path = queue.shift();
      const current = path[path.length - 1];
      const node = buildings.find(b => b.id === current);
      if (!node) continue;

      for (const neighborId of (node.neighbors || [])) {
        if (visited.has(neighborId)) continue;
        const newPath = [...path, neighborId];
        if (neighborId === toId) return newPath;
        visited.add(neighborId);
        queue.push(newPath);
      }
    }

    // Fallback: direct hop if no path found
    return [fromId, toId];
  }

  /**
   * Convert a path array into human-readable step strings (HTML)
   * @param {string[]} path
   * @param {Array}    buildings
   * @returns {string[]} array of HTML strings
   */
  function buildSteps(path, buildings) {
    const name = id => {
      const b = buildings.find(x => x.id === id);
      return b ? b.name : id;
    };

    if (path.length <= 1) return ["You are already here!"];

    const steps = [];
    steps.push(`Start at <strong>${name(path[0])}</strong>`);

    for (let i = 1; i < path.length; i++) {
      if (i === path.length - 1) {
        steps.push(`Arrive at <strong>${name(path[i])}</strong> 📍`);
      } else {
        steps.push(`Pass by <strong>${name(path[i])}</strong>`);
      }
    }

    return steps;
  }

  return { findPath, buildSteps };
})();

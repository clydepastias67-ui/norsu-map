/**
 * data.js — NORSU Campus Building Data
 * x, y, w, h are percentages of the map image dimensions
 * neighbors define which buildings are directly connected (for pathfinding)
 */

const CAMPUS_INFO = {
  campus1: {
    label: "MAIN CAMPUS 1",
    address: "Kagawasan Avenue, Dumaguete City",
    mapSrc: "assets/campus1.png",
  },
  campus2: {
    label: "MAIN CAMPUS 2",
    address: "Brgy. Bajumpandan, Dumaguete City",
    mapSrc: "assets/campus2.png",
  },
};

const BUILDINGS = {
  campus1: [
    {
      id: "main-gate", name: "Main Gate",
      x: 32, y: 13, w: 13, h: 7,
      neighbors: ["admin", "cas", "cthm"],
    },
    {
      id: "cas", name: "CAS Building",
      x: 46, y: 5, w: 29, h: 16,
      neighbors: ["main-gate", "megatronics", "courts", "admin"],
    },
    {
      id: "megatronics", name: "Megatronics Building",
      x: 70, y: 14, w: 11, h: 22,
      neighbors: ["cas", "gate2", "st"],
    },
    {
      id: "gate2", name: "Gate 2",
      x: 89, y: 28, w: 9, h: 8,
      neighbors: ["megatronics", "st"],
    },
    {
      id: "cthm", name: "CTHM Building",
      x: 14, y: 22, w: 19, h: 14,
      neighbors: ["main-gate", "gate4", "gym"],
    },
    {
      id: "admin", name: "Admin Building",
      x: 32, y: 20, w: 13, h: 13,
      neighbors: ["main-gate", "gym", "cas"],
    },
    {
      id: "gate4", name: "Gate 4",
      x: 2, y: 28, w: 9, h: 8,
      neighbors: ["cthm", "cba"],
    },
    {
      id: "courts", name: "Basketball / Volleyball Courts",
      x: 47, y: 28, w: 16, h: 17,
      neighbors: ["cas", "gym", "motorpool"],
    },
    {
      id: "gym", name: "GYM",
      x: 22, y: 34, w: 22, h: 23,
      neighbors: ["cthm", "admin", "pe-office", "cba", "courts"],
    },
    {
      id: "motorpool", name: "Motorpool",
      x: 56, y: 43, w: 13, h: 12,
      neighbors: ["courts", "pe-office", "canteen"],
    },
    {
      id: "st", name: "ST Building",
      x: 77, y: 41, w: 12, h: 20,
      neighbors: ["megatronics", "gate2", "cit"],
    },
    {
      id: "cba", name: "CBA Building",
      x: 3, y: 44, w: 12, h: 22,
      neighbors: ["gate4", "gym", "cnpahs"],
    },
    {
      id: "pe-office", name: "PE / Cultural & Sports",
      x: 28, y: 52, w: 21, h: 9,
      neighbors: ["gym", "motorpool", "cnpahs"],
    },
    {
      id: "canteen", name: "Canteen",
      x: 57, y: 54, w: 11, h: 11,
      neighbors: ["motorpool", "cit"],
    },
    {
      id: "cnpahs", name: "CNPAHS Building",
      x: 16, y: 56, w: 27, h: 13,
      neighbors: ["cba", "pe-office"],
    },
    {
      id: "cit", name: "CIT Building",
      x: 64, y: 54, w: 13, h: 22,
      neighbors: ["canteen", "st", "sas", "psychology"],
    },
    {
      id: "psychology", name: "Psychology Building",
      x: 77, y: 58, w: 14, h: 22,
      neighbors: ["st", "cit", "cted", "gate3"],
    },
    {
      id: "sas", name: "SAS Hall / Career Center",
      x: 57, y: 64, w: 12, h: 12,
      neighbors: ["cit", "cted"],
    },
    {
      id: "cted", name: "CTED Building",
      x: 57, y: 74, w: 13, h: 14,
      neighbors: ["sas", "psychology", "gate3"],
    },
    {
      id: "gate3", name: "Gate 3",
      x: 84, y: 84, w: 10, h: 9,
      neighbors: ["psychology", "cted"],
    },
  ],

  campus2: [
    {
      id: "ccje-a", name: "CCJE Building",
      x: 2, y: 9, w: 22, h: 27,
      neighbors: ["ccje-b", "canteen"],
    },
    {
      id: "ccje-b", name: "CCJE Building (B)",
      x: 2, y: 37, w: 20, h: 20,
      neighbors: ["ccje-a", "mechanical", "aviation"],
    },
    {
      id: "mechanical", name: "Mechanical Engineering",
      x: 2, y: 57, w: 20, h: 18,
      neighbors: ["ccje-b", "cea", "aviation"],
    },
    {
      id: "cea", name: "CEA Building",
      x: 2, y: 75, w: 20, h: 21,
      neighbors: ["mechanical", "guardhouse"],
    },
    {
      id: "canteen", name: "Canteen",
      x: 23, y: 5, w: 15, h: 18,
      neighbors: ["ccje-a", "cit", "aviation"],
    },
    {
      id: "cit", name: "CIT Building",
      x: 40, y: 2, w: 29, h: 17,
      neighbors: ["canteen", "maritime", "aviation"],
    },
    {
      id: "maritime", name: "Old Maritime Building",
      x: 82, y: 2, w: 16, h: 17,
      neighbors: ["cit", "st"],
    },
    {
      id: "aviation", name: "CCJE/P.E/Aviation Building",
      x: 30, y: 22, w: 45, h: 38,
      neighbors: ["canteen", "cit", "aviation-area", "ccje-b", "mechanical", "st"],
    },
    {
      id: "aviation-area", name: "Aviation Working Area",
      x: 43, y: 59, w: 19, h: 12,
      neighbors: ["aviation", "stage", "open-field"],
    },
    {
      id: "st", name: "ST Building",
      x: 80, y: 27, w: 18, h: 43,
      neighbors: ["maritime", "aviation"],
    },
    {
      id: "stage", name: "Stage",
      x: 43, y: 73, w: 15, h: 8,
      neighbors: ["aviation-area", "open-field"],
    },
    {
      id: "open-field", name: "Open Field",
      x: 32, y: 79, w: 37, h: 14,
      neighbors: ["stage", "aviation-area"],
    },
    {
      id: "guardhouse", name: "Guard House",
      x: 19, y: 88, w: 8, h: 7,
      neighbors: ["cea", "main-gate"],
    },
    {
      id: "main-gate", name: "Main Gate",
      x: 28, y: 92, w: 12, h: 6,
      neighbors: ["guardhouse", "open-field"],
    },
  ],
};

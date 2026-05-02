const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  day: document.getElementById("day"),
  cash: document.getElementById("cash"),
  trips: document.getElementById("trips"),
  score: document.getElementById("score"),
  stress: document.getElementById("stress"),
  hudToast: document.getElementById("hudToast"),
  buyBridgeBtn: document.getElementById("buyBridgeBtn"),
  buyCarriageBtn: document.getElementById("buyCarriageBtn"),
  buyEngineBtn: document.getElementById("buyEngineBtn"),
  buyLineBtn: document.getElementById("buyLineBtn"),
  shopBtn: document.getElementById("shopBtn"),
  shopModal: document.getElementById("shopModal"),
  closeShopBtn: document.getElementById("closeShopBtn"),
  inventoryBridgeBtn: document.getElementById("inventoryBridgeBtn"),
  inventoryCarriageBtn: document.getElementById("inventoryCarriageBtn"),
  inventoryEngineBtn: document.getElementById("inventoryEngineBtn"),
  inventoryLineBtn: document.getElementById("inventoryLineBtn"),
  bridgeCount: document.getElementById("bridgeCount"),
  carriageCount: document.getElementById("carriageCount"),
  engineCount: document.getElementById("engineCount"),
  lineCount: document.getElementById("lineCount"),
  linePicker: document.getElementById("linePicker"),
  speedPicker: document.getElementById("speedPicker"),
  pauseBtn: document.getElementById("pauseBtn"),
  restartBtn: document.getElementById("restartBtn"),
  musicToggleBtn: document.getElementById("musicToggleBtn"),
  bgMusic: document.getElementById("bgMusic"),
  startModal: document.getElementById("startModal"),
  startBtn: document.getElementById("startBtn"),
  playerNameInput: document.getElementById("playerNameInput"),
  playerNameHint: document.getElementById("playerNameHint"),
  leaderboardStatus: document.getElementById("leaderboardStatus"),
  leaderboardList: document.getElementById("leaderboardList"),
  resultsModal: document.getElementById("resultsModal"),
  resultScore: document.getElementById("resultScore"),
  resultPassengers: document.getElementById("resultPassengers"),
  resultRevenue: document.getElementById("resultRevenue"),
  resultDays: document.getElementById("resultDays"),
  resultsRestartBtn: document.getElementById("resultsRestartBtn"),
  resultsLeaderboardStatus: document.getElementById("resultsLeaderboardStatus"),
  resultsLeaderboardList: document.getElementById("resultsLeaderboardList"),
};

const AIRPORT_SHAPE = "star";
const PORT_SHAPE = "hexagon";
const REGULAR_SHAPES = ["circle", "triangle", "square", "diamond", "plus"];
const SHAPES = [...REGULAR_SHAPES, AIRPORT_SHAPE, PORT_SHAPE];
const LINE_COLORS = ["#e5524d", "#0d9fb3", "#1f9d72", "#d8a21b", "#6c5ce7", "#202124", "#db3a7b", "#5f6f52"];
const STARTING_LINE_COUNT = 2;
const ITEM_PRICES = {
  bridge: 80,
  carriage: 200,
  engine: 240,
  line: 300,
};
const EARLY_DAILY_PRICE_INCREASE = 3;
const MID_DAILY_PRICE_INCREASE = 6;
const LATE_DAILY_PRICE_INCREASE = 10;
const CARRIAGE_OWNED_SURCHARGE = 12;
const ENGINE_OWNED_SURCHARGE = 20;
const LINE_OWNED_SURCHARGE = 45;
const OPERATING_COST_TRIP_INTERVAL = 50;
const ENGINE_OPERATING_COST = 8;
const CARRIAGE_OPERATING_COST = 4;
const ENGINE_CAPACITY = 6;
const CARRIAGE_CAPACITY = 6;
const RAW_STARTER_STATIONS = [
  { x: 0.22, y: 0.28, shape: "circle" },
  { x: 0.46, y: 0.38, shape: "triangle" },
  { x: 0.54, y: 0.28, shape: "square" },
  { x: 0.34, y: 0.68, shape: "diamond" },
  { x: 0.64, y: 0.66, shape: "circle" },
];
const SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "Normal", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];
const BASE_GAME_SPEED = 0.7;
const STATION_CAPACITY = 10;
const MAX_STRESS = 100;
const STRESS_WARNING_LOAD = 0.4;
const STRESS_RISE_RATE = 8;
const STRESS_FALL_RATE = 4;
const TRAIN_SPEED = 145;
const MAX_CAMERA_ZOOM = 2.8;
const SHARP_TURN_ANGLE = Math.PI / 2;
const SHORE_MARGIN = 0.035;
const STATION_LAND_RADIUS = 0.045;
const LINE_GRAB_RADIUS = 16;
const ROUTE_WATER_CLEARANCE = 0.018;
const SEA_COLOR = "#dceff2";
const INLAND_WATER_COLOR = "#86c9d8";
const WATER_GRID = 0.08;
const GRID_SIZE = 64;
const WORLD_SCALE = GRID_SIZE / WATER_GRID;
const WATER_RADIUS = 12;
const INLAND_WATER_RATIO_MIN = 0.035;
const INLAND_WATER_RATIO_MAX = 0.21;
const MAP_EXPAND_FACTOR = 1.12;
const AIRPORT_DAY_VARIANCE = 2;
const FIRST_AIRPORT_DAY = 15;
const AIRPORT_DAY_INTERVAL = 9;
const AIRPORT_DROP_MIN = 15;
const AIRPORT_DROP_MAX = 20;
const AIRPORT_ARRIVAL_MIN = 72;
const AIRPORT_ARRIVAL_MAX = 126;
const AIRPORT_APPROACH_DURATION = 3.2;
const AIRPORT_CAPACITY = 24;
const AIRPORT_STRESS_MULTIPLIER = 0.55;
const FIRST_PORT_DAY = 20;
const PORT_DAY_VARIANCE = 3;
const PORT_DAY_INTERVAL = 13;
const PORT_DROP_MIN = AIRPORT_DROP_MIN * 2;
const PORT_DROP_MAX = AIRPORT_DROP_MAX * 2;
const PORT_ARRIVAL_MIN = 94;
const PORT_ARRIVAL_MAX = 156;
const PORT_APPROACH_DURATION = 5.4;
const PORT_CAPACITY = 40;
const PORT_STRESS_MULTIPLIER = 0.42;
const PORT_SHORE_MIN = 0.02;
const PORT_SHORE_MAX = 0.065;
const PORT_LAND_RADIUS = 0.02;
const PORT_SHORE_MARGIN = 0.008;
const DEBUG_START_DAY = 1;
const DAY_START_HOUR = 7;
const NIGHT_START_PROGRESS = 0.617;
const MAX_NIGHT_DIM = 0.575;
const LEADERBOARD_TABLE = "leaderboard_entries";
const LEADERBOARD_LIMIT = 10;
const PLAYER_NAME_MAX = 24;
const PLAYER_NAME_STORAGE_KEY = "tinytransit.playerName";
const MUSIC_ENABLED_STORAGE_KEY = "tinytransit.musicEnabled";
const STARTER_STATIONS = RAW_STARTER_STATIONS.map((station) => ({
  ...station,
  ...snapTerrainPointToGrid(station.x, station.y, { west: 0, north: 0, south: 0 }),
}));
const STARTER_ROUTE_SEGMENTS = [
  [STARTER_STATIONS[0], STARTER_STATIONS[1]],
  [STARTER_STATIONS[1], STARTER_STATIONS[2]],
  [STARTER_STATIONS[3], STARTER_STATIONS[1]],
  [STARTER_STATIONS[1], STARTER_STATIONS[4]],
];

let state;
let lastTime = performance.now();
let pointer = { x: 0, y: 0, worldX: 0, worldY: 0, stationId: null };
let camera = { zoom: 1, x: 0, y: 0 };
let speedMultiplier = 1;
let routeDrag = null;
let trainDrag = null;
let panDrag = null;
let touchGesture = null;
let activeTouchPoints = new Map();
let disconnectMenu = null;
let supabaseClient = null;
let leaderboardReady = false;
let leaderboardEntries = [];
let musicEnabled = loadStoredMusicEnabled();
let hudToastTimer = null;
let shopPausedGame = false;

function isTouchPointer(event) {
  return event.pointerType === "touch";
}

function loadStoredMusicEnabled() {
  try {
    const stored = localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function storeMusicEnabled() {
  try {
    localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, String(musicEnabled));
  } catch {
    // Ignore storage failures and keep the current session preference.
  }
}

function resetMusic() {
  if (!ui.bgMusic) return;
  ui.bgMusic.pause();
  ui.bgMusic.currentTime = 0;
}

function iconMarkup(iconId) {
  return `<svg class="btn-icon" aria-hidden="true"><use href="#${iconId}"></use></svg>`;
}

function speedIconId(value) {
  if (value === 0.5) return "icon-speed-half";
  if (value === 1) return "icon-speed-1";
  if (value === 2) return "icon-speed-2";
  return "icon-speed-4";
}

function itemIconId(item) {
  if (item === "bridge") return "icon-bridge";
  if (item === "carriage") return "icon-carriage";
  if (item === "engine") return "icon-engine";
  return "icon-line";
}

function updateMusicToggle() {
  if (!ui.musicToggleBtn) return;
  ui.musicToggleBtn.innerHTML = iconMarkup(musicEnabled ? "icon-music" : "icon-muted");
  ui.musicToggleBtn.setAttribute("aria-pressed", musicEnabled ? "true" : "false");
  ui.musicToggleBtn.setAttribute("aria-label", musicEnabled ? "Music on" : "Music off");
  ui.musicToggleBtn.title = musicEnabled ? "Music on" : "Music off";
  ui.musicToggleBtn.classList.toggle("active", musicEnabled);
}

function syncMusicPlayback() {
  if (!ui.bgMusic) return;
  ui.bgMusic.volume = 0.42;
  updateMusicToggle();
  if (musicEnabled && state.started && !state.paused && !state.gameOver) {
    ui.bgMusic.play().catch(() => {});
  } else {
    ui.bgMusic.pause();
  }
}

function showHudToast(message, duration = 2600) {
  if (!ui.hudToast) return;
  ui.hudToast.textContent = message;
  ui.hudToast.classList.remove("hidden");
  if (hudToastTimer) window.clearTimeout(hudToastTimer);
  hudToastTimer = window.setTimeout(() => {
    ui.hudToast.classList.add("hidden");
  }, duration);
}

function resetGame() {
  const terrain = createTerrain();
  disconnectMenu = null;
  shopPausedGame = false;
  resetMusic();
  updateMusicToggle();
  speedMultiplier = 1;
  state = {
    activeLine: 0,
    paused: false,
    gameOver: false,
    started: false,
    resultsShown: false,
    scoreSubmitted: false,
    elapsed: (DEBUG_START_DAY - 1) * 35,
    day: DEBUG_START_DAY,
    cash: 0,
    trips: 0,
    nextOperatingCostTrip: OPERATING_COST_TRIP_INTERVAL,
    score: 0,
    stress: 0,
    playerName: loadStoredPlayerName(),
    selectedItem: null,
    inventory: {
      bridges: 0,
      carriages: 0,
      engines: 0,
      lines: 0,
    },
    bridges: [],
    map: {
      west: 0,
      north: 0,
      south: 0,
    },
    spawnTimer: 0,
    stationTimer: 0,
    nextAirportDay: randomInt(
      Math.max(1, FIRST_AIRPORT_DAY - AIRPORT_DAY_VARIANCE),
      FIRST_AIRPORT_DAY + AIRPORT_DAY_VARIANCE
    ),
    nextPortDay: FIRST_PORT_DAY,
    lastPortAttemptDay: 0,
    inlandWaterRatio: terrain.inlandWaterRatio,
    coastline: terrain.coastline,
    waterBodies: terrain.waterBodies,
    stations: [],
    planeArrivals: [],
    shipArrivals: [],
    lines: LINE_COLORS.slice(0, STARTING_LINE_COUNT).map((color, index) => ({
      id: index,
      name: `Line ${index + 1}`,
      color,
      closed: false,
      stops: [],
      segmentVariants: {},
      trains: [],
    })),
  };

  STARTER_STATIONS.forEach((station) => addStation(station.x, station.y, station.shape));
  state.lines[0].stops.push(0, 1, 2);
  state.lines[1].stops.push(3, 1, 4);
  addTrain(state.lines[0]);
  addTrain(state.lines[1]);
  state.lines.forEach(syncTrains);
  fitCameraToMap();
  renderLinePicker();
  renderSpeedPicker();
  renderShopButtons();
  renderLeaderboard();
  setLeaderboardStatus(leaderboardReady ? "Ready" : "Offline");
  if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = leaderboardReady ? "Ready" : "Offline";
  if (ui.playerNameInput) ui.playerNameInput.value = state.playerName;
  setPlayerNameHint("Choose a name for the leaderboard.");
  updateUI();
  ui.startModal.classList.remove("hidden");
  ui.resultsModal.classList.add("hidden");
  ui.shopModal?.classList.add("hidden");
}

function startGame() {
  const name = sanitizePlayerName(ui.playerNameInput?.value);
  if (!name) {
    setPlayerNameHint("Please enter your name before starting.", true);
    ui.playerNameInput?.focus();
    return;
  }
  state.playerName = name;
  if (ui.playerNameInput) ui.playerNameInput.value = name;
  try {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name);
  } catch {
    // Ignore storage failures and keep the session name in memory.
  }
  setPlayerNameHint("Choose a name for the leaderboard.");
  renderLeaderboard();
  state.started = true;
  ui.startModal.classList.add("hidden");
  updateButtons();
  syncMusicPlayback();
}

function addStation(x, y, shape, options = {}) {
  const snapped = snapTerrainPointToGrid(x, y);
  state.stations.push({
    id: state.stations.length,
    x: snapped.x,
    y: snapped.y,
    shape,
    airport: !!options.airport,
    port: !!options.port,
    nextPlaneAt: options.nextPlaneAt ?? null,
    nextShipAt: options.nextShipAt ?? null,
    passengers: [],
    pulse: Math.random() * Math.PI * 2,
    stressGlow: 0,
  });
}

function addLine() {
  const id = state.lines.length;
  const line = {
    id,
    name: `Line ${id + 1}`,
    color: LINE_COLORS[id % LINE_COLORS.length],
    closed: false,
    stops: [],
    segmentVariants: {},
    trains: [],
  };
  state.lines.push(line);
  return line;
}

function removeEmptyNewLine(lineId) {
  const line = state.lines[lineId];
  if (!line || line.stops.length || line.trains.length || lineId < STARTING_LINE_COUNT) return;
  state.lines.splice(lineId, 1);
  state.lines.forEach((candidate, index) => {
    candidate.id = index;
    candidate.name = `Line ${index + 1}`;
  });
  state.activeLine = Math.max(0, Math.min(state.activeLine, state.lines.length - 1));
  renderLinePicker();
  updateButtons();
}

function createTerrain() {
  const inlandWaterRatio = randomBetween(INLAND_WATER_RATIO_MIN, INLAND_WATER_RATIO_MAX);
  let coastline = createCoastline();
  for (let attempt = 0; attempt < 40; attempt += 1) {
    coastline = createCoastline();
    const dryTerrain = { coastline, waterBodies: [] };
    if (!starterLayoutFitsTerrain(dryTerrain)) continue;
    return {
      coastline,
      waterBodies: createInlandWaters(coastline, { west: 0, north: 0, south: 0 }, inlandWaterRatio),
      inlandWaterRatio,
    };
  }
  return {
    coastline,
    waterBodies: createInlandWaters(coastline, { west: 0, north: 0, south: 0 }, inlandWaterRatio),
    inlandWaterRatio,
  };
}

function createCoastline() {
  if (Math.random() < 0.5) return null;
  return {
    startX: randomBetween(0.72, 0.84),
    control1X: randomBetween(0.66, 0.82),
    control1Y: randomBetween(0.16, 0.36),
    control2X: randomBetween(0.76, 0.94),
    control2Y: randomBetween(0.58, 0.84),
    endX: randomBetween(0.72, 0.88),
  };
}

function createInlandWaters(coastline, mapOffsets = { west: 0, north: 0, south: 0 }, targetRatio = randomBetween(INLAND_WATER_RATIO_MIN, INLAND_WATER_RATIO_MAX)) {
  const landArea = estimateLandArea(coastline, mapOffsets);
  const targetArea = landArea * targetRatio;
  const isBaseMap = !mapOffsets.west && !mapOffsets.north && !mapOffsets.south;
  const bodies = isBaseMap ? createGuaranteedLakes(coastline) : [];
  let area = bodies.reduce((total, body) => total + waterBodyArea(body), 0);

  const riverCount = Math.random() < 0.55 ? 1 : 2;
  for (let i = 0; i < riverCount; i += 1) {
    const river = createRiver(coastline, mapOffsets);
    if (river && !waterBodyBlocksStarter(river)) {
      bodies.push(river);
      area += waterBodyArea(river);
    }
  }

  for (let attempt = 0; area < targetArea && attempt < 140; attempt += 1) {
    const lake = createLake(coastline, mapOffsets);
    if (!lake || waterBodyBlocksStarter(lake)) continue;
    bodies.push(lake);
    area += waterBodyArea(lake);
  }

  while (isBaseMap && (bodies.length === 0 || area < landArea * INLAND_WATER_RATIO_MIN) && bodies.length < 8) {
    const lake = createFallbackLake(coastline, bodies.length);
    if (!lake) break;
    bodies.push(lake);
    area += waterBodyArea(lake);
  }

  return bodies;
}

function createGuaranteedLakes(coastline) {
  const lakes = [];
  const candidates = shuffleItems([
    { x: 0.14, y: 0.18 },
    { x: 0.15, y: 0.82 },
    { x: 0.58, y: 0.86 },
    { x: 0.62, y: 0.13 },
    { x: 0.12, y: 0.52 },
    { x: 0.58, y: 0.5 },
  ]);

  for (const candidate of candidates) {
    if (lakes.length >= 3) break;
    const lake = createGridLakeAt(candidate.x, candidate.y, randomItem([1, 2]), randomItem([1, 2]));
    if (!waterBodyInsideLand(lake, coastline)) continue;
    if (waterBodyBlocksStarter(lake)) continue;
    if (lakes.some((other) => lakeOverlapsLake(lake, other))) continue;
    lakes.push(lake);
  }

  return lakes;
}

function createLake(coastline, mapOffsets = { west: 0, north: 0, south: 0 }) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const widthCells = randomItem([1, 1, 2, 2, 3]);
    const heightCells = randomItem([1, 1, 2]);
    const width = widthCells * WATER_GRID;
    const height = heightCells * WATER_GRID;
    const y = snapToGrid(randomBetween(-mapOffsets.north + 0.08, 1 + mapOffsets.south - 0.08 - height));
    const boundary = waterBoundaryAtForCoast(y, coastline);
    const minLeft = -mapOffsets.west + 0.08;
    const maxLeft = snapToGrid(boundary - SHORE_MARGIN - width);
    if (maxLeft < minLeft) continue;
    const left = snapToGrid(randomBetween(minLeft, maxLeft));
    const lake = createGridLake(left, y, widthCells, heightCells);
    if (waterBodyInsideLand(lake, coastline, mapOffsets)) return lake;
  }
  return null;
}

function createFallbackLake(coastline, index) {
  const candidates = [
    { x: 0.16, y: 0.82 },
    { x: 0.18, y: 0.12 },
    { x: 0.52, y: 0.82 },
    { x: 0.62, y: 0.14 },
    { x: 0.12, y: 0.5 },
    { x: 0.5, y: 0.55 },
    { x: 0.28, y: 0.88 },
    { x: 0.68, y: 0.48 },
  ];

  for (let offset = 0; offset < candidates.length; offset += 1) {
    const candidate = candidates[(index + offset) % candidates.length];
    const lake = createGridLakeAt(candidate.x, candidate.y, randomItem([1, 2]), randomItem([1, 2]));
    if (waterBodyInsideLand(lake, coastline) && !waterBodyBlocksStarter(lake)) return lake;
  }
  return null;
}

function createGridLakeAt(centerX, centerY, widthCells, heightCells) {
  const width = widthCells * WATER_GRID;
  const height = heightCells * WATER_GRID;
  return createGridLake(
    snapToGrid(centerX - width / 2),
    snapToGrid(centerY - height / 2),
    widthCells,
    heightCells
  );
}

function createGridLake(left, top, widthCells, heightCells) {
  const width = widthCells * WATER_GRID;
  const height = heightCells * WATER_GRID;
  return {
    type: "lake",
    left,
    top,
    width,
    height,
    radius: Math.min(width, height) * 0.28,
  };
}

function createRiver(coastline, mapOffsets = { west: 0, north: 0, south: 0 }) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const minY = -mapOffsets.north + 0.1;
    const maxY = 1 + mapOffsets.south - 0.12;
    const startY = snapToGrid(randomBetween(minY, maxY));
    const endY = snapToGrid(Math.max(-mapOffsets.north + 0.08, Math.min(1 + mapOffsets.south - 0.08, startY + randomBetween(-0.35, 0.35))));
    const startMax = waterBoundaryAtForCoast(startY, coastline) - 0.08;
    const endMax = waterBoundaryAtForCoast(endY, coastline) - 0.08;
    const minLeft = -mapOffsets.west + 0.08;
    if (startMax < minLeft + 0.12 || endMax < minLeft + 0.12) continue;
    const start = { x: snapToGrid(randomBetween(minLeft, Math.min(minLeft + 0.24, startMax))), y: startY };
    const end = { x: snapToGrid(randomBetween(Math.max(minLeft + 0.32, endMax - 0.22), endMax)), y: endY };
    if (end.x - start.x < 0.24) continue;
    const midX = snapToGrid(randomBetween(start.x + WATER_GRID, end.x - WATER_GRID));
    const midY = snapToGrid(randomBetween(Math.min(start.y, end.y), Math.max(start.y, end.y)));
    const river = {
      type: "river",
      points: [
        start,
        { x: midX, y: start.y },
        { x: midX, y: midY },
        { x: end.x, y: midY },
        end,
      ],
      width: WATER_GRID * randomItem([0.55, 0.7, 0.85]),
    };
    if (waterBodyInsideLand(river, coastline, mapOffsets)) return river;
  }
  return null;
}

function estimateLandArea(coastline, mapOffsets = { west: 0, north: 0, south: 0 }) {
  let area = 0;
  const samples = 60;
  for (let i = 0; i < samples; i += 1) {
    const y = -mapOffsets.north + ((i + 0.5) / samples) * (1 + mapOffsets.north + mapOffsets.south);
    area += waterBoundaryAtForCoast(y, coastline) + mapOffsets.west;
  }
  return (area / samples) * (1 + mapOffsets.north + mapOffsets.south);
}

function waterBodyArea(body) {
  if (body.type === "lake") return body.width * body.height;
  return riverLength(body) * body.width;
}

function riverLength(river) {
  let length = 0;
  for (let i = 0; i < river.points.length - 1; i += 1) {
    length += Math.hypot(
      river.points[i + 1].x - river.points[i].x,
      river.points[i + 1].y - river.points[i].y
    );
  }
  return length;
}

function waterBodyInsideLand(body, coastline, mapOffsets = { west: 0, north: 0, south: 0 }) {
  const points = body.type === "lake"
    ? lakeSamplePoints(body)
    : riverSamplePoints(body);
  const clearance = body.type === "lake" ? 0 : body.width / 2;
  return points.every((point) => {
    return point.x > -mapOffsets.west + 0.04 &&
      point.y > -mapOffsets.north + 0.04 &&
      point.y < 1 + mapOffsets.south - 0.04 &&
      point.x + clearance + SHORE_MARGIN < waterBoundaryAtForCoast(point.y, coastline);
  });
}

function waterBodyBlocksStarter(body) {
  return STARTER_STATIONS.some((station) => waterBodyContainsPoint(body, station.x, station.y, STATION_LAND_RADIUS + SHORE_MARGIN)) ||
    STARTER_ROUTE_SEGMENTS.some(([a, b]) => trackPathHitsWaterBody(a, b, body, { west: 0, north: 0, south: 0 }));
}

function lakeOverlapsLake(a, b) {
  return a.left < b.left + b.width + WATER_GRID &&
    a.left + a.width + WATER_GRID > b.left &&
    a.top < b.top + b.height + WATER_GRID &&
    a.top + a.height + WATER_GRID > b.top;
}

function starterLayoutFitsTerrain(terrain) {
  return STARTER_STATIONS.every((station) => isLandStationForTerrain(station.x, station.y, terrain)) &&
    STARTER_ROUTE_SEGMENTS.every(([a, b]) => !routeSegmentHitsWaterForTerrain(a.x, a.y, b.x, b.y, terrain, { west: 0, north: 0, south: 0 }));
}

function lakeSamplePoints(lake) {
  return [
    { x: lake.left, y: lake.top },
    { x: lake.left + lake.width, y: lake.top },
    { x: lake.left, y: lake.top + lake.height },
    { x: lake.left + lake.width, y: lake.top + lake.height },
    { x: lake.left + lake.width / 2, y: lake.top + lake.height / 2 },
  ];
}

function riverSamplePoints(river) {
  const points = [];
  for (let i = 0; i < river.points.length - 1; i += 1) {
    const a = river.points[i];
    const b = river.points[i + 1];
    for (let sample = 0; sample <= 6; sample += 1) {
      const t = sample / 6;
      points.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      });
    }
  }
  return points;
}

function waterBodyContainsPoint(body, x, y, clearance = 0) {
  if (body.type === "lake") return lakeContainsPoint(body, x, y, clearance);
  return riverContainsPoint(body, x, y, clearance);
}

function lakeContainsPoint(lake, x, y, clearance = 0) {
  return x >= lake.left - clearance &&
    x <= lake.left + lake.width + clearance &&
    y >= lake.top - clearance &&
    y <= lake.top + lake.height + clearance;
}

function riverContainsPoint(river, x, y, clearance = 0) {
  const point = { x, y };
  const radius = river.width / 2 + clearance;
  for (let i = 0; i < river.points.length - 1; i += 1) {
    if (pointToSegmentDistance(point, river.points[i], river.points[i + 1]) <= radius) return true;
  }
  return false;
}

function segmentIntersectsWaterBody(a, b, body, clearance = 0) {
  const distance = Math.hypot(a.x - b.x, a.y - b.y);
  const samples = Math.max(8, Math.ceil(distance / 0.012));
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (waterBodyContainsPoint(body, x, y, clearance)) return true;
  }
  return false;
}

function renderLinePicker() {
  if (!ui.linePicker) return;
  ui.linePicker.innerHTML = "";
  state.lines.forEach((line, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `line-btn${index === state.activeLine ? " active" : ""}`;
    button.innerHTML = `<span class="swatch" style="background:${line.color}"></span>${line.name}`;
    button.addEventListener("click", () => {
      if (state.selectedItem === "engine") {
        const train = addTrain(line);
        if (train) {
          state.activeLine = index;
          renderLinePicker();
          finishInventoryUse(true);
        }
        return;
      }
      state.activeLine = index;
      renderLinePicker();
      updateButtons();
    });
    ui.linePicker.appendChild(button);
  });
}

function renderSpeedPicker() {
  ui.speedPicker.innerHTML = "";
  SPEED_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-btn speed-btn${option.value === speedMultiplier ? " active" : ""}`;
    button.textContent = option.value === 1 ? "1x" : `${option.value}x`;
    button.setAttribute("aria-label", option.label);
    button.title = option.label;
    button.addEventListener("click", () => {
      speedMultiplier = option.value;
      renderSpeedPicker();
    });
    ui.speedPicker.appendChild(button);
  });
}

function itemPrice(item) {
  const basePrice = ITEM_PRICES[item] ?? 0;
  const dayOffset = Math.max(0, (state?.day ?? 1) - 1);
  const earlyDays = Math.min(6, dayOffset);
  const midDays = Math.min(7, Math.max(0, dayOffset - 6));
  const lateDays = Math.max(0, dayOffset - 13);
  let price = basePrice +
    earlyDays * EARLY_DAILY_PRICE_INCREASE +
    midDays * MID_DAILY_PRICE_INCREASE +
    lateDays * LATE_DAILY_PRICE_INCREASE;

  if (item === "carriage") {
    price += totalCarriageCount() * CARRIAGE_OWNED_SURCHARGE;
  } else if (item === "engine") {
    price += totalTrainCount() * ENGINE_OWNED_SURCHARGE;
  } else if (item === "line") {
    price += Math.max(0, state.lines.length - STARTING_LINE_COUNT) * LINE_OWNED_SURCHARGE;
  }

  return price;
}

function totalTrainCount() {
  return state.lines.reduce((total, line) => total + line.trains.length, 0) + (state.inventory?.engines ?? 0);
}

function totalCarriageCount() {
  const attached = state.lines.reduce((total, line) => {
    return total + line.trains.reduce((trainTotal, train) => trainTotal + (train.carriages?.length ?? 0), 0);
  }, 0);
  return attached + (state.inventory?.carriages ?? 0);
}

function deployedTrainCount() {
  return state.lines.reduce((total, line) => total + line.trains.length, 0);
}

function deployedCarriageCount() {
  return state.lines.reduce((total, line) => {
    return total + line.trains.reduce((trainTotal, train) => trainTotal + (train.carriages?.length ?? 0), 0);
  }, 0);
}

function applyOperatingCosts() {
  while (state.trips >= state.nextOperatingCostTrip) {
    const trains = deployedTrainCount();
    const carriages = deployedCarriageCount();
    const cost = trains * ENGINE_OPERATING_COST + carriages * CARRIAGE_OPERATING_COST;
    state.cash -= cost;
    if (cost > 0) {
      const parts = [];
      if (trains > 0) parts.push(`${trains} engine${trains === 1 ? "" : "s"} x $${ENGINE_OPERATING_COST}`);
      if (carriages > 0) parts.push(`${carriages} carriage${carriages === 1 ? "" : "s"} x $${CARRIAGE_OPERATING_COST}`);
      showHudToast(`Operating costs: -$${cost} after 50 passengers (${parts.join(", ")})`);
    }
    state.nextOperatingCostTrip += OPERATING_COST_TRIP_INTERVAL;
  }
}

function loadStoredPlayerName() {
  try {
    return sanitizePlayerName(localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

function sanitizePlayerName(name) {
  return String(name || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PLAYER_NAME_MAX);
}

function setPlayerNameHint(message, isError = false) {
  if (!ui.playerNameHint) return;
  ui.playerNameHint.textContent = message;
  ui.playerNameHint.classList.toggle("error", !!isError);
}

function setLeaderboardStatus(message) {
  if (ui.leaderboardStatus) ui.leaderboardStatus.textContent = message;
}

function renderLeaderboard() {
  renderLeaderboardList(ui.leaderboardList, leaderboardEntries);
  renderLeaderboardList(ui.resultsLeaderboardList, leaderboardEntries);
}

function renderLeaderboardList(container, entries) {
  if (!container) return;
  container.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "leaderboard-empty";
    empty.textContent = leaderboardReady
      ? "No runs posted yet."
      : "Add Supabase keys in supabase-config.js to turn the leaderboard on.";
    container.appendChild(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    if (state?.playerName && sanitizePlayerName(entry.player_name) === state.playerName) {
      row.classList.add("current-player");
    }

    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    rank.textContent = `#${index + 1}`;

    const name = document.createElement("div");
    name.className = "leaderboard-name";
    name.textContent = entry.player_name;

    const score = document.createElement("span");
    score.className = "leaderboard-score";
    score.textContent = entry.score;

    row.append(rank, name, score);
    container.appendChild(row);
  });
}

function initLeaderboard() {
  const config = window.SUPABASE_CONFIG || {};
  if (!config.url || !config.anonKey || !window.supabase?.createClient) {
    leaderboardReady = false;
    renderLeaderboard();
    return;
  }

  supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  leaderboardReady = true;
  setLeaderboardStatus("Loading...");
  if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Loading...";
  refreshLeaderboard();
}

async function refreshLeaderboard() {
  if (!leaderboardReady || !supabaseClient) {
    renderLeaderboard();
    return [];
  }

  setLeaderboardStatus("Loading...");
  if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Loading...";
  const { data, error } = await supabaseClient
    .from(LEADERBOARD_TABLE)
    .select("player_name, score, passengers, revenue, days_operated, created_at")
    .order("score", { ascending: false })
    .order("passengers", { ascending: false })
    .order("revenue", { ascending: false })
    .order("days_operated", { ascending: false })
    .limit(LEADERBOARD_LIMIT);

  if (error) {
    leaderboardReady = false;
    setLeaderboardStatus("Offline");
    if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Offline";
    renderLeaderboard();
    return [];
  }

  leaderboardEntries = data || [];
  setLeaderboardStatus("Live");
  if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Live";
  renderLeaderboard();
  return leaderboardEntries;
}

async function submitLeaderboardScore() {
  if (!leaderboardReady || !supabaseClient || state.scoreSubmitted || !state.playerName) return false;
  state.scoreSubmitted = true;
  if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Posting...";
  const payload = {
    player_name: state.playerName,
    score: state.score,
    passengers: state.trips,
    revenue: state.cash,
    days_operated: state.day,
  };
  const { error } = await supabaseClient
    .from(LEADERBOARD_TABLE)
    .insert(payload);

  if (error) {
    state.scoreSubmitted = false;
    if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Offline";
    return false;
  }

  await refreshLeaderboard();
  return true;
}

function renderShopButtons() {
  ui.buyBridgeBtn.innerHTML = `${iconMarkup("icon-bridge")}<span class="shop-price">$${itemPrice("bridge")}</span>`;
  ui.buyCarriageBtn.innerHTML = `${iconMarkup("icon-carriage")}<span class="shop-price">$${itemPrice("carriage")}</span>`;
  ui.buyEngineBtn.innerHTML = `${iconMarkup("icon-engine")}<span class="shop-price">$${itemPrice("engine")}</span>`;
  ui.buyLineBtn.innerHTML = `${iconMarkup("icon-line")}<span class="shop-price">$${itemPrice("line")}</span>`;
  ui.buyBridgeBtn.setAttribute("aria-label", `Buy bridge for $${itemPrice("bridge")}`);
  ui.buyCarriageBtn.setAttribute("aria-label", `Buy carriage for $${itemPrice("carriage")}`);
  ui.buyEngineBtn.setAttribute("aria-label", `Buy engine for $${itemPrice("engine")}`);
  ui.buyLineBtn.setAttribute("aria-label", `Buy line for $${itemPrice("line")}`);
  ui.buyBridgeBtn.title = `Buy bridge for $${itemPrice("bridge")}`;
  ui.buyCarriageBtn.title = `Buy carriage for $${itemPrice("carriage")}`;
  ui.buyEngineBtn.title = `Buy engine for $${itemPrice("engine")}`;
  ui.buyLineBtn.title = `Buy line for $${itemPrice("line")}`;
}

function openShop() {
  if (!state.started || state.gameOver || ui.shopModal?.classList.contains("hidden") === false) return;
  shopPausedGame = !state.paused;
  state.paused = true;
  ui.shopModal?.classList.remove("hidden");
  syncMusicPlayback();
  updateButtons();
}

function closeShop() {
  if (!ui.shopModal || ui.shopModal.classList.contains("hidden")) return;
  ui.shopModal.classList.add("hidden");
  if (shopPausedGame && !state.gameOver) {
    state.paused = false;
  }
  shopPausedGame = false;
  syncMusicPlayback();
  updateButtons();
}

function updateButtons() {
  ui.pauseBtn.innerHTML = iconMarkup(state.paused ? "icon-play" : "icon-pause");
  ui.pauseBtn.setAttribute("aria-label", state.paused ? "Resume" : "Pause");
  ui.pauseBtn.title = state.paused ? "Resume" : "Pause";
  if (ui.shopBtn) ui.shopBtn.disabled = !state.started || state.gameOver;
  ui.buyBridgeBtn.disabled = state.cash < itemPrice("bridge");
  ui.buyCarriageBtn.disabled = state.cash < itemPrice("carriage");
  ui.buyEngineBtn.disabled = state.cash < itemPrice("engine");
  ui.buyLineBtn.disabled = state.cash < itemPrice("line");
  ui.inventoryBridgeBtn.classList.toggle("active", state.selectedItem === "bridge");
  ui.inventoryCarriageBtn.classList.toggle("active", state.selectedItem === "carriage");
  ui.inventoryEngineBtn.classList.toggle("active", state.selectedItem === "engine");
  ui.inventoryLineBtn.classList.toggle("active", state.selectedItem === "line");
  ui.inventoryBridgeBtn.disabled = state.inventory.bridges <= 0 && state.selectedItem !== "bridge";
  ui.inventoryCarriageBtn.disabled = state.inventory.carriages <= 0 && state.selectedItem !== "carriage";
  ui.inventoryEngineBtn.disabled = state.inventory.engines <= 0 && state.selectedItem !== "engine";
  ui.inventoryLineBtn.disabled = state.inventory.lines <= 0 && state.selectedItem !== "line";
}

function updateUI() {
  ui.day.textContent = `Day ${state.day}`;
  ui.cash.textContent = `$${state.cash}`;
  ui.trips.textContent = state.trips;
  ui.score.textContent = state.score;
  ui.stress.textContent = `${Math.round(state.stress)}%`;
  ui.bridgeCount.textContent = state.inventory.bridges;
  ui.carriageCount.textContent = state.inventory.carriages;
  ui.engineCount.textContent = state.inventory.engines;
  ui.lineCount.textContent = state.inventory.lines;
  renderShopButtons();
  updateButtons();
}

function dayProgress() {
  return (state.elapsed % 35) / 35;
}

function currentDayHour() {
  return (DAY_START_HOUR + dayProgress() * 24) % 24;
}

function formatClockTime(hourFloat) {
  const totalMinutes = Math.floor(hourFloat * 60) % (24 * 60);
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function nightIntensity() {
  const progress = dayProgress();
  if (progress <= NIGHT_START_PROGRESS) return 0;
  const span = 1 - NIGHT_START_PROGRESS;
  const t = (progress - NIGHT_START_PROGRESS) / span;
  const duskPortion = 0.34;
  const dawnPortion = 0.26;

  if (t < duskPortion) {
    const duskT = t / duskPortion;
    return duskT * duskT * (3 - 2 * duskT);
  }

  if (t > 1 - dawnPortion) {
    const dawnT = (t - (1 - dawnPortion)) / dawnPortion;
    const fade = dawnT * dawnT * (3 - 2 * dawnT);
    return 1 - fade;
  }

  return 1;
}

function nightLightIntensity() {
  const night = nightIntensity();
  if (night <= 0.18) return 0;
  const t = (night - 0.18) / 0.82;
  return Math.min(1, t * t * t);
}

function updateViewportMetrics() {
  const viewport = window.visualViewport;
  const height = viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
  const top = viewport?.offsetTop || 0;
  document.documentElement.style.setProperty("--viewport-height", `${Math.round(height)}px`);
  document.documentElement.style.setProperty("--viewport-top", `${Math.round(top)}px`);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  clampCamera();
}

function syncTrains(line) {
  if (line.stops.length < 3) line.closed = false;
  if (line.stops.length < 2) {
    line.trains.length = 0;
    return;
  }
  line.trains.forEach((train) => {
    normalizeTrainCompartments(train);
    train.segment = Math.max(0, Math.min(line.stops.length - 1, train.segment));
    if (line.closed) {
      train.dir = 1;
    } else if (train.segment <= 0) {
      train.segment = 0;
      train.dir = 1;
    } else if (train.segment >= line.stops.length - 1) {
      train.segment = line.stops.length - 1;
      train.dir = -1;
    }
    snapTrainToVisibleTrack(line, train);
  });
}

function captureTrainPlacements(line) {
  return line.trains.map((train) => ({
    train,
    dir: train.dir,
    pos: trainPosition(line, train),
    fromStopId: line.stops[train.segment] ?? null,
    toStopId: line.stops[nextTrainStopIndex(line, train)] ?? null,
  }));
}

function restoreTrainPlacements(line, placements) {
  if (line.stops.length < 2) {
    syncTrains(line);
    return;
  }
  placements.forEach((placement) => {
    if (!placement.pos || !line.trains.includes(placement.train)) return;
    const preservedLeg = findTravelLegByStops(line, placement.fromStopId, placement.toStopId);
    if (preservedLeg) {
      const path = routeTravelPath(line, preservedLeg.fromIndex, preservedLeg.toIndex);
      const projection = projectPointToPolyline(placement.pos, path);
      if (projection) {
        placement.train.segment = preservedLeg.fromIndex;
        placement.train.t = Math.max(0, Math.min(0.98, projection.t));
        placement.train.dir = placement.dir;
        return;
      }
    }
    const segment = closestLineSegmentToPoint(line, placement.pos);
    if (!segment) return;
    if (!line.closed && placement.dir < 0) {
      placement.train.segment = Math.min(line.stops.length - 1, segment.index + 1);
      placement.train.t = Math.max(0, Math.min(0.98, 1 - segment.t));
    } else {
      placement.train.segment = segment.index;
      placement.train.t = Math.max(0, Math.min(0.98, segment.t));
    }
    placement.train.dir = placement.dir;
  });
  syncTrains(line);
}

function findTravelLegByStops(line, fromStopId, toStopId) {
  if (fromStopId === null || toStopId === null) return null;
  const segmentCount = line.closed ? line.stops.length : Math.max(0, line.stops.length - 1);
  for (let index = 0; index < segmentCount; index += 1) {
    const nextIndex = (index + 1) % line.stops.length;
    if (line.stops[index] === fromStopId && line.stops[nextIndex] === toStopId) {
      return { fromIndex: index, toIndex: nextIndex };
    }
  }
  return null;
}

function closestLineSegmentToPoint(line, point) {
  const segmentCount = line.closed ? line.stops.length : line.stops.length - 1;
  let closest = null;
  for (let index = 0; index < segmentCount; index += 1) {
    const projection = projectPointToPolyline(point, routeSegmentPath(line, index));
    if (!projection) continue;
    if (!closest || projection.distance < closest.distance) {
      closest = {
        index,
        t: projection.t,
        distance: projection.distance,
      };
    }
  }
  return closest;
}

function snapTrainToVisibleTrack(line, train, maxDistance = 14) {
  if (train.dwell > 0 || train.t <= 0.02 || train.t >= 0.98) return;
  const head = trainPosition(line, train);
  if (!head) return;
  const closest = closestLineSegmentToPoint(line, head);
  if (!closest || closest.distance <= maxDistance) return;
  if (!line.closed && train.dir < 0) {
    train.segment = Math.min(line.stops.length - 1, closest.index + 1);
    train.t = Math.max(0, Math.min(0.98, 1 - closest.t));
  } else {
    train.segment = closest.index;
    train.t = Math.max(0, Math.min(0.98, closest.t));
  }
}

function addTrain(line, placement = {}) {
  if (line.stops.length < 2) return null;
  const train = {
    segment: placement.segment ?? 0,
    t: placement.t ?? (line.trains.length ? line.trains.length / (line.trains.length + 1) : 0),
    dir: placement.dir ?? 1,
    passengers: [],
    carriages: [],
    capacity: ENGINE_CAPACITY,
    dwell: 0,
  };
  line.trains.push(train);
  syncTrains(line);
  return train;
}

function addCarriage(train) {
  normalizeTrainCompartments(train);
  train.carriages.push({ passengers: [] });
  updateTrainCapacity(train);
}

function normalizeTrainCompartments(train) {
  if (!Array.isArray(train.passengers)) train.passengers = [];
  if (typeof train.carriages === "number") {
    train.carriages = Array.from({ length: train.carriages }, () => ({ passengers: [] }));
  } else if (!Array.isArray(train.carriages)) {
    train.carriages = [];
  }
  train.carriages.forEach((carriage) => {
    if (!Array.isArray(carriage.passengers)) carriage.passengers = [];
  });
  updateTrainCapacity(train);
}

function updateTrainCapacity(train) {
  train.capacity = ENGINE_CAPACITY + train.carriages.length * CARRIAGE_CAPACITY;
}

function trainPassengerCount(train) {
  normalizeTrainCompartments(train);
  return train.passengers.length + train.carriages.reduce((total, carriage) => {
    return total + carriage.passengers.length;
  }, 0);
}

function trainCompartments(train) {
  normalizeTrainCompartments(train);
  return [
    { passengers: train.passengers, capacity: ENGINE_CAPACITY },
    ...train.carriages.map((carriage) => ({ passengers: carriage.passengers, capacity: CARRIAGE_CAPACITY })),
  ];
}

function stationPosition(station) {
  const rect = canvas.getBoundingClientRect();
  return terrainPointToWorld(station.x, station.y, rect);
}

function stationTrackPosition(station) {
  const base = stationPosition(station);
  if (!station?.port) return base;
  const rect = canvas.getBoundingClientRect();
  const coastX = waterBoundaryAt(station.y);
  const coastPoint = terrainPointToWorld(coastX, station.y, rect);
  const inlandDirection = coastPoint.x >= base.x ? -1 : 1;
  return {
    x: base.x + inlandDirection * 24,
    y: base.y,
  };
}

function routeSegmentPath(line, index) {
  const from = state.stations[line.stops[index]];
  const to = state.stations[line.stops[(index + 1) % line.stops.length]];
  if (!from || !to) return [];
  return roundedTrackPath(trackPathBetweenStations(from, to, getSegmentVariant(line, from.id, to.id, from, to)), 18);
}

function routeTravelPath(line, fromIndex, toIndex) {
  if (toIndex === (fromIndex + 1) % line.stops.length) return routeSegmentPath(line, fromIndex);
  if (fromIndex === (toIndex + 1) % line.stops.length) return [...routeSegmentPath(line, toIndex)].reverse();
  return routeSegmentPath(line, Math.min(fromIndex, toIndex));
}

function trackPathBetweenStations(from, to, variant = 0) {
  return generateTrackPath(stationTrackPosition(from), stationTrackPosition(to), variant);
}

function trackPathBetweenTerrainPoints(a, b, mapOffsets = state?.map || { west: 0, north: 0, south: 0 }, variant = 0) {
  const rect = canvas.getBoundingClientRect();
  const worldA = terrainPointToWorldForOffsets(a.x, a.y, mapOffsets, rect);
  const worldB = terrainPointToWorldForOffsets(b.x, b.y, mapOffsets, rect);
  return generateTrackPath(worldA, worldB, variant).map((point) => ({
    ...worldPointToTerrainForOffsets(point, mapOffsets, rect),
  }));
}

function generateTrackPath(a, b, variant = 0) {
  const candidates = generateTrackPathCandidates(a, b);
  return candidates[Math.max(0, Math.min(candidates.length - 1, variant))];
}

function generateTrackPathCandidates(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return [[a, b]];
  if (Math.abs(dx) < 1 || Math.abs(dy) < 1 || Math.abs(Math.abs(dx) - Math.abs(dy)) < 1) {
    return [[a, b]];
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const sx = Math.sign(dx) || 1;
  const sy = Math.sign(dy) || 1;
  const candidates = [];

  if (absDx > absDy) {
    const diagonal = absDy;
    candidates.push([
      a,
      { x: a.x + sx * (absDx - diagonal), y: a.y },
      b,
    ]);
    candidates.push([
      a,
      { x: a.x + sx * diagonal, y: b.y },
      b,
    ]);
  } else {
    const diagonal = absDx;
    candidates.push([
      a,
      { x: a.x, y: a.y + sy * (absDy - diagonal) },
      b,
    ]);
    candidates.push([
      a,
      { x: b.x, y: a.y + sy * diagonal },
      b,
    ]);
  }

  const valid = candidates
    .map((points) => simplifyTrackPath(points))
    .filter((points) => points.length >= 2);

  if (!valid.length) return [[a, b]];
  return dedupeTrackCandidates(valid.sort((left, right) => pathTurnPenalty(left) - pathTurnPenalty(right)));
}

function dedupeTrackCandidates(candidates) {
  const unique = [];
  candidates.forEach((candidate) => {
    const key = candidate.map((point) => `${Math.round(point.x)},${Math.round(point.y)}`).join("|");
    if (!unique.some((entry) => entry.key === key)) unique.push({ key, candidate });
  });
  return unique.map((entry) => entry.candidate);
}

function simplifyTrackPath(points) {
  return points.filter((point, index) => {
    if (index === 0 || index === points.length - 1) return true;
    const previous = points[index - 1];
    const next = points[index + 1];
    return Math.hypot(point.x - previous.x, point.y - previous.y) >= 1 &&
      Math.hypot(next.x - point.x, next.y - point.y) >= 1;
  });
}

function pathTurnPenalty(points) {
  if (points.length < 3) return 0;
  const start = normalizePoint({
    x: points[1].x - points[0].x,
    y: points[1].y - points[0].y,
  });
  const end = normalizePoint({
    x: points[points.length - 1].x - points[points.length - 2].x,
    y: points[points.length - 1].y - points[points.length - 2].y,
  });
  return Math.acos(Math.max(-1, Math.min(1, dotPoints(start, end))));
}

function getSegmentVariant(line, fromId, toId, fromPoint = null, toPoint = null) {
  const stored = line.segmentVariants?.[segmentVariantKey(fromId, toId)] || 0;
  const candidateCount = segmentVariantCount(fromPoint, toPoint);
  return segmentVariantForDirection(fromId, toId, stored, candidateCount);
}

function setSegmentVariant(line, fromId, toId, variant, fromPoint = null, toPoint = null) {
  if (!line.segmentVariants) line.segmentVariants = {};
  const stored = storedSegmentVariantForDirection(fromId, toId, variant, segmentVariantCount(fromPoint, toPoint));
  if (!stored) delete line.segmentVariants[segmentVariantKey(fromId, toId)];
  else line.segmentVariants[segmentVariantKey(fromId, toId)] = stored;
}

function cleanupSegmentVariants(line) {
  if (!line?.segmentVariants) return;
  const active = new Set();
  const segmentCount = line.closed ? line.stops.length : Math.max(0, line.stops.length - 1);
  for (let index = 0; index < segmentCount; index += 1) {
    active.add(segmentVariantKey(line.stops[index], line.stops[(index + 1) % line.stops.length]));
  }
  Object.keys(line.segmentVariants).forEach((key) => {
    if (!active.has(key)) delete line.segmentVariants[key];
  });
}

function segmentVariantKey(fromId, toId) {
  return fromId < toId ? `${fromId}:${toId}` : `${toId}:${fromId}`;
}

function segmentVariantCount(fromPoint, toPoint) {
  if (!fromPoint || !toPoint) return 2;
  return generateTrackPathCandidates(stationTrackPosition(fromPoint), stationTrackPosition(toPoint)).length;
}

function segmentVariantForDirection(fromId, toId, storedVariant, candidateCount) {
  if (candidateCount <= 1) return 0;
  if (fromId < toId) return Math.max(0, Math.min(candidateCount - 1, storedVariant));
  return Math.max(0, Math.min(candidateCount - 1, candidateCount - 1 - storedVariant));
}

function storedSegmentVariantForDirection(fromId, toId, variant, candidateCount) {
  if (candidateCount <= 1) return 0;
  if (fromId < toId) return Math.max(0, Math.min(candidateCount - 1, variant));
  return Math.max(0, Math.min(candidateCount - 1, candidateCount - 1 - variant));
}

const TRACK_DIRECTIONS = [
  { x: 1, y: 0 },
  normalizePoint({ x: 1, y: 1 }),
  { x: 0, y: 1 },
  normalizePoint({ x: -1, y: 1 }),
  { x: -1, y: 0 },
  normalizePoint({ x: -1, y: -1 }),
  { x: 0, y: -1 },
  normalizePoint({ x: 1, y: -1 }),
];

function nearestTrackDirection(direction) {
  return TRACK_DIRECTIONS.reduce((best, candidate) => {
    return dotPoints(direction, candidate) > dotPoints(direction, best) ? candidate : best;
  }, TRACK_DIRECTIONS[0]);
}

function rayIntersection(a, da, b, db) {
  const det = crossPoints(da, db);
  if (Math.abs(det) < 0.001) return null;
  const delta = { x: b.x - a.x, y: b.y - a.y };
  const t = crossPoints(delta, db) / det;
  const u = crossPoints(delta, da) / det;
  if (t < 0 || u < 0) return null;
  return {
    x: a.x + da.x * t,
    y: a.y + da.y * t,
  };
}

function normalizePoint(point) {
  const length = Math.hypot(point.x, point.y) || 1;
  return { x: point.x / length, y: point.y / length };
}

function dotPoints(a, b) {
  return a.x * b.x + a.y * b.y;
}

function crossPoints(a, b) {
  return a.x * b.y - a.y * b.x;
}

function polylineLength(points) {
  let length = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    length += Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y);
  }
  return length;
}

function pointOnPolyline(points, t) {
  const totalLength = polylineLength(points);
  if (totalLength <= 0) return { x: points[0]?.x || 0, y: points[0]?.y || 0, angle: 0 };
  return pointOnPolylineAtDistance(points, totalLength * Math.max(0, Math.min(1, t)));
}

function pointOnPolylineAtDistance(points, distance) {
  const totalLength = polylineLength(points);
  if (totalLength <= 0) return { x: points[0]?.x || 0, y: points[0]?.y || 0, angle: 0 };
  let remaining = Math.max(0, Math.min(totalLength, distance));
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= length || index === points.length - 2) {
      const localT = length <= 0 ? 0 : remaining / length;
      return {
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT,
        angle: Math.atan2(b.y - a.y, b.x - a.x),
      };
    }
    remaining -= length;
  }
  const last = points[points.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}

function projectPointToPolyline(point, points) {
  const totalLength = polylineLength(points);
  let walked = 0;
  let closest = null;
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    const projection = pointToSegmentProjection(point, a, b);
    const segmentLength = Math.hypot(b.x - a.x, b.y - a.y);
    const t = totalLength <= 0 ? 0 : (walked + segmentLength * projection.t) / totalLength;
    if (!closest || projection.distance < closest.distance) {
      closest = { ...projection, t };
    }
    walked += segmentLength;
  }
  return closest;
}

function terrainToScreen(x, y) {
  const metrics = mapViewportMetrics();
  return {
    x: (x + metrics.west) * metrics.scaleX,
    y: (y + metrics.north) * metrics.scaleY,
  };
}

function screenWorldToTerrain(x, y) {
  const metrics = mapViewportMetrics();
  return {
    x: x / metrics.scaleX - metrics.west,
    y: y / metrics.scaleY - metrics.north,
  };
}

function mapWidth() {
  return 1 + state.map.west;
}

function mapHeight() {
  return 1 + state.map.north + state.map.south;
}

function useStableMobileMap() {
  return true;
}

function mapViewportMetrics(rect = canvas.getBoundingClientRect(), mapOffsets = state?.map || { west: 0, north: 0, south: 0 }) {
  const width = rect.width || canvas.width || 1;
  const height = rect.height || canvas.height || 1;
  const west = mapOffsets.west || 0;
  const north = mapOffsets.north || 0;
  const south = mapOffsets.south || 0;
  const terrainWidth = 1 + west;
  const terrainHeight = 1 + north + south;
  const worldWidth = terrainWidth * WORLD_SCALE;
  const worldHeight = terrainHeight * WORLD_SCALE;
  const fitZoom = Math.min(width / worldWidth, height / worldHeight);
  const zoom = camera?.zoom && Number.isFinite(camera.zoom) ? camera.zoom : fitZoom;
  const scaledWorldWidth = worldWidth * zoom;
  const scaledWorldHeight = worldHeight * zoom;
  return {
    width,
    height,
    west,
    north,
    south,
    scaleX: WORLD_SCALE,
    scaleY: WORLD_SCALE,
    fitZoom,
    zoom,
    offsetX: scaledWorldWidth < width ? (width - scaledWorldWidth) / 2 : 0,
    offsetY: scaledWorldHeight < height ? (height - scaledWorldHeight) / 2 : 0,
    worldWidth,
    worldHeight,
    scaledWorldWidth,
    scaledWorldHeight,
  };
}

function screenToWorld(x, y) {
  const metrics = mapViewportMetrics();
  return {
    x: (x - metrics.offsetX - camera.x) / camera.zoom,
    y: (y - metrics.offsetY - camera.y) / camera.zoom,
  };
}

function clampCamera() {
  const rect = canvas.getBoundingClientRect();
  const metrics = mapViewportMetrics(rect);
  const scaledWidth = metrics.scaledWorldWidth;
  const scaledHeight = metrics.scaledWorldHeight;
  const minZoom = minCameraZoom();
  const allowSlackPan = camera.zoom > minZoom + 0.001;

  if (scaledWidth <= rect.width) {
    if (allowSlackPan) {
      const slack = (rect.width - scaledWidth) / 2;
      camera.x = Math.max(-slack, Math.min(slack, camera.x));
    } else {
      camera.x = 0;
    }
  } else {
    camera.x = Math.min(0, Math.max(rect.width - scaledWidth, camera.x));
  }

  if (scaledHeight <= rect.height) {
    if (allowSlackPan) {
      const slack = (rect.height - scaledHeight) / 2;
      camera.y = Math.max(-slack, Math.min(slack, camera.y));
    } else {
      camera.y = 0;
    }
  } else {
    camera.y = Math.min(0, Math.max(rect.height - scaledHeight, camera.y));
  }
}

function fitCameraToMap() {
  camera.zoom = minCameraZoom();
  camera.x = 0;
  camera.y = 0;
  clampCamera();
}

function minCameraZoom() {
  const rect = canvas.getBoundingClientRect();
  const metrics = mapViewportMetrics(rect);
  return metrics.fitZoom;
}

function zoomCameraAtScreenPoint(screenX, screenY, nextZoom, anchorWorld = null) {
  const zoom = Math.max(minCameraZoom(), Math.min(MAX_CAMERA_ZOOM, nextZoom));
  const anchor = anchorWorld || screenToWorld(screenX, screenY);
  camera.zoom = zoom;
  const metrics = mapViewportMetrics();
  camera.x = screenX - metrics.offsetX - anchor.x * camera.zoom;
  camera.y = screenY - metrics.offsetY - anchor.y * camera.zoom;
  clampCamera();
}

function clearActiveCanvasDrags() {
  routeDrag = null;
  trainDrag = null;
  panDrag = null;
}

function activeTouchList() {
  return Array.from(activeTouchPoints.values()).slice(0, 2);
}

function setActiveTouchPoint(event) {
  activeTouchPoints.set(event.pointerId, {
    clientX: event.clientX,
    clientY: event.clientY,
  });
}

function removeActiveTouchPoint(event) {
  activeTouchPoints.delete(event.pointerId);
}

function beginTouchGesture() {
  const points = activeTouchList();
  if (points.length < 2) {
    touchGesture = null;
    return false;
  }
  const rect = canvas.getBoundingClientRect();
  const centerX = (points[0].clientX + points[1].clientX) / 2 - rect.left;
  const centerY = (points[0].clientY + points[1].clientY) / 2 - rect.top;
  const anchor = screenToWorld(centerX, centerY);
  touchGesture = {
    anchorWorldX: anchor.x,
    anchorWorldY: anchor.y,
    startDistance: Math.max(24, Math.hypot(
      points[1].clientX - points[0].clientX,
      points[1].clientY - points[0].clientY
    )),
    startZoom: camera.zoom,
  };
  return true;
}

function resetTouchGesture() {
  touchGesture = null;
}

function updateTouchGesture() {
  if (!touchGesture && !beginTouchGesture()) return false;
  const points = activeTouchList();
  if (points.length < 2) {
    resetTouchGesture();
    return false;
  }
  const rect = canvas.getBoundingClientRect();
  const centerX = (points[0].clientX + points[1].clientX) / 2 - rect.left;
  const centerY = (points[0].clientY + points[1].clientY) / 2 - rect.top;
  const distance = Math.max(24, Math.hypot(
    points[1].clientX - points[0].clientX,
    points[1].clientY - points[0].clientY
  ));
  const targetZoom = touchGesture.startZoom * (distance / touchGesture.startDistance);
  zoomCameraAtScreenPoint(centerX, centerY, targetZoom, {
    x: touchGesture.anchorWorldX,
    y: touchGesture.anchorWorldY,
  });
  pointer.stationId = null;
  return true;
}

function getStationAt(clientX, clientY) {
  const world = clientToWorld(clientX, clientY);
  const terrain = screenWorldToTerrain(world.x, world.y);
  return state.stations.find((station) => {
    return Math.hypot(station.x - terrain.x, station.y - terrain.y) < stationHitRadius();
  });
}

function stationHitRadius() {
  const metrics = mapViewportMetrics();
  return 34 / camera.zoom / metrics.scaleX;
}

function clientToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;
  return screenToWorld(screenX, screenY);
}

function getRouteSegmentAt(clientX, clientY) {
  const world = clientToWorld(clientX, clientY);
  const grabRadius = LINE_GRAB_RADIUS / camera.zoom;
  let closest = null;
  state.lines.forEach((line) => {
    if (line.stops.length < 2) return;
    const segmentCount = line.closed ? line.stops.length : line.stops.length - 1;
    for (let index = 0; index < segmentCount; index += 1) {
      const projection = projectPointToPolyline(world, routeSegmentPath(line, index));
      if (projection && projection.distance <= grabRadius && (!closest || projection.distance < closest.distance)) {
        closest = {
          lineId: line.id,
          insertIndex: index,
          distance: projection.distance,
        };
      }
    }
  });
  return closest;
}

function getBridgeSegmentAt(clientX, clientY) {
  const world = clientToWorld(clientX, clientY);
  let closest = null;
  state.bridges.forEach((bridge) => {
    const line = state.lines.find((candidate) => routeHasSegment(candidate, bridge.fromId, bridge.toId));
    if (!line) return;
    const from = state.stations[bridge.fromId];
    const to = state.stations[bridge.toId];
    if (!from || !to) return;
    routeSegmentInlandSpans(from, to, line).forEach((span) => {
      const spanA = pointBetween(span.a, span.b, span.start);
      const spanB = pointBetween(span.a, span.b, span.end);
      const projection = pointToSegmentProjection(world, spanA, spanB);
      if (projection.distance <= 24 && (!closest || projection.distance < closest.distance)) {
        closest = {
          lineId: line.id,
          insertIndex: bridgeSegmentIndex(line, bridge.fromId, bridge.toId),
          distance: projection.distance,
        };
      }
    });
  });
  return closest && closest.insertIndex >= 0 ? closest : null;
}

function bridgeSegmentIndex(line, fromId, toId) {
  const segmentCount = line.closed ? line.stops.length : line.stops.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const a = line.stops[index];
    const b = line.stops[(index + 1) % line.stops.length];
    if ((a === fromId && b === toId) || (a === toId && b === fromId)) return index;
  }
  return -1;
}

function getTrainAt(clientX, clientY) {
  const part = getTrainPartAt(clientX, clientY);
  return part ? { line: part.line, train: part.train, distance: part.distance } : null;
}

function getTrainPartAt(clientX, clientY) {
  const world = clientToWorld(clientX, clientY);
  let closest = null;
  state.lines.forEach((line) => {
    line.trains.forEach((train) => {
      normalizeTrainCompartments(train);
      for (let partIndex = 0; partIndex <= train.carriages.length; partIndex += 1) {
        const pos = trainPartPosition(line, train, partIndex);
        if (!pos) continue;
        const dx = world.x - pos.x;
        const dy = world.y - pos.y;
        const cos = Math.cos(-pos.angle);
        const sin = Math.sin(-pos.angle);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;
        const hit = localX >= -27 && localX <= 27 && Math.abs(localY) <= 22;
        const distance = Math.hypot(dx, dy);
        if (hit && (!closest || distance < closest.distance)) {
          closest = {
            line,
            train,
            part: partIndex === 0 ? "engine" : "carriage",
            carriageIndex: partIndex - 1,
            distance,
          };
        }
      }
    });
  });
  return closest;
}

function getRouteSegmentDropAt(clientX, clientY) {
  const world = clientToWorld(clientX, clientY);
  let closest = null;
  state.lines.forEach((line) => {
    if (line.stops.length < 2) return;
    const segmentCount = line.closed ? line.stops.length : line.stops.length - 1;
    for (let index = 0; index < segmentCount; index += 1) {
      const path = routeSegmentPath(line, index);
      const projection = projectPointToPolyline(world, path);
      if (projection && projection.distance <= 34 && (!closest || projection.distance < closest.distance)) {
        const onPath = pointOnPolyline(path, projection.t);
        const side = Math.sign(
          Math.cos(onPath.angle) * (world.y - onPath.y) -
          Math.sin(onPath.angle) * (world.x - onPath.x)
        ) || 1;
        closest = {
          line,
          segment: index,
          t: projection.t,
          side,
          distance: projection.distance,
        };
      }
    }
  });
  return closest;
}

function engineDirectionForDrop(line, drop) {
  if (line.closed) return 1;
  if (drop.segment <= 0 && drop.t <= 0.08) return 1;
  if (drop.segment >= line.stops.length - 2 && drop.t >= 0.92) return -1;
  return drop.side > 0 ? 1 : -1;
}

function enginePlacementForDrop(line, drop) {
  const dir = engineDirectionForDrop(line, drop);
  if (!line.closed && dir < 0) {
    return {
      segment: Math.min(line.stops.length - 1, drop.segment + 1),
      t: Math.max(0, Math.min(0.98, 1 - drop.t)),
      dir,
    };
  }
  return {
    segment: drop.segment,
    t: Math.max(0, Math.min(0.98, drop.t)),
    dir,
  };
}

function getRouteEndAt(station) {
  const activeLine = state.lines[state.activeLine];
  if (!activeLine.closed && activeLine.stops[0] === station.id) {
    return { lineId: activeLine.id, insertIndex: -1, anchorIndex: 0, distance: 0 };
  }
  if (!activeLine.closed && activeLine.stops[activeLine.stops.length - 1] === station.id) {
    return {
      lineId: activeLine.id,
      insertIndex: activeLine.stops.length - 1,
      anchorIndex: activeLine.stops.length - 1,
      distance: 0,
    };
  }

  for (const line of state.lines) {
    if (line.id === activeLine.id) continue;
    if (!line.closed && line.stops[0] === station.id) {
      return { lineId: line.id, insertIndex: -1, anchorIndex: 0, distance: 0 };
    }
    if (!line.closed && line.stops[line.stops.length - 1] === station.id) {
      return {
        lineId: line.id,
        insertIndex: line.stops.length - 1,
        anchorIndex: line.stops.length - 1,
        distance: 0,
      };
    }
  }
  return null;
}

function pointToSegmentDistance(point, a, b) {
  return pointToSegmentProjection(point, a, b).distance;
}

function pointToSegmentProjection(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    return {
      t: 0,
      x: a.x,
      y: a.y,
      distance: Math.hypot(point.x - a.x, point.y - a.y),
    };
  }
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq));
  const x = a.x + dx * t;
  const y = a.y + dy * t;
  return {
    t,
    x,
    y,
    distance: Math.hypot(point.x - x, point.y - y),
  };
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
  const world = screenToWorld(pointer.x, pointer.y);
  pointer.worldX = world.x;
  pointer.worldY = world.y;
  const station = getStationAt(event.clientX, event.clientY);
  pointer.stationId = station ? station.id : null;
  if (routeDrag) {
    routeDrag.worldX = world.x;
    routeDrag.worldY = world.y;
    routeDrag.stationId = station ? station.id : null;
  }
  if (trainDrag) {
    trainDrag.worldX = world.x;
    trainDrag.worldY = world.y;
  }
  if (panDrag) {
    const dx = event.clientX - panDrag.startClientX;
    const dy = event.clientY - panDrag.startClientY;
    panDrag.moved = panDrag.moved || Math.hypot(dx, dy) > 6;
    camera.x = panDrag.startCameraX + dx;
    camera.y = panDrag.startCameraY + dy;
    clampCamera();
  }
}

function handleWheel(event) {
  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const before = screenToWorld(mouseX, mouseY);
  const direction = event.deltaY < 0 ? 1 : -1;
  const factor = direction > 0 ? 1.14 : 1 / 1.14;
  zoomCameraAtScreenPoint(mouseX, mouseY, camera.zoom * factor, before);
}

function handleCanvasPointerMove(event) {
  if (isTouchPointer(event) && activeTouchPoints.has(event.pointerId)) {
    setActiveTouchPoint(event);
    if (touchGesture || activeTouchPoints.size >= 2) {
      event.preventDefault();
      updateTouchGesture();
      return;
    }
  }
  updatePointer(event);
}

function handleCanvasPointerDown(event) {
  if (isTouchPointer(event)) {
    setActiveTouchPoint(event);
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
    if (activeTouchPoints.size >= 2) {
      clearActiveCanvasDrags();
      beginTouchGesture();
      return;
    }
  }
  if (!state.started) return;
  if (state.gameOver) {
    resetGame();
    return;
  }

  updatePointer(event);
  if (disconnectMenu) {
    const option = getDisconnectMenuOptionAt(event.clientX, event.clientY);
    if (option) {
      event.preventDefault();
      removeStationFromLine(disconnectMenu.stationId, option.lineId);
      disconnectMenu = null;
      return;
    }
    disconnectMenu = null;
  }
  const station = getStationAt(event.clientX, event.clientY);
  if (event.button === 2) {
    event.preventDefault();
    if (camera.zoom > minCameraZoom() + 0.001) {
      panDrag = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startCameraX: camera.x,
        startCameraY: camera.y,
        stationId: station?.id ?? null,
        moved: false,
      };
      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (station) handleStationDisconnectRequest(station);
    return;
  }

  if (event.button !== 0) return;

  if (state.selectedItem === "carriage") {
    const target = getTrainAt(event.clientX, event.clientY);
    if (target) {
      addCarriage(target.train);
      finishInventoryUse(true);
    }
    return;
  }

  if (state.selectedItem === "engine") {
    const target = getRouteSegmentDropAt(event.clientX, event.clientY);
    if (target) {
      const line = target.line;
      const placement = enginePlacementForDrop(line, target);
      const train = addTrain(line, placement);
      if (train) {
        state.activeLine = line.id;
        renderLinePicker();
        finishInventoryUse(true);
      }
    }
    return;
  }

  if (state.selectedItem === "line") {
    if (!station) return;
    const line = addLine();
    state.activeLine = line.id;
    renderLinePicker();
    routeDrag = {
      lineId: line.id,
      startStationId: station.id,
      insertIndex: undefined,
      anchorIndex: undefined,
      newLineItem: true,
      startWorldX: pointer.worldX,
      startWorldY: pointer.worldY,
      worldX: pointer.worldX,
      worldY: pointer.worldY,
      stationId: null,
    };
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
    return;
  }

  const activeLine = state.lines[state.activeLine];
  const routeTarget = station && activeLine.stops.length === 0
    ? { lineId: activeLine.id, startStationId: station.id, distance: 0 }
    : station
      ? getRouteEndAt(station)
      : getBridgeSegmentAt(event.clientX, event.clientY) || getRouteSegmentAt(event.clientX, event.clientY);
  const trainPart = getTrainPartAt(event.clientX, event.clientY);
  const shouldDragTrain = trainPart && (!routeTarget || trainPart.distance + 6 < (routeTarget.distance ?? Infinity));
  if (shouldDragTrain) {
    const dragPos = trainPart.part === "engine"
      ? trainPartPosition(trainPart.line, trainPart.train, 0)
      : trainPartPosition(trainPart.line, trainPart.train, trainPart.carriageIndex + 1);
    trainDrag = {
      type: trainPart.part,
      line: trainPart.line,
      train: trainPart.train,
      carriageIndex: trainPart.carriageIndex,
      worldX: pointer.worldX,
      worldY: pointer.worldY,
      angle: dragPos?.angle || 0,
    };
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
    return;
  }

  const target = routeTarget;
  if (!target) return;

  routeDrag = {
    lineId: target.lineId,
    startStationId: target.startStationId,
    insertIndex: target.insertIndex,
    anchorIndex: target.anchorIndex,
    startWorldX: pointer.worldX,
    startWorldY: pointer.worldY,
    worldX: pointer.worldX,
    worldY: pointer.worldY,
    stationId: null,
  };
  state.activeLine = target.lineId;
  renderLinePicker();
  if (canvas.setPointerCapture) {
    canvas.setPointerCapture(event.pointerId);
  }
}

function handleCanvasPointerUp(event) {
  if (isTouchPointer(event)) {
    const wasGesture = !!touchGesture;
    removeActiveTouchPoint(event);
    if (wasGesture) {
      if (activeTouchPoints.size >= 2) {
        beginTouchGesture();
      } else {
        resetTouchGesture();
      }
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      return;
    }
  }
  if (panDrag) {
    updatePointer(event);
    const station = panDrag.stationId !== null ? state.stations[panDrag.stationId] : null;
    const moved = panDrag.moved;
    panDrag = null;
    if (!moved && event.button === 2 && station) {
      handleStationDisconnectRequest(station);
    }
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    return;
  }
  if (trainDrag) {
    handleTrainPointerUp(event);
    return;
  }
  if (!routeDrag) return;

  updatePointer(event);
  const station = getStationAt(event.clientX, event.clientY);
  const line = state.lines[routeDrag.lineId];
  const closesLine = station && !line.closed && line.stops.length >= 3 && (
    (routeDrag.insertIndex < 0 && station.id === line.stops[line.stops.length - 1]) ||
    (routeDrag.insertIndex >= line.stops.length - 1 && station.id === line.stops[0])
  );

  let routeChanged = false;
  let trainPlacements = null;
  const finishRouteInventoryUse = () => {
    finishInventoryUse(routeDrag.newLineItem);
  };
  const startPlan = routeDrag.startStationId !== undefined && station && station.id !== routeDrag.startStationId
    ? routeSegmentPlanForStations(state.stations[routeDrag.startStationId], station)
    : null;
  const closePlan = closesLine
    ? routeSegmentPlanForStations(state.stations[line.stops[line.stops.length - 1]], state.stations[line.stops[0]])
    : null;
  const prependPlan = station && !line.stops.includes(station.id) && routeDrag.insertIndex < 0
    ? routeSegmentPlanForStations(station, state.stations[line.stops[0]])
    : null;
  const appendPlan = station && !line.stops.includes(station.id) && routeDrag.insertIndex >= line.stops.length - 1
    ? routeSegmentPlanForStations(state.stations[line.stops[line.stops.length - 1]], station)
    : null;
  if (routeDrag.startStationId !== undefined && station && station.id !== routeDrag.startStationId && startPlan && startPlan.water !== "ocean" && canStartRoute(routeDrag.startStationId, station.id)) {
    if (startPlan.water === "inland" &&
      !bridgeExistsForSegment(routeDrag.startStationId, station.id) &&
      !placeBridgeForSegment(routeDrag.startStationId, station.id)) {
      warnBridgeInventory();
      routeDrag = null;
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      return;
    }
    trainPlacements = captureTrainPlacements(line);
    line.stops = [routeDrag.startStationId, station.id];
    line.closed = false;
    cleanupSegmentVariants(line);
    setSegmentVariant(line, routeDrag.startStationId, station.id, startPlan.variant, state.stations[routeDrag.startStationId], station);
    if (routeDrag.newLineItem) addTrain(line);
    state.activeLine = routeDrag.lineId;
    restoreTrainPlacements(line, trainPlacements);
    cleanupBridges();
    renderLinePicker();
    routeChanged = true;
    finishRouteInventoryUse();
  } else if (closesLine && closePlan && closePlan.water !== "ocean" && canCloseRoute(line)) {
    if (closePlan.water === "inland" &&
      !bridgeExistsForSegment(line.stops[line.stops.length - 1], line.stops[0]) &&
      !placeBridgeForSegment(line.stops[line.stops.length - 1], line.stops[0])) {
      warnBridgeInventory();
      routeDrag = null;
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      return;
    }
    trainPlacements = captureTrainPlacements(line);
    line.closed = true;
    cleanupSegmentVariants(line);
    setSegmentVariant(
      line,
      line.stops[line.stops.length - 1],
      line.stops[0],
      closePlan.variant,
      state.stations[line.stops[line.stops.length - 1]],
      state.stations[line.stops[0]]
    );
    state.activeLine = routeDrag.lineId;
    restoreTrainPlacements(line, trainPlacements);
    cleanupBridges();
    renderLinePicker();
    routeChanged = true;
    finishRouteInventoryUse();
  } else if (station && !line.stops.includes(station.id) && routeDrag.insertIndex < 0 && prependPlan && prependPlan.water !== "ocean" && canPrependStop(line, station.id)) {
    if (prependPlan.water === "inland" &&
      !bridgeExistsForSegment(station.id, line.stops[0]) &&
      !placeBridgeForSegment(station.id, line.stops[0])) {
      warnBridgeInventory();
      routeDrag = null;
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      return;
    }
    trainPlacements = captureTrainPlacements(line);
    const oldFirstId = line.stops[0];
    line.stops.unshift(station.id);
    cleanupSegmentVariants(line);
    setSegmentVariant(line, station.id, oldFirstId, prependPlan.variant, station, state.stations[oldFirstId]);
    state.activeLine = routeDrag.lineId;
    restoreTrainPlacements(line, trainPlacements);
    cleanupBridges();
    renderLinePicker();
    routeChanged = true;
    finishRouteInventoryUse();
  } else if (station && !line.stops.includes(station.id) && routeDrag.insertIndex >= line.stops.length - 1 && appendPlan && appendPlan.water !== "ocean" && canAppendStop(line, station.id)) {
    if (appendPlan.water === "inland" &&
      !bridgeExistsForSegment(line.stops[line.stops.length - 1], station.id) &&
      !placeBridgeForSegment(line.stops[line.stops.length - 1], station.id)) {
      warnBridgeInventory();
      routeDrag = null;
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      return;
    }
    trainPlacements = captureTrainPlacements(line);
    const oldLastId = line.stops[line.stops.length - 1];
    line.stops.push(station.id);
    cleanupSegmentVariants(line);
    setSegmentVariant(line, oldLastId, station.id, appendPlan.variant, state.stations[oldLastId], station);
    state.activeLine = routeDrag.lineId;
    restoreTrainPlacements(line, trainPlacements);
    cleanupBridges();
    renderLinePicker();
    routeChanged = true;
    finishRouteInventoryUse();
  } else if (station && !line.stops.includes(station.id) && routeDrag.insertIndex >= 0 && (routeDrag.insertIndex < line.stops.length - 1 || line.closed)) {
    const bridgePlan = planBridgeInsert(line, station.id, routeDrag.insertIndex);
    if (!bridgePlan.ok) {
      if (bridgePlan.reason === "bridges") warnBridgeInventory();
      routeDrag = null;
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      return;
    }
    trainPlacements = captureTrainPlacements(line);
    applyBridgeInsertPlan(bridgePlan);
    line.stops.splice(routeDrag.insertIndex + 1, 0, station.id);
    cleanupSegmentVariants(line);
    state.activeLine = routeDrag.lineId;
    restoreTrainPlacements(line, trainPlacements);
    cleanupBridges();
    renderLinePicker();
    routeChanged = true;
    finishRouteInventoryUse();
  } else if (routeDrag.startStationId === undefined && routeDrag.insertIndex >= 0 && reshapeDistance(routeDrag) > 18) {
    const reshape = getSegmentReshapePreview(line, routeDrag.insertIndex, { x: routeDrag.worldX, y: routeDrag.worldY });
    if (reshape) {
      trainPlacements = captureTrainPlacements(line);
      if (applySegmentVariant(line, routeDrag.insertIndex, reshape.variant)) {
        state.activeLine = routeDrag.lineId;
        restoreTrainPlacements(line, trainPlacements);
        cleanupSegmentVariants(line);
        renderLinePicker();
        routeChanged = true;
      }
    }
  }
  if (!routeChanged && routeDrag.newLineItem) {
    removeEmptyNewLine(routeDrag.lineId);
  }
  routeDrag = null;
  if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function canStartRoute(fromId, toId) {
  return routeSegmentCanCross(state.stations[fromId], state.stations[toId]);
}

function handleTrainPointerUp(event) {
  updatePointer(event);
  if (trainDrag.type === "engine") {
    const target = getRouteSegmentDropAt(event.clientX, event.clientY);
    if (target) {
      const placement = enginePlacementForDrop(target.line, target);
      moveTrainToLine(trainDrag.train, trainDrag.line, target.line, placement);
      state.activeLine = target.line.id;
      renderLinePicker();
    }
  } else {
    const target = getTrainPartAt(event.clientX, event.clientY);
    if (target && target.train !== trainDrag.train) {
      moveCarriageToTrain(trainDrag.train, trainDrag.carriageIndex, target.train);
    }
  }
  trainDrag = null;
  if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function moveTrainToLine(train, fromLine, toLine, placement) {
  const oldIndex = fromLine.trains.indexOf(train);
  if (oldIndex >= 0 && fromLine !== toLine) {
    fromLine.trains.splice(oldIndex, 1);
    toLine.trains.push(train);
  }
  train.segment = placement.segment;
  train.t = Math.max(0, Math.min(0.98, placement.t));
  train.dir = placement.dir;
  syncTrains(fromLine);
  syncTrains(toLine);
}

function moveCarriageToTrain(fromTrain, carriageIndex, toTrain) {
  normalizeTrainCompartments(fromTrain);
  normalizeTrainCompartments(toTrain);
  const carriage = fromTrain.carriages[carriageIndex];
  if (!carriage) return;
  fromTrain.carriages.splice(carriageIndex, 1);
  toTrain.carriages.push(carriage);
  updateTrainCapacity(fromTrain);
  updateTrainCapacity(toTrain);
}

function canPrependStop(line, stationId) {
  return routeSegmentCanCross(state.stations[stationId], state.stations[line.stops[0]]);
}

function canAppendStop(line, stationId) {
  return routeSegmentCanCross(state.stations[line.stops[line.stops.length - 1]], state.stations[stationId]);
}

function canInsertStop(line, stationId, insertIndex) {
  const previous = state.stations[line.stops[insertIndex]];
  const next = state.stations[line.stops[(insertIndex + 1) % line.stops.length]];
  const station = state.stations[stationId];
  return routeSegmentCanCross(previous, station) && routeSegmentCanCross(station, next);
}

function canCloseRoute(line) {
  return routeSegmentCanCross(state.stations[line.stops[line.stops.length - 1]], state.stations[line.stops[0]]);
}

function routeSegmentCanCross(aStation, bStation, line = null, variant = null) {
  const water = routeSegmentWaterKindForStations(aStation, bStation, line, variant);
  if (water === "none") return true;
  if (water === "ocean") return false;
  return bridgeExistsForSegment(aStation.id, bStation.id) || state.inventory.bridges > 0;
}

function routeSegmentPlanForStations(aStation, bStation, line = null, variant = null) {
  if (!aStation || !bStation) return null;
  if (variant !== null && variant !== undefined) {
    const path = trackPathBetweenStations(aStation, bStation, variant);
    return { variant, path, water: routeSegmentWaterKindForPath(path) };
  }
  if (line) {
    const chosenVariant = getSegmentVariant(line, aStation.id, bStation.id, aStation, bStation);
    const path = trackPathBetweenStations(aStation, bStation, chosenVariant);
    return { variant: chosenVariant, path, water: routeSegmentWaterKindForPath(path) };
  }
  const candidates = generateTrackPathCandidates(stationTrackPosition(aStation), stationTrackPosition(bStation));
  let fallback = null;
  for (let variantIndex = 0; variantIndex < candidates.length; variantIndex += 1) {
    const path = candidates[variantIndex];
    const water = routeSegmentWaterKindForPath(path);
    const plan = { variant: variantIndex, path, water };
    if (water === "none") return plan;
    if (water === "inland" && !fallback) fallback = plan;
  }
  return fallback || { variant: 0, path: candidates[0], water: "ocean" };
}

function routeSegmentWaterKindForStations(aStation, bStation, line = null, variant = null) {
  const plan = routeSegmentPlanForStations(aStation, bStation, line, variant);
  return plan ? plan.water : "ocean";
}

function routeSegmentWaterKindForPath(path) {
  let hitsInland = false;
  for (let index = 0; index < path.length - 1; index += 1) {
    const a = worldPointToTerrain(path[index]);
    const b = worldPointToTerrain(path[index + 1]);
    const water = routeSegmentWaterKind(a.x, a.y, b.x, b.y, state);
    if (water === "ocean") return "ocean";
    if (water === "inland") hitsInland = true;
  }
  return hitsInland ? "inland" : "none";
}

function worldPointToTerrain(point) {
  return worldPointToTerrainForOffsets(point);
}

function placeBridgeForSegment(fromId, toId) {
  const from = state.stations[fromId];
  const to = state.stations[toId];
  if (routeSegmentWaterKindForStations(from, to) !== "inland") return false;
  if (bridgeExistsForSegment(fromId, toId)) return false;
  if (state.inventory.bridges <= 0) return false;
  state.inventory.bridges -= 1;
  state.bridges.push({ fromId, toId });
  updateUI();
  return true;
}

function findBridgeIndexForSegment(fromId, toId) {
  return state.bridges.findIndex((bridge) => {
    return (bridge.fromId === fromId && bridge.toId === toId) ||
      (bridge.fromId === toId && bridge.toId === fromId);
  });
}

function bridgeExistsForSegment(fromId, toId) {
  return findBridgeIndexForSegment(fromId, toId) >= 0;
}

function routeHasSegment(line, fromId, toId) {
  if (line.stops.length < 2) return false;
  const segmentCount = line.closed ? line.stops.length : line.stops.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const a = line.stops[index];
    const b = line.stops[(index + 1) % line.stops.length];
    if ((a === fromId && b === toId) || (a === toId && b === fromId)) return true;
  }
  return false;
}

function bridgeSegmentIsActive(bridge) {
  const from = state.stations[bridge.fromId];
  const to = state.stations[bridge.toId];
  if (!from || !to) return false;
  const line = state.lines.find((candidate) => routeHasSegment(candidate, bridge.fromId, bridge.toId));
  if (!line) return false;
  if (routeSegmentWaterKindForStations(from, to, line) !== "inland") return false;
  return true;
}

function cleanupBridges(refund = true) {
  const seen = new Set();
  const kept = [];
  let returned = 0;
  state.bridges.forEach((bridge) => {
    const key = bridgeKey(bridge.fromId, bridge.toId);
    if (seen.has(key) || !bridgeSegmentIsActive(bridge)) {
      returned += 1;
      return;
    }
    seen.add(key);
    kept.push(bridge);
  });
  state.bridges = kept;
  if (refund && returned > 0) {
    state.inventory.bridges += returned;
    updateUI();
  }
}

function bridgeKey(fromId, toId) {
  return fromId < toId ? `${fromId}:${toId}` : `${toId}:${fromId}`;
}

function planBridgeInsert(line, stationId, insertIndex) {
  const previousId = line.stops[insertIndex];
  const nextId = line.stops[(insertIndex + 1) % line.stops.length];
  const pairs = [
    [previousId, stationId],
    [stationId, nextId],
  ];
  const needed = [];
  for (const pair of pairs) {
    const from = state.stations[pair[0]];
    const to = state.stations[pair[1]];
    const water = routeSegmentWaterKindForStations(from, to);
    if (water === "ocean") return { ok: false, reason: "ocean" };
    if (water === "inland" && !bridgeExistsForSegment(pair[0], pair[1])) needed.push(pair);
  }

  const oldBridgeIndex = findBridgeIndexForSegment(previousId, nextId);
  if (oldBridgeIndex >= 0) {
    const extraNeeded = Math.max(0, needed.length - 1);
    if (extraNeeded > state.inventory.bridges) return { ok: false, reason: "bridges" };
    return { ok: true, mode: "reassign", oldBridgeIndex, needed, extraNeeded };
  }

  const extraNeeded = needed.length;
  if (extraNeeded > state.inventory.bridges) {
    return { ok: false, reason: "bridges" };
  }
  return { ok: true, mode: "new", needed, extraNeeded };
}

function applyBridgeInsertPlan(plan) {
  if (!plan || !plan.ok) return false;
  if (plan.mode === "reassign") {
    if (plan.needed.length === 0) {
      state.bridges.splice(plan.oldBridgeIndex, 1);
      state.inventory.bridges += 1;
    } else {
      const oldBridge = state.bridges[plan.oldBridgeIndex];
      oldBridge.fromId = plan.needed[0][0];
      oldBridge.toId = plan.needed[0][1];
      for (let index = 1; index < plan.needed.length; index += 1) {
        state.bridges.push({ fromId: plan.needed[index][0], toId: plan.needed[index][1] });
      }
      state.inventory.bridges -= plan.extraNeeded;
    }
    updateUI();
    return true;
  }

  for (let index = 0; index < plan.needed.length; index += 1) {
    state.bridges.push({ fromId: plan.needed[index][0], toId: plan.needed[index][1] });
  }
  state.inventory.bridges -= plan.extraNeeded;
  updateUI();
  return true;
}

function warnBridgeInventory() {
  ui.inventoryBridgeBtn.classList.remove("warn");
  void ui.inventoryBridgeBtn.offsetWidth;
  ui.inventoryBridgeBtn.classList.add("warn");
  window.setTimeout(() => ui.inventoryBridgeBtn.classList.remove("warn"), 560);
}

function finishInventoryUse(itemUsed) {
  if (!itemUsed || !state.selectedItem) return;
  const inventoryKey = inventoryKeyForItem(state.selectedItem);
  if (!inventoryKey) return;
  state.inventory[inventoryKey] = Math.max(0, state.inventory[inventoryKey] - 1);
  state.selectedItem = null;
  updateUI();
}

function inventoryKeyForItem(item) {
  if (item === "bridge") return "bridges";
  if (item === "carriage") return "carriages";
  if (item === "engine") return "engines";
  if (item === "line") return "lines";
  return null;
}

function buyInventoryItem(item) {
  const inventoryKey = inventoryKeyForItem(item);
  const price = itemPrice(item);
  if (!inventoryKey || state.cash < price) return;
  state.cash -= price;
  state.inventory[inventoryKey] += 1;
  updateUI();
}

function toggleInventoryItem(item) {
  const inventoryKey = inventoryKeyForItem(item);
  if (!inventoryKey) return;
  if (state.selectedItem === item) {
    state.selectedItem = null;
  } else if (state.inventory[inventoryKey] > 0) {
    state.selectedItem = item;
  }
  updateUI();
}

function removeStationFromRoute(station) {
  const activeLine = state.lines[state.activeLine];
  let line = activeLine.stops.includes(station.id)
    ? activeLine
    : state.lines.find((candidate) => candidate.stops.includes(station.id));
  if (!line) return;
  removeStationFromLine(station.id, line.id);
}

function stationLineMemberships(stationId) {
  return state.lines.filter((line) => line.stops.includes(stationId));
}

function handleStationDisconnectRequest(station) {
  const memberships = stationLineMemberships(station.id);
  if (!memberships.length) return;
  if (memberships.length === 1) {
    removeStationFromLine(station.id, memberships[0].id);
    return;
  }
  disconnectMenu = {
    stationId: station.id,
    lineIds: memberships.map((line) => line.id),
    openedAt: performance.now(),
  };
}

function removeStationFromLine(stationId, lineId) {
  const line = state.lines[lineId];
  if (!line) return;
  line.stops = line.stops.filter((id) => id !== stationId);
  if (line.stops.length < 3) line.closed = false;
  cleanupSegmentVariants(line);
  state.activeLine = line.id;
  syncTrains(line);
  cleanupBridges();
  renderLinePicker();
}

function disconnectMenuLayout(menu = disconnectMenu) {
  if (!menu) return [];
  const station = state.stations[menu.stationId];
  if (!station) return [];
  const center = stationPosition(station);
  const elapsed = Math.max(0, performance.now() - menu.openedAt);
  const progress = Math.min(1, elapsed / 150);
  const eased = 1 - Math.pow(1 - progress, 3);
  const spacing = 28;
  const radius = 11;
  return menu.lineIds.map((lineId, index) => ({
    lineId,
    x: center.x + 34 + spacing * (index + 1) * eased,
    y: center.y,
    radius,
  }));
}

function getDisconnectMenuOptionAt(clientX, clientY) {
  if (!disconnectMenu) return null;
  const world = clientToWorld(clientX, clientY);
  return disconnectMenuLayout().find((option) => Math.hypot(world.x - option.x, world.y - option.y) <= option.radius + 6) || null;
}

function spawnPassenger() {
  if (state.stations.length < 2) return;
  const from = randomItem(state.stations);
  const choices = state.stations.filter((station) => station.shape !== from.shape);
  const to = randomItem(choices);
  if (!to) return;
  from.passengers.push({
    shape: to.shape,
    born: state.elapsed,
  });
}

function scheduleNextPlane(airport, baseTime = state.elapsed) {
  airport.nextPlaneAt = baseTime + randomBetween(AIRPORT_ARRIVAL_MIN, AIRPORT_ARRIVAL_MAX);
}

function startPlaneArrival(airport) {
  if (!airport || state.planeArrivals.some((arrival) => arrival.airportId === airport.id)) return;
  const airportPoint = stationPosition(airport);
  const rect = canvas.getBoundingClientRect();
  const metrics = mapViewportMetrics(rect);
  state.planeArrivals.push({
    airportId: airport.id,
    progress: 0,
    duration: AIRPORT_APPROACH_DURATION,
    dropSize: randomInt(AIRPORT_DROP_MIN, AIRPORT_DROP_MAX),
    startX: metrics.worldWidth + 80,
    startY: airportPoint.y - randomBetween(90, 150),
  });
}

function airportArrivalDestinations() {
  const shapes = state.stations
    .filter((station) => !station.airport)
    .map((station) => station.shape)
    .filter((shape, index, array) => array.indexOf(shape) === index);
  return shapes.length ? shapes : REGULAR_SHAPES;
}

function portArrivalDestinations() {
  const shapes = state.stations
    .filter((station) => !station.port)
    .map((station) => station.shape)
    .filter((shape, index, array) => array.indexOf(shape) === index);
  return shapes.length ? shapes : REGULAR_SHAPES;
}

function unloadPlane(arrival) {
  const airport = state.stations[arrival.airportId];
  if (!airport) return;
  const destinations = airportArrivalDestinations();
  for (let index = 0; index < arrival.dropSize; index += 1) {
    airport.passengers.push({
      shape: randomItem(destinations),
      born: state.elapsed,
    });
  }
}

function scheduleNextShip(port, baseTime = state.elapsed) {
  port.nextShipAt = baseTime + randomBetween(PORT_ARRIVAL_MIN, PORT_ARRIVAL_MAX);
}

function startShipArrival(port) {
  if (!port || state.shipArrivals.some((arrival) => arrival.portId === port.id)) return;
  const berth = portBerthGeometry(port);
  const rect = canvas.getBoundingClientRect();
  const metrics = mapViewportMetrics(rect);
  state.shipArrivals.push({
    portId: port.id,
    progress: 0,
    duration: PORT_APPROACH_DURATION,
    dropSize: randomInt(PORT_DROP_MIN, PORT_DROP_MAX),
    startX: Math.max(metrics.worldWidth + 120, berth.berthX + 150),
    startY: berth.berthY + randomBetween(-18, 18),
  });
}

function unloadShip(arrival) {
  const port = state.stations[arrival.portId];
  if (!port) return;
  const destinations = portArrivalDestinations();
  for (let index = 0; index < arrival.dropSize; index += 1) {
    port.passengers.push({
      shape: randomItem(destinations),
      born: state.elapsed,
    });
  }
}

function updateAirports(dt) {
  state.stations.forEach((station) => {
    if (!station.airport || station.nextPlaneAt === null) return;
    if (state.elapsed >= station.nextPlaneAt && !state.planeArrivals.some((arrival) => arrival.airportId === station.id)) {
      startPlaneArrival(station);
      scheduleNextPlane(station, station.nextPlaneAt);
    }
  });

  for (let index = state.planeArrivals.length - 1; index >= 0; index -= 1) {
    const arrival = state.planeArrivals[index];
    arrival.progress = Math.min(1, arrival.progress + dt / arrival.duration);
    if (arrival.progress >= 1) {
      unloadPlane(arrival);
      state.planeArrivals.splice(index, 1);
    }
  }
}

function updatePorts(dt) {
  state.stations.forEach((station) => {
    if (!station.port || station.nextShipAt === null) return;
    if (state.elapsed >= station.nextShipAt && !state.shipArrivals.some((arrival) => arrival.portId === station.id)) {
      startShipArrival(station);
      scheduleNextShip(station, station.nextShipAt);
    }
  });

  for (let index = state.shipArrivals.length - 1; index >= 0; index -= 1) {
    const arrival = state.shipArrivals[index];
    arrival.progress = Math.min(1, arrival.progress + dt / arrival.duration);
    if (arrival.progress >= 1) {
      unloadShip(arrival);
      state.shipArrivals.splice(index, 1);
    }
  }
}

function maybeAddStation() {
  const shape = randomItem(REGULAR_SHAPES);
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const candidate = snapTerrainPointToGrid(
      randomBetween(-state.map.west + 0.1, 0.9),
      randomBetween(-state.map.north + 0.14, 1 + state.map.south - 0.12)
    );
    const tooClose = state.stations.some((station) => Math.hypot(station.x - candidate.x, station.y - candidate.y) < 0.18);
    if (!tooClose && isLandStation(candidate.x, candidate.y)) {
      addStation(candidate.x, candidate.y, shape);
      return;
    }
  }
  expandMap();
  maybeAddStation();
}

function expandMap() {
  const previousBounds = {
    west: state.map.west,
    north: state.map.north,
    south: state.map.south,
  };
  const widthGrowth = mapWidth() * (MAP_EXPAND_FACTOR - 1);
  const heightGrowth = mapHeight() * (MAP_EXPAND_FACTOR - 1);
  state.map.west += widthGrowth;
  state.map.north += heightGrowth / 2;
  state.map.south += heightGrowth / 2;
  extendInlandWaters(previousBounds);
  fitCameraToMap();
  maybeAddAirport(previousBounds);
}

function extendInlandWaters(previousBounds) {
  const targetArea = estimateLandArea(state.coastline, state.map) * state.inlandWaterRatio;
  let currentArea = state.waterBodies.reduce((total, body) => total + waterBodyArea(body), 0);
  if (currentArea >= targetArea) return;

  for (let attempt = 0; currentArea < targetArea && attempt < 180; attempt += 1) {
    const body = Math.random() < 0.3
      ? createRiver(state.coastline, state.map)
      : createLake(state.coastline, state.map);
    if (!body) continue;
    if (!waterBodyTouchesExpandedBand(body, previousBounds)) continue;
    if (waterBodiesOverlapAny(body, state.waterBodies)) continue;
    if (waterBodyBlocksTransit(body)) continue;
    state.waterBodies.push(body);
    currentArea += waterBodyArea(body);
  }
}

function waterBodyTouchesExpandedBand(body, previousBounds) {
  return waterBodySamplePoints(body).some((point) => {
    return point.x < -previousBounds.west ||
      point.y < -previousBounds.north ||
      point.y > 1 + previousBounds.south;
  });
}

function waterBodySamplePoints(body) {
  return body.type === "lake" ? lakeSamplePoints(body) : riverSamplePoints(body);
}

function waterBodiesOverlapAny(body, existingBodies) {
  return existingBodies.some((other) => waterBodiesOverlap(body, other));
}

function waterBodiesOverlap(a, b) {
  const clearance = WATER_GRID * 0.35;
  return waterBodySamplePoints(a).some((point) => waterBodyContainsPoint(b, point.x, point.y, clearance)) ||
    waterBodySamplePoints(b).some((point) => waterBodyContainsPoint(a, point.x, point.y, clearance));
}

function waterBodyBlocksTransit(body) {
  if (state.stations.some((station) => waterBodyContainsPoint(body, station.x, station.y, STATION_LAND_RADIUS + SHORE_MARGIN))) {
    return true;
  }

  return state.lines.some((line) => {
    const segmentCount = line.closed ? line.stops.length : Math.max(0, line.stops.length - 1);
    for (let index = 0; index < segmentCount; index += 1) {
      const from = state.stations[line.stops[index]];
      const to = state.stations[line.stops[(index + 1) % line.stops.length]];
      if (from && to && trackPathHitsWaterBody(from, to, body, state.map)) return true;
    }
    return false;
  });
}

function maybeAddAirport(previousBounds) {
  if (state.day < state.nextAirportDay) return;
  const existingAirports = state.stations.filter((station) => station.airport).length;
  if (existingAirports >= 4) return;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate = snapTerrainPointToGrid(
      randomBetween(-state.map.west + 0.12, 0.88),
      randomBetween(-state.map.north + 0.16, 1 + state.map.south - 0.14)
    );
    const inNewBand = candidate.x < -previousBounds.west + 0.12 ||
      candidate.y < -previousBounds.north + 0.14 ||
      candidate.y > 1 + previousBounds.south - 0.14;
    const tooClose = state.stations.some((station) => Math.hypot(station.x - candidate.x, station.y - candidate.y) < 0.24);
    if (inNewBand && !tooClose && isLandStation(candidate.x, candidate.y)) {
      addAirport(candidate.x, candidate.y);
      scheduleNextAirportDay();
      return;
    }
  }
  const fallback = findAirportSpawnInExpandedBand(previousBounds);
  if (fallback) {
    addAirport(fallback.x, fallback.y);
    scheduleNextAirportDay();
  }
}

function addAirport(x, y) {
  addStation(x, y, AIRPORT_SHAPE, {
    airport: true,
    nextPlaneAt: state.elapsed + randomBetween(8, 16),
  });
}

function scheduleNextAirportDay() {
  state.nextAirportDay = state.day + randomInt(
    AIRPORT_DAY_INTERVAL - AIRPORT_DAY_VARIANCE,
    AIRPORT_DAY_INTERVAL + AIRPORT_DAY_VARIANCE
  );
}

function maybeAddPort() {
  if (!state.coastline || state.day < state.nextPortDay || state.lastPortAttemptDay === state.day) return;
  state.lastPortAttemptDay = state.day;
  const existingPorts = state.stations.filter((station) => station.port).length;
  if (existingPorts >= 4) return;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const y = randomBetween(-state.map.north + 0.16, 1 + state.map.south - 0.14);
    const coast = waterBoundaryAt(y);
    const x = coast - randomBetween(PORT_SHORE_MIN, PORT_SHORE_MAX);
    const candidate = snapTerrainPointToGrid(x, y);
    const tooClose = state.stations.some((station) => Math.hypot(station.x - candidate.x, station.y - candidate.y) < 0.26);
    const coastalEnough = isCoastalPortCandidate(candidate.x, candidate.y);
    if (coastalEnough && !tooClose && isPortStation(candidate.x, candidate.y)) {
      addPort(candidate.x, candidate.y);
      scheduleNextPortDay();
      return;
    }
  }
  const fallback = findPortSpawnCandidate();
  if (fallback) {
    addPort(fallback.x, fallback.y);
    scheduleNextPortDay();
  }
}

function addPort(x, y) {
  addStation(x, y, PORT_SHAPE, {
    port: true,
    nextShipAt: state.elapsed + randomBetween(14, 24),
  });
}

function scheduleNextPortDay() {
  state.nextPortDay = state.day + randomInt(
    PORT_DAY_INTERVAL - PORT_DAY_VARIANCE,
    PORT_DAY_INTERVAL + PORT_DAY_VARIANCE
  );
}

function findPortSpawnCandidate() {
  const candidates = [];
  for (let y = -state.map.north + 0.16; y <= 1 + state.map.south - 0.14; y += WATER_GRID) {
    const coast = waterBoundaryAt(y);
    for (let offset = PORT_SHORE_MIN; offset <= PORT_SHORE_MAX; offset += WATER_GRID / 2) {
      const candidate = snapTerrainPointToGrid(coast - offset, y);
      const tooClose = state.stations.some((station) => Math.hypot(station.x - candidate.x, station.y - candidate.y) < 0.26);
      if (tooClose || !isPortStation(candidate.x, candidate.y) || !isCoastalPortCandidate(candidate.x, candidate.y)) continue;
      candidates.push(candidate);
    }
  }
  return candidates.length ? randomItem(candidates) : null;
}

function isCoastalPortCandidate(x, y) {
  if (!state.coastline) return false;
  const boundary = waterBoundaryAt(y);
  const coastDistance = boundary - x;
  return coastDistance >= PORT_SHORE_MIN * 0.6 && coastDistance <= PORT_SHORE_MAX * 1.5;
}

function findAirportSpawnInExpandedBand(previousBounds) {
  const candidates = [];
  for (let y = -state.map.north + 0.16; y <= 1 + state.map.south - 0.14; y += WATER_GRID) {
    for (let x = -state.map.west + 0.12; x <= 0.88; x += WATER_GRID) {
      const candidate = snapTerrainPointToGrid(x, y);
      const inNewBand = candidate.x < -previousBounds.west + 0.12 ||
        candidate.y < -previousBounds.north + 0.14 ||
        candidate.y > 1 + previousBounds.south - 0.14;
      if (!inNewBand) continue;
      const tooClose = state.stations.some((station) => Math.hypot(station.x - candidate.x, station.y - candidate.y) < 0.24);
      if (tooClose || !isLandStation(candidate.x, candidate.y)) continue;
      candidates.push(candidate);
    }
  }
  return candidates.length ? randomItem(candidates) : null;
}

function isLandStation(x, y) {
  return isLandStationForTerrain(x, y, state);
}

function isPortStation(x, y) {
  return isPortStationForTerrain(x, y, state);
}

function isLandStationForTerrain(x, y, terrain) {
  const sampleYs = [y - STATION_LAND_RADIUS, y, y + STATION_LAND_RADIUS];
  return sampleYs.every((sampleY) => {
    if (x + STATION_LAND_RADIUS >= 1 - SHORE_MARGIN) return false;
    if (x < 0) return true;
    return x + STATION_LAND_RADIUS < waterBoundaryAtForCoast(sampleY, terrain.coastline) - SHORE_MARGIN &&
      !terrain.waterBodies.some((body) => waterBodyContainsPoint(body, x, sampleY, STATION_LAND_RADIUS + SHORE_MARGIN));
  });
}

function isPortStationForTerrain(x, y, terrain) {
  if (!terrain.coastline) return false;
  const sampleYs = [y - PORT_LAND_RADIUS, y, y + PORT_LAND_RADIUS];
  return sampleYs.every((sampleY) => {
    const boundary = waterBoundaryAtForCoast(sampleY, terrain.coastline);
    if (x + PORT_LAND_RADIUS >= 1 - PORT_SHORE_MARGIN) return false;
    if (x < 0) return true;
    return x + PORT_LAND_RADIUS < boundary - PORT_SHORE_MARGIN &&
      !terrain.waterBodies.some((body) => waterBodyContainsPoint(body, x, sampleY, PORT_LAND_RADIUS + SHORE_MARGIN));
  });
}

function routeSegmentHitsWater(aStation, bStation) {
  return routeSegmentHitsWaterForTerrain(aStation.x, aStation.y, bStation.x, bStation.y, state);
}

function routeSegmentHitsWaterForTerrain(x1, y1, x2, y2, terrain, mapOffsets = state?.map || { west: 0, north: 0, south: 0 }) {
  const path = trackPathBetweenTerrainPoints({ x: x1, y: y1 }, { x: x2, y: y2 }, mapOffsets);
  for (let index = 0; index < path.length - 1; index += 1) {
    if (routeSegmentWaterKind(path[index].x, path[index].y, path[index + 1].x, path[index + 1].y, terrain) !== "none") {
      return true;
    }
  }
  return false;
}

function routeSegmentWaterKind(x1, y1, x2, y2, terrain) {
  const distance = Math.hypot(x1 - x2, y1 - y2);
  const samples = Math.max(10, Math.ceil(distance / 0.01));
  let hitsInland = false;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (x + ROUTE_WATER_CLEARANCE >= 1 - SHORE_MARGIN) return "ocean";
    if (x < 0) continue;
    if (x + ROUTE_WATER_CLEARANCE >= waterBoundaryAtForCoast(y, terrain.coastline) - SHORE_MARGIN) return "ocean";
    if (terrain.waterBodies.some((body) => waterBodyContainsPoint(body, x, y, ROUTE_WATER_CLEARANCE))) hitsInland = true;
  }
  return hitsInland ? "inland" : "none";
}

function trackPathHitsWaterBody(a, b, body, mapOffsets = state?.map || { west: 0, north: 0, south: 0 }) {
  const path = trackPathBetweenTerrainPoints(a, b, mapOffsets);
  for (let index = 0; index < path.length - 1; index += 1) {
    if (segmentIntersectsWaterBody(path[index], path[index + 1], body, ROUTE_WATER_CLEARANCE)) return true;
  }
  return false;
}

function reshapeDistance(routeDrag) {
  return Math.hypot(routeDrag.worldX - routeDrag.startWorldX, routeDrag.worldY - routeDrag.startWorldY);
}

function getSegmentReshapePreview(line, segmentIndex, point) {
  const from = state.stations[line.stops[segmentIndex]];
  const to = state.stations[line.stops[(segmentIndex + 1) % line.stops.length]];
  if (!from || !to) return null;
  const candidates = generateTrackPathCandidates(stationTrackPosition(from), stationTrackPosition(to));
  if (candidates.length < 2) return null;
  let bestVariant = 0;
  let bestDistance = Infinity;
  candidates.forEach((candidate, index) => {
    const projection = projectPointToPolyline(point, candidate);
    if (projection && projection.distance < bestDistance) {
      bestDistance = projection.distance;
      bestVariant = index;
    }
  });
  return {
    from,
    to,
    variant: bestVariant,
    path: candidates[bestVariant],
    candidates,
  };
}

function applySegmentVariant(line, segmentIndex, variant) {
  const from = state.stations[line.stops[segmentIndex]];
  const to = state.stations[line.stops[(segmentIndex + 1) % line.stops.length]];
  if (!from || !to) return false;
  const currentVariant = getSegmentVariant(line, from.id, to.id, from, to);
  if (variant === currentVariant) return false;
  const nextWater = routeSegmentWaterKindForStations(from, to, line, variant);
  if (nextWater === "ocean") return false;

  const bridgeIndex = findBridgeIndexForSegment(from.id, to.id);
  if (nextWater === "inland" && bridgeIndex < 0) {
    if (state.inventory.bridges <= 0) {
      warnBridgeInventory();
      return false;
    }
    state.inventory.bridges -= 1;
    state.bridges.push({ fromId: from.id, toId: to.id });
  } else if (nextWater !== "inland" && bridgeIndex >= 0) {
    state.bridges.splice(bridgeIndex, 1);
    state.inventory.bridges += 1;
  }

  setSegmentVariant(line, from.id, to.id, variant, from, to);
  cleanupBridges(false);
  updateUI();
  return true;
}

function waterBoundaryAt(y) {
  return waterBoundaryAtForCoast(y, state.coastline);
}

function waterBoundaryAtForCoast(y, coast) {
  if (!coast) return 1;
  if (y <= 0) return coast.startX;
  if (y >= 1) return coast.endX;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 18; i += 1) {
    const t = (low + high) / 2;
    const pointY = cubicBezier(0, coast.control1Y, coast.control2Y, 1, t);
    if (pointY < y) low = t;
    else high = t;
  }
  const t = (low + high) / 2;
  return cubicBezier(coast.startX, coast.control1X, coast.control2X, coast.endX, t);
}

function cubicBezier(a, b, c, d, t) {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

function update(dt) {
  if (!state.started || state.paused || state.gameOver) return;

  state.elapsed += dt;
  state.day = 1 + Math.floor(state.elapsed / 35);
  state.spawnTimer -= dt;
  state.stationTimer -= dt;

  const spawnEvery = Math.max(0.79, (2.2 - state.day * 0.12) / 0.825);
  while (state.spawnTimer <= 0) {
    spawnPassenger();
    state.spawnTimer += spawnEvery;
  }

  if (state.stationTimer <= 0) {
    maybeAddStation();
    state.stationTimer = 22 + Math.random() * 14;
  }

  maybeAddPort();
  updateAirports(dt);
  updatePorts(dt);
  state.lines.forEach(updateLine.bind(null, dt));
  updateStress(dt);
  updateUI();
}

function updateLine(dt, line) {
  syncTrains(line);
  if (line.stops.length < 2) return;

  line.trains.forEach((train) => {
    if (train.dwell > 0) {
      train.dwell -= dt;
      return;
    }

    const a = state.stations[line.stops[train.segment]];
    const nextIndex = nextTrainStopIndex(line, train);
    const b = state.stations[line.stops[nextIndex]];
    if (!a || !b) {
      train.segment = 0;
      train.dir = 1;
      train.t = 0;
      return;
    }

    const distance = polylineLength(routeTravelPath(line, train.segment, nextIndex));
    train.t += (dt * TRAIN_SPEED) / Math.max(40, distance);

    if (train.t >= 1) {
      train.t = 0;
      train.segment = nextIndex;
      collectLegFares(train);
      if (!line.closed) {
        if (train.segment <= 0) {
          train.segment = 0;
          train.dir = 1;
        }
        if (train.segment >= line.stops.length - 1) {
          train.segment = line.stops.length - 1;
          train.dir = -1;
        }
      }
      const station = state.stations[line.stops[train.segment]];
      const exchangedPassengers = serviceStation(train, station, line);
      const sharpTurn = isSharpTurnAt(line, train.segment);
      if (exchangedPassengers || isTerminus(line, train.segment) || sharpTurn) {
        train.dwell = sharpTurn && !exchangedPassengers ? 0.28 : 0.38;
      }
    }
    snapTrainToVisibleTrack(line, train);
  });
}

function collectLegFares(train) {
  const fare = trainPassengerCount(train);
  if (!fare) return;
  state.cash += fare;
  state.score += fare;
}

function nextTrainStopIndex(line, train) {
  if (line.closed) return (train.segment + 1) % line.stops.length;
  return Math.max(0, Math.min(line.stops.length - 1, train.segment + train.dir));
}

function serviceStation(train, station, line) {
  let exchanged = false;
  trainCompartments(train).forEach((compartment) => {
    for (let i = compartment.passengers.length - 1; i >= 0; i -= 1) {
      const passenger = compartment.passengers[i];
      if (passenger.shape === station.shape) {
        compartment.passengers.splice(i, 1);
        state.trips += 1;
        state.score += 12;
        applyOperatingCosts();
        exchanged = true;
      } else if (shouldTransferHere(passenger, station, line)) {
        station.passengers.push(passenger);
        compartment.passengers.splice(i, 1);
        exchanged = true;
      }
    }
  });

  for (let i = station.passengers.length - 1; i >= 0 && trainPassengerCount(train) < train.capacity; i -= 1) {
    const passenger = station.passengers[i];
    if (passenger.shape !== station.shape && lineCanAdvancePassenger(line, station.id, passenger.shape)) {
      const compartment = firstOpenCompartment(train);
      if (!compartment) return;
      compartment.passengers.push(passenger);
      station.passengers.splice(i, 1);
      exchanged = true;
    }
  }
  return exchanged;
}

function firstOpenCompartment(train) {
  return trainCompartments(train).find((compartment) => {
    return compartment.passengers.length < compartment.capacity;
  });
}

function isTerminus(line, stationIndex) {
  return !line.closed && (stationIndex === 0 || stationIndex === line.stops.length - 1);
}

function isSharpTurnAt(line, stationIndex) {
  const angle = turnAngleAt(line, stationIndex);
  return angle !== null && angle < SHARP_TURN_ANGLE;
}

function turnAngleAt(line, stationIndex) {
  if (line.stops.length < 3) return null;
  if (!line.closed && (stationIndex <= 0 || stationIndex >= line.stops.length - 1)) return null;
  const previousIndex = (stationIndex - 1 + line.stops.length) % line.stops.length;
  const nextIndex = (stationIndex + 1) % line.stops.length;
  const incomingPath = routeTravelPath(line, stationIndex, previousIndex);
  const outgoingPath = routeTravelPath(line, stationIndex, nextIndex);
  const incoming = pathStartDirection(incomingPath);
  const outgoing = pathStartDirection(outgoingPath);
  if (!incoming || !outgoing) return null;
  const dot = dotPoints(incoming, outgoing);
  return Math.acos(Math.max(-1, Math.min(1, dot)));
}

function pathStartDirection(points) {
  if (points.length < 2) return null;
  const a = points[0];
  const b = points[1];
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (length < 1) return null;
  return { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
}

function shouldTransferHere(passenger, station, currentLine) {
  if (!stationIsOnLine(station.id, currentLine)) return false;
  if (lineHasDestination(currentLine, passenger.shape)) return false;
  return state.lines.some((line) => {
    return line.id !== currentLine.id &&
      stationIsOnLine(station.id, line) &&
      lineHasReachableDestination(line, passenger.shape);
  });
}

function lineCanAdvancePassenger(line, stationId, destinationShape) {
  if (!stationIsOnLine(stationId, line)) return false;
  if (lineHasDestination(line, destinationShape)) return true;
  return line.stops.some((stopId) => {
    if (stopId === stationId) return false;
    return state.lines.some((otherLine) => {
      return otherLine.id !== line.id &&
        stationIsOnLine(stopId, otherLine) &&
        lineHasReachableDestination(otherLine, destinationShape);
    });
  });
}

function lineHasReachableDestination(line, destinationShape, visitedLineIds = new Set()) {
  if (visitedLineIds.has(line.id)) return false;
  if (lineHasDestination(line, destinationShape)) return true;
  const nextVisitedLineIds = new Set(visitedLineIds);
  nextVisitedLineIds.add(line.id);
  return line.stops.some((stopId) => {
    return state.lines.some((otherLine) => {
      return otherLine.id !== line.id &&
        stationIsOnLine(stopId, otherLine) &&
        lineHasReachableDestination(otherLine, destinationShape, nextVisitedLineIds);
    });
  });
}

function lineHasDestination(line, destinationShape) {
  return line.stops.some((id) => state.stations[id].shape === destinationShape);
}

function stationIsOnLine(stationId, line) {
  return line.stops.includes(stationId);
}

function updateStress(dt) {
  const pressure = state.stations.reduce((total, station) => {
    const load = station.passengers.length / stationCapacity(station);
    const warning = Math.max(0, (load - STRESS_WARNING_LOAD) / (1 - STRESS_WARNING_LOAD));
    const overload = Math.max(0, load - 1);
    station.stressGlow = Math.min(1, warning * 0.75 + overload * 0.25);
    const localPressure = warning * 0.28 + warning * warning * 0.52 + overload * 1.1;
    const multiplier = station.airport
      ? AIRPORT_STRESS_MULTIPLIER
      : station.port
        ? PORT_STRESS_MULTIPLIER
        : 1;
    return total + localPressure * multiplier;
  }, 0);
  const recovery = pressure > 0 ? 0 : STRESS_FALL_RATE;
  const targetDelta = pressure > 0 ? Math.min(STRESS_RISE_RATE, pressure) : -recovery;
  state.stress += targetDelta * dt;
  state.stress = Math.max(0, Math.min(MAX_STRESS, state.stress));
  if (state.stress >= MAX_STRESS) {
    state.gameOver = true;
    showResults();
  }
}

function stationCapacity(station) {
  if (station.airport) return AIRPORT_CAPACITY;
  if (station.port) return PORT_CAPACITY;
  return STATION_CAPACITY;
}

function showResults() {
  if (state.resultsShown) return;
  state.resultsShown = true;
  syncMusicPlayback();
  ui.resultScore.textContent = `${state.score}`;
  ui.resultPassengers.textContent = `${state.trips} passenger${state.trips === 1 ? "" : "s"}`;
  ui.resultRevenue.textContent = `$${state.cash}`;
  ui.resultDays.textContent = `${state.day}`;
  if (ui.resultsLeaderboardStatus) {
    ui.resultsLeaderboardStatus.textContent = leaderboardReady ? "Posting..." : "Offline";
  }
  ui.resultsModal.classList.remove("hidden");
  submitLeaderboardScore().catch(() => {
    if (ui.resultsLeaderboardStatus) ui.resultsLeaderboardStatus.textContent = "Offline";
  });
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  const metrics = mapViewportMetrics(rect);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "#e6dcc7";
  ctx.fillRect(0, 0, rect.width, rect.height);
  drawViewportWaterGutter(rect, metrics);
  ctx.save();
  ctx.translate(metrics.offsetX + camera.x, metrics.offsetY + camera.y);
  ctx.scale(camera.zoom, camera.zoom);
  drawWater(rect);
  drawLines();
  drawSharpTurnWarnings();
  drawBridges();
  drawRouteDrag();
  drawNightMapShade(rect);
  drawStations();
  drawPlanes();
  drawShips();
  drawTrains();
  drawDisconnectMenu();
  ctx.restore();
  if (state.paused && !state.selectedItem) drawOverlay(rect);
}

function drawViewportWaterGutter(rect, metrics) {
  if (!state.coastline) return;
  const gutterStart = metrics.offsetX + camera.x + metrics.scaledWorldWidth;
  if (gutterStart >= rect.width) return;
  ctx.fillStyle = SEA_COLOR;
  ctx.fillRect(gutterStart, 0, rect.width - gutterStart, rect.height);
}

function drawWater(rect) {
  const coast = state.coastline;
  const metrics = mapViewportMetrics(rect);
  ctx.fillStyle = "#e6dcc7";
  ctx.fillRect(0, 0, metrics.worldWidth, metrics.worldHeight);
  if (coast) {
    const topY = -state.map.north;
    const bottomY = 1 + state.map.south;
    const extendedTop = terrainPointToWorld(coast.startX, topY, rect);
    const start = terrainPointToWorld(coast.startX, 0, rect);
    const control1 = terrainPointToWorld(coast.control1X, coast.control1Y, rect);
    const control2 = terrainPointToWorld(coast.control2X, coast.control2Y, rect);
    const end = terrainPointToWorld(coast.endX, 1, rect);
    const extendedBottom = terrainPointToWorld(coast.endX, bottomY, rect);
    const oceanTop = terrainPointToWorld(1, topY, rect);
    const oceanBottom = terrainPointToWorld(1, bottomY, rect);
    ctx.fillStyle = SEA_COLOR;
    ctx.beginPath();
    ctx.moveTo(extendedTop.x, extendedTop.y);
    ctx.lineTo(start.x, start.y);
    ctx.bezierCurveTo(
      control1.x,
      control1.y,
      control2.x,
      control2.y,
      end.x,
      end.y
    );
    ctx.lineTo(extendedBottom.x, extendedBottom.y);
    ctx.lineTo(oceanBottom.x, oceanBottom.y);
    ctx.lineTo(oceanTop.x, oceanTop.y);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = INLAND_WATER_COLOR;
  drawInlandWaterCells(rect);
}

function drawNightMapShade(rect) {
  const intensity = nightIntensity();
  if (intensity <= 0) return;
  const metrics = mapViewportMetrics(rect);
  ctx.fillStyle = `rgba(20, 28, 44, ${MAX_NIGHT_DIM * intensity})`;
  ctx.fillRect(0, 0, metrics.worldWidth, metrics.worldHeight);
}

function drawInlandWaterCells(rect) {
  const cells = collectInlandWaterCells(rect);
  drawDiagonalWaterConnectors(cells);
  cells.forEach((cellKey) => {
    const [col, row] = cellKey.split(",").map(Number);
    drawWaterCell(col, row, cells);
  });
}

function drawGrid(rect) {
  const metrics = mapViewportMetrics(rect);
  const width = metrics.worldWidth;
  const height = metrics.worldHeight;
  ctx.strokeStyle = "#e4e8ef";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function collectInlandWaterCells(rect) {
  const cells = new Set();
  state.waterBodies.forEach((body) => {
    if (body.type === "lake") addLakeCells(body, rect, cells);
    else addRiverCells(body, rect, cells);
  });
  return cells;
}

function addLakeCells(lake, rect, cells) {
  const startCol = Math.round(lake.left / WATER_GRID);
  const startRow = Math.round(lake.top / WATER_GRID);
  const endCol = startCol + Math.max(1, Math.round(lake.width / WATER_GRID));
  const endRow = startRow + Math.max(1, Math.round(lake.height / WATER_GRID));
  for (let col = startCol; col < endCol; col += 1) {
    for (let row = startRow; row < endRow; row += 1) {
      cells.add(cellKey(col, row));
    }
  }
}

function addRiverCells(river, rect, cells) {
  const points = river.points.map((point) => ({
    col: Math.round(point.x / WATER_GRID),
    row: Math.round(point.y / WATER_GRID),
  }));
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    const colStep = Math.sign(b.col - a.col);
    const rowStep = Math.sign(b.row - a.row);
    let col = a.col;
    let row = a.row;
    cells.add(cellKey(col, row));
    while (col !== b.col || row !== b.row) {
      if (col !== b.col) col += colStep;
      if (row !== b.row) row += rowStep;
      cells.add(cellKey(col, row));
    }
  }
}

function drawWaterCell(col, row, cells) {
  const top = cells.has(cellKey(col, row - 1));
  const right = cells.has(cellKey(col + 1, row));
  const bottom = cells.has(cellKey(col, row + 1));
  const left = cells.has(cellKey(col - 1, row));
  const topLeft = cells.has(cellKey(col - 1, row - 1));
  const topRight = cells.has(cellKey(col + 1, row - 1));
  const bottomRight = cells.has(cellKey(col + 1, row + 1));
  const bottomLeft = cells.has(cellKey(col - 1, row + 1));
  const radii = {
    topLeft: !top && !left && !topLeft ? WATER_RADIUS : 0,
    topRight: !top && !right && !topRight ? WATER_RADIUS : 0,
    bottomRight: !bottom && !right && !bottomRight ? WATER_RADIUS : 0,
    bottomLeft: !bottom && !left && !bottomLeft ? WATER_RADIUS : 0,
  };
  const rect = canvas.getBoundingClientRect();
  const topLeftPoint = terrainPointToWorld(col * WATER_GRID, row * WATER_GRID, rect);
  const bottomRightPoint = terrainPointToWorld((col + 1) * WATER_GRID, (row + 1) * WATER_GRID, rect);
  const width = bottomRightPoint.x - topLeftPoint.x;
  const height = bottomRightPoint.y - topLeftPoint.y;
  const radiusScale = Math.min(width, height) / GRID_SIZE;
  roundRectCorners(
    topLeftPoint.x - 0.5,
    topLeftPoint.y - 0.5,
    width + 1,
    height + 1,
    {
      topLeft: radii.topLeft * radiusScale,
      topRight: radii.topRight * radiusScale,
      bottomRight: radii.bottomRight * radiusScale,
      bottomLeft: radii.bottomLeft * radiusScale,
    }
  );
  ctx.fill();
}

function drawDiagonalWaterConnectors(cells) {
  cells.forEach((cell) => {
    const [col, row] = cell.split(",").map(Number);
    if (cells.has(cellKey(col + 1, row + 1)) &&
      !cells.has(cellKey(col + 1, row)) &&
      !cells.has(cellKey(col, row + 1))) {
      drawTriangleWaterCell(col + 1, row, "bottomLeft");
      drawTriangleWaterCell(col, row + 1, "topRight");
    }
    if (cells.has(cellKey(col - 1, row + 1)) &&
      !cells.has(cellKey(col - 1, row)) &&
      !cells.has(cellKey(col, row + 1))) {
      drawTriangleWaterCell(col - 1, row, "bottomRight");
      drawTriangleWaterCell(col, row + 1, "topLeft");
    }
  });
}

function drawTriangleWaterCell(col, row, corner) {
  const rect = canvas.getBoundingClientRect();
  const topLeft = terrainPointToWorld(col * WATER_GRID, row * WATER_GRID, rect);
  const bottomRight = terrainPointToWorld((col + 1) * WATER_GRID, (row + 1) * WATER_GRID, rect);
  const x = topLeft.x - 0.5;
  const y = topLeft.y - 0.5;
  const width = bottomRight.x - topLeft.x + 1;
  const height = bottomRight.y - topLeft.y + 1;
  ctx.beginPath();
  if (corner === "topLeft") {
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y + height);
  } else if (corner === "topRight") {
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y);
  } else if (corner === "bottomRight") {
    ctx.moveTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width, y);
  } else {
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width, y + height);
  }
  ctx.closePath();
  ctx.fill();
}

function cellKey(col, row) {
  return `${col},${row}`;
}

function terrainPointToWorld(x, y, rect) {
  return terrainPointToWorldForOffsets(x, y, state?.map || { west: 0, north: 0, south: 0 }, rect);
}

function terrainPointToWorldForOffsets(x, y, mapOffsets = state?.map || { west: 0, north: 0, south: 0 }, rect = canvas.getBoundingClientRect()) {
  const metrics = mapViewportMetrics(rect, mapOffsets);
  return {
    x: (x + metrics.west) * metrics.scaleX,
    y: (y + metrics.north) * metrics.scaleY,
  };
}

function worldPointToTerrainForOffsets(point, mapOffsets = state?.map || { west: 0, north: 0, south: 0 }, rect = canvas.getBoundingClientRect()) {
  const metrics = mapViewportMetrics(rect, mapOffsets);
  return {
    x: point.x / metrics.scaleX - metrics.west,
    y: point.y / metrics.scaleY - metrics.north,
  };
}

function portBerthGeometry(port, rect = canvas.getBoundingClientRect()) {
  const portPoint = stationPosition(port);
  const coastX = waterBoundaryAt(port.y);
  const coastPoint = terrainPointToWorld(coastX, port.y, rect);
  const shoreX = Math.max(portPoint.x + 20, coastPoint.x - 10);
  const berthX = Math.max(shoreX + 18, coastPoint.x + 28);
  return {
    portX: portPoint.x,
    portY: portPoint.y,
    coastX: coastPoint.x,
    coastY: coastPoint.y,
    shoreX,
    berthX,
    berthY: portPoint.y,
  };
}

function snapTerrainPointToGrid(x, y, mapOffsets = state?.map || { west: 0, north: 0, south: 0 }) {
  const west = mapOffsets.west || 0;
  const north = mapOffsets.north || 0;
  const south = mapOffsets.south || 0;
  return {
    x: Math.max(-west, Math.min(1, Math.round(x / WATER_GRID) * WATER_GRID)),
    y: Math.max(-north, Math.min(1 + south, Math.round(y / WATER_GRID) * WATER_GRID)),
  };
}

function snapPixel(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function drawLines() {
  state.lines.forEach((line) => {
    if (line.stops.length === 1) {
      const p = stationPosition(state.stations[line.stops[0]]);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    if (line.stops.length < 2) return;
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokeLinePath(line);
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 3;
    strokeLinePath(line);
  });
}

function strokeLinePath(line) {
  const segmentCount = line.closed ? line.stops.length : line.stops.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    drawPolyline(routeSegmentPath(line, index));
  }
}

function drawPolyline(points) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.stroke();
}

function roundedTrackPath(points, radius, curveSteps = 8) {
  if (points.length < 3) return points;
  const result = [points[0]];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const prevLength = Math.hypot(current.x - previous.x, current.y - previous.y);
    const nextLength = Math.hypot(next.x - current.x, next.y - current.y);
    if (prevLength < 1 || nextLength < 1) continue;
    const cornerRadius = Math.min(radius, prevLength / 2, nextLength / 2);
    const before = {
      x: current.x + (previous.x - current.x) * (cornerRadius / prevLength),
      y: current.y + (previous.y - current.y) * (cornerRadius / prevLength),
    };
    const after = {
      x: current.x + (next.x - current.x) * (cornerRadius / nextLength),
      y: current.y + (next.y - current.y) * (cornerRadius / nextLength),
    };
    result.push(before);
    for (let step = 1; step < curveSteps; step += 1) {
      const t = step / curveSteps;
      result.push(quadraticPoint(before, current, after, t));
    }
    result.push(after);
  }
  result.push(points[points.length - 1]);
  return result;
}

function quadraticPoint(a, control, b, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * a.x + 2 * mt * t * control.x + t * t * b.x,
    y: mt * mt * a.y + 2 * mt * t * control.y + t * t * b.y,
  };
}

function drawSharpTurnWarnings() {
  state.lines.forEach((line) => {
    if (line.stops.length < 3) return;
    line.stops.forEach((stationId, stationIndex) => {
      if (!isSharpTurnAt(line, stationIndex)) return;
      const p = stationPosition(state.stations[stationId]);
      ctx.save();
      ctx.strokeStyle = "rgba(216, 162, 27, 0.9)";
      ctx.fillStyle = "rgba(216, 162, 27, 0.14)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 31, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  });
}

function drawBridges() {
  state.bridges.forEach((bridge) => {
    const line = state.lines.find((candidate) => routeHasSegment(candidate, bridge.fromId, bridge.toId));
    if (!line) return;
    const from = state.stations[bridge.fromId];
    const to = state.stations[bridge.toId];
    if (!from || !to) return;
    routeSegmentInlandSpans(from, to, line).forEach((span) => {
      drawBridgeSpan(span.a, span.b, span.start, span.end);
    });
  });
}

function drawBridgeSpan(a, b, startT, endT) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) return;
  const start = Math.max(0, Math.min(1, startT));
  const end = Math.max(0, Math.min(1, endT));
  if (end - start <= 0.01) return;
  const nx = -dy / length;
  const ny = dx / length;
  const p1 = {
    x: a.x + dx * start,
    y: a.y + dy * start,
  };
  const p2 = {
    x: a.x + dx * end,
    y: a.y + dy * end,
  };
  ctx.save();
  ctx.strokeStyle = "#202124";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p1.x + nx * 9, p1.y + ny * 9);
  ctx.lineTo(p2.x + nx * 9, p2.y + ny * 9);
  ctx.moveTo(p1.x - nx * 9, p1.y - ny * 9);
  ctx.lineTo(p2.x - nx * 9, p2.y - ny * 9);
  ctx.stroke();
  ctx.restore();
}

function routeSegmentInlandSpans(from, to, line = null) {
  const path = trackPathBetweenStations(from, to, line ? getSegmentVariant(line, from.id, to.id, from, to) : 0);
  return path.slice(0, -1).flatMap((point, index) => inlandSpansOnPathLeg(point, path[index + 1]));
}

function inlandSpansOnPathLeg(a, b) {
  const terrainSpans = inlandTerrainSpansOnPathLeg(a, b);
  if (terrainSpans.length) return terrainSpans;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const samples = Math.max(12, Math.ceil(length / 8));
  const spans = [];
  let spanStart = null;
  const rect = canvas.getBoundingClientRect();
  const waterCells = collectInlandWaterCells(rect);
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    const inland = waterCells.has(cellKey(Math.floor(x / GRID_SIZE), Math.floor(y / GRID_SIZE)));
    if (inland && spanStart === null) spanStart = t;
    if ((!inland || i === samples) && spanStart !== null) {
      const end = inland && i === samples ? t : Math.max(0, (i - 1) / samples);
      const padding = Math.min(0.35, (GRID_SIZE * 0.55) / Math.max(1, length));
      spans.push({
        a,
        b,
        start: Math.max(0, spanStart - padding),
        end: Math.min(1, end + padding),
      });
      spanStart = null;
    }
  }
  return mergeBridgeSpans(spans);
}

function inlandTerrainSpansOnPathLeg(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const samples = Math.max(18, Math.ceil(length / 6));
  const spans = [];
  let spanStart = null;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    const point = worldPointToTerrain({ x, y });
    const inland = state.waterBodies.some((body) => waterBodyContainsPoint(body, point.x, point.y, ROUTE_WATER_CLEARANCE));
    if (inland && spanStart === null) spanStart = t;
    if ((!inland || i === samples) && spanStart !== null) {
      const end = inland && i === samples ? t : Math.max(0, (i - 1) / samples);
      const padding = Math.min(0.35, (GRID_SIZE * 0.45) / Math.max(1, length));
      spans.push({
        a,
        b,
        start: Math.max(0, spanStart - padding),
        end: Math.min(1, end + padding),
      });
      spanStart = null;
    }
  }
  return mergeBridgeSpans(spans);
}

function mergeBridgeSpans(spans) {
  if (spans.length < 2) return spans;
  const merged = [];
  spans.sort((a, b) => a.start - b.start).forEach((span) => {
    const previous = merged[merged.length - 1];
    if (previous && span.start <= previous.end + 0.02) {
      previous.end = Math.max(previous.end, span.end);
    } else {
      merged.push({ ...span });
    }
  });
  return merged;
}

function pointBetween(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function drawRouteDrag() {
  if (!routeDrag) return;
  const line = state.lines[routeDrag.lineId];
  if (!line) return;

  if (routeDrag.startStationId === undefined && routeDrag.insertIndex >= 0 && routeDrag.stationId === null) {
    const reshape = getSegmentReshapePreview(line, routeDrag.insertIndex, { x: routeDrag.worldX, y: routeDrag.worldY });
    if (reshape && reshapeDistance(routeDrag) > 18) {
      ctx.save();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([14, 10]);
      drawPolyline(roundedTrackPath(reshape.path, 18));
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 3;
      drawPolyline(roundedTrackPath(reshape.path, 18));
      ctx.restore();
      return;
    }
  }

  const anchorIndex = routeDrag.anchorIndex ?? routeDrag.insertIndex;
  const anchor = routeDrag.startStationId !== undefined
    ? state.stations[routeDrag.startStationId]
    : state.stations[line.stops[anchorIndex]];
  if (!anchor) return;

  const a = stationPosition(anchor);
  const b = routeDrag.startStationId === undefined && routeDrag.insertIndex >= 0 && (routeDrag.insertIndex < line.stops.length - 1 || line.closed)
    ? stationPosition(state.stations[line.stops[(routeDrag.insertIndex + 1) % line.stops.length]])
    : null;
  const targetStation = state.stations.find((station) => {
    if (station.id !== routeDrag.stationId) return false;
    return station.id !== routeDrag.startStationId && (!line.stops.includes(station.id) || (
      !line.closed &&
      line.stops.length >= 3 &&
      ((routeDrag.insertIndex < 0 && station.id === line.stops[line.stops.length - 1]) ||
        (routeDrag.insertIndex >= line.stops.length - 1 && station.id === line.stops[0]))
    ));
  });
  const target = targetStation ? stationPosition(targetStation) : { x: routeDrag.worldX, y: routeDrag.worldY };

  ctx.save();
  ctx.strokeStyle = line.color;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(target.x, target.y);
  if (b) ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawStations() {
  const activeStops = new Set(state.lines[state.activeLine].stops);
  const lightNight = nightLightIntensity();
  state.stations.forEach((station) => {
    const p = stationPosition(station);
    if (station.airport) drawAirportScenario(p.x, p.y);
    if (station.port) drawPortScenario(p.x, p.y, station);
    const stressGlow = station.stressGlow || 0;
    station.pulse += 0.04;
    if (stressGlow > 0) {
      const pulse = 0.82 + Math.sin(station.pulse) * 0.18;
      const radius = 28 + stressGlow * 24;
      ctx.fillStyle = `rgba(229, 82, 77, ${stressGlow * pulse * 0.28})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(229, 82, 77, ${0.22 + stressGlow * 0.42})`;
      ctx.lineWidth = 2 + stressGlow * 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius - 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (station.id === pointer.stationId || activeStops.has(station.id)) {
      ctx.strokeStyle = station.id === pointer.stationId ? state.lines[state.activeLine].color : "#202124";
      ctx.lineWidth = station.id === pointer.stationId ? 4 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, station.id === pointer.stationId ? 26 : 23, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (lightNight > 0) {
      ctx.fillStyle = `rgba(255, 243, 194, ${0.05 + lightNight * 0.23})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24 + lightNight * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    if (station.airport || station.port) {
      ctx.strokeStyle = "#202124";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawShape(station.shape, p.x, p.y, station.airport || station.port ? 18 : 16, "#ffffff", "#202124", 4);
    drawPassengerQueue(station, p.x, p.y + 28);
  });
}

function drawAirportScenario(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(97, 103, 111, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 54, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9d9b95";
  ctx.strokeStyle = "#6e6b65";
  ctx.lineWidth = 2;
  roundRect(-44, -10, 88, 20, 7);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(34, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#c7c0b1";
  roundRect(-18, -32, 36, 16, 4);
  ctx.fill();
  ctx.strokeStyle = "#6e6b65";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#7f8d94";
  ctx.fillRect(-12, -29, 6, 5);
  ctx.fillRect(-3, -29, 6, 5);
  ctx.fillRect(6, -29, 6, 5);

  ctx.restore();
}

function drawPortScenario(x, y, station) {
  const berth = portBerthGeometry(station);
  const pierBase = Math.max(16, berth.shoreX - x);
  const pierTip = Math.max(pierBase + 22, berth.berthX - x);

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(97, 103, 111, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 9, 58, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9d9b95";
  ctx.strokeStyle = "#6e6b65";
  ctx.lineWidth = 2;
  roundRect(-40, 4, 80, 14, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#c7c0b1";
  roundRect(-24, -28, 48, 18, 4);
  ctx.fill();
  ctx.strokeStyle = "#6e6b65";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#a88958";
  roundRect(pierBase, -9, pierTip - pierBase, 18, 4);
  ctx.fill();
  ctx.strokeStyle = "#5f4a32";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#5f4a32";
  ctx.lineWidth = 3;
  for (let postX = pierBase + 6; postX < pierTip; postX += 14) {
    ctx.beginPath();
    ctx.moveTo(postX, 9);
    ctx.lineTo(postX, 18);
    ctx.stroke();
  }

  ctx.strokeStyle = "#6e6b65";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(18, -4);
  ctx.lineTo(pierBase, -4);
  ctx.moveTo(18, 4);
  ctx.lineTo(pierBase, 4);
  ctx.stroke();

  ctx.fillStyle = "#7f8d94";
  ctx.fillRect(-17, -23, 8, 6);
  ctx.fillRect(-4, -23, 8, 6);
  ctx.fillRect(9, -23, 8, 6);

  ctx.restore();
}

function drawPlanes() {
  const lightNight = nightLightIntensity();
  state.planeArrivals.forEach((arrival) => {
    const airport = state.stations[arrival.airportId];
    if (!airport) return;
    const airportPoint = stationPosition(airport);
    const t = Math.max(0, Math.min(1, arrival.progress));
    const eased = 1 - Math.pow(1 - t, 2);
    const x = arrival.startX + (airportPoint.x - arrival.startX) * eased;
    const y = arrival.startY + (airportPoint.y - arrival.startY) * eased;
    const angle = Math.atan2(airportPoint.y - arrival.startY, airportPoint.x - arrival.startX);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    drawAirlinerSilhouette(0, 0);
    if (lightNight > 0) drawPlanePositionLights(lightNight);
    ctx.restore();
  });
}

function drawShips() {
  const lightNight = nightLightIntensity();
  state.shipArrivals.forEach((arrival) => {
    const port = state.stations[arrival.portId];
    if (!port) return;
    const berth = portBerthGeometry(port);
    const t = Math.max(0, Math.min(1, arrival.progress));
    const eased = 1 - Math.pow(1 - t, 2);
    const x = arrival.startX + (berth.berthX - arrival.startX) * eased;
    const y = arrival.startY + (berth.berthY - arrival.startY) * eased;
    const angle = Math.atan2(berth.berthY - arrival.startY, berth.berthX - arrival.startX);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI);
    drawShipSilhouette(0, 0);
    if (lightNight > 0) drawShipPositionLights(lightNight);
    ctx.restore();
  });
}

function drawAirlinerSilhouette(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.5, 0.5);
  ctx.fillStyle = "#2f2f31";
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.bezierCurveTo(4.5, -38, 6.5, -31, 6.5, -24);
  ctx.lineTo(6.5, -8);
  ctx.lineTo(34, 8);
  ctx.lineTo(34, 16);
  ctx.lineTo(6.5, 10);
  ctx.lineTo(6.5, 31);
  ctx.lineTo(18, 42);
  ctx.lineTo(12, 46);
  ctx.lineTo(1.5, 38);
  ctx.lineTo(0, 47);
  ctx.lineTo(-1.5, 47);
  ctx.lineTo(-3, 38);
  ctx.lineTo(-14, 46);
  ctx.lineTo(-20, 42);
  ctx.lineTo(-8.5, 31);
  ctx.lineTo(-8.5, 10);
  ctx.lineTo(-36, 16);
  ctx.lineTo(-36, 8);
  ctx.lineTo(-8.5, -8);
  ctx.lineTo(-8.5, -24);
  ctx.bezierCurveTo(-8.5, -31, -4.5, -38, 0, -38);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShipSilhouette(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.62, 0.62);
  ctx.fillStyle = "#202124";
  ctx.beginPath();
  ctx.moveTo(-78, 0);
  ctx.quadraticCurveTo(-70, -7, -56, -12);
  ctx.quadraticCurveTo(-24, -23, 24, -22);
  ctx.quadraticCurveTo(46, -21, 66, -20);
  ctx.lineTo(78, -18);
  ctx.lineTo(80, -9);
  ctx.lineTo(80, 9);
  ctx.lineTo(78, 18);
  ctx.lineTo(66, 20);
  ctx.quadraticCurveTo(46, 21, 24, 22);
  ctx.quadraticCurveTo(-24, 23, -56, 12);
  ctx.quadraticCurveTo(-70, 7, -78, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlanePositionLights(night) {
  const blink = Math.sin(state.elapsed * 7.5) > 0 ? 1 : 0.2;
  ctx.fillStyle = `rgba(255, 70, 70, ${0.35 + 0.55 * blink * night})`;
  ctx.beginPath();
  ctx.arc(-17, 8, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(76, 220, 140, ${0.35 + 0.55 * blink * night})`;
  ctx.beginPath();
  ctx.arc(17, 8, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 248, 220, ${0.18 + 0.42 * blink * night})`;
  ctx.beginPath();
  ctx.arc(0, -28, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawShipPositionLights(night) {
  ctx.fillStyle = `rgba(255, 88, 88, ${0.45 + night * 0.4})`;
  ctx.beginPath();
  ctx.arc(-56, -6, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(82, 224, 146, ${0.45 + night * 0.4})`;
  ctx.beginPath();
  ctx.arc(-56, 6, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 248, 220, ${0.34 + night * 0.3})`;
  ctx.beginPath();
  ctx.arc(48, 0, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPassengerQueue(station, x, y) {
  const maxVisible = 8;
  station.passengers.slice(0, maxVisible).forEach((passenger, index) => {
    const px = x - 28 + (index % 4) * 18;
    const py = y + Math.floor(index / 4) * 16;
    drawShape(passenger.shape, px, py, 5, "#202124", "#202124", 1.5);
  });
  if (station.passengers.length > maxVisible) {
    ctx.fillStyle = "#202124";
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.fillText(`+${station.passengers.length - maxVisible}`, x + 38, y + 5);
  }
}

function drawTrains() {
  const lightNight = nightLightIntensity();
  state.lines.forEach((line) => {
    line.trains.forEach((train) => {
      normalizeTrainCompartments(train);
      if (trainDrag?.type === "engine" && trainDrag.train === train) return;
      for (let car = train.carriages.length; car >= 0; car -= 1) {
        if (trainDrag?.type === "carriage" && trainDrag.train === train && trainDrag.carriageIndex === car - 1) continue;
        const pos = trainPartPosition(line, train, car);
        if (!pos) continue;
        if (lightNight > 0 && car === 0) drawTrainHeadlight(pos, lightNight);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.angle);
        ctx.fillStyle = line.color;
        ctx.strokeStyle = "#202124";
        ctx.lineWidth = 2;
        roundRect(-17, -8, 34, 16, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-9, -4, 6, 8);
        ctx.fillRect(3, -4, 6, 8);
        ctx.restore();
      }

      const pos = trainPosition(line, train);
      if (!pos) return;
      const passengers = trainPassengers(train);
      passengers.slice(0, 4).forEach((passenger, index) => {
        drawShape(passenger.shape, pos.x - 18 + index * 12, pos.y - 20, 4.5, "#202124", "#202124", 1);
      });
      if (passengers.length > 4) {
        ctx.fillStyle = "#202124";
        ctx.font = "700 11px system-ui, sans-serif";
        ctx.fillText(`+${passengers.length - 4}`, pos.x + 20, pos.y - 16);
      }
    });
  });
  drawTrainDrag();
}

function drawTrainHeadlight(pos, night) {
  const beamLength = 62 + night * 26;
  const beamWidth = 18 + night * 6;
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.angle);
  const gradient = ctx.createLinearGradient(10, 0, beamLength, 0);
  gradient.addColorStop(0, `rgba(255, 246, 196, ${0.24 + night * 0.22})`);
  gradient.addColorStop(0.55, `rgba(255, 246, 196, ${0.09 + night * 0.1})`);
  gradient.addColorStop(1, "rgba(255, 246, 196, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(beamLength, -beamWidth);
  ctx.lineTo(beamLength, beamWidth);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 248, 222, ${0.4 + night * 0.3})`;
  ctx.beginPath();
  ctx.arc(14, 0, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function trainPassengers(train) {
  return trainCompartments(train).flatMap((compartment) => compartment.passengers);
}

function drawTrainDrag() {
  if (!trainDrag) return;
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.translate(trainDrag.worldX, trainDrag.worldY);
  ctx.rotate(trainDrag.angle);
  const parts = trainDrag.type === "engine" ? 1 + trainDrag.train.carriages.length : 1;
  for (let part = parts - 1; part >= 0; part -= 1) {
    const offset = trainDrag.type === "engine" ? -part * 38 : 0;
    ctx.fillStyle = trainDrag.line.color;
    ctx.strokeStyle = "#202124";
    ctx.lineWidth = 2;
    roundRect(offset - 17, -8, 34, 16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(offset - 9, -4, 6, 8);
    ctx.fillRect(offset + 3, -4, 6, 8);
  }
  ctx.restore();
}

function drawDisconnectMenu() {
  if (!disconnectMenu) return;
  const station = state.stations[disconnectMenu.stationId];
  if (!station) {
    disconnectMenu = null;
    return;
  }
  const options = disconnectMenuLayout();
  if (!options.length) return;
  const center = stationPosition(station);
  ctx.save();
  ctx.strokeStyle = "rgba(32, 33, 36, 0.22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(center.x + 18, center.y);
  ctx.lineTo(options[options.length - 1].x, options[options.length - 1].y);
  ctx.stroke();
  options.forEach((option) => {
    const line = state.lines[option.lineId];
    if (!line) return;
    ctx.fillStyle = line.color;
    ctx.strokeStyle = "#202124";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(option.x, option.y, option.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function trainPosition(line, train) {
  if (line.stops.length < 2) return null;
  return trainPartPosition(line, train, 0);
}

function trainPartPosition(line, train, partIndex) {
  if (line.stops.length < 2) return null;
  const fromIndex = train.segment;
  const toIndex = nextTrainStopIndex(line, train);
  const path = routeTravelPath(line, fromIndex, toIndex);
  if (path.length < 2 || toIndex === fromIndex) return null;
  const segmentLength = polylineLength(path);
  const backwardDistance = partIndex * 38;
  let distanceAlong = segmentLength * Math.max(0, Math.min(1, train.t)) - backwardDistance;
  if (distanceAlong >= 0) return pointOnPolylineAtDistance(path, distanceAlong);

  let anchorIndex = fromIndex;
  let remaining = -distanceAlong;
  while (true) {
    const behindIndex = adjacentStopIndex(line, anchorIndex, train.dir === 1 ? -1 : 1);
    if (behindIndex === null) return pointOnPolylineAtDistance(path, 0);
    const behindPath = routeTravelPath(line, behindIndex, anchorIndex);
    const behindLength = polylineLength(behindPath);
    if (remaining <= behindLength) {
      return pointOnPolylineAtDistance(behindPath, Math.max(0, behindLength - remaining));
    }
    remaining -= behindLength;
    anchorIndex = behindIndex;
  }
}

function adjacentStopIndex(line, index, step) {
  const next = index + step;
  if (line.closed) return (next + line.stops.length) % line.stops.length;
  if (next < 0 || next >= line.stops.length) return null;
  return next;
}

function drawOverlay(rect) {
  ctx.fillStyle = "rgba(247, 248, 251, 0.84)";
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "#202124";
  ctx.textAlign = "center";
  ctx.font = "900 34px system-ui, sans-serif";
  ctx.fillText(state.gameOver ? "City gridlocked" : "Paused", rect.width / 2, rect.height / 2 - 18);
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText(state.gameOver ? "Click the map or press Restart to try again." : "Press Resume when you are ready.", rect.width / 2, rect.height / 2 + 18);
  ctx.textAlign = "start";
}

function resultShareText() {
  return `Tiny Transit gridlocked after ${state.day} days with ${state.trips} passengers moved and $${state.cash} earned.`;
}

function createResultsShareCanvas() {
  const shareCanvas = document.createElement("canvas");
  shareCanvas.width = 1200;
  shareCanvas.height = 630;
  const shareCtx = shareCanvas.getContext("2d");
  shareCtx.fillStyle = "#f7f8fb";
  shareCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
  shareCtx.strokeStyle = "#d8dde6";
  shareCtx.lineWidth = 2;
  for (let x = 0; x <= shareCanvas.width; x += 64) {
    shareCtx.beginPath();
    shareCtx.moveTo(x, 0);
    shareCtx.lineTo(x, shareCanvas.height);
    shareCtx.stroke();
  }
  for (let y = 0; y <= shareCanvas.height; y += 64) {
    shareCtx.beginPath();
    shareCtx.moveTo(0, y);
    shareCtx.lineTo(shareCanvas.width, y);
    shareCtx.stroke();
  }

  shareCtx.fillStyle = "#86c9d8";
  roundShareRect(shareCtx, 760, 0, 440, 140, 8);
  shareCtx.fill();
  roundShareRect(shareCtx, 0, 430, 360, 200, 8);
  shareCtx.fill();

  shareCtx.strokeStyle = "#e5524d";
  shareCtx.lineWidth = 14;
  shareCtx.lineCap = "round";
  shareCtx.lineJoin = "round";
  shareCtx.beginPath();
  shareCtx.moveTo(140, 180);
  shareCtx.lineTo(330, 180);
  shareCtx.quadraticCurveTo(390, 180, 390, 240);
  shareCtx.lineTo(580, 240);
  shareCtx.quadraticCurveTo(650, 240, 650, 310);
  shareCtx.lineTo(910, 310);
  shareCtx.stroke();
  shareCtx.strokeStyle = "rgba(255,255,255,0.65)";
  shareCtx.lineWidth = 4;
  shareCtx.stroke();

  shareCtx.fillStyle = "#202124";
  shareCtx.font = "900 34px system-ui, sans-serif";
  shareCtx.fillText("Tiny Transit", 82, 90);
  shareCtx.font = "900 72px system-ui, sans-serif";
  shareCtx.fillText("City gridlocked", 82, 395);
  shareCtx.font = "700 30px system-ui, sans-serif";
  shareCtx.fillText(`Score: ${state.score}`, 82, 468);
  shareCtx.fillText(`Passengers: ${state.trips}`, 82, 515);
  shareCtx.fillText(`Total revenue: $${state.cash}`, 82, 562);
  shareCtx.fillText(`Days operated: ${state.day}`, 82, 609);

  drawShareShape(shareCtx, "circle", 140, 180, 24);
  drawShareShape(shareCtx, "square", 390, 240, 22);
  drawShareShape(shareCtx, "triangle", 650, 310, 24);
  drawShareShape(shareCtx, "diamond", 910, 310, 24);
  return shareCanvas;
}

function roundShareRect(targetCtx, x, y, width, height, radius) {
  targetCtx.beginPath();
  targetCtx.moveTo(x + radius, y);
  targetCtx.arcTo(x + width, y, x + width, y + height, radius);
  targetCtx.arcTo(x + width, y + height, x, y + height, radius);
  targetCtx.arcTo(x, y + height, x, y, radius);
  targetCtx.arcTo(x, y, x + width, y, radius);
  targetCtx.closePath();
}

function drawShareShape(targetCtx, shape, x, y, size) {
  targetCtx.save();
  targetCtx.fillStyle = "#ffffff";
  targetCtx.strokeStyle = "#202124";
  targetCtx.lineWidth = 5;
  targetCtx.beginPath();
  if (shape === "circle") {
    targetCtx.arc(x, y, size, 0, Math.PI * 2);
  } else if (shape === "square") {
    targetCtx.rect(x - size, y - size, size * 2, size * 2);
  } else if (shape === "triangle") {
    targetCtx.moveTo(x, y - size);
    targetCtx.lineTo(x + size, y + size * 0.82);
    targetCtx.lineTo(x - size, y + size * 0.82);
    targetCtx.closePath();
  } else if (shape === AIRPORT_SHAPE) {
    traceStarPath(targetCtx, x, y, size, size * 0.46);
  } else if (shape === PORT_SHAPE) {
    traceHexagonPath(targetCtx, x, y, size);
  } else {
    targetCtx.moveTo(x, y - size);
    targetCtx.lineTo(x + size, y);
    targetCtx.lineTo(x, y + size);
    targetCtx.lineTo(x - size, y);
    targetCtx.closePath();
  }
  targetCtx.fill();
  targetCtx.stroke();
  targetCtx.restore();
}

function canvasToBlob(targetCanvas) {
  return new Promise((resolve) => targetCanvas.toBlob(resolve, "image/png"));
}

async function shareResults(platform) {
  const shareCanvas = createResultsShareCanvas();
  const blob = await canvasToBlob(shareCanvas);
  const file = blob ? new File([blob], "tiny-transit-gridlock.png", { type: "image/png" }) : null;
  const text = resultShareText();
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "Tiny Transit gridlock report",
      text,
      files: [file],
    });
    return;
  }
  downloadShareImage(shareCanvas, platform);
  openSocialFallback(platform, text);
}

function downloadShareImage(targetCanvas, platform) {
  const link = document.createElement("a");
  link.download = `tiny-transit-${platform}.png`;
  link.href = targetCanvas.toDataURL("image/png");
  link.click();
}

function openSocialFallback(platform, text) {
  const encodedText = encodeURIComponent(text);
  const pageUrl = encodeURIComponent(window.location.href);
  if (platform === "facebook") {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedText}`, "_blank", "noopener");
  } else if (platform === "whatsapp") {
    window.open(`https://wa.me/?text=${encodedText}`, "_blank", "noopener");
  } else if (platform === "reddit") {
    window.open(`https://www.reddit.com/submit?title=${encodedText}&url=${pageUrl}`, "_blank", "noopener");
  } else {
    window.alert("Your result image was saved. Open Instagram and post it from your device.");
  }
}

function drawShape(shape, x, y, size, fill, stroke, width) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  } else if (shape === "triangle") {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.9, y + size * 0.75);
    ctx.lineTo(x - size * 0.9, y + size * 0.75);
    ctx.closePath();
  } else if (shape === "square") {
    ctx.rect(x - size * 0.78, y - size * 0.78, size * 1.56, size * 1.56);
  } else if (shape === "diamond") {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
  } else if (shape === AIRPORT_SHAPE) {
    traceStarPath(ctx, x, y, size, size * 0.46);
  } else if (shape === PORT_SHAPE) {
    traceHexagonPath(ctx, x, y, size);
  } else {
    const s = size * 0.95;
    ctx.rect(x - s * 0.28, y - s, s * 0.56, s * 2);
    ctx.rect(x - s, y - s * 0.28, s * 2, s * 0.56);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function traceStarPath(targetCtx, x, y, outerRadius, innerRadius) {
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * (Math.PI / 5);
    const radius = point % 2 === 0 ? outerRadius : innerRadius;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (point === 0) targetCtx.moveTo(px, py);
    else targetCtx.lineTo(px, py);
  }
  targetCtx.closePath();
}

function traceHexagonPath(targetCtx, x, y, radius) {
  for (let side = 0; side < 6; side += 1) {
    const angle = Math.PI / 6 + side * (Math.PI / 3);
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (side === 0) targetCtx.moveTo(px, py);
    else targetCtx.lineTo(px, py);
  }
  targetCtx.closePath();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function roundRectCorners(x, y, width, height, radii) {
  const tl = Math.min(radii.topLeft, width / 2, height / 2);
  const tr = Math.min(radii.topRight, width / 2, height / 2);
  const br = Math.min(radii.bottomRight, width / 2, height / 2);
  const bl = Math.min(radii.bottomLeft, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  if (tr) ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  else ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height - br);
  if (br) ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  else ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + bl, y + height);
  if (bl) ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  else ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + tl);
  if (tl) ctx.quadraticCurveTo(x, y, x + tl, y);
  else ctx.lineTo(x, y);
  ctx.closePath();
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function snapToGrid(value) {
  return Math.max(0, Math.min(1 - WATER_GRID, Math.round(value / WATER_GRID) * WATER_GRID));
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000) * BASE_GAME_SPEED * speedMultiplier;
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

ui.pauseBtn.addEventListener("click", () => {
  if (!state.started) return;
  if (ui.shopModal && !ui.shopModal.classList.contains("hidden")) {
    closeShop();
    return;
  }
  if (state.selectedItem) {
    state.selectedItem = null;
    updateUI();
    return;
  }
  state.paused = !state.paused;
  syncMusicPlayback();
  updateButtons();
});
ui.musicToggleBtn?.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  storeMusicEnabled();
  syncMusicPlayback();
});
ui.shopBtn?.addEventListener("click", openShop);
ui.closeShopBtn?.addEventListener("click", closeShop);
ui.buyBridgeBtn.addEventListener("click", () => buyInventoryItem("bridge"));
ui.buyCarriageBtn.addEventListener("click", () => buyInventoryItem("carriage"));
ui.buyEngineBtn.addEventListener("click", () => buyInventoryItem("engine"));
ui.buyLineBtn.addEventListener("click", () => buyInventoryItem("line"));
ui.inventoryBridgeBtn.addEventListener("click", () => toggleInventoryItem("bridge"));
ui.inventoryCarriageBtn.addEventListener("click", () => toggleInventoryItem("carriage"));
ui.inventoryEngineBtn.addEventListener("click", () => toggleInventoryItem("engine"));
ui.inventoryLineBtn.addEventListener("click", () => toggleInventoryItem("line"));
ui.playerNameInput?.addEventListener("input", () => {
  const clean = sanitizePlayerName(ui.playerNameInput.value);
  if (ui.playerNameInput.value !== clean) ui.playerNameInput.value = clean;
  setPlayerNameHint("Choose a name for the leaderboard.");
});
ui.playerNameInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startGame();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ui.shopModal && !ui.shopModal.classList.contains("hidden")) {
    event.preventDefault();
    closeShop();
    return;
  }
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  const tagName = document.activeElement?.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || document.activeElement?.isContentEditable) return;
  const key = event.key.toLowerCase();
  if (key === "e") {
    toggleInventoryItem("engine");
  } else if (key === "l") {
    toggleInventoryItem("line");
  } else if (key === "c") {
    toggleInventoryItem("carriage");
  } else {
    return;
  }
  event.preventDefault();
});
ui.restartBtn.addEventListener("click", resetGame);
ui.startBtn.addEventListener("click", startGame);
ui.resultsRestartBtn.addEventListener("click", resetGame);
ui.shopModal?.addEventListener("click", (event) => {
  if (event.target === ui.shopModal) closeShop();
});
document.querySelectorAll(".share-btn").forEach((button) => {
  button.addEventListener("click", () => {
    shareResults(button.dataset.platform).catch(() => downloadShareImage(createResultsShareCanvas(), button.dataset.platform));
  });
});
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  handleCanvasPointerDown(event);
});
canvas.addEventListener("pointermove", handleCanvasPointerMove);
canvas.addEventListener("pointerup", handleCanvasPointerUp);
canvas.addEventListener("pointercancel", (event) => {
  if (isTouchPointer(event)) {
    removeActiveTouchPoint(event);
  }
  if (activeTouchPoints.size < 2) {
    resetTouchGesture();
  }
  clearActiveCanvasDrags();
  if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
});
canvas.addEventListener("pointerleave", () => {
  if (routeDrag || trainDrag || panDrag) return;
  pointer.stationId = null;
});
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
canvas.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("resize", () => {
  updateViewportMetrics();
  resizeCanvas();
  draw();
});
window.visualViewport?.addEventListener("resize", () => {
  updateViewportMetrics();
  resizeCanvas();
  draw();
});
window.visualViewport?.addEventListener("scroll", () => {
  updateViewportMetrics();
  draw();
});

initLeaderboard();
resetGame();
updateViewportMetrics();
resizeCanvas();
requestAnimationFrame(loop);


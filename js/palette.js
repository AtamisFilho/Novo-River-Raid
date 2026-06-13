// Palette — Central color palette for River Raid (matching original Palette.gd)

export const Palette = {
  // Sky
  SKY_TOP:         [0.04, 0.05, 0.15],
  SKY_MID:         [0.07, 0.10, 0.25],
  SKY_HORIZON:     [0.12, 0.18, 0.35],
  SKY_BAND:        [0.08, 0.12, 0.28, 0.3],

  // Terrain
  JUNGLE_FAR:      [0.05, 0.18, 0.05],
  JUNGLE_MID:      [0.07, 0.25, 0.07],
  JUNGLE_NEAR:     [0.10, 0.35, 0.10],
  JUNGLE_EDGE:     [0.20, 0.60, 0.15],
  JUNGLE_SHADOW:   [0.03, 0.12, 0.03],
  TREE_DARK:       [0.04, 0.14, 0.04],
  TREE_MID:        [0.06, 0.20, 0.06],
  TREE_HIGHLIGHT:  [0.12, 0.30, 0.08],

  // River
  RIVER_DEEP:      [0.05, 0.12, 0.35],
  RIVER_MID:       [0.08, 0.18, 0.45],
  RIVER_SHALLOW:   [0.12, 0.25, 0.50],
  RIVER_EDGE:      [0.18, 0.35, 0.55],
  WAVE_COLOR:      [0.30, 0.65, 0.85, 0.35],
  FOAM_COLOR:      [0.75, 0.88, 0.95, 0.70],

  // Player
  PLAYER_BODY:     [0.85, 0.92, 1.00],
  PLAYER_WING:     [0.70, 0.80, 0.95],
  PLAYER_COCKPIT:  [0.40, 0.75, 1.00],
  PLAYER_ENGINE:   [0.30, 0.30, 0.35],
  EXHAUST_INNER:   [1.00, 0.90, 0.30],
  EXHAUST_OUTER:   [1.00, 0.45, 0.05],
  EXHAUST_TIP:     [0.80, 0.15, 0.00, 0.4],
  BULLET_CORE:     [1.00, 0.98, 0.40],
  BULLET_GLOW:     [1.00, 0.75, 0.10, 0.45],

  // Enemies
  BOAT_HULL:       [0.75, 0.10, 0.10],
  BOAT_STRIPE:     [0.35, 0.05, 0.05],
  BOAT_WAKE:       [0.55, 0.72, 0.82, 0.55],
  HELI_BODY:       [0.50, 0.52, 0.55],
  HELI_COCKPIT:    [0.20, 0.22, 0.28],
  HELI_ROTOR:      [0.65, 0.67, 0.70],
  JET_WING:        [0.85, 0.75, 0.10],
  JET_BODY:        [0.95, 0.85, 0.20],
  JET_ENGINE:      [1.00, 0.50, 0.05, 0.7],

  // Fuel Depot
  DEPOT_PLATFORM:  [0.20, 0.45, 0.20],
  DEPOT_TOWER:     [0.90, 0.90, 0.90],
  DEPOT_CROSS:     [0.85, 0.10, 0.10],
  DEPOT_LIGHT_ON:  [1.00, 0.20, 0.20],
  DEPOT_LIGHT_OFF: [0.45, 0.05, 0.05],
  DEPOT_TEXT:      [0.95, 0.80, 0.10],

  // UI
  HUD_BG:          [0.00, 0.00, 0.08, 0.72],
  HUD_TEXT:        [0.95, 0.95, 0.80],
  HUD_SCORE:       [0.95, 0.90, 0.30],
  FUEL_HIGH:       [0.20, 0.85, 0.25],
  FUEL_MID:        [0.90, 0.80, 0.10],
  FUEL_LOW:        [0.90, 0.15, 0.10],
  FUEL_BORDER:     [0.60, 0.60, 0.65],
  MENU_BG:         [0.03, 0.04, 0.12],
  MENU_TITLE:      [0.95, 0.80, 0.10],
  MENU_BUTTON:     [0.12, 0.18, 0.35],
  MENU_BUTTON_HV:  [0.20, 0.30, 0.55],
  MENU_BUTTON_TX:  [0.90, 0.92, 1.00],
};

// Helper: convert palette [r,g,b] or [r,g,b,a] to CSS color string
export function rgba(c, alphaOverride) {
  if (!c) return 'rgba(0,0,0,1)';
  const a = alphaOverride !== undefined ? alphaOverride : (c.length > 3 ? c[3] : 1);
  return `rgba(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)},${a})`;
}

// Lerp between two [r,g,b] colors
export function lerpColor(a, b, t) {
  const r = a[0] + (b[0] - a[0]) * t;
  const g = a[1] + (b[1] - a[1]) * t;
  const bl = a[2] + (b[2] - a[2]) * t;
  return [r, g, bl];
}

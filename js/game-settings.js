// GameSettings singleton — difficulty, player count, save/load (matching GameSettings.gd)

export const Difficulty = { EASY: 0, NORMAL: 1, HARD: 2, CUSTOM: 3 };

const PRESETS = {
  [Difficulty.EASY]:   [0.75, 0.60, 0.75, 0.70],
  [Difficulty.NORMAL]: [1.00, 1.00, 1.00, 1.00],
  [Difficulty.HARD]:   [1.40, 1.60, 1.30, 1.40],
  [Difficulty.CUSTOM]: [1.00, 1.00, 1.00, 1.00],
};

const BASE_SCROLL_SPEED   = 120.0;
const BASE_ENEMY_DENSITY  = 1.0;
const BASE_FUEL_CONSUMPTION = 1.0;
const BASE_ENEMY_SPEED    = 60.0;

export const GameSettings = {
  difficulty: Difficulty.NORMAL,
  playerCount: 1,
  scrollSpeedMult: 1.0,
  enemyDensityMult: 1.0,
  fuelConsumptionMult: 1.0,
  enemySpeedMult: 1.0,

  applyPreset(diff) {
    this.difficulty = diff;
    const p = PRESETS[diff] || PRESETS[Difficulty.NORMAL];
    this.scrollSpeedMult    = p[0];
    this.enemyDensityMult   = p[1];
    this.fuelConsumptionMult = p[2];
    this.enemySpeedMult     = p[3];
  },

  getScrollSpeed() {
    return BASE_SCROLL_SPEED * this.scrollSpeedMult;
  },

  getEnemySpeed() {
    return BASE_ENEMY_SPEED * this.enemySpeedMult;
  },

  saveSettings() {
    try {
      const data = {
        difficulty: this.difficulty,
        playerCount: this.playerCount,
        scrollSpeedMult: this.scrollSpeedMult,
        enemyDensityMult: this.enemyDensityMult,
        fuelConsumptionMult: this.fuelConsumptionMult,
        enemySpeedMult: this.enemySpeedMult,
      };
      localStorage.setItem('riverRaidSettings', JSON.stringify(data));
    } catch(e) { /* ignore */ }
  },

  loadSettings() {
    try {
      const raw = localStorage.getItem('riverRaidSettings');
      if (!raw) {
        this.applyPreset(Difficulty.NORMAL);
        return;
      }
      const data = JSON.parse(raw);
      this.difficulty = data.difficulty ?? Difficulty.NORMAL;
      this.playerCount = data.playerCount ?? 1;
      this.scrollSpeedMult = data.scrollSpeedMult ?? 1.0;
      this.enemyDensityMult = data.enemyDensityMult ?? 1.0;
      this.fuelConsumptionMult = data.fuelConsumptionMult ?? 1.0;
      this.enemySpeedMult = data.enemySpeedMult ?? 1.0;
      if (this.difficulty !== Difficulty.CUSTOM) {
        this.applyPreset(this.difficulty);
      }
    } catch(e) {
      this.applyPreset(Difficulty.NORMAL);
    }
  }
};

// GameState singleton — per-player runtime state (matching GameState.gd)

export const MAX_PLAYERS = 2;
const START_LIVES  = 3;
const MAX_FUEL     = 100.0;
const START_FUEL   = 80.0;

// Simple event system
const listeners = {};

function emit(event, ...args) {
  (listeners[event] || []).forEach(fn => fn(...args));
}

export const GameState = {
  scores:    [0, 0],
  lives:     [START_LIVES, START_LIVES],
  fuel:      [START_FUEL, START_FUEL],
  distances: [0.0, 0.0],
  active:    [true, false],
  gameRunning: false,

  on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  },

  off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(f => f !== fn);
  },

  // Remove all listeners for a specific event (useful for scene cleanup)
  offAll(event) {
    delete listeners[event];
  },

  // Remove all listeners entirely (full reset)
  clearAllListeners() {
    for (const key in listeners) delete listeners[key];
  },

  reset() {
    for (let i = 0; i < MAX_PLAYERS; i++) {
      this.scores[i]    = 0;
      this.lives[i]     = START_LIVES;
      this.fuel[i]      = START_FUEL;
      this.distances[i] = 0.0;
    }
    this.active[0] = true;
    this.active[1] = (this._playerCount >= 2);
    this.gameRunning = true;
    // Clear all listeners to prevent accumulation across game sessions
    this.clearAllListeners();
  },

  // Internal reference to settings player count
  _playerCount: 1,

  addScore(idx, amount) {
    if (idx < 0 || idx >= MAX_PLAYERS) return;
    this.scores[idx] += amount;
    emit('scoreChanged', idx, this.scores[idx]);
  },

  drainFuel(idx, amount) {
    if (idx < 0 || idx >= MAX_PLAYERS) return;
    this.fuel[idx] = Math.max(0, this.fuel[idx] - amount);
    emit('fuelChanged', idx, this.fuel[idx]);
    if (this.fuel[idx] <= 0) {
      this.killPlayer(idx);
    }
  },

  addFuel(idx, amount) {
    if (idx < 0 || idx >= MAX_PLAYERS) return;
    this.fuel[idx] = Math.min(MAX_FUEL, this.fuel[idx] + amount);
    emit('fuelChanged', idx, this.fuel[idx]);
  },

  killPlayer(idx) {
    if (idx < 0 || idx >= MAX_PLAYERS) return;
    this.lives[idx] -= 1;
    emit('livesChanged', idx, this.lives[idx]);
    if (this.lives[idx] <= 0) {
      this.active[idx] = false;
      this._checkGameOver();
    }
  },

  _checkGameOver() {
    let anyAlive = false;
    for (let i = 0; i < MAX_PLAYERS; i++) {
      if (this.active[i] && this.lives[i] > 0) {
        anyAlive = true;
        break;
      }
    }
    if (!anyAlive) {
      this.gameRunning = false;
      emit('gameOver');
    }
  },

  addDistance(idx, deltaPx) {
    if (idx < 0 || idx >= MAX_PLAYERS) return;
    this.distances[idx] += deltaPx;
  },

  getDistanceKm(idx) {
    return this.distances[idx] / 1000.0;
  },

  get maxFuel() { return MAX_FUEL; },
  get startLives() { return START_LIVES; },
};

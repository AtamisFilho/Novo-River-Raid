// Spawner — manages spawning of enemies and fuel depots (matching Spawner.gd)

import { GameSettings } from './game-settings.js';
import { GameState } from './game-state.js';
import { Enemy, EnemyType } from './enemy.js';
import { FuelDepot } from './fuel-depot.js';

export class Spawner {
  constructor() {
    this.spawnTimer = 0;
    this.depotTimer = 0;
    this.baseSpawnInterval = 2.5;
    this.baseDepotInterval = 15.0;
  }

  update(delta, riverField) {
    if (!GameState.gameRunning) return [];

    const density = GameSettings.enemyDensityMult;
    const interval = this.baseSpawnInterval / density;
    const spawned = [];

    this.spawnTimer += delta;
    this.depotTimer += delta;

    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      const enemy = this._spawnEnemy(riverField);
      if (enemy) spawned.push(enemy);
    }

    if (this.depotTimer >= this.baseDepotInterval) {
      this.depotTimer = 0;
      const depot = this._spawnDepot(riverField);
      if (depot) spawned.push(depot);
    }

    return spawned;
  }

  _spawnEnemy(riverField) {
    const spawnY = 20.0;
    const bounds = riverField.getBoundsAtY(spawnY);
    const riverW = bounds.right - bounds.left;
    if (riverW < 60) return null;

    const r = Math.random();
    let type;
    if (r < 0.45) type = EnemyType.BOAT;
    else if (r < 0.75) type = EnemyType.HELI;
    else type = EnemyType.JET;

    const margin = 20.0;
    const x = bounds.left + margin + Math.random() * (riverW - margin * 2);

    return new Enemy(type, x, spawnY);
  }

  _spawnDepot(riverField) {
    const spawnY = 20.0;
    const bounds = riverField.getBoundsAtY(spawnY);
    const cx = (bounds.left + bounds.right) * 0.5;
    return new FuelDepot(cx, spawnY);
  }
}

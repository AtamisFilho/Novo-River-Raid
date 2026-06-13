// Main — game orchestrator (matching Main.gd)

import { RiverField } from './river-field.js';
import { Spawner } from './spawner.js';
import { Player } from './player.js';
import { Bullet } from './bullet.js';
import { HUD } from './hud.js';
import { GameState } from './game-state.js';
import { GameSettings } from './game-settings.js';
import { InputManager } from './input.js';

export class MainGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new InputManager();

    this.riverField = new RiverField();
    this.spawner = new Spawner();
    this.players = [];
    this.bullets = [];
    this.enemies = [];
    this.depots = [];
    this.hud = new HUD();

    this.gameOverTriggered = false;
    this.gameOverTimer = 0;

    // Initialize game
    GameState._playerCount = GameSettings.playerCount;
    GameState.reset();

    // Create players
    for (let i = 0; i < GameSettings.playerCount; i++) {
      const player = new Player(i, this.input);
      player.onRequestBullet = (idx, x, y) => {
        this.bullets.push(new Bullet(idx, x, y));
      };
      this.players.push(player);
    }

    GameState.on('gameOver', () => {
      this.gameOverTriggered = true;
      this.gameOverTimer = 0;
    });
  }

  update(delta) {
    if (!GameState.gameRunning) {
      if (this.gameOverTriggered) {
        this.gameOverTimer += delta;
        if (this.gameOverTimer >= 2.0) {
          return 'gameOver';
        }
      }
      // Still update visual elements
      this.riverField.update(delta);
      return null;
    }

    // Update river
    this.riverField.update(delta);

    // Update players
    for (const player of this.players) {
      player.update(delta);
    }

    // Spawn enemies/depots
    const spawned = this.spawner.update(delta, this.riverField);
    for (const obj of spawned) {
      if (obj.type === 'enemy') {
        this.enemies.push(obj);
      } else if (obj.type === 'depot') {
        this.depots.push(obj);
      }
    }

    // Update bullets
    for (const bullet of this.bullets) bullet.update(delta);
    this.bullets = this.bullets.filter(b => !b.dead);

    // Update enemies
    for (const enemy of this.enemies) enemy.update(delta);
    this.enemies = this.enemies.filter(e => !e.dead);

    // Update depots
    for (const depot of this.depots) depot.update(delta);
    this.depots = this.depots.filter(d => !d.dead);

    // Update HUD
    this.hud.update();

    // Update distance
    for (let i = 0; i < GameSettings.playerCount; i++) {
      if (GameState.active[i]) {
        GameState.addDistance(i, GameSettings.getScrollSpeed() * delta);
      }
    }

    // Collision detection
    this._checkCollisions();

    return null;
  }

  _checkCollisions() {
    // Bullet vs enemy
    for (const bullet of this.bullets) {
      if (bullet.dead) continue;
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.getCollisionRadius() + 6.0) {
          GameState.addScore(bullet.playerIdx, enemy.getPoints());
          enemy.hit();
          bullet.dead = true;
          break;
        }
      }
    }

    // Player vs bank / enemy / depot
    for (const player of this.players) {
      if (player.dead) continue;
      const idx = player.playerIdx;

      // Check river bounds
      const bounds = this.riverField.getBoundsAtY(player.y);
      if (player.x < bounds.left + 10 || player.x > bounds.right - 10) {
        player.takeHit();
        continue;
      }

      // Check enemy collisions
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        if (Math.sqrt(dx * dx + dy * dy) < enemy.getCollisionRadius() + 12.0) {
          player.takeHit();
          break;
        }
      }

      // Check depot collisions
      for (const depot of this.depots) {
        if (depot.dead) continue;
        depot.checkPlayerCollision({ x: player.x, y: player.y }, idx);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 480, 720);

    // Draw river (background)
    this.riverField.draw(ctx);

    // Draw depots
    for (const depot of this.depots) depot.draw(ctx);

    // Draw enemies
    for (const enemy of this.enemies) enemy.draw(ctx);

    // Draw bullets
    for (const bullet of this.bullets) bullet.draw(ctx);

    // Draw players
    for (const player of this.players) player.draw(ctx);

    // Draw HUD (on top)
    this.hud.draw(ctx);
  }
}

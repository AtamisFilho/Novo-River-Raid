// Enemy — three types: BOAT, HELI, JET. All drawn procedurally (matching Enemy.gd)

import { Palette, rgba, lerpColor } from './palette.js';
import { GameSettings } from './game-settings.js';

const EnemyType = { BOAT: 0, HELI: 1, JET: 2 };

const POINTS = { [EnemyType.BOAT]: 100, [EnemyType.HELI]: 150, [EnemyType.JET]: 250 };
const COLLISION_RADIUS = { [EnemyType.BOAT]: 14.0, [EnemyType.HELI]: 16.0, [EnemyType.JET]: 18.0 };

export class Enemy {
  constructor(enemyType, x, y) {
    this.enemyType = enemyType;
    this.health = 1;
    this.x = x;
    this.y = y;
    this.scrollSpeed = 120;
    this.moveTimer = Math.random() * 1.5 + 0.5;
    this.lateralSpeed = GameSettings.getEnemySpeed() * (0.3 + Math.random() * 0.4);
    this.lateralDir = Math.random() > 0.5 ? 1.0 : -1.0;
    this.rotorAngle = 0;
    this.exhaustAnim = 0;
    this.wakeOffset = 0;
    this.dead = false;
    this.type = 'enemy';
  }

  update(delta) {
    this.scrollSpeed = GameSettings.getScrollSpeed();
    this.rotorAngle += delta * 8.0;
    this.exhaustAnim += delta * 4.0;
    this.wakeOffset = (this.wakeOffset + delta * 60.0) % 20.0;

    // Move downward with scroll
    this.y += this.scrollSpeed * delta;

    // Type-specific movement
    switch (this.enemyType) {
      case EnemyType.BOAT:  this._updateBoat(delta); break;
      case EnemyType.HELI:  this._updateHeli(delta); break;
      case EnemyType.JET:   this._updateJet(delta);  break;
    }

    if (this.y > 760) this.dead = true;
  }

  _updateBoat(delta) {
    this.moveTimer -= delta;
    if (this.moveTimer <= 0) {
      this.lateralDir *= -1;
      this.moveTimer = 1.0 + Math.random() * 2.0;
    }
    this.x += this.lateralDir * this.lateralSpeed * delta * 0.5;
  }

  _updateHeli(delta) {
    this.x += Math.sin(this.y * 0.03) * this.lateralSpeed * delta;
  }

  _updateJet(delta) {
    this.moveTimer -= delta;
    if (this.moveTimer <= 0) {
      this.lateralDir *= -1;
      this.moveTimer = 0.4 + Math.random() * 0.8;
    }
    this.x += this.lateralDir * this.lateralSpeed * delta * 1.5;
  }

  hit() {
    this.health -= 1;
    if (this.health <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }

  getCollisionRadius() { return COLLISION_RADIUS[this.enemyType]; }
  getPoints() { return POINTS[this.enemyType]; }

  draw(ctx) {
    switch (this.enemyType) {
      case EnemyType.BOAT: this._drawBoat(ctx); break;
      case EnemyType.HELI: this._drawHeli(ctx); break;
      case EnemyType.JET:  this._drawJet(ctx);  break;
    }
  }

  // ─── BOAT ─────────────────────────────────────────────
  _drawBoat(ctx) {
    ctx.fillStyle = rgba(Palette.BOAT_HULL);
    ctx.beginPath();
    ctx.moveTo(this.x - 14, this.y - 5);
    ctx.lineTo(this.x - 10, this.y - 9);
    ctx.lineTo(this.x + 10, this.y - 9);
    ctx.lineTo(this.x + 14, this.y - 5);
    ctx.lineTo(this.x + 14, this.y + 5);
    ctx.lineTo(this.x - 14, this.y + 5);
    ctx.closePath();
    ctx.fill();

    // Dark stripe
    ctx.fillStyle = rgba(Palette.BOAT_STRIPE);
    ctx.fillRect(this.x - 12, this.y - 2, 24, 4);

    // Cabin
    ctx.beginPath();
    ctx.moveTo(this.x - 5, this.y - 9);
    ctx.lineTo(this.x - 2, this.y - 14);
    ctx.lineTo(this.x + 2, this.y - 14);
    ctx.lineTo(this.x + 5, this.y - 9);
    ctx.closePath();
    ctx.fill();

    // Hull highlight
    ctx.strokeStyle = 'rgba(255,128,128,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x - 12, this.y - 8);
    ctx.lineTo(this.x + 10, this.y - 8);
    ctx.stroke();

    // Wake lines
    for (let i = 0; i < 3; i++) {
      const wY = this.y + 5 + i * 7 + this.wakeOffset * 0.3;
      const wAlpha = 0.5 - i * 0.15;
      ctx.strokeStyle = rgba(Palette.BOAT_WAKE, wAlpha);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x - 8 - i * 3, wY);
      ctx.lineTo(this.x + 8 + i * 3, wY);
      ctx.stroke();
    }
  }

  // ─── HELICOPTER ───────────────────────────────────────
  _drawHeli(ctx) {
    // Body
    ctx.fillStyle = rgba(Palette.HELI_BODY);
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit
    ctx.fillStyle = rgba(Palette.HELI_COCKPIT);
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 3, 8, 5, 0, Math.PI, 0);
    ctx.fill();

    // Tail boom
    ctx.strokeStyle = rgba(Palette.HELI_BODY);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + 12, this.y);
    ctx.lineTo(this.x + 24, this.y - 2);
    ctx.stroke();

    // Tail fin
    ctx.fillStyle = rgba(Palette.HELI_BODY);
    ctx.beginPath();
    ctx.moveTo(this.x + 22, this.y - 6);
    ctx.lineTo(this.x + 26, this.y - 2);
    ctx.lineTo(this.x + 22, this.y - 2);
    ctx.closePath();
    ctx.fill();

    // Rotor (animated)
    ctx.strokeStyle = rgba(Palette.HELI_ROTOR, 0.7);
    ctx.lineWidth = 2;
    const rotorLen = 20;
    const rAngle = this.rotorAngle;
    ctx.beginPath();
    ctx.moveTo(this.x + Math.cos(rAngle) * rotorLen, this.y - 8 + Math.sin(rAngle) * 3);
    ctx.lineTo(this.x - Math.cos(rAngle) * rotorLen, this.y - 8 - Math.sin(rAngle) * 3);
    ctx.stroke();

    // Rotor hub
    ctx.fillStyle = rgba(Palette.HELI_COCKPIT);
    ctx.beginPath();
    ctx.arc(this.x, this.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── JET ──────────────────────────────────────────────
  _drawJet(ctx) {
    // Wings (swept)
    ctx.fillStyle = rgba(Palette.JET_WING);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 16);
    ctx.lineTo(this.x - 18, this.y + 6);
    ctx.lineTo(this.x - 8, this.y + 4);
    ctx.lineTo(this.x, this.y + 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 16);
    ctx.lineTo(this.x + 18, this.y + 6);
    ctx.lineTo(this.x + 8, this.y + 4);
    ctx.lineTo(this.x, this.y + 8);
    ctx.closePath();
    ctx.fill();

    // Fuselage
    ctx.fillStyle = rgba(Palette.JET_BODY);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 16);
    ctx.lineTo(this.x - 4, this.y + 4);
    ctx.lineTo(this.x, this.y + 8);
    ctx.lineTo(this.x + 4, this.y + 4);
    ctx.closePath();
    ctx.fill();

    // Engine glow (animated)
    const flicker = 0.5 + 0.5 * Math.abs(Math.sin(this.exhaustAnim));
    ctx.fillStyle = rgba(Palette.JET_ENGINE, 0.5 + flicker * 0.3);
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12 + flicker * 4, 4, 3 + flicker * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose highlight
    ctx.strokeStyle = 'rgba(255,255,200,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 16);
    ctx.lineTo(this.x - 18, this.y + 6);
    ctx.stroke();
  }
}

export { EnemyType };

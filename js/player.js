// Player — delta-wing jet with engine exhaust, banking animation (matching Player.gd)

import { Palette, rgba } from './palette.js';
import { GameSettings } from './game-settings.js';
import { GameState } from './game-state.js';

const SHOOT_INTERVAL = 0.25;
const FUEL_DRAIN_RATE = 4.0;
const INVINCIBLE_DURATION = 2.5;

export class Player {
  constructor(playerIdx, input) {
    this.playerIdx = playerIdx;
    this.input = input;
    this.speed = 160.0;
    this.shootCooldown = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.bankAngle = 0;
    this.exhaustAnim = 0;
    this.dead = false;
    this.x = playerIdx === 0 ? 240 : 280;
    this.y = 600;
    this.onRequestBullet = null; // callback
  }

  update(delta) {
    if (this.dead) return;

    this.exhaustAnim += delta * 6.0;
    this.shootCooldown -= delta;

    // Fuel drain
    GameState.drainFuel(this.playerIdx, FUEL_DRAIN_RATE * GameSettings.fuelConsumptionMult * delta);

    if (this.invincible) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    this._handleMovement(delta);
    this._handleShooting();
  }

  _handleMovement(delta) {
    const pfx = this.playerIdx === 0 ? 'p1' : 'p2';
    let dx = 0, dy = 0;

    if (this.input.isActionPressed(`${pfx}_left`))  dx -= this.speed * delta;
    if (this.input.isActionPressed(`${pfx}_right`)) dx += this.speed * delta;
    if (this.input.isActionPressed(`${pfx}_up`))    dy -= this.speed * delta * 0.7;
    if (this.input.isActionPressed(`${pfx}_down`))  dy += this.speed * delta * 0.5;

    this.x += dx;
    this.y += dy;

    // Clamp to screen
    this.x = Math.max(20, Math.min(460, this.x));
    this.y = Math.max(80, Math.min(700, this.y));

    // Banking animation
    const targetBank = dx * 1.8;
    this.bankAngle += (targetBank - this.bankAngle) * 0.15;
  }

  _handleShooting() {
    const pfx = this.playerIdx === 0 ? 'p1' : 'p2';
    if (this.input.isActionPressed(`${pfx}_shoot`) && this.shootCooldown <= 0) {
      this.shootCooldown = SHOOT_INTERVAL;
      if (this.onRequestBullet) {
        this.onRequestBullet(this.playerIdx, this.x, this.y - 20);
      }
    }
  }

  takeHit() {
    if (this.invincible || this.dead) return;
    GameState.killPlayer(this.playerIdx);
    if (GameState.lives[this.playerIdx] <= 0) {
      this.dead = true;
      return;
    }
    this.invincible = true;
    this.invincibleTimer = INVINCIBLE_DURATION;
  }

  draw(ctx) {
    if (this.dead) return;

    // Blink when invincible
    if (this.invincible && (this.invincibleTimer * 8.0 % 2.0) < 1.0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.bankAngle * Math.PI / 180);
    this._drawJet(ctx);
    ctx.restore();
  }

  _drawJet(ctx) {
    // Main delta wings
    ctx.fillStyle = rgba(Palette.PLAYER_WING);
    // Left wing
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-22, 12);
    ctx.lineTo(-14, 8);
    ctx.lineTo(-6, 14);
    ctx.lineTo(0, 12);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(22, 12);
    ctx.lineTo(14, 8);
    ctx.lineTo(6, 14);
    ctx.lineTo(0, 12);
    ctx.closePath();
    ctx.fill();

    // Fuselage
    ctx.fillStyle = rgba(Palette.PLAYER_BODY);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-3, 14);
    ctx.lineTo(0, 12);
    ctx.lineTo(3, 14);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();

    // Cockpit canopy
    ctx.fillStyle = rgba(Palette.PLAYER_COCKPIT);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-4, -6);
    ctx.lineTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.fill();

    // Canopy glass highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -14);
    ctx.lineTo(-1, -5);
    ctx.stroke();

    // Wing highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(-22, 12);
    ctx.moveTo(0, -20); ctx.lineTo(22, 12);
    ctx.stroke();

    // Engine nacelles
    ctx.fillStyle = rgba(Palette.PLAYER_ENGINE);
    ctx.fillRect(-9, 6, 5, 9);
    ctx.fillRect(4, 6, 5, 9);

    // Exhaust flames
    const flicker = 0.5 + 0.5 * Math.abs(Math.sin(this.exhaustAnim));
    const flameLen = 8.0 + flicker * 6.0;

    this._drawFlame(ctx, -6.5, 15, flameLen);
    this._drawFlame(ctx, 6.5, 15, flameLen);
  }

  _drawFlame(ctx, baseX, baseY, length) {
    // Outer orange glow
    ctx.fillStyle = rgba(Palette.EXHAUST_OUTER);
    ctx.beginPath();
    ctx.moveTo(baseX - 3, baseY);
    ctx.lineTo(baseX + 3, baseY);
    ctx.lineTo(baseX + 1, baseY + length);
    ctx.closePath();
    ctx.fill();

    // Inner yellow core
    ctx.fillStyle = rgba(Palette.EXHAUST_INNER);
    ctx.beginPath();
    ctx.moveTo(baseX - 1.5, baseY);
    ctx.lineTo(baseX + 1.5, baseY);
    ctx.lineTo(baseX, baseY + length * 0.6);
    ctx.closePath();
    ctx.fill();

    // Tip glow
    ctx.fillStyle = rgba(Palette.EXHAUST_TIP);
    ctx.beginPath();
    ctx.arc(baseX, baseY + length * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

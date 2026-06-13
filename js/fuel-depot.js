// FuelDepot — fuel station structure that floats on the river (matching FuelDepot.gd)

import { Palette, rgba } from './palette.js';
import { GameSettings } from './game-settings.js';
import { GameState } from './game-state.js';

const FUEL_AMOUNT = 50.0;
const SCORE_VALUE = 200;
const DEPOT_W = 36.0;
const DEPOT_H = 28.0;
const COLLECT_RADIUS = 22.0;

export class FuelDepot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.scrollSpeed = 120;
    this.blinkTimer = 0;
    this.blinkState = true;
    this.collectedBy = [false, false];
    this.dead = false;
    this.type = 'depot';
  }

  update(delta) {
    this.scrollSpeed = GameSettings.getScrollSpeed();
    this.y += this.scrollSpeed * delta;
    this.blinkTimer += delta;
    if (this.blinkTimer > 0.5) {
      this.blinkTimer = 0;
      this.blinkState = !this.blinkState;
    }
    if (this.y > 780) this.dead = true;
  }

  checkPlayerCollision(playerPos, playerIdx) {
    if (this.collectedBy[playerIdx]) return false;
    const dx = this.x - playerPos.x;
    const dy = this.y - playerPos.y;
    if (Math.sqrt(dx * dx + dy * dy) < COLLECT_RADIUS) {
      this.collectedBy[playerIdx] = true;
      GameState.addFuel(playerIdx, FUEL_AMOUNT);
      GameState.addScore(playerIdx, SCORE_VALUE);
      return true;
    }
    return false;
  }

  draw(ctx) {
    // Base platform
    ctx.fillStyle = rgba(Palette.DEPOT_PLATFORM);
    ctx.fillRect(this.x - DEPOT_W, this.y - 6, DEPOT_W * 2, 10);

    // Platform highlights
    ctx.strokeStyle = rgba(Palette.JUNGLE_EDGE);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x - DEPOT_W, this.y - 6);
    ctx.lineTo(this.x + DEPOT_W, this.y - 6);
    ctx.stroke();

    ctx.strokeStyle = rgba(Palette.JUNGLE_SHADOW);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x - DEPOT_W, this.y + 4);
    ctx.lineTo(this.x + DEPOT_W, this.y + 4);
    ctx.stroke();

    // Central tower
    ctx.fillStyle = rgba(Palette.DEPOT_TOWER);
    ctx.fillRect(this.x - 8, this.y - 28, 16, 28);

    // Tower shading
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(this.x + 5, this.y - 28, 3, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(this.x - 8, this.y - 28, 3, 28);

    // Red cross
    ctx.fillStyle = rgba(Palette.DEPOT_CROSS);
    ctx.fillRect(this.x - 6, this.y - 22, 12, 3);
    ctx.fillRect(this.x - 1.5, this.y - 26, 3, 11);

    // "F" letter
    ctx.strokeStyle = rgba(Palette.DEPOT_TEXT);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x - 4, this.y - 14);
    ctx.lineTo(this.x + 2, this.y - 14);
    ctx.moveTo(this.x - 4, this.y - 10);
    ctx.lineTo(this.x + 1, this.y - 10);
    ctx.moveTo(this.x - 4, this.y - 14);
    ctx.lineTo(this.x - 4, this.y - 6);
    ctx.stroke();

    // Blinking red light
    const lightColor = this.blinkState ? Palette.DEPOT_LIGHT_ON : Palette.DEPOT_LIGHT_OFF;
    ctx.fillStyle = rgba(lightColor);
    ctx.beginPath();
    ctx.arc(this.x, this.y - 32, 4, 0, Math.PI * 2);
    ctx.fill();

    if (this.blinkState) {
      ctx.fillStyle = rgba(Palette.DEPOT_LIGHT_ON, 0.3);
      ctx.beginPath();
      ctx.arc(this.x, this.y - 32, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Support struts
    ctx.strokeStyle = rgba(Palette.DEPOT_TOWER);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - 8, this.y - 6);
    ctx.lineTo(this.x - 14, this.y - 6);
    ctx.moveTo(this.x + 8, this.y - 6);
    ctx.lineTo(this.x + 14, this.y - 6);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x - 14, this.y - 6);
    ctx.lineTo(this.x - 18, this.y + 4);
    ctx.moveTo(this.x + 14, this.y - 6);
    ctx.lineTo(this.x + 18, this.y + 4);
    ctx.stroke();
  }
}

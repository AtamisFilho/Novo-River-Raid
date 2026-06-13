// HUD — draws score, lives, fuel bar, distance counter (matching HUD.gd)

import { Palette, rgba, lerpColor } from './palette.js';
import { GameState } from './game-state.js';
import { GameSettings } from './game-settings.js';

const VW = 480.0;
const VH = 720.0;
const HUD_HEIGHT = 52.0;
const BAR_W = 100.0;
const BAR_H = 10.0;

export class HUD {
  constructor() {
    this.scores = [0, 0];
    this.lives = [3, 3];
    this.fuel = [80.0, 80.0];
    this.distances = [0.0, 0.0];

    GameState.on('scoreChanged', (idx, val) => { this.scores[idx] = val; });
    GameState.on('fuelChanged', (idx, val) => { this.fuel[idx] = val; });
    GameState.on('livesChanged', (idx, val) => { this.lives[idx] = val; });
  }

  update() {
    for (let i = 0; i < GameState.maxFuel; i++) {
      if (i < 2) this.distances[i] = GameState.getDistanceKm(i);
    }
  }

  draw(ctx) {
    this._drawTopBar(ctx);
    this._drawPlayerHUD(ctx, 0, 0);
    if (GameSettings.playerCount >= 2) {
      this._drawPlayerHUD(ctx, 1, VW * 0.5);
    }
  }

  _drawTopBar(ctx) {
    ctx.fillStyle = rgba(Palette.HUD_BG);
    ctx.fillRect(0, 0, VW, HUD_HEIGHT);
    ctx.strokeStyle = 'rgba(76,102,153,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, HUD_HEIGHT);
    ctx.lineTo(VW, HUD_HEIGHT);
    ctx.stroke();
  }

  _drawPlayerHUD(ctx, idx, xOffset) {
    if (!GameState.active[idx] && idx >= GameSettings.playerCount) return;

    const colW = VW / GameSettings.playerCount;
    const baseX = xOffset + 8;
    const baseY = 6;

    // Player label
    ctx.font = '11px monospace';
    ctx.fillStyle = rgba(Palette.HUD_TEXT);
    ctx.fillText(`P${idx + 1}`, baseX, baseY + 12);

    // Score
    const scoreStr = String(this.scores[idx]).padStart(7, '0');
    ctx.fillStyle = rgba(Palette.HUD_SCORE);
    ctx.fillText(scoreStr, baseX + 22, baseY + 12);

    // Lives (mini plane icons)
    for (let i = 0; i < this.lives[idx]; i++) {
      this._drawMiniPlane(ctx, baseX + i * 16 + 22, baseY + 28);
    }

    // Fuel bar
    const fuelX = baseX + colW - BAR_W - 16;
    const fuelPct = this.fuel[idx] / GameState.maxFuel;

    // Bar background
    ctx.fillStyle = 'rgba(25,25,38,1)';
    ctx.fillRect(fuelX - 1, baseY + 20, BAR_W + 2, BAR_H + 2);
    // Bar border
    ctx.strokeStyle = rgba(Palette.FUEL_BORDER);
    ctx.lineWidth = 1;
    ctx.strokeRect(fuelX - 1, baseY + 20, BAR_W + 2, BAR_H + 2);

    // Bar fill with gradient color
    let barColor;
    if (fuelPct > 0.5) {
      barColor = lerpColor(Palette.FUEL_HIGH, Palette.FUEL_MID, (1.0 - fuelPct) * 2.0);
    } else {
      barColor = lerpColor(Palette.FUEL_MID, Palette.FUEL_LOW, (0.5 - fuelPct) * 2.0);
    }

    if (fuelPct > 0.01) {
      ctx.fillStyle = rgba(barColor);
      ctx.fillRect(fuelX, baseY + 21, BAR_W * fuelPct, BAR_H);
      // Highlight strip
      ctx.fillStyle = `rgba(${Math.min(255,barColor[0]*255*1.3)|0},${Math.min(255,barColor[1]*255*1.3)|0},${Math.min(255,barColor[2]*255*1.3)|0},0.5)`;
      ctx.fillRect(fuelX, baseY + 21, BAR_W * fuelPct, 3);
    }

    // "FUEL" label
    ctx.font = '9px monospace';
    ctx.fillStyle = rgba(Palette.HUD_TEXT);
    ctx.fillText('FUEL', fuelX - 28, baseY + 30);

    // Distance
    const distStr = this.distances[idx].toFixed(1) + 'km';
    ctx.fillStyle = 'rgba(179,217,255,1)';
    ctx.fillText(distStr, baseX, baseY + 44);
  }

  _drawMiniPlane(ctx, x, y) {
    ctx.fillStyle = rgba(Palette.PLAYER_BODY);
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x - 6, y + 2);
    ctx.lineTo(x - 2, y);
    ctx.lineTo(x, y + 3);
    ctx.lineTo(x + 2, y);
    ctx.lineTo(x + 6, y + 2);
    ctx.closePath();
    ctx.fill();
  }
}

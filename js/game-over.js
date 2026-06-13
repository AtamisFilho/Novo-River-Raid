// GameOver — shows final scores and buttons (matching GameOver.gd)

import { Palette, rgba } from './palette.js';
import { GameState } from './game-state.js';
import { GameSettings } from './game-settings.js';

const VW = 480.0;
const VH = 720.0;

export class GameOverScreen {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hovered = -1;
    this.anim = 0;

    this.buttons = [
      { label: 'PLAY AGAIN', rect: { x: VW * 0.5 - 110, y: 520, w: 100, h: 48 }, action: 0 },
      { label: 'MAIN MENU',  rect: { x: VW * 0.5 + 10,  y: 520, w: 100, h: 48 }, action: 1 },
    ];

    this._setupInput();
  }

  _setupInput() {
    this._mouseMoveHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = VW / rect.width;
      const scaleY = VH / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      this.hovered = -1;
      for (let i = 0; i < this.buttons.length; i++) {
        const r = this.buttons[i].rect;
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
          this.hovered = i;
          break;
        }
      }
      this.canvas.style.cursor = this.hovered >= 0 ? 'pointer' : 'default';
    };

    this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = VW / rect.width;
    const scaleY = VH / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (let i = 0; i < this.buttons.length; i++) {
      const r = this.buttons[i].rect;
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        return this.buttons[i].action;
      }
    }
    return -1;
  }

  update(delta) {
    this.anim += delta;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VW, VH);

    // Dark background
    ctx.fillStyle = 'rgba(5,5,20,1)';
    ctx.fillRect(0, 0, VW, VH);

    // Scan lines
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let i = 0; i < VH; i += 4) {
      ctx.fillRect(0, i, VW, 1);
    }

    // "GAME OVER" text with glow
    const pulse = 0.7 + 0.3 * Math.sin(this.anim * 2.0);
    ctx.font = '44px monospace';

    // Shadow
    ctx.fillStyle = `rgba(128,0,0,0.5)`;
    ctx.fillText('GAME OVER', VW * 0.5 - 95 + 3, 183);
    // Main
    ctx.fillStyle = `rgba(230,26,26,${pulse})`;
    ctx.fillText('GAME OVER', VW * 0.5 - 95, 180);

    // Decorative line
    ctx.strokeStyle = 'rgba(128,26,26,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 200);
    ctx.lineTo(VW - 40, 200);
    ctx.stroke();

    // Scores
    let yOffset = 260;
    for (let i = 0; i < GameSettings.playerCount; i++) {
      const pname = `PLAYER ${i + 1}`;
      const scoreStr = String(GameState.scores[i]).padStart(7, '0');
      const distStr = GameState.getDistanceKm(i).toFixed(1) + ' km';

      ctx.font = '16px monospace';
      ctx.fillStyle = rgba(Palette.HUD_TEXT);
      ctx.fillText(pname, VW * 0.5 - 120, yOffset);

      ctx.font = '22px monospace';
      ctx.fillStyle = rgba(Palette.HUD_SCORE);
      ctx.fillText(scoreStr, VW * 0.5 - 50, yOffset + 30);

      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(153,204,255,1)';
      ctx.fillText('DIST: ' + distStr, VW * 0.5 - 50, yOffset + 60);

      yOffset += 110;
    }

    // High score
    let bestScore = 0;
    for (let i = 0; i < GameSettings.playerCount; i++) {
      if (GameState.scores[i] > bestScore) bestScore = GameState.scores[i];
    }
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(179,179,179,1)';
    ctx.fillText('HIGH SCORE', VW * 0.5 - 80, yOffset + 10);
    ctx.font = '20px monospace';
    ctx.fillStyle = rgba(Palette.MENU_TITLE);
    ctx.fillText(String(bestScore).padStart(7, '0'), VW * 0.5 - 60, yOffset + 30);

    // Buttons
    ctx.font = '13px monospace';
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const isHovered = (i === this.hovered);
      const bg = isHovered ? rgba(Palette.MENU_BUTTON_HV) : rgba(Palette.MENU_BUTTON);
      const r = btn.rect;

      ctx.fillStyle = bg;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = 'rgba(102,77,128,0.7)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      if (isHovered) {
        ctx.fillStyle = 'rgba(179,128,255,0.4)';
        ctx.fillRect(r.x, r.y, r.w, 3);
      }

      ctx.fillStyle = rgba(Palette.MENU_BUTTON_TX);
      const textX = r.x + r.w * 0.5 - btn.label.length * 4;
      const textY = r.y + r.h * 0.5 + 5;
      ctx.fillText(btn.label, textX, textY);
    }
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
  }
}

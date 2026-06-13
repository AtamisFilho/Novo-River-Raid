// MainMenu — title screen with buttons (matching MainMenu.gd)

import { Palette, rgba, lerpColor } from './palette.js';
import { GameSettings } from './game-settings.js';

const VW = 480.0;
const VH = 720.0;

export class MainMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hovered = -1;
    this.titleAnim = 0;
    this.previewScroll = 0;
    this.previewSegments = [];

    this.buttons = [
      { label: 'NEW GAME', rect: { x: VW * 0.5 - 100, y: 460, w: 200, h: 48 }, action: 0 },
      { label: 'SETTINGS', rect: { x: VW * 0.5 - 100, y: 525, w: 200, h: 48 }, action: 1 },
      { label: 'QUIT',     rect: { x: VW * 0.5 - 100, y: 590, w: 200, h: 48 }, action: 2 },
    ];

    this._generatePreview();
    this._setupInput();
  }

  _generatePreview() {
    let cx = VW * 0.5;
    let w = 170.0;
    for (let i = 0; i < 35; i++) {
      this.previewSegments.push({
        left: cx - w * 0.5,
        right: cx + w * 0.5,
        y: i * 22.0
      });
      cx += (Math.random() - 0.5) * 14;
      cx = Math.max(100, Math.min(380, cx));
      w += (Math.random() - 0.5) * 10;
      w = Math.max(130, Math.min(210, w));
    }
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

    this._clickHandler = (e) => {
      if (this.hovered >= 0) {
        return this.buttons[this.hovered].action;
      }
      return -1;
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
    this.titleAnim += delta;
    this.previewScroll = (this.previewScroll + 60.0 * delta) % 22.0;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VW, VH);

    this._drawBackground(ctx);
    this._drawTitle(ctx);
    this._drawButtons(ctx);
  }

  _drawBackground(ctx) {
    // Sky gradient
    for (let i = 0; i < 24; i++) {
      const t = i / 24;
      const y = t * VH * 0.65;
      const c = lerpColor(Palette.SKY_TOP, Palette.SKY_HORIZON, t);
      ctx.fillStyle = rgba(c);
      ctx.fillRect(0, y, VW, VH / 24 + 1);
    }

    // Preview river
    if (this.previewSegments.length < 2) return;

    for (let i = 0; i < this.previewSegments.length - 1; i++) {
      const s0 = this.previewSegments[i];
      const s1 = this.previewSegments[i + 1];
      const y0 = s0.y - this.previewScroll;
      const y1 = s1.y - this.previewScroll;

      // Left terrain
      ctx.fillStyle = rgba(Palette.JUNGLE_FAR);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(s0.left, y0);
      ctx.lineTo(s1.left, y1);
      ctx.lineTo(0, y1);
      ctx.closePath();
      ctx.fill();

      // Right terrain
      ctx.beginPath();
      ctx.moveTo(s0.right, y0);
      ctx.lineTo(VW, y0);
      ctx.lineTo(VW, y1);
      ctx.lineTo(s1.right, y1);
      ctx.closePath();
      ctx.fill();

      // River water
      ctx.fillStyle = rgba(Palette.RIVER_MID);
      ctx.beginPath();
      ctx.moveTo(s0.left + 12, y0);
      ctx.lineTo(s0.right - 12, y0);
      ctx.lineTo(s1.right - 12, y1);
      ctx.lineTo(s1.left + 12, y1);
      ctx.closePath();
      ctx.fill();
    }

    // Darken bottom half
    ctx.fillStyle = 'rgba(0,0,13,0.7)';
    ctx.fillRect(0, VH * 0.35, VW, VH * 0.65);
  }

  _drawTitle(ctx) {
    // Title backdrop glow
    const glowAlpha = 0.15 + 0.08 * Math.sin(this.titleAnim * 1.5);
    ctx.fillStyle = `rgba(204,153,0,${glowAlpha})`;
    ctx.fillRect(40, 120, VW - 80, 150);

    ctx.font = '48px monospace';
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText('RIVER RAID', VW * 0.5 - 120 + 3, 218);
    // Main
    ctx.fillStyle = rgba(Palette.MENU_TITLE);
    ctx.fillText('RIVER RAID', VW * 0.5 - 120, 215);
    // Shine
    ctx.fillStyle = 'rgba(255,255,204,0.3)';
    ctx.fillText('RIVER RAID', VW * 0.5 - 120, 213);

    // Subtitle
    ctx.font = '20px monospace';
    ctx.fillStyle = 'rgba(204,179,77,1)';
    ctx.fillText('RELOADED', VW * 0.5 - 58, 252);

    // Decorative line
    ctx.strokeStyle = 'rgba(153,128,51,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 265);
    ctx.lineTo(VW - 60, 265);
    ctx.stroke();

    // "CLICK TO PLAY" hint
    const hintAlpha = 0.5 + 0.5 * Math.abs(Math.sin(this.titleAnim * 2.0));
    ctx.font = '14px monospace';
    ctx.fillStyle = `rgba(204,230,255,${hintAlpha})`;
    ctx.fillText('CLICK TO PLAY', VW * 0.5 - 90, 420);
  }

  _drawButtons(ctx) {
    ctx.font = '16px monospace';
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const isHovered = (i === this.hovered);
      const r = btn.rect;

      ctx.fillStyle = rgba(isHovered ? Palette.MENU_BUTTON_HV : Palette.MENU_BUTTON);
      ctx.fillRect(r.x, r.y, r.w, r.h);

      ctx.strokeStyle = 'rgba(102,128,179,0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      if (isHovered) {
        ctx.fillStyle = 'rgba(153,179,255,0.3)';
        ctx.fillRect(r.x, r.y, r.w, 3);
      }

      ctx.fillStyle = rgba(Palette.MENU_BUTTON_TX);
      const textX = r.x + r.w * 0.5 - btn.label.length * 5;
      const textY = r.y + r.h * 0.5 + 6;
      ctx.fillText(btn.label, textX, textY);
    }
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
  }
}

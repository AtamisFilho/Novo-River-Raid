// SettingsMenu — difficulty and player count settings (matching SettingsMenu.gd)

import { Palette, rgba } from './palette.js';
import { GameSettings, Difficulty } from './game-settings.js';

const VW = 480.0;
const VH = 720.0;
const DIFF_NAMES = ['EASY', 'NORMAL', 'HARD'];

export class SettingsMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hovered = -1;
    this.buttons = [];

    this._createButtons();
    this._setupInput();
  }

  _createButtons() {
    this.buttons = [];

    // Difficulty buttons — evenly spaced
    const btnW = 80;
    const btnGap = 15;
    const totalW = DIFF_NAMES.length * btnW + (DIFF_NAMES.length - 1) * btnGap;
    const startX = (VW - totalW) / 2;
    for (let i = 0; i < DIFF_NAMES.length; i++) {
      this.buttons.push({
        label: DIFF_NAMES[i],
        rect: { x: startX + i * (btnW + btnGap), y: 280, w: btnW, h: 40 },
        type: 'diff',
        value: i
      });
    }

    // Player count buttons
    this.buttons.push({
      label: '1 PLAYER',
      rect: { x: VW * 0.5 - 100, y: 380, w: 90, h: 40 },
      type: 'players',
      value: 1
    });
    this.buttons.push({
      label: '2 PLAYERS',
      rect: { x: VW * 0.5 + 10, y: 380, w: 90, h: 40 },
      type: 'players',
      value: 2
    });

    // Back button
    this.buttons.push({
      label: 'BACK',
      rect: { x: VW * 0.5 - 60, y: 500, w: 120, h: 48 },
      type: 'back',
      value: 0
    });
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
        const btn = this.buttons[i];
        switch (btn.type) {
          case 'diff':
            GameSettings.applyPreset(btn.value);
            GameSettings.saveSettings();
            break;
          case 'players':
            GameSettings.playerCount = btn.value;
            GameSettings.saveSettings();
            break;
          case 'back':
            return 'back';
        }
        break;
      }
    }
    return null;
  }

  update() {
    // No continuous updates needed
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VW, VH);

    // Background
    ctx.fillStyle = rgba(Palette.MENU_BG);
    ctx.fillRect(0, 0, VW, VH);

    // Grid pattern
    ctx.strokeStyle = 'rgba(26,38,77,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < VW; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, VH);
      ctx.stroke();
    }
    for (let j = 0; j < VH; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(VW, j);
      ctx.stroke();
    }

    // Title
    ctx.font = '32px monospace';
    ctx.fillStyle = rgba(Palette.MENU_TITLE);
    ctx.fillText('SETTINGS', VW * 0.5 - 60, 100);

    ctx.strokeStyle = 'rgba(153,128,51,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 115);
    ctx.lineTo(VW - 60, 115);
    ctx.stroke();

    // Difficulty label
    ctx.font = '16px monospace';
    ctx.fillStyle = rgba(Palette.HUD_TEXT);
    ctx.fillText('DIFFICULTY', VW * 0.5 - 60, 240);

    // Players label
    ctx.fillText('PLAYERS', VW * 0.5 - 60, 360);

    // Draw buttons
    ctx.font = '13px monospace';
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      const isHovered = (i === this.hovered);
      let isSelected = false;

      if (btn.type === 'diff') {
        isSelected = (GameSettings.difficulty === btn.value);
      } else if (btn.type === 'players') {
        isSelected = (GameSettings.playerCount === btn.value);
      }

      let bg;
      if (isSelected) {
        bg = 'rgba(51,128,204,0.9)';
      } else if (isHovered) {
        bg = rgba(Palette.MENU_BUTTON_HV);
      } else {
        bg = rgba(Palette.MENU_BUTTON);
      }

      const r = btn.rect;
      ctx.fillStyle = bg;
      ctx.fillRect(r.x, r.y, r.w, r.h);

      ctx.strokeStyle = 'rgba(102,128,179,0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      ctx.fillStyle = rgba(Palette.MENU_BUTTON_TX);
      const textX = r.x + r.w * 0.5 - btn.label.length * 4;
      const textY = r.y + r.h * 0.5 + 5;
      ctx.fillText(btn.label, textX, textY);
    }

    // Current settings info
    const diffName = DIFF_NAMES[GameSettings.difficulty] || 'CUSTOM';
    const info = `Current: ${diffName}  |  ${GameSettings.playerCount} Player(s)`;
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(153,179,204,1)';
    ctx.fillText(info, VW * 0.5 - 100, 460);
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
  }
}

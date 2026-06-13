// Bullet — bright yellow elongated oval with glow (matching Bullet.gd)

import { Palette, rgba } from './palette.js';

const SPEED = 500.0;

export class Bullet {
  constructor(playerIdx, x, y) {
    this.playerIdx = playerIdx;
    this.x = x;
    this.y = y;
    this.dead = false;
  }

  update(delta) {
    this.y -= SPEED * delta;
    if (this.y < -20) {
      this.dead = true;
    }
  }

  draw(ctx) {
    // Outer glow
    ctx.fillStyle = rgba(Palette.BULLET_GLOW);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core (elongated)
    ctx.fillStyle = rgba(Palette.BULLET_CORE);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 8);
    ctx.lineTo(this.x - 3, this.y - 3);
    ctx.lineTo(this.x - 3, this.y + 3);
    ctx.lineTo(this.x, this.y + 8);
    ctx.lineTo(this.x + 3, this.y + 3);
    ctx.lineTo(this.x + 3, this.y - 3);
    ctx.closePath();
    ctx.fill();

    // Bright center dot
    ctx.fillStyle = 'rgba(255,255,230,1)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

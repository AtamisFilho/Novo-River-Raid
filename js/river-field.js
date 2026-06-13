// RiverField — procedural river with terrain, water, sky, trees (matching RiverField.gd)

import { Palette, rgba, lerpColor } from './palette.js';
import { GameSettings } from './game-settings.js';

const SEG_H = 24;
const MIN_WIDTH = 130.0;
const MAX_WIDTH = 220.0;
const CENTER_DRIFT = 8.0;
const VW = 480.0;
const VH = 720.0;
const SEG_COUNT = 40;
const TREE_COUNT = 30;
const FOAM_COUNT = 50;

// Seeded random number generator
class SeededRNG {
  constructor(seed = 42) { this.seed = seed; }
  next() {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }
  randfRange(min, max) { return min + this.next() * (max - min); }
  randiRange(min, max) { return Math.floor(min + this.next() * (max - min + 1)); }
  randf() { return this.next(); }
}

export class RiverField {
  constructor() {
    this.segments = [];
    this.scrollY = 0;
    this.scrollSpeed = 120;
    this.waveOffset = 0;
    this.waveSpeed = 40;
    this.trees = [];
    this.foamFlecks = [];
    this.rng = new SeededRNG(42);

    this._generateInitialSegments();
    this._generateTrees();
    this._generateFoam();
  }

  _generateInitialSegments() {
    this.segments = [];
    let cx = VW * 0.5;
    let w = 160.0;
    for (let i = 0; i < SEG_COUNT; i++) {
      const yWorld = -(SEG_COUNT - i) * SEG_H;
      this.segments.push({
        left: cx - w * 0.5,
        right: cx + w * 0.5,
        yWorld
      });
      cx += this.rng.randfRange(-CENTER_DRIFT, CENTER_DRIFT);
      cx = Math.max(MIN_WIDTH * 0.5 + 10, Math.min(VW - MIN_WIDTH * 0.5 - 10, cx));
      w += this.rng.randfRange(-6.0, 6.0);
      w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w));
    }
  }

  _generateTrees() {
    this.trees = [];
    for (let i = 0; i < TREE_COUNT; i++) {
      this.trees.push({
        side: this.rng.randf() < 0.5 ? 0 : 1,
        xOff: this.rng.randfRange(5.0, 50.0),
        segIdx: this.rng.randiRange(0, SEG_COUNT - 1),
        size: this.rng.randfRange(12.0, 22.0),
        variation: this.rng.randf()
      });
    }
  }

  _generateFoam() {
    this.foamFlecks = [];
    for (let i = 0; i < FOAM_COUNT; i++) {
      this.foamFlecks.push({
        t: this.rng.randf(),
        offset: this.rng.randfRange(-3.0, 3.0),
        side: this.rng.randf() < 0.5 ? 0 : 1,
        size: this.rng.randfRange(1.5, 3.5),
        phase: this.rng.randf() * Math.PI * 2
      });
    }
  }

  update(delta) {
    this.scrollSpeed = GameSettings.getScrollSpeed();
    this.scrollY += this.scrollSpeed * delta;
    this.waveOffset += this.waveSpeed * delta;
    this._recycleSegments();
  }

  _recycleSegments() {
    while (this.segments.length > 0) {
      const seg = this.segments[0];
      const screenY = seg.yWorld - this.scrollY + VH;
      if (screenY > VH + SEG_H * 2) {
        this.segments.shift();
        this._appendNewSegment();
      } else {
        break;
      }
    }
  }

  _appendNewSegment() {
    const last = this.segments[this.segments.length - 1];
    let cx = (last.left + last.right) * 0.5;
    let w = last.right - last.left;
    cx += this.rng.randfRange(-CENTER_DRIFT, CENTER_DRIFT);
    cx = Math.max(MIN_WIDTH * 0.5 + 10, Math.min(VW - MIN_WIDTH * 0.5 - 10, cx));
    w += this.rng.randfRange(-6.0, 6.0);
    w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w));
    this.segments.push({
      left: cx - w * 0.5,
      right: cx + w * 0.5,
      yWorld: last.yWorld + SEG_H
    });
  }

  getBoundsAtY(screenY) {
    const worldY = screenY + this.scrollY - VH;
    for (let i = 0; i < this.segments.length - 1; i++) {
      const s0 = this.segments[i];
      const s1 = this.segments[i + 1];
      if (worldY >= s0.yWorld && worldY < s1.yWorld) {
        let t = (worldY - s0.yWorld) / SEG_H;
        t = Math.max(0, Math.min(1, t));
        const left  = s0.left  + (s1.left  - s0.left)  * t;
        const right = s0.right + (s1.right - s0.right) * t;
        return { left, right };
      }
    }
    if (this.segments.length > 0) {
      const last = this.segments[this.segments.length - 1];
      return { left: last.left, right: last.right };
    }
    return { left: 120, right: 360 };
  }

  _segScreenY(seg) {
    return seg.yWorld - this.scrollY + VH;
  }

  draw(ctx) {
    this._drawSky(ctx);
    this._drawTerrainFar(ctx);
    this._drawTerrainMid(ctx);
    this._drawTerrainNearEdge(ctx);
    this._drawTreeSilhouettes(ctx);
    this._drawRiverWater(ctx);
    this._drawWaveLines(ctx);
    this._drawBankFoam(ctx);
  }

  _drawSky(ctx) {
    const strips = 32;
    for (let i = 0; i < strips; i++) {
      const t = i / strips;
      const y = t * VH;
      const c = lerpColor(Palette.SKY_TOP, Palette.SKY_HORIZON, t);
      ctx.fillStyle = rgba(c);
      ctx.fillRect(0, y, VW, VH / strips + 1);
    }
    // Subtle horizontal banding
    for (let i = 0; i < VH; i += 60) {
      const bandY = i + ((this.scrollY * 0.05) % 60);
      ctx.fillStyle = rgba(Palette.SKY_BAND);
      ctx.fillRect(0, bandY, VW, 2);
    }
  }

  _drawTerrainFar(ctx) {
    const riverLeft = [];
    const riverRight = [];

    for (const seg of this.segments) {
      const sy = this._segScreenY(seg);
      if (sy < -SEG_H * 2 || sy > VH + SEG_H * 2) continue;
      riverLeft.push({ x: seg.left, y: sy });
      riverRight.push({ x: seg.right, y: sy });
    }

    if (riverLeft.length < 2) return;

    // Left terrain polygon
    ctx.fillStyle = rgba(Palette.JUNGLE_FAR);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(riverLeft[0].x, -10);
    for (const pt of riverLeft) ctx.lineTo(pt.x, pt.y);
    ctx.lineTo(riverLeft[riverLeft.length - 1].x, VH + 10);
    ctx.lineTo(0, VH + 10);
    ctx.closePath();
    ctx.fill();

    // Right terrain polygon
    ctx.beginPath();
    ctx.moveTo(riverRight[0].x, -10);
    ctx.lineTo(VW, -10);
    ctx.lineTo(VW, VH + 10);
    ctx.lineTo(riverRight[riverRight.length - 1].x, VH + 10);
    for (let i = riverRight.length - 1; i >= 0; i--) {
      ctx.lineTo(riverRight[i].x, riverRight[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawTerrainMid(ctx) {
    const LAYER_W = 35.0;
    if (this.segments.length < 2) return;

    const midLeft = [];
    const midRight = [];
    for (const seg of this.segments) {
      const sy = this._segScreenY(seg);
      if (sy < -SEG_H * 2 || sy > VH + SEG_H * 2) continue;
      midLeft.push({ x: seg.left + LAYER_W, y: sy });
      midRight.push({ x: seg.right - LAYER_W, y: sy });
    }

    if (midLeft.length < 2) return;

    ctx.fillStyle = rgba(Palette.JUNGLE_MID);
    // Left mid
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(midLeft[0].x, -10);
    for (const pt of midLeft) ctx.lineTo(pt.x, pt.y);
    ctx.lineTo(midLeft[midLeft.length - 1].x, VH + 10);
    ctx.lineTo(0, VH + 10);
    ctx.closePath();
    ctx.fill();

    // Right mid
    ctx.beginPath();
    ctx.moveTo(midRight[0].x, -10);
    ctx.lineTo(VW, -10);
    ctx.lineTo(VW, VH + 10);
    ctx.lineTo(midRight[midRight.length - 1].x, VH + 10);
    for (let i = midRight.length - 1; i >= 0; i--) {
      ctx.lineTo(midRight[i].x, midRight[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawTerrainNearEdge(ctx) {
    if (this.segments.length < 2) return;

    for (let i = 0; i < this.segments.length - 1; i++) {
      const s0 = this.segments[i];
      const s1 = this.segments[i + 1];
      const y0 = this._segScreenY(s0);
      const y1 = this._segScreenY(s1);

      if (y1 < -SEG_H || y0 > VH + SEG_H) continue;

      // Left edge bright strip
      ctx.fillStyle = rgba(Palette.JUNGLE_EDGE);
      ctx.beginPath();
      ctx.moveTo(s0.left, y0);
      ctx.lineTo(s0.left + 8, y0);
      ctx.lineTo(s1.left + 8, y1);
      ctx.lineTo(s1.left, y1);
      ctx.closePath();
      ctx.fill();

      // Left shadow strip
      ctx.fillStyle = rgba(Palette.JUNGLE_SHADOW);
      ctx.beginPath();
      ctx.moveTo(s0.left + 8, y0);
      ctx.lineTo(s0.left + 14, y0);
      ctx.lineTo(s1.left + 14, y1);
      ctx.lineTo(s1.left + 8, y1);
      ctx.closePath();
      ctx.fill();

      // Right edge bright strip
      ctx.fillStyle = rgba(Palette.JUNGLE_EDGE);
      ctx.beginPath();
      ctx.moveTo(s0.right - 8, y0);
      ctx.lineTo(s0.right, y0);
      ctx.lineTo(s1.right, y1);
      ctx.lineTo(s1.right - 8, y1);
      ctx.closePath();
      ctx.fill();

      // Right shadow
      ctx.fillStyle = rgba(Palette.JUNGLE_SHADOW);
      ctx.beginPath();
      ctx.moveTo(s0.right - 14, y0);
      ctx.lineTo(s0.right - 8, y0);
      ctx.lineTo(s1.right - 8, y1);
      ctx.lineTo(s1.right - 14, y1);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawTreeSilhouettes(ctx) {
    for (const tree of this.trees) {
      const idx = tree.segIdx % this.segments.length;
      if (idx < 0 || idx >= this.segments.length) continue;
      const seg = this.segments[idx];
      const sy = this._segScreenY(seg);
      let tx;
      if (tree.side === 0) {
        tx = seg.left - tree.xOff;
      } else {
        tx = seg.right + tree.xOff;
      }
      this._drawPineTree(ctx, tx, sy, tree.size, tree.variation);
    }
  }

  _drawPineTree(ctx, x, y, size, variation) {
    for (let l = 0; l < 3; l++) {
      const t = l / 3;
      const layerW = size * (1.0 - t * 0.3);
      const layerH = size * 0.5;
      const yOff = -l * (size * 0.35);
      const c = lerpColor(Palette.TREE_DARK, Palette.TREE_MID, t * 0.5 + variation * 0.3);
      ctx.fillStyle = rgba(c);
      ctx.beginPath();
      ctx.moveTo(x, y + yOff - layerH);
      ctx.lineTo(x - layerW * 0.5, y + yOff);
      ctx.lineTo(x + layerW * 0.5, y + yOff);
      ctx.closePath();
      ctx.fill();
    }
    // Trunk
    ctx.fillStyle = rgba(Palette.TREE_DARK);
    ctx.fillRect(x - 2, y, 4, size * 0.3);
  }

  _drawRiverWater(ctx) {
    if (this.segments.length < 2) return;

    const leftEdge = [];
    const rightEdge = [];

    for (const seg of this.segments) {
      const sy = this._segScreenY(seg);
      leftEdge.push({ x: seg.left + 14, y: sy });
      rightEdge.push({ x: seg.right - 14, y: sy });
    }

    const centerL = [], centerR = [], midL = [], midR = [];
    for (let i = 0; i < this.segments.length; i++) {
      const cx = (leftEdge[i].x + rightEdge[i].x) * 0.5;
      const hw = (rightEdge[i].x - leftEdge[i].x) * 0.5;
      const sy = leftEdge[i].y;
      centerL.push({ x: cx - hw * 0.25, y: sy });
      centerR.push({ x: cx + hw * 0.25, y: sy });
      midL.push({ x: cx - hw * 0.65, y: sy });
      midR.push({ x: cx + hw * 0.65, y: sy });
    }

    this._fillRiverStrip(ctx, leftEdge, rightEdge, Palette.RIVER_SHALLOW);
    this._fillRiverStrip(ctx, midL, midR, Palette.RIVER_MID);
    this._fillRiverStrip(ctx, centerL, centerR, Palette.RIVER_DEEP);
  }

  _fillRiverStrip(ctx, leftPts, rightPts, color) {
    if (leftPts.length < 2) return;
    ctx.fillStyle = rgba(color);
    ctx.beginPath();
    for (const pt of leftPts) ctx.lineTo(pt.x, pt.y);
    for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
    ctx.closePath();
    ctx.fill();
  }

  _drawWaveLines(ctx) {
    const waveSpacing = 30.0;
    const dashLen = 18.0;
    const gapLen = 10.0;

    let y = this.waveOffset % waveSpacing;
    while (y < VH) {
      const bounds = this.getBoundsAtY(y);
      const lx = bounds.left + 16;
      const rx = bounds.right - 16;
      if (rx - lx < 30) { y += waveSpacing; continue; }

      const cxOffset = Math.sin(y * 0.05 + this.waveOffset * 0.03) * 15.0;
      let x = lx;
      let toggle = true;
      while (x < rx) {
        if (toggle) {
          const x2 = Math.min(x + dashLen, rx);
          const alpha = 0.15 + 0.2 * Math.abs(Math.sin(y * 0.08 + this.waveOffset * 0.02));
          const c = [...Palette.WAVE_COLOR];
          c[3] = alpha;
          ctx.strokeStyle = rgba(c);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + cxOffset, y);
          ctx.lineTo(x2 + cxOffset, y);
          ctx.stroke();
        }
        x += toggle ? dashLen : gapLen;
        toggle = !toggle;
      }
      y += waveSpacing;
    }
  }

  _drawBankFoam(ctx) {
    for (const fleck of this.foamFlecks) {
      const screenY = ((fleck.t * VH + this.scrollY * 0.8) % VH);
      const bounds = this.getBoundsAtY(screenY);
      let x;
      if (fleck.side === 0) {
        x = bounds.left + 12 + fleck.offset;
      } else {
        x = bounds.right - 12 + fleck.offset;
      }
      const alpha = 0.4 + 0.3 * Math.sin(this.scrollY * 0.05 + fleck.phase);
      const c = [...Palette.FOAM_COLOR];
      c[3] = alpha;
      ctx.fillStyle = rgba(c);
      ctx.beginPath();
      ctx.arc(x, screenY, fleck.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

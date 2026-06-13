// InputManager — handles keyboard + gamepad + touch input (replacing Godot's InputMap)

import { touchState } from './touch-state.js';

export class InputManager {
  constructor() {
    this.keys = {};

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  // Check if an action is pressed
  isActionPressed(action) {
    // Check touch state first
    if (touchState[action]) return true;

    // P1 keyboard mappings
    const p1Map = {
      'p1_left':  ['KeyA'],
      'p1_right': ['KeyD'],
      'p1_up':    ['KeyW'],
      'p1_down':  ['KeyS'],
      'p1_shoot': ['Space'],
    };

    const p2Map = {
      'p2_left':  ['ArrowLeft'],
      'p2_right': ['ArrowRight'],
      'p2_up':    ['ArrowUp'],
      'p2_down':  ['ArrowDown'],
      'p2_shoot': ['Enter', 'NumpadEnter'],
    };

    const uiMap = {
      'ui_pause': ['Escape'],
    };

    // Check keyboard
    let keyMap = {};
    if (action.startsWith('p1')) keyMap = p1Map;
    else if (action.startsWith('p2')) keyMap = p2Map;
    else keyMap = uiMap;

    const codes = keyMap[action] || [];
    for (const code of codes) {
      if (this.keys[code]) return true;
    }

    // Check gamepad
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (action.startsWith('p1') && gamepads[0]) {
      return this._checkGamepadAction(gamepads[0], action, 1);
    }
    if (action.startsWith('p2') && gamepads[1]) {
      return this._checkGamepadAction(gamepads[1], action, 2);
    }

    return false;
  }

  _checkGamepadAction(gp, action, playerNum) {
    const axisX = gp.axes[0] || 0;
    const axisY = gp.axes[1] || 0;
    const deadzone = 0.5;

    if (action === `p${playerNum}_left`  && axisX < -deadzone) return true;
    if (action === `p${playerNum}_right` && axisX > deadzone)  return true;
    if (action === `p${playerNum}_up`    && axisY < -deadzone) return true;
    if (action === `p${playerNum}_down`  && axisY > deadzone)  return true;

    // D-pad
    if (action === `p${playerNum}_left`  && gp.buttons[14] && gp.buttons[14].pressed) return true;
    if (action === `p${playerNum}_right` && gp.buttons[15] && gp.buttons[15].pressed) return true;
    if (action === `p${playerNum}_up`    && gp.buttons[12] && gp.buttons[12].pressed) return true;
    if (action === `p${playerNum}_down`  && gp.buttons[13] && gp.buttons[13].pressed) return true;

    // Shoot: A / X button
    if (action === `p${playerNum}_shoot` && gp.buttons[0] && gp.buttons[0].pressed) return true;

    return false;
  }

  // Get action strength (0..1) for analog input
  getActionStrength(action) {
    if (touchState[action]) return 1.0;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const playerNum = action.startsWith('p2') ? 2 : 1;
    const gpIdx = playerNum - 1;

    if (gamepads[gpIdx]) {
      const gp = gamepads[gpIdx];
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;

      if (action === `p${playerNum}_left`  && axisX < -0.2) return Math.min(1, Math.abs(axisX));
      if (action === `p${playerNum}_right` && axisX > 0.2)  return Math.min(1, axisX);
      if (action === `p${playerNum}_up`    && axisY < -0.2) return Math.min(1, Math.abs(axisY));
      if (action === `p${playerNum}_down`  && axisY > 0.2)  return Math.min(1, axisY);
    }

    return this.isActionPressed(action) ? 1.0 : 0.0;
  }
}

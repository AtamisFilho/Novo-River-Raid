// App — main entry point, manages game scenes/states

import { GameSettings } from './game-settings.js';
import { GameState } from './game-state.js';
import { MainMenu } from './main-menu.js';
import { SettingsMenu } from './settings-menu.js';
import { MainGame } from './main.js';
import { GameOverScreen } from './game-over.js';

const VW = 480;
const VH = 720;

export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = VW;
    this.canvas.height = VH;
    this.currentScene = null;
    this.sceneName = '';

    // Load saved settings
    GameSettings.loadSettings();

    // Start at main menu
    this.switchScene('mainMenu');

    // Click handler
    this._clickHandler = (e) => this._onClick(e);
    this.canvas.addEventListener('click', this._clickHandler);

    // Touch handler for mobile
    this._touchStartHandler = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this._onClick({ clientX: touch.clientX, clientY: touch.clientY });
    };
    this.canvas.addEventListener('touchstart', this._touchStartHandler, { passive: false });

    // Start game loop
    this._lastTime = performance.now();
    this._boundLoop = this._loop.bind(this);
    requestAnimationFrame(this._boundLoop);
  }

  switchScene(name) {
    // Destroy old scene
    if (this.currentScene && this.currentScene.destroy) {
      this.currentScene.destroy();
    }

    this.sceneName = name;
    this.canvas.style.cursor = 'default';

    switch (name) {
      case 'mainMenu':
        this.currentScene = new MainMenu(this.canvas);
        break;
      case 'settings':
        this.currentScene = new SettingsMenu(this.canvas);
        break;
      case 'game':
        GameState._playerCount = GameSettings.playerCount;
        this.currentScene = new MainGame(this.canvas);
        break;
      case 'gameOver':
        this.currentScene = new GameOverScreen(this.canvas);
        break;
    }
  }

  _onClick(e) {
    switch (this.sceneName) {
      case 'mainMenu': {
        const action = this.currentScene.handleClick(e);
        if (action === 0) this.switchScene('game');
        else if (action === 1) this.switchScene('settings');
        else if (action === 2) {
          // "Quit" — go back to menu
          this.switchScene('mainMenu');
        }
        break;
      }
      case 'settings': {
        const result = this.currentScene.handleClick(e);
        if (result === 'back') this.switchScene('mainMenu');
        break;
      }
      case 'gameOver': {
        const action = this.currentScene.handleClick(e);
        if (action === 0) this.switchScene('game');
        else if (action === 1) this.switchScene('mainMenu');
        break;
      }
    }
  }

  _loop(now) {
    const delta = Math.min((now - this._lastTime) / 1000, 0.05); // Cap delta at 50ms
    this._lastTime = now;

    // Update
    switch (this.sceneName) {
      case 'mainMenu':
      case 'settings':
      case 'gameOver':
        this.currentScene.update(delta);
        break;
      case 'game': {
        const result = this.currentScene.update(delta);
        if (result === 'gameOver') {
          this.switchScene('gameOver');
        }
        break;
      }
    }

    // Draw
    if (this.currentScene && this.currentScene.draw) {
      this.currentScene.draw();
    }

    requestAnimationFrame(this._boundLoop);
  }
}

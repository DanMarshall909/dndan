/**
 * UI management for character panels, logs, and menus
 */

import { Character } from '../game/types';

export class GameUI {
  private container: HTMLElement;
  private logElement: HTMLElement;
  private statsElement: HTMLElement;
  private minimapCanvas: HTMLCanvasElement;
  private logMessages: string[] = [];
  private maxLogMessages = 50;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element '${containerId}' not found`);
    }
    this.container = container;

    // Create UI elements
    this.logElement = this.createLogPanel();
    this.statsElement = this.createStatsPanel();
    this.minimapCanvas = this.createMinimapPanel();
  }

  /**
   * Create message log panel
   */
  private createLogPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'message-log';
    panel.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      width: 600px;
      height: 150px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #0a0;
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 8px;
      overflow-y: auto;
      white-space: pre-wrap;
    `;
    this.container.appendChild(panel);
    return panel;
  }

  /**
   * Create character stats panel
   */
  private createStatsPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'stats-panel';
    panel.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 250px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #0a0;
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      padding: 10px;
    `;
    this.container.appendChild(panel);
    return panel;
  }

  /**
   * Create minimap panel
   */
  private createMinimapPanel(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.id = 'minimap';
    canvas.width = 128;
    canvas.height = 128;
    canvas.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 128px;
      height: 128px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #0a0;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    `;
    this.container.appendChild(canvas);
    return canvas;
  }

  /**
   * Get minimap canvas for rendering
   */
  getMinimapCanvas(): HTMLCanvasElement {
    return this.minimapCanvas;
  }

  /**
   * Add a message to the log
   */
  addMessage(message: string, color: string = '#0f0'): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logMessages.push(`[${timestamp}] ${message}`);

    // Keep only recent messages
    if (this.logMessages.length > this.maxLogMessages) {
      this.logMessages.shift();
    }

    this.updateLog();
  }

  /**
   * Update the log display
   */
  private updateLog(): void {
    this.logElement.innerHTML = this.logMessages.join('\n');
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  /**
   * Update character stats display
   */
  updateStats(character: Character): void {
    const { name, race, class: charClass, level } = character;
    const { hitPoints, maxHitPoints, armorClass, thac0 } = character.combat;
    const { experience, nextLevelXP } = character;

    const html = `
<strong>${name}</strong>
${race} ${charClass} (Level ${level})

HP: ${hitPoints}/${maxHitPoints}
AC: ${armorClass}
THAC0: ${thac0}

XP: ${experience}/${nextLevelXP}

STR: ${character.abilities.strength}
INT: ${character.abilities.intelligence}
WIS: ${character.abilities.wisdom}
DEX: ${character.abilities.dexterity}
CON: ${character.abilities.constitution}
CHA: ${character.abilities.charisma}

Weapon: ${character.equipment.weapon?.name || 'None'}
Armor: ${character.equipment.armor?.name || 'None'}
    `.trim();

    this.statsElement.innerHTML = html;
  }

  /**
   * Show controls help
   */
  showControls(): void {
    const controls = `
CONTROLS:
---------
Arrow Keys / WASD: Move
Q / E: Rotate 90°
Space: Interact
C: Character Sheet
I: Inventory
M: Cast Spell
R: Rest
ESC: Menu
    `.trim();

    this.addMessage(controls, '#ff0');
  }

  /**
   * Clear the message log
   */
  clearLog(): void {
    this.logMessages = [];
    this.updateLog();
  }

  /**
   * Show a modal dialog
   */
  showDialog(title: string, content: string, buttons: { text: string; callback: () => void }[]): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #000;
      border: 3px solid #0a0;
      color: #0f0;
      font-family: 'Courier New', monospace;
      padding: 20px;
      min-width: 400px;
      max-width: 600px;
    `;

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.cssText = 'margin: 0 0 15px 0; color: #ff0;';

    const contentEl = document.createElement('div');
    contentEl.innerHTML = content;
    contentEl.style.cssText = 'margin-bottom: 20px; line-height: 1.5;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

    for (const btn of buttons) {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.style.cssText = `
        background: #000;
        border: 2px solid #0a0;
        color: #0f0;
        padding: 8px 16px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
      `;
      button.onmouseover = () => {
        button.style.background = '#0a0';
        button.style.color = '#000';
      };
      button.onmouseout = () => {
        button.style.background = '#000';
        button.style.color = '#0f0';
      };
      button.onclick = () => {
        document.body.removeChild(overlay);
        btn.callback();
      };
      buttonContainer.appendChild(button);
    }

    dialog.appendChild(titleEl);
    dialog.appendChild(contentEl);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
}

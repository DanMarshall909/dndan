/**
 * Fullscreen atmospheric UI with SSI-style text overlays
 * Target resolution: 320x240x256 color
 */

import { Character } from '../game/types';

export class FullscreenGameUI {
  private container: HTMLElement;
  private atmosphereImage: HTMLImageElement;
  private logElement: HTMLElement;
  private statsElement: HTMLElement;
  private minimapCanvas: HTMLCanvasElement;
  private logMessages: string[] = [];
  private maxLogMessages = 8; // Fewer messages for compact display
  private currentImageUrl: string | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element '${containerId}' not found`);
    }
    this.container = container;
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';

    // Create fullscreen atmospheric background
    this.atmosphereImage = this.createAtmosphereLayer();

    // Create UI overlays (in order: back to front)
    this.minimapCanvas = this.createMinimapPanel();
    this.statsElement = this.createStatsPanel();
    this.logElement = this.createLogPanel();
  }

  /**
   * Create fullscreen atmospheric image layer
   */
  private createAtmosphereLayer(): HTMLImageElement {
    const img = document.createElement('img');
    img.id = 'atmosphere-layer';
    img.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      transition: opacity 0.5s ease-in-out;
    `;
    this.container.appendChild(img);
    return img;
  }

  /**
   * Create minimap panel (half screen, left side)
   */
  private createMinimapPanel(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.id = 'minimap';
    canvas.width = 160;
    canvas.height = 120;
    canvas.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      width: 160px;
      height: 120px;
      background: rgba(0, 0, 0, 0.1);
      border: 2px solid #8b7355;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
      z-index: 10;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    `;
    this.container.appendChild(canvas);
    return canvas;
  }

  /**
   * Create character stats panel (SSI style)
   */
  private createStatsPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'stats-panel';
    panel.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 140px;
      min-height: 100px;
      background: rgba(0, 0, 0, 0.1);
      border: 2px solid #8b7355;
      color: #d4af37;
      font-family: 'VGA', 'Fixedsys', 'Courier New', monospace;
      font-size: 10px;
      line-height: 1.2;
      padding: 6px;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
      z-index: 10;
      text-shadow: 1px 1px 0px #000;
    `;
    this.container.appendChild(panel);
    return panel;
  }

  /**
   * Create message log panel (bottom, SSI style)
   */
  private createLogPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'message-log';
    panel.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      height: 60px;
      background: rgba(0, 0, 0, 0.1);
      border: 2px solid #8b7355;
      color: #d4af37;
      font-family: 'VGA', 'Fixedsys', 'Courier New', monospace;
      font-size: 10px;
      line-height: 1.3;
      padding: 4px 6px;
      overflow-y: auto;
      white-space: pre-wrap;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
      z-index: 10;
      text-shadow: 1px 1px 0px #000;
    `;

    // Custom scrollbar styling
    panel.style.scrollbarWidth = 'thin';
    panel.style.scrollbarColor = '#8b7355 rgba(0, 0, 0, 0.3)';

    this.container.appendChild(panel);
    return panel;
  }

  /**
   * Update the atmospheric background image
   */
  async updateAtmosphere(imageDataUrl: string): Promise<void> {
    return new Promise((resolve) => {
      // Fade out current image
      this.atmosphereImage.style.opacity = '0';

      setTimeout(() => {
        this.atmosphereImage.src = imageDataUrl;
        this.currentImageUrl = imageDataUrl;

        this.atmosphereImage.onload = () => {
          // Fade in new image
          this.atmosphereImage.style.opacity = '1';
          resolve();
        };
      }, 500); // Wait for fade out
    });
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
  addMessage(message: string, color: string = '#d4af37'): void {
    const coloredMessage = `<span style="color: ${color}">${message}</span>`;
    this.logMessages.push(coloredMessage);

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
    this.logElement.innerHTML = this.logMessages.join('<br>');
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  /**
   * Update character stats display (SSI Gold Box style)
   */
  updateStats(character: Character): void {
    const { name, race, class: charClass, level } = character;
    const { hitPoints, maxHitPoints, armorClass } = character.combat;
    const { strength, intelligence, wisdom, dexterity, constitution, charisma } = character.abilities;

    // SSI-style compact stats
    const html = `
<span style="color: #fff">${name}</span>
<span style="color: #aaa">${race} ${charClass}</span>

<span style="color: #ff6b6b">HP</span> ${hitPoints}/${maxHitPoints}
<span style="color: #74c0fc">AC</span> ${armorClass}
<span style="color: #ffd43b">LV</span> ${level}

<span style="color: #aaa">STR</span> ${strength} <span style="color: #aaa">INT</span> ${intelligence}
<span style="color: #aaa">WIS</span> ${wisdom} <span style="color: #aaa">DEX</span> ${dexterity}
<span style="color: #aaa">CON</span> ${constitution} <span style="color: #aaa">CHA</span> ${charisma}
    `.trim();

    this.statsElement.innerHTML = html;
  }

  /**
   * Show controls help
   */
  showControls(): void {
    const controls = `
<span style="color: #ffd43b">CONTROLS</span>
Arrows/WASD: Move
Q/E: Rotate
Space: Action
ESC: Menu
    `.trim();

    this.addMessage(controls, '#ffd43b');
  }

  /**
   * Clear the message log
   */
  clearLog(): void {
    this.logMessages = [];
    this.updateLog();
  }

  /**
   * Show a dialog overlay
   */
  showDialog(title: string, content: string, buttons: { text: string; callback: () => void }[]): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #1a1a1a;
      border: 3px solid #8b7355;
      color: #d4af37;
      font-family: 'VGA', 'Fixedsys', 'Courier New', monospace;
      padding: 20px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
    `;

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.cssText = 'margin: 0 0 15px 0; color: #ffd43b; font-size: 16px; text-transform: uppercase;';

    const contentEl = document.createElement('div');
    contentEl.innerHTML = content;
    contentEl.style.cssText = 'margin-bottom: 20px; line-height: 1.4; font-size: 12px;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

    for (const btn of buttons) {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.style.cssText = `
        background: #2a2a2a;
        border: 2px solid #8b7355;
        color: #d4af37;
        padding: 6px 12px;
        font-family: 'VGA', 'Fixedsys', 'Courier New', monospace;
        font-size: 11px;
        cursor: pointer;
        text-transform: uppercase;
      `;
      button.onmouseover = () => {
        button.style.background = '#8b7355';
        button.style.color = '#1a1a1a';
      };
      button.onmouseout = () => {
        button.style.background = '#2a2a2a';
        button.style.color = '#d4af37';
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

  /**
   * Show loading overlay
   */
  showLoading(message: string = 'Loading...'): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
    `;

    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      color: #d4af37;
      font-family: 'VGA', 'Fixedsys', 'Courier New', monospace;
      font-size: 14px;
      text-transform: uppercase;
      text-shadow: 2px 2px 4px #000;
    `;

    overlay.appendChild(messageEl);
    this.container.appendChild(overlay);
    return overlay;
  }

  /**
   * Hide loading overlay
   */
  hideLoading(): void {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

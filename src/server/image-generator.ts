import WebSocket from 'ws';

export interface ImageGenerationConfig {
  baseUrl: string;
  enabled: boolean;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
}

export interface GeneratedImage {
  url: string;
  filename: string;
  promptId: string;
}

/**
 * ComfyUI-based image generator for creating scene images
 */
export class ImageGenerator {
  private config: ImageGenerationConfig;

  constructor(config: ImageGenerationConfig) {
    this.config = {
      model: 'v1-5-pruned-emaonly.safetensors',
      width: 512,
      height: 512,
      steps: 20,
      ...config,
    };
  }

  /**
   * Check if ComfyUI is available and responding
   */
  async isAvailable(): Promise<boolean> {
    if (!this.config.enabled) return false;

    try {
      const response = await fetch(`${this.config.baseUrl}/system_stats`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate an image from a text prompt
   */
  async generate(
    prompt: string,
    negativePrompt: string = 'bad quality, blurry, low resolution'
  ): Promise<GeneratedImage | null> {
    if (!this.config.enabled) {
      return null;
    }

    const workflow = this.createWorkflow(prompt, negativePrompt);
    const clientId = this.generateClientId();

    try {
      const promptId = await this.queuePrompt(workflow, clientId);
      await this.waitForCompletion(promptId, clientId);
      const images = await this.getGeneratedImages(promptId);

      if (images.length > 0) {
        return images[0];
      }

      return null;
    } catch (error) {
      console.error('Image generation failed:', error);
      return null;
    }
  }

  /**
   * Generate a scene image based on game context
   */
  async generateSceneImage(
    sceneDescription: string,
    style: 'fantasy' | 'pixel' | 'retro' = 'fantasy'
  ): Promise<GeneratedImage | null> {
    const stylePrompts: Record<string, string> = {
      fantasy: 'fantasy rpg style, detailed, dramatic lighting',
      pixel: 'pixel art style, 16-bit, retro game aesthetic',
      retro: 'retro crt monitor style, green monochrome, terminal aesthetic',
    };

    const prompt = `${sceneDescription}, ${stylePrompts[style]}`;
    const negativePrompt = 'modern, photo-realistic, blurry, watermark, text';

    return this.generate(prompt, negativePrompt);
  }

  /**
   * Get the URL for viewing a generated image
   */
  getImageUrl(filename: string, subfolder: string = '', type: string = 'output'): string {
    return `${this.config.baseUrl}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}`;
  }

  /**
   * Get base64 encoded image data
   */
  async getImageAsBase64(filename: string, subfolder: string = '', type: string = 'output'): Promise<string | null> {
    try {
      const url = this.getImageUrl(filename, subfolder, type);
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch {
      return null;
    }
  }

  private createWorkflow(prompt: string, negativePrompt: string): object {
    return {
      '3': {
        inputs: {
          seed: Math.floor(Math.random() * 1000000),
          steps: this.config.steps,
          cfg: 7,
          sampler_name: 'euler',
          scheduler: 'normal',
          denoise: 1,
          model: ['4', 0],
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0],
        },
        class_type: 'KSampler',
      },
      '4': {
        inputs: {
          ckpt_name: this.config.model,
        },
        class_type: 'CheckpointLoaderSimple',
      },
      '5': {
        inputs: {
          width: this.config.width,
          height: this.config.height,
          batch_size: 1,
        },
        class_type: 'EmptyLatentImage',
      },
      '6': {
        inputs: {
          text: prompt,
          clip: ['4', 1],
        },
        class_type: 'CLIPTextEncode',
      },
      '7': {
        inputs: {
          text: negativePrompt,
          clip: ['4', 1],
        },
        class_type: 'CLIPTextEncode',
      },
      '8': {
        inputs: {
          samples: ['3', 0],
          vae: ['4', 2],
        },
        class_type: 'VAEDecode',
      },
      '9': {
        inputs: {
          filename_prefix: 'dndan',
          images: ['8', 0],
        },
        class_type: 'SaveImage',
      },
    };
  }

  private generateClientId(): string {
    return `dndan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async queuePrompt(workflow: object, clientId: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: workflow,
        client_id: clientId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to queue prompt: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.prompt_id;
  }

  private async waitForCompletion(promptId: string, clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.baseUrl.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/ws?clientId=${clientId}`);

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Timeout waiting for image generation'));
      }, 120000);

      ws.on('message', (data: WebSocket.Data) => {
        const message = JSON.parse(data.toString());

        if (message.type === 'executing') {
          if (message.data.node === null && message.data.prompt_id === promptId) {
            clearTimeout(timeout);
            ws.close();
            resolve();
          }
        } else if (message.type === 'execution_error') {
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`Execution error: ${JSON.stringify(message.data)}`));
        }
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private async getGeneratedImages(promptId: string): Promise<GeneratedImage[]> {
    const response = await fetch(`${this.config.baseUrl}/history/${promptId}`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    const history = await response.json();
    const outputs = history[promptId]?.outputs;

    if (!outputs) {
      return [];
    }

    const images: GeneratedImage[] = [];
    for (const nodeId in outputs) {
      const nodeOutput = outputs[nodeId];
      if (nodeOutput.images) {
        for (const image of nodeOutput.images) {
          images.push({
            url: this.getImageUrl(image.filename, image.subfolder || '', image.type || 'output'),
            filename: image.filename,
            promptId,
          });
        }
      }
    }

    return images;
  }
}

/**
 * Create an image generator from environment variables
 */
export function createImageGenerator(): ImageGenerator {
  return new ImageGenerator({
    baseUrl: process.env.COMFYUI_BASE_URL || 'http://localhost:8188',
    enabled: process.env.IMAGE_GENERATION_ENABLED === 'true',
    model: process.env.COMFYUI_MODEL || 'v1-5-pruned-emaonly.safetensors',
    width: parseInt(process.env.COMFYUI_WIDTH || '512', 10),
    height: parseInt(process.env.COMFYUI_HEIGHT || '512', 10),
    steps: parseInt(process.env.COMFYUI_STEPS || '20', 10),
  });
}

/**
 * Backend server for AI API endpoints
 */

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { loadEnv } from 'vite';

hydrateEnvFromVite();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image data

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

type LLMProvider = 'anthropic' | 'openrouter' | 'ollama';

interface ServerConfig {
  llmProvider: LLMProvider;
  anthropicApiKey?: string;
  anthropicModel: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  openrouterBaseUrl?: string;
  openrouterSiteUrl?: string;
  openrouterSiteName?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  imageProvider: string;
  openaiApiKey?: string;
  replicateApiKey?: string;
  stabilityApiKey?: string;
}

type MessageRole = 'user' | 'assistant' | 'system';

interface MessageParam {
  role: MessageRole;
  content: string;
}

interface LLMRequestPayload {
  messages: MessageParam[];
  system?: string;
  temperature?: number;
  max_tokens?: number;
}

function hydrateEnvFromVite() {
  const mode = process.env.NODE_ENV || 'development';
  const env = loadEnv(mode, process.cwd(), '');

  Object.entries(env).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });

  console.log(`[Server] Environment hydrated via Vite loadEnv (mode: ${mode})`);
}

function validateConfiguration(): ServerConfig {
  console.log('\n=== D&D AN Server Configuration ===\n');

  const providerEnv =
    (process.env.LLM_PROVIDER || process.env.VITE_LLM_PROVIDER || 'anthropic').toLowerCase();

  const llmProvider: LLMProvider =
    providerEnv === 'openrouter' || providerEnv === 'ollama' ? (providerEnv as LLMProvider) : 'anthropic';

  console.log(`[config] LLM Provider: ${llmProvider}`);

  const config: ServerConfig = {
    llmProvider,
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    imageProvider: process.env.VITE_IMAGE_PROVIDER || 'placeholder',
  };

  switch (llmProvider) {
    case 'anthropic': {
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
      if (!anthropicApiKey) {
        console.error('[config] ERROR: Anthropic API key is REQUIRED but not found!');
        console.error('\nTo fix this:');
        console.error('1. Get an API key from: https://console.anthropic.com/');
        console.error('2. Add to your environment:');
        console.error('   export ANTHROPIC_API_KEY=your_key_here');
        console.error('\nSet LLM_PROVIDER=openrouter or ollama if you are not using Anthropic.\n');
        process.exit(1);
      }

      config.anthropicApiKey = anthropicApiKey;
      console.log('[config] Anthropic API Key: Found');
      console.log(`[config] Anthropic Model: ${config.anthropicModel}`);
      break;
    }

    case 'openrouter': {
      const openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
      if (!openrouterApiKey) {
        console.error('[config] ERROR: OpenRouter API key is REQUIRED but not found!');
        console.error('\nTo fix this:');
        console.error('1. Get an API key from: https://openrouter.ai/');
        console.error('2. Add to your environment:');
        console.error('   export OPENROUTER_API_KEY=your_key_here');
        console.error('\nSet LLM_PROVIDER=anthropic if you are not using OpenRouter.\n');
        process.exit(1);
      }

      config.openrouterApiKey = openrouterApiKey;
      config.openrouterModel = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';
      config.openrouterBaseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
      config.openrouterSiteUrl = process.env.OPENROUTER_SITE_URL;
      config.openrouterSiteName = process.env.OPENROUTER_SITE_NAME;
      console.log('[config] OpenRouter API Key: Found');
      console.log(`[config] OpenRouter Model: ${config.openrouterModel}`);
      break;
    }

    case 'ollama': {
      config.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      config.ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
      console.log(`[config] Ollama Endpoint: ${config.ollamaBaseUrl}`);
      console.log(`[config] Ollama Model: ${config.ollamaModel}`);
      break;
    }
  }

  console.log(`[config] Image Provider: ${config.imageProvider}`);

  if (config.imageProvider !== 'placeholder') {
    switch (config.imageProvider) {
      case 'openai':
        config.openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (config.openaiApiKey) {
          console.log('[config] OpenAI API Key: Found');
        } else {
          console.warn('[config] WARNING: OpenAI provider selected but API key not found!');
          console.warn('   Set OPENAI_API_KEY or VITE_OPENAI_API_KEY');
          console.warn('   Falling back to placeholder mode');
          config.imageProvider = 'placeholder';
        }
        break;

      case 'replicate':
        config.replicateApiKey = process.env.REPLICATE_API_KEY || process.env.VITE_REPLICATE_API_KEY;
        if (config.replicateApiKey) {
          console.log('[config] Replicate API Key: Found');
        } else {
          console.warn('[config] WARNING: Replicate provider selected but API key not found!');
          console.warn('   Set REPLICATE_API_KEY or VITE_REPLICATE_API_KEY');
          console.warn('   Falling back to placeholder mode');
          config.imageProvider = 'placeholder';
        }
        break;

      case 'stability':
        config.stabilityApiKey = process.env.STABILITY_API_KEY || process.env.VITE_STABILITY_API_KEY;
        if (config.stabilityApiKey) {
          console.log('[config] Stability AI API Key: Found');
        } else {
          console.warn('[config] WARNING: Stability provider selected but API key not found!');
          console.warn('   Set STABILITY_API_KEY or VITE_STABILITY_API_KEY');
          console.warn('   Falling back to placeholder mode');
          config.imageProvider = 'placeholder';
        }
        break;

      default:
        console.warn(`[config] WARNING: Unknown image provider '${config.imageProvider}'`);
        console.warn('   Valid options: placeholder, openai, replicate, stability');
        console.warn('   Falling back to placeholder mode');
        config.imageProvider = 'placeholder';
    }
  }

  console.log('\n=== Configuration Complete ===\n');

  return config;
}// Validate configuration on startup
const serverConfig = validateConfiguration();

// Initialize Anthropic client when required
const anthropicClient =
  serverConfig.llmProvider === 'anthropic' && serverConfig.anthropicApiKey
    ? new Anthropic({
        apiKey: serverConfig.anthropicApiKey,
      })
    : null;

function sanitizeMessages(messages: MessageParam[] | undefined): MessageParam[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => {
      if (!message || typeof message.content !== 'string') {
        return null;
      }

      const role: MessageRole = message.role === 'assistant' ? 'assistant' : 'user';

      const content = message.content.trim();
      if (!content) {
        return null;
      }

      return { role, content };
    })
    .filter((message): message is MessageParam => Boolean(message));
}

function prependSystemMessage(system: string | undefined, messages: MessageParam[]): MessageParam[] {
  const sanitized = [...messages];
  if (system) {
    sanitized.unshift({
      role: 'system',
      content: system,
    });
  }
  return sanitized;
}

async function runLLMRequest(payload: LLMRequestPayload): Promise<string> {
  const messages = sanitizeMessages(payload.messages);
  const temperature = typeof payload.temperature === 'number' ? payload.temperature : 0.8;
  const maxTokens = typeof payload.max_tokens === 'number' ? payload.max_tokens : 300;

  switch (serverConfig.llmProvider) {
    case 'anthropic': {
      if (!anthropicClient) {
        throw new Error('Anthropic client not initialized');
      }

      const response = await anthropicClient.messages.create({
        model: serverConfig.anthropicModel,
        max_tokens: maxTokens,
        temperature,
        system: payload.system || '',
        messages,
      });

      const content = response.content?.[0];
      if (content?.type === 'text' && content.text) {
        return content.text;
      }

      return 'The DM considers the situation...';
    }

    case 'openrouter': {
      const apiKey = serverConfig.openrouterApiKey;
      if (!apiKey || !serverConfig.openrouterModel) {
        throw new Error('OpenRouter is not configured');
      }

      const baseUrl = (serverConfig.openrouterBaseUrl || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(serverConfig.openrouterSiteUrl ? { 'HTTP-Referer': serverConfig.openrouterSiteUrl } : {}),
          ...(serverConfig.openrouterSiteName ? { 'X-Title': serverConfig.openrouterSiteName } : {}),
        },
        body: JSON.stringify({
          model: serverConfig.openrouterModel,
          messages: prependSystemMessage(payload.system, messages),
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`OpenRouter error: ${response.status} ${details}`);
      }

      const data = await response.json();
      const text =
        data?.choices?.[0]?.message?.content?.trim() ||
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.content?.[0]?.text?.trim();

      if (text) {
        return text;
      }

      throw new Error('OpenRouter response missing content');
    }

    case 'ollama': {
      const baseUrl = (serverConfig.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: serverConfig.ollamaModel || 'llama3',
          messages: prependSystemMessage(payload.system, messages),
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Ollama error: ${response.status} ${details}`);
      }

      const data = await response.json();
      const text = data?.message?.content?.trim() || data?.response?.trim();
      if (text) {
        return text;
      }

      throw new Error('Ollama response missing content');
    }

    default:
      throw new Error(`Unsupported LLM provider: ${serverConfig.llmProvider}`);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// LLM proxy endpoint (DM + NPC)
app.post('/api/claude', async (req, res) => {
  try {
    const { messages = [], system = '', temperature, max_tokens } = req.body || {};

    console.log('[Server] LLM request:', {
      provider: serverConfig.llmProvider,
      messageCount: Array.isArray(messages) ? messages.length : 0,
    });

    const narrative = await runLLMRequest({
      messages,
      system,
      temperature,
      max_tokens,
    });

    res.json({ narrative });
  } catch (error) {
    console.error('[Server] LLM error:', error);
    res.status(500).json({ error: 'AI DM request failed', narrative: 'The ancient magic falters...' });
  }
});

// Image generation proxy endpoint - supports multiple providers
app.post('/api/generate', async (req, res) => {
  try {
    const { provider, prompt, negativePrompt, width, height, steps, cfgScale } = req.body;

    console.log('[Server] Image generation request:', { provider, prompt, width, height });

    // Route to appropriate provider
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(req, res, prompt, width, height);

      case 'replicate':
        return await generateWithReplicate(req, res, prompt, negativePrompt, width, height);

      case 'stability':
        return await generateWithStability(req, res, prompt, negativePrompt, width, height, steps, cfgScale);

      case 'placeholder':
      default:
        // Placeholder base64 image (1x1 black pixel)
        const placeholderImage =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        res.json({
          image: placeholderImage,
          prompt,
          provider: 'placeholder',
          generated: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('[Server] Generation error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

/**
 * Generate image using OpenAI DALL-E
 */
async function generateWithOpenAI(req: any, res: any, prompt: string, width: number, height: number) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('[Server] OpenAI API key not configured');
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  try {
    // DALL-E 3 doesn't support custom sizes below 1024x1024, so we'll use 1024x1024 and mention pixel art style
    const enhancedPrompt = `${prompt}. Style: retro pixel art, 160x100 resolution scaled up, crisp pixels, no anti-aliasing`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Server] OpenAI error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const imageData = data.data[0].b64_json;

    res.json({
      image: `data:image/png;base64,${imageData}`,
      prompt: enhancedPrompt,
      provider: 'openai',
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Server] OpenAI generation error:', error);
    res.status(500).json({ error: 'OpenAI generation failed' });
  }
}

/**
 * Generate image using Replicate (pixel art models)
 */
async function generateWithReplicate(req: any, res: any, prompt: string, negativePrompt: string, width: number, height: number) {
  const apiKey = process.env.REPLICATE_API_KEY || process.env.VITE_REPLICATE_API_KEY;

  if (!apiKey) {
    console.warn('[Server] Replicate API key not configured');
    return res.status(400).json({ error: 'Replicate API key not configured' });
  }

  try {
    // Use a pixel art model on Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: `${prompt}, pixel art, retro gaming, 16-bit style`,
          negative_prompt: negativePrompt || 'blurry, realistic, 3d, modern',
          width: 1024, // SDXL min size
          height: 1024,
          num_inference_steps: 25,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        }
      );

      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error('Replicate generation failed');
    }

    // Convert image URL to base64
    const imageUrl = result.output[0];
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    res.json({
      image: `data:image/png;base64,${base64Image}`,
      prompt,
      provider: 'replicate',
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Server] Replicate generation error:', error);
    res.status(500).json({ error: 'Replicate generation failed' });
  }
}

/**
 * Generate image using Stability AI
 */
async function generateWithStability(req: any, res: any, prompt: string, negativePrompt: string, width: number, height: number, steps: number, cfgScale: number) {
  const apiKey = process.env.STABILITY_API_KEY || process.env.VITE_STABILITY_API_KEY;

  if (!apiKey) {
    console.warn('[Server] Stability AI API key not configured');
    return res.status(400).json({ error: 'Stability AI API key not configured' });
  }

  try {
    // Stability AI requires dimensions to be multiples of 64, so we'll use 512x512 and mention pixel art
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          { text: `${prompt}, pixel art, retro gaming aesthetic`, weight: 1 },
          { text: negativePrompt || 'blurry, realistic, 3d, modern', weight: -1 },
        ],
        cfg_scale: cfgScale || 7.5,
        height: 1024,
        width: 1024,
        steps: steps || 30,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Server] Stability AI error:', errorData);
      throw new Error(`Stability AI error: ${response.statusText}`);
    }

    const data = await response.json();
    const imageData = data.artifacts[0].base64;

    res.json({
      image: `data:image/png;base64,${imageData}`,
      prompt,
      provider: 'stability',
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Server] Stability AI generation error:', error);
    res.status(500).json({ error: 'Stability AI generation failed' });
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`[Server] D&D AN backend running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});

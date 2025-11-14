/**
 * Backend server for AI API endpoints
 */

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image data

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '',
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Claude AI proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, system, temperature, max_tokens } = req.body;

    console.log('[Server] Claude request:', { messageCount: messages?.length });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: max_tokens || 300,
      temperature: temperature || 0.8,
      system: system || '',
      messages: messages || [],
    });

    const content = response.content[0];
    const narrative = content.type === 'text' ? content.text : 'The DM considers the situation...';

    res.json({ narrative });
  } catch (error) {
    console.error('[Server] Claude error:', error);
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

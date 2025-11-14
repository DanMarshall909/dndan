/**
 * Backend server for AI API endpoints
 */

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

// Stable Diffusion proxy endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, negativePrompt, width, height, steps, cfgScale } = req.body;

    // In production, forward to actual SD API
    // For now, return a placeholder response
    console.log('[Server] SD Generation request:', { prompt, width, height });

    // Placeholder base64 image (1x1 black pixel)
    const placeholderImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    res.json({
      image: placeholderImage,
      prompt,
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Server] Generation error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] D&D AN backend running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});

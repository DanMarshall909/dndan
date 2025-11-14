/**
 * Backend server for AI API endpoints
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

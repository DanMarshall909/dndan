import WebSocket from 'ws';

const COMFYUI_BASE_URL = process.env.COMFYUI_BASE_URL || 'http://localhost:8188';

// Basic txt2img workflow for ComfyUI
const createWorkflow = (prompt: string, negativePrompt: string = '') => ({
  '3': {
    inputs: {
      seed: Math.floor(Math.random() * 1000000),
      steps: 20,
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
      ckpt_name: 'v1-5-pruned-emaonly.safetensors',
    },
    class_type: 'CheckpointLoaderSimple',
  },
  '5': {
    inputs: {
      width: 512,
      height: 512,
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
      text: negativePrompt || 'bad quality, blurry',
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
      filename_prefix: 'ComfyUI',
      images: ['8', 0],
    },
    class_type: 'SaveImage',
  },
});

async function getClientId(): Promise<string> {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function queuePrompt(workflow: object, clientId: string): Promise<string> {
  const response = await fetch(`${COMFYUI_BASE_URL}/prompt`, {
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

async function waitForCompletion(promptId: string, clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const wsUrl = COMFYUI_BASE_URL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws?clientId=${clientId}`);

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout waiting for image generation'));
    }, 120000); // 2 minute timeout

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

async function getGeneratedImages(promptId: string): Promise<string[]> {
  const response = await fetch(`${COMFYUI_BASE_URL}/history/${promptId}`);

  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.status}`);
  }

  const history = await response.json();
  const outputs = history[promptId]?.outputs;

  if (!outputs) {
    return [];
  }

  const images: string[] = [];
  for (const nodeId in outputs) {
    const nodeOutput = outputs[nodeId];
    if (nodeOutput.images) {
      for (const image of nodeOutput.images) {
        images.push(`${COMFYUI_BASE_URL}/view?filename=${image.filename}&subfolder=${image.subfolder || ''}&type=${image.type || 'output'}`);
      }
    }
  }

  return images;
}

async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${COMFYUI_BASE_URL}/system_stats`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Testing ComfyUI connection...\n');
  console.log(`ComfyUI URL: ${COMFYUI_BASE_URL}\n`);

  // Check connection
  const isConnected = await checkConnection();
  if (!isConnected) {
    console.error('✗ Cannot connect to ComfyUI');
    console.error('\nMake sure ComfyUI is running:');
    console.error('  docker-compose up comfyui');
    process.exit(1);
  }
  console.log('✓ ComfyUI connection successful\n');

  // Check for models
  try {
    const response = await fetch(`${COMFYUI_BASE_URL}/object_info/CheckpointLoaderSimple`);
    const data = await response.json();
    const checkpoints = data.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [];

    if (checkpoints.length === 0) {
      console.log('⚠ No models found. You need to download a Stable Diffusion model.');
      console.log('\nTo add a model:');
      console.log('1. Download v1-5-pruned-emaonly.safetensors from HuggingFace');
      console.log('2. Place it in the comfyui_models volume under checkpoints/');
      console.log('\nOr use docker exec to download:');
      console.log('  docker exec dndan-comfyui wget -P /opt/ComfyUI/models/checkpoints/ \\');
      console.log('    https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors');
      process.exit(0);
    }

    console.log(`✓ Found ${checkpoints.length} model(s): ${checkpoints.join(', ')}\n`);
  } catch (error) {
    console.error('Failed to check models:', error);
  }

  // Generate test image
  console.log('Generating test image...\n');

  const prompt = 'a dark dungeon corridor with torches, fantasy rpg style, pixel art';
  const workflow = createWorkflow(prompt);

  try {
    const clientId = await getClientId();
    const promptId = await queuePrompt(workflow, clientId);
    console.log(`Prompt queued: ${promptId}`);

    console.log('Waiting for generation...');
    await waitForCompletion(promptId, clientId);

    const images = await getGeneratedImages(promptId);

    if (images.length > 0) {
      console.log('\n✓ Image generation successful!\n');
      console.log('Generated images:');
      images.forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
    } else {
      console.log('\n⚠ No images generated');
    }
  } catch (error) {
    console.error('\n✗ Image generation failed:', error);
    process.exit(1);
  }
}

main();

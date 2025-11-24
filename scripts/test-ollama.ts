import { createOllamaProvider } from '../src/ai/providers/ollama-provider';

async function main() {
  console.log('Testing Ollama connection via LangChain...\n');

  const provider = createOllamaProvider({
    model: process.env.OLLAMA_MODEL || 'llama3',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });

  try {
    const result = await provider.generateText({
      system: 'You are a helpful assistant. Keep responses brief.',
      messages: [{ role: 'user', content: 'Say hello in one sentence.' }],
      temperature: 0.7,
      maxTokens: 100,
    });

    console.log('✓ Ollama connection successful!\n');
    console.log('Response:', result.content);
    if (result.model) {
      console.log('Model:', result.model);
    }
    if (result.usage) {
      console.log('Tokens:', result.usage);
    }
  } catch (error) {
    console.error('✗ Ollama connection failed:\n');
    console.error(error instanceof Error ? error.message : error);
    console.error('\nMake sure Ollama is running: ollama serve');
    process.exit(1);
  }
}

main();

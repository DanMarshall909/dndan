import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

async function main() {
  console.log('Testing Ollama connection via LangChain...\n');

  const model = new ChatOllama({
    model: process.env.OLLAMA_MODEL || 'llama3',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });

  try {
    const result = await model.invoke([
      new SystemMessage('You are a helpful assistant. Keep responses brief.'),
      new HumanMessage('Say hello in one sentence.'),
    ], {
      temperature: 0.7,
      maxTokens: 100,
    });

    console.log('✓ Ollama connection successful!\n');
    console.log('Response:', result.content);
    if (result.usage_metadata) {
      console.log('Tokens:', {
        inputTokens: result.usage_metadata.input_tokens,
        outputTokens: result.usage_metadata.output_tokens,
      });
    }
  } catch (error) {
    console.error('✗ Ollama connection failed:\n');
    console.error(error instanceof Error ? error.message : error);
    console.error('\nMake sure Ollama is running: ollama serve');
    process.exit(1);
  }
}

main();

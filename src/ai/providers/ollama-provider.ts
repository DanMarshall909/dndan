import { ChatOllama } from '@langchain/ollama';
import { LangChainProvider } from './langchain-provider';
import { ITextProvider } from './types';

/**
 * Configuration for creating an Ollama provider.
 */
export interface OllamaProviderConfig {
  /** Base URL for Ollama API (default: http://localhost:11434) */
  baseUrl?: string;
  /** Model name to use (default: llama3) */
  model?: string;
  /** Default temperature for generation */
  temperature?: number;
}

/**
 * Creates an Ollama provider using LangChain's ChatOllama.
 *
 * @param config - Configuration options
 * @returns An ITextProvider that uses Ollama
 *
 * @example
 * ```typescript
 * const provider = createOllamaProvider({
 *   model: 'llama3',
 *   baseUrl: 'http://localhost:11434',
 * });
 *
 * const result = await provider.generateText({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */
export function createOllamaProvider(config: OllamaProviderConfig = {}): ITextProvider {
  const model = new ChatOllama({
    baseUrl: config.baseUrl ?? 'http://localhost:11434',
    model: config.model ?? 'llama3',
    temperature: config.temperature,
  });

  return new LangChainProvider(model);
}

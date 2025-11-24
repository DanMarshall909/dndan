import { ChatOllama } from '@langchain/ollama';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { LangChainProvider } from './langchain-provider';
import { ITextProvider } from './types';

/**
 * LLM provider type.
 */
export type LLMProvider = 'anthropic' | 'openrouter' | 'ollama';

/**
 * Configuration for creating a text provider from server settings.
 */
export interface ProviderConfig {
  /** Which provider to use */
  llmProvider: LLMProvider;
  /** Ollama base URL */
  ollamaBaseUrl?: string;
  /** Ollama model name */
  ollamaModel?: string;
  /** Anthropic API key */
  anthropicApiKey?: string;
  /** Anthropic model name */
  anthropicModel?: string;
  /** OpenRouter API key */
  openrouterApiKey?: string;
  /** OpenRouter model name */
  openrouterModel?: string;
  /** OpenRouter base URL */
  openrouterBaseUrl?: string;
}

/**
 * Creates a text provider from server configuration.
 *
 * @param config - Server configuration
 * @returns An ITextProvider instance for the configured provider
 * @throws Error if required configuration is missing
 *
 * @example
 * ```typescript
 * const provider = createProviderFromConfig({
 *   llmProvider: 'ollama',
 *   ollamaBaseUrl: 'http://localhost:11434',
 *   ollamaModel: 'llama3',
 * });
 * ```
 */
export function createProviderFromConfig(config: ProviderConfig): ITextProvider {
  switch (config.llmProvider) {
    case 'ollama': {
      const model = new ChatOllama({
        baseUrl: config.ollamaBaseUrl ?? 'http://localhost:11434',
        model: config.ollamaModel ?? 'llama3',
      });
      return new LangChainProvider(model);
    }

    case 'anthropic': {
      if (!config.anthropicApiKey) {
        throw new Error('Anthropic API key is required');
      }
      const model = new ChatAnthropic({
        apiKey: config.anthropicApiKey,
        modelName: config.anthropicModel ?? 'claude-sonnet-4-5-20250929',
      });
      return new LangChainProvider(model);
    }

    case 'openrouter': {
      if (!config.openrouterApiKey) {
        throw new Error('OpenRouter API key is required');
      }
      const model = new ChatOpenAI({
        apiKey: config.openrouterApiKey,
        modelName: config.openrouterModel ?? 'mistralai/mistral-7b-instruct:free',
        configuration: {
          baseURL: config.openrouterBaseUrl ?? 'https://openrouter.ai/api/v1',
        },
      });
      return new LangChainProvider(model);
    }

    default: {
      const exhaustiveCheck: never = config.llmProvider;
      throw new Error(`Unsupported LLM provider: ${exhaustiveCheck}`);
    }
  }
}

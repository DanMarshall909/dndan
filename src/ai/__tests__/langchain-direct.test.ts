import { describe, it, expect, vi } from 'vitest';
import { ChatOllama } from '@langchain/ollama';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

// Mock LangChain modules
vi.mock('@langchain/ollama', () => {
  return {
    ChatOllama: class MockChatOllama {
      _config: Record<string, unknown>;
      constructor(config: Record<string, unknown>) {
        this._config = config;
      }
      invoke = vi.fn().mockResolvedValue({
        content: 'mocked ollama response',
        usage_metadata: { input_tokens: 10, output_tokens: 20 },
      });
    },
  };
});

vi.mock('@langchain/anthropic', () => {
  return {
    ChatAnthropic: class MockChatAnthropic {
      _config: Record<string, unknown>;
      constructor(config: Record<string, unknown>) {
        this._config = config;
      }
      invoke = vi.fn().mockResolvedValue({
        content: 'mocked anthropic response',
        usage_metadata: { input_tokens: 15, output_tokens: 25 },
      });
    },
  };
});

vi.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: class MockChatOpenAI {
      _config: Record<string, unknown>;
      constructor(config: Record<string, unknown>) {
        this._config = config;
      }
      invoke = vi.fn().mockResolvedValue({
        content: 'mocked openai response',
        usage_metadata: { input_tokens: 12, output_tokens: 22 },
      });
    },
  };
});

describe('LangChain direct usage', () => {
  describe('ChatOllama', () => {
    it('invokes with messages and returns response', async () => {
      const model = new ChatOllama({
        baseUrl: 'http://localhost:11434',
        model: 'llama3',
      });

      const result = await model.invoke([
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked ollama response');
      expect(result.usage_metadata).toEqual({
        input_tokens: 10,
        output_tokens: 20,
      });
    });

    it('accepts system message before human message', async () => {
      const model = new ChatOllama({ model: 'llama3' });

      const result = await model.invoke([
        new SystemMessage('You are helpful'),
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked ollama response');
      expect(model.invoke).toHaveBeenCalledWith([
        expect.any(SystemMessage),
        expect.any(HumanMessage),
      ]);
    });

    it('handles multi-turn conversation', async () => {
      const model = new ChatOllama({ model: 'llama3' });

      const result = await model.invoke([
        new HumanMessage('First'),
        new AIMessage('Response'),
        new HumanMessage('Second'),
      ]);

      expect(result.content).toBe('mocked ollama response');
    });
  });

  describe('ChatAnthropic', () => {
    it('invokes with API key and model', async () => {
      const model = new ChatAnthropic({
        apiKey: 'test-key',
        modelName: 'claude-sonnet-4-5-20250929',
      });

      const result = await model.invoke([
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked anthropic response');
    });
  });

  describe('ChatOpenAI (for OpenRouter)', () => {
    it('invokes with custom baseURL for OpenRouter', async () => {
      const model = new ChatOpenAI({
        apiKey: 'test-key',
        modelName: 'mistralai/mistral-7b-instruct:free',
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
        },
      });

      const result = await model.invoke([
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked openai response');
    });
  });

  describe('factory pattern without wrapper', () => {
    type LLMProvider = 'ollama' | 'anthropic' | 'openrouter';

    interface ProviderConfig {
      llmProvider: LLMProvider;
      ollamaBaseUrl?: string;
      ollamaModel?: string;
      anthropicApiKey?: string;
      anthropicModel?: string;
      openrouterApiKey?: string;
      openrouterModel?: string;
      openrouterBaseUrl?: string;
    }

    function createModel(config: ProviderConfig): BaseChatModel {
      switch (config.llmProvider) {
        case 'ollama':
          return new ChatOllama({
            baseUrl: config.ollamaBaseUrl ?? 'http://localhost:11434',
            model: config.ollamaModel ?? 'llama3',
          }) as unknown as BaseChatModel;

        case 'anthropic':
          if (!config.anthropicApiKey) {
            throw new Error('Anthropic API key is required');
          }
          return new ChatAnthropic({
            apiKey: config.anthropicApiKey,
            modelName: config.anthropicModel ?? 'claude-sonnet-4-5-20250929',
          }) as unknown as BaseChatModel;

        case 'openrouter':
          if (!config.openrouterApiKey) {
            throw new Error('OpenRouter API key is required');
          }
          return new ChatOpenAI({
            apiKey: config.openrouterApiKey,
            modelName: config.openrouterModel ?? 'mistralai/mistral-7b-instruct:free',
            configuration: {
              baseURL: config.openrouterBaseUrl ?? 'https://openrouter.ai/api/v1',
            },
          }) as unknown as BaseChatModel;

        default: {
          const exhaustiveCheck: never = config.llmProvider;
          throw new Error(`Unsupported provider: ${exhaustiveCheck}`);
        }
      }
    }

    it('creates Ollama model from config', async () => {
      const model = createModel({
        llmProvider: 'ollama',
        ollamaModel: 'llama3',
      });

      const result = await model.invoke([
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked ollama response');
    });

    it('creates Anthropic model from config', async () => {
      const model = createModel({
        llmProvider: 'anthropic',
        anthropicApiKey: 'test-key',
      });

      const result = await model.invoke([
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked anthropic response');
    });

    it('creates OpenRouter model from config', async () => {
      const model = createModel({
        llmProvider: 'openrouter',
        openrouterApiKey: 'test-key',
      });

      const result = await model.invoke([
        new HumanMessage('Hello'),
      ]);

      expect(result.content).toBe('mocked openai response');
    });

    it('throws when Anthropic API key missing', () => {
      expect(() => createModel({
        llmProvider: 'anthropic',
      })).toThrow('Anthropic API key is required');
    });

    it('throws when OpenRouter API key missing', () => {
      expect(() => createModel({
        llmProvider: 'openrouter',
      })).toThrow('OpenRouter API key is required');
    });
  });
});

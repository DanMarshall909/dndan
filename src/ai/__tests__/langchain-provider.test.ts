import { describe, it, expect, vi } from 'vitest';
import { LangChainProvider } from '../providers/langchain-provider';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

describe('LangChainProvider', () => {
  const createMockModel = (response: { content: string; usage_metadata?: { input_tokens: number; output_tokens: number } }) => ({
    invoke: vi.fn().mockResolvedValue(response),
    getName: vi.fn().mockReturnValue('test-model'),
  });

  describe('message conversion', () => {
    it('converts user messages to HumanMessage', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      await provider.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const messages = mockModel.invoke.mock.calls[0][0];
      expect(messages[0]).toBeInstanceOf(HumanMessage);
      expect(messages[0].content).toBe('Hello');
    });

    it('converts assistant messages to AIMessage', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      await provider.generateText({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ],
      });

      const messages = mockModel.invoke.mock.calls[0][0];
      expect(messages[1]).toBeInstanceOf(AIMessage);
      expect(messages[1].content).toBe('Hi there');
    });

    it('prepends system message when provided', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      await provider.generateText({
        system: 'You are helpful',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const messages = mockModel.invoke.mock.calls[0][0];
      expect(messages[0]).toBeInstanceOf(SystemMessage);
      expect(messages[0].content).toBe('You are helpful');
      expect(messages[1]).toBeInstanceOf(HumanMessage);
    });

    it('handles multi-turn conversation', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      await provider.generateText({
        messages: [
          { role: 'user', content: 'First' },
          { role: 'assistant', content: 'Second' },
          { role: 'user', content: 'Third' },
        ],
      });

      const messages = mockModel.invoke.mock.calls[0][0];
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Second');
      expect(messages[2].content).toBe('Third');
    });
  });

  describe('request parameters', () => {
    it('passes temperature to model', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      await provider.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.5,
      });

      const options = mockModel.invoke.mock.calls[0][1];
      expect(options.temperature).toBe(0.5);
    });

    it('passes maxTokens to model', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      await provider.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 500,
      });

      const options = mockModel.invoke.mock.calls[0][1];
      expect(options.maxTokens).toBe(500);
    });
  });

  describe('response parsing', () => {
    it('returns content from model response', async () => {
      const mockModel = createMockModel({ content: 'Hello world' });
      const provider = new LangChainProvider(mockModel as any);

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.content).toBe('Hello world');
    });

    it('returns model name in response', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.model).toBe('test-model');
    });

    it('returns token usage when available', async () => {
      const mockModel = createMockModel({
        content: 'Response',
        usage_metadata: { input_tokens: 10, output_tokens: 20 },
      });
      const provider = new LangChainProvider(mockModel as any);

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.usage).toEqual({
        inputTokens: 10,
        outputTokens: 20,
      });
    });

    it('omits usage when not available', async () => {
      const mockModel = createMockModel({ content: 'Response' });
      const provider = new LangChainProvider(mockModel as any);

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.usage).toBeUndefined();
    });

    it('stringifies non-string content', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({ content: ['part1', 'part2'] }),
        getName: vi.fn().mockReturnValue('test-model'),
      };
      const provider = new LangChainProvider(mockModel as any);

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.content).toBe('["part1","part2"]');
    });

    it('handles model without getName', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const provider = new LangChainProvider(mockModel as any);

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(result.model).toBe('unknown');
    });
  });
});

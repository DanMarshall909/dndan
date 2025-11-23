import { describe, it, expect } from 'vitest';
import { TestTextProvider, NO_RESPONSES_ERROR } from '../providers/test-text-provider';

describe('TestTextProvider', () => {
  describe('canned responses', () => {
    it('returns configured canned response', async () => {
      const provider = new TestTextProvider({
        responses: [{ content: 'Hello, adventurer!' }],
      });

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.content).toBe('Hello, adventurer!');
    });

    it('returns different responses for sequential calls', async () => {
      const provider = new TestTextProvider({
        responses: [
          { content: 'First response' },
          { content: 'Second response' },
        ],
      });

      const first = await provider.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
      });
      const second = await provider.generateText({
        messages: [{ role: 'user', content: 'Hello again' }],
      });

      expect(first.content).toBe('First response');
      expect(second.content).toBe('Second response');
    });

    it('cycles through responses when exhausted', async () => {
      const provider = new TestTextProvider({
        responses: [
          { content: 'Only response' },
        ],
      });

      const first = await provider.generateText({
        messages: [{ role: 'user', content: 'Call 1' }],
      });
      const second = await provider.generateText({
        messages: [{ role: 'user', content: 'Call 2' }],
      });

      expect(first.content).toBe('Only response');
      expect(second.content).toBe('Only response');
    });

    it('throws error when no responses configured', async () => {
      const provider = new TestTextProvider();

      await expect(
        provider.generateText({
          messages: [{ role: 'user', content: 'Hello' }],
        })
      ).rejects.toThrow(NO_RESPONSES_ERROR);

      expect(NO_RESPONSES_ERROR.length).toBeGreaterThan(0);
    });

    it.todo('supports response based on input pattern');
    it.todo('handles multiline response content');
    it.todo('can be used as drop-in replacement for real provider');
  });

  describe('request capture', () => {
    it.todo('captures all requests for assertions');
    it.todo('records request timestamp');
    it.todo('records full request parameters');
    it.todo('allows clearing captured requests');
  });

  describe('delay simulation', () => {
    it.todo('simulates configurable delay');
    it.todo('delay affects response time');
    it.todo('supports variable delays per response');
  });

  describe('error simulation', () => {
    it.todo('simulates errors when configured');
    it.todo('simulates specific error types');
    it.todo('simulates rate limiting');
    it.todo('simulates timeout errors');
  });

  describe('token usage simulation', () => {
    it.todo('returns configurable token counts');
    it.todo('calculates tokens from response length');
  });

  describe('assertion helpers', () => {
    it.todo('provides helper to assert request was made');
    it.todo('provides helper to assert request count');
    it.todo('provides helper to assert request content');
  });
});

describe('TestImageProvider', () => {
  describe('canned responses', () => {
    it.todo('returns configured image URL');
    it.todo('returns configured base64 data');
    it.todo('returns placeholder image by default');
  });

  describe('request capture', () => {
    it.todo('captures all image generation requests');
    it.todo('records prompt and dimensions');
  });

  describe('error simulation', () => {
    it.todo('simulates image generation errors');
    it.todo('simulates content policy violations');
  });
});

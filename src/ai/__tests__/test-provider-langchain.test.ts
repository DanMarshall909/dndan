import { describe, it, expect } from 'vitest';
import { createTestProvider, createSingleResponseProvider } from '../providers/test-provider';

describe('createTestProvider', () => {
  describe('canned responses', () => {
    it('returns configured canned response', async () => {
      const provider = createTestProvider({
        responses: ['Hello, adventurer!'],
      });

      const result = await provider.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.content).toBe('Hello, adventurer!');
    });

    it('returns different responses for sequential calls', async () => {
      const provider = createTestProvider({
        responses: ['First response', 'Second response'],
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
      const provider = createTestProvider({
        responses: ['Only response'],
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
  });
});

describe('createSingleResponseProvider', () => {
  it('always returns the same response', async () => {
    const provider = createSingleResponseProvider('Always this');

    const first = await provider.generateText({
      messages: [{ role: 'user', content: 'First' }],
    });
    const second = await provider.generateText({
      messages: [{ role: 'user', content: 'Second' }],
    });

    expect(first.content).toBe('Always this');
    expect(second.content).toBe('Always this');
  });
});

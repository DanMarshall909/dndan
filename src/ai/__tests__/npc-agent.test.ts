import { describe, it, expect, vi } from 'vitest';
import { NPCAgent } from '../npc-agent';
import { createSingleResponseProvider } from '../providers/test-provider';
import { generatePersona } from '../npc-personas';
import type { ITextProvider } from '../providers/types';

describe('NPCAgent', () => {
  describe('initialization', () => {
    it('creates agent with id, name, and persona', () => {
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      expect(agent.getId()).toBe('npc-1');
      expect(agent.getName()).toBe('Garrick');
      expect(agent.getPersona()).toEqual(persona);
    });
    it('Accepts_text_provider_and_uses_it_for_dialogue', async () => {
      const expectedResponse = 'Test response from provider';
      const provider = createSingleResponseProvider(expectedResponse);
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);
      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe(expectedResponse);
    });
    it('Sends_user_message_to_provider_when_processing_dialogue', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Mock response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello there!', 'greeting');

      expect(mockProvider.generateText).toHaveBeenCalledOnce();
      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.messages).toBeDefined();
      expect(call.messages.length).toBeGreaterThan(0);
      expect(call.messages.some(m => m.content.includes('Hello there!'))).toBe(true);
    });
    it('Trims_whitespace_from_provider_response', async () => {
      const responseWithWhitespace = '  Test response with spaces  \n';
      const provider = createSingleResponseProvider(responseWithWhitespace);
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe('Test response with spaces');
      expect(response).not.toContain('\n');
      expect(response[0]).not.toBe(' ');
      expect(response[response.length - 1]).not.toBe(' ');
    });
    it('Uses_default_temperature_0_9_when_processing_dialogue', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.temperature).toBe(0.9);
    });
    it('Uses_default_maxTokens_200_when_processing_dialogue', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.maxTokens).toBe(200);
    });
    it('Returns_ellipsis_fallback_when_provider_returns_empty_string', async () => {
      const provider = createSingleResponseProvider('');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe('...');
    });
    it('Initializes_empty_conversation_history', () => {
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const state = agent.saveState() as any;
      expect(state.memory.interactions).toEqual([]);
    });
    it('Initializes_empty_facts_array', () => {
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const state = agent.saveState() as any;
      expect(state.memory.facts).toEqual([]);
    });
    it.todo('Initializes_empty_relationships_map');
    it.todo('Initializes_with_current_timestamp_in_memory');
    it.todo('saveState_includes_all_memory_components');
    it.todo('saveState_returns_serializable_object');
    it.todo('builds system prompt from persona');
  });

  describe('generates contextual NPC response', () => {
    it.todo('responds to player message');
    it.todo('response reflects NPC personality');
    it.todo('response is contextually appropriate');
    it.todo('response respects persona traits');
  });

  describe('maintains conversation history', () => {
    it.todo('stores player messages in history');
    it.todo('stores NPC responses in history');
    it.todo('limits history to configured size');
    it.todo('provides history to provider for context');
  });

  describe('state persistence', () => {
    describe('saveState', () => {
      it.todo('serializes conversation history');
      it.todo('serializes NPC metadata');
      it.todo('returns JSON-serializable object');
    });

    describe('loadState', () => {
      it.todo('restores conversation history');
      it.todo('restores NPC metadata');
      it.todo('resumes conversation from saved state');
    });
  });

  describe('respects persona in responses', () => {
    it.todo('uses persona name in context');
    it.todo('applies persona personality traits');
    it.todo('uses persona background knowledge');
    it.todo('maintains persona speech patterns');
  });

  describe('handles edge cases', () => {
    it.todo('handles empty player message');
    it.todo('handles very long player message');
    it.todo('handles special characters in message');
    it.todo('recovers from provider errors');
    it.todo('retries before returning fallback on empty response');
    it.todo('dialogue includes system prompt with persona information');
    it.todo('multiple sequential dialogues accumulate in history');
  });

  describe('performance', () => {
    it.todo('respects max_tokens limit');
    it.todo('truncates history when too long');
  });
});

describe('NPCAgent personas', () => {
  describe('persona configuration', () => {
    it.todo('loads persona from predefined templates');
    it.todo('supports custom persona definition');
    it.todo('validates required persona fields');
  });

  describe('persona behavior', () => {
    it.todo('merchant persona offers to trade');
    it.todo('guard persona is suspicious');
    it.todo('innkeeper persona is welcoming');
    it.todo('mysterious stranger is cryptic');
  });
});

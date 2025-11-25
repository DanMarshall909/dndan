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
    it('Initializes_empty_relationships_map', () => {
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const state = agent.saveState() as any;
      expect(state.memory.relationships).toEqual([]);
    });
    it('Initializes_with_current_timestamp_in_memory', () => {
      const before = Date.now();
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const after = Date.now();
      const state = agent.saveState() as any;
      expect(state.memory.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(state.memory.lastUpdated).toBeLessThanOrEqual(after);
    });
    it('saveState_includes_all_memory_components', () => {
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const state = agent.saveState() as any;
      expect(state.memory).toBeDefined();
      expect(state.memory.interactions).toBeDefined();
      expect(state.memory.facts).toBeDefined();
      expect(state.memory.relationships).toBeDefined();
      expect(state.memory.lastUpdated).toBeDefined();
    });
    it('saveState_returns_serializable_object', () => {
      const provider = createSingleResponseProvider('Test response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const state = agent.saveState();
      expect(() => JSON.stringify(state)).not.toThrow();
      const serialized = JSON.stringify(state);
      expect(() => JSON.parse(serialized)).not.toThrow();
    });
    it('Builds_system_prompt_from_persona', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.system).toBeDefined();
      expect(call.system!.length).toBeGreaterThan(0);
    });
  });

  describe('generates contextual NPC response', () => {
    it('Responds_to_player_message', async () => {
      const provider = createSingleResponseProvider('Greetings, traveler!');
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);
      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe('Greetings, traveler!');
    });
    it('Response_reflects_NPC_personality_through_provider', async () => {
      const merchantResponse = 'Looking to buy or sell?';
      const provider = createSingleResponseProvider(merchantResponse);
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);
      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe(merchantResponse);
    });
    it('Response_is_contextually_appropriate_when_context_provided', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Contextual response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'What do you sell?', 'in marketplace');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.messages.some(m => m.content.includes('in marketplace'))).toBe(true);
    });
    it('Response_respects_persona_traits_through_system_prompt', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Guard', 'Lawful Neutral');
      const agent = new NPCAgent('npc-1', 'Marcus', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.system).toBeDefined();
      expect(call.system!.length).toBeGreaterThan(0);
    });
  });

  describe('maintains conversation history', () => {
    it('Stores_player_messages_in_history', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      await agent.processDialogue('Player', 'Hello there', 'greeting');

      const state = agent.saveState() as any;
      expect(state.memory.interactions.length).toBe(2);
      expect(state.memory.interactions[0].speaker).toBe('Player');
      expect(state.memory.interactions[0].message).toBe('Hello there');
    });
    it('Stores_NPC_responses_in_history', async () => {
      const provider = createSingleResponseProvider('NPC response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const state = agent.saveState() as any;
      expect(state.memory.interactions.length).toBe(2);
      expect(state.memory.interactions[1].speaker).toBe('Garrick');
      expect(state.memory.interactions[1].message).toBe('NPC response');
    });
    it('Limits_history_to_configured_size', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      for (let i = 0; i < 30; i++) {
        await agent.processDialogue('Player', `Message ${i}`, 'context');
      }

      const state = agent.saveState() as any;
      expect(state.memory.interactions.length).toBeLessThanOrEqual(50);
    });
    it('Provides_history_to_provider_for_context', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'First message', 'greeting');
      await agent.processDialogue('Player', 'Second message', 'greeting');

      const calls = vi.mocked(mockProvider.generateText).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[1][0].messages.length).toBeGreaterThan(calls[0][0].messages.length);
    });
  });

  describe('state persistence', () => {
    describe('saveState', () => {
      it('Serializes_conversation_history', async () => {
        const provider = createSingleResponseProvider('Response');
        const persona = generatePersona('Merchant', 'Lawful Good');
        const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

        await agent.processDialogue('Player', 'Test message', 'context');

        const state = agent.saveState() as any;
        expect(state.memory.interactions).toBeDefined();
        expect(state.memory.interactions.length).toBeGreaterThan(0);
        expect(state.memory.interactions[0].message).toBe('Test message');
      });
      it('Serializes_NPC_metadata', () => {
        const provider = createSingleResponseProvider('Response');
        const persona = generatePersona('Merchant', 'Lawful Good');
        const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

        agent.addFact('Test fact');

        const state = agent.saveState() as any;
        expect(state.id).toBe('npc-1');
        expect(state.name).toBe('Garrick');
        expect(state.memory.facts).toContain('Test fact');
      });
      it('Returns_JSON_serializable_object', async () => {
        const provider = createSingleResponseProvider('Response');
        const persona = generatePersona('Merchant', 'Lawful Good');
        const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

        await agent.processDialogue('Player', 'Message', 'context');
        agent.addFact('Fact');
        agent.updateRelationship('Player', 1);

        const state = agent.saveState();
        const json = JSON.stringify(state);
        expect(() => JSON.parse(json)).not.toThrow();
      });
    });

    describe('loadState', () => {
      it('Restores_conversation_history', async () => {
        const provider = createSingleResponseProvider('Response');
        const persona = generatePersona('Merchant', 'Lawful Good');
        const agent1 = new NPCAgent('npc-1', 'Garrick', persona, provider);

        await agent1.processDialogue('Player', 'Original message', 'context');
        const state = agent1.saveState();

        const agent2 = new NPCAgent('npc-2', 'NewName', persona, provider);
        agent2.loadState(state);

        const restoredState = agent2.saveState() as any;
        expect(restoredState.memory.interactions[0].message).toBe('Original message');
      });
      it('Restores_NPC_metadata', () => {
        const provider = createSingleResponseProvider('Response');
        const persona = generatePersona('Merchant', 'Lawful Good');
        const agent1 = new NPCAgent('npc-1', 'Garrick', persona, provider);

        agent1.addFact('Important fact');
        agent1.updateRelationship('Player', 2);
        const state = agent1.saveState();

        const agent2 = new NPCAgent('npc-2', 'NewName', persona, provider);
        agent2.loadState(state);

        const restoredState = agent2.saveState() as any;
        expect(restoredState.memory.facts).toContain('Important fact');
        expect(restoredState.memory.relationships).toBeDefined();
      });
      it('Resumes_conversation_from_saved_state', async () => {
        const provider = createSingleResponseProvider('Response');
        const persona = generatePersona('Merchant', 'Lawful Good');
        const agent1 = new NPCAgent('npc-1', 'Garrick', persona, provider);

        await agent1.processDialogue('Player', 'First message', 'context');
        const state = agent1.saveState();

        const agent2 = new NPCAgent('npc-2', 'NewName', persona, provider);
        agent2.loadState(state);
        await agent2.processDialogue('Player', 'Second message', 'context');

        const finalState = agent2.saveState() as any;
        expect(finalState.memory.interactions.length).toBe(4);
        expect(finalState.memory.interactions[0].message).toBe('First message');
        expect(finalState.memory.interactions[2].message).toBe('Second message');
      });
    });
  });

  describe('respects persona in responses', () => {
    it('Uses_persona_name_in_context', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.messages.some(m => m.content.includes('Garrick'))).toBe(true);
    });
    it('Applies_persona_personality_traits_via_system_prompt', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.system).toBeDefined();
    });
    it('Uses_persona_background_knowledge_in_system_prompt', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Guard', 'Lawful Neutral');
      const agent = new NPCAgent('npc-1', 'Marcus', persona, mockProvider);

      await agent.processDialogue('Player', 'Tell me about yourself', 'conversation');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.system).toBeDefined();
      expect(call.system!.length).toBeGreaterThan(0);
    });
    it('Maintains_persona_speech_patterns_through_provider', async () => {
      const guardResponse = 'State your business!';
      const provider = createSingleResponseProvider(guardResponse);
      const persona = generatePersona('Guard', 'Lawful Neutral');
      const agent = new NPCAgent('npc-1', 'Marcus', persona, provider);

      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe(guardResponse);
    });
  });

  describe('handles edge cases', () => {
    it('Handles_empty_player_message', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const response = await agent.processDialogue('Player', '', 'greeting');

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
    it('Handles_very_long_player_message', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const longMessage = 'A'.repeat(1000);
      const response = await agent.processDialogue('Player', longMessage, 'context');

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
    it('Handles_special_characters_in_message', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const specialMessage = 'Hello! @#$%^&*()_+ "quotes" \'apostrophes\' <tags>';
      const response = await agent.processDialogue('Player', specialMessage, 'greeting');

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
    it('Recovers_from_provider_errors', async () => {
      const errorProvider: ITextProvider = {
        generateText: vi.fn().mockRejectedValue(new Error('Provider error')),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, errorProvider);

      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
    it('Returns_fallback_on_empty_response', async () => {
      const provider = createSingleResponseProvider('');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe('...');
    });
    it('Dialogue_includes_system_prompt_with_persona_information', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.system).toBeDefined();
      expect(call.system!.length).toBeGreaterThan(0);
    });
    it('Multiple_sequential_dialogues_accumulate_in_history', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      await agent.processDialogue('Player', 'First', 'context');
      await agent.processDialogue('Player', 'Second', 'context');
      await agent.processDialogue('Player', 'Third', 'context');

      const state = agent.saveState() as any;
      expect(state.memory.interactions.length).toBe(6);
      expect(state.memory.interactions[0].message).toBe('First');
      expect(state.memory.interactions[2].message).toBe('Second');
      expect(state.memory.interactions[4].message).toBe('Third');
    });
  });

  describe('performance', () => {
    it('Respects_max_tokens_limit', async () => {
      const mockProvider: ITextProvider = {
        generateText: vi.fn().mockResolvedValue({ content: 'Response' }),
      };
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, mockProvider);

      await agent.processDialogue('Player', 'Hello', 'greeting');

      const call = vi.mocked(mockProvider.generateText).mock.calls[0][0];
      expect(call.maxTokens).toBe(200);
    });
    it('Truncates_history_when_too_long', async () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');
      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);

      for (let i = 0; i < 30; i++) {
        await agent.processDialogue('Player', `Message ${i}`, 'context');
      }

      const state = agent.saveState() as any;
      expect(state.memory.interactions.length).toBe(50);
    });
  });
});

describe('NPCAgent personas', () => {
  describe('persona configuration', () => {
    it('Loads_persona_from_predefined_templates', () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      expect(persona).toBeDefined();
      expect(persona.archetype).toBe('Merchant');
      expect(persona.alignment).toBe('Lawful Good');
    });
    it('Supports_custom_persona_definition', () => {
      const provider = createSingleResponseProvider('Response');
      const customPersona = generatePersona('Guard', 'Lawful Neutral');

      const agent = new NPCAgent('npc-1', 'Marcus', customPersona, provider);

      expect(agent.getPersona()).toEqual(customPersona);
    });
    it('Validates_required_persona_fields', () => {
      const provider = createSingleResponseProvider('Response');
      const persona = generatePersona('Merchant', 'Lawful Good');

      expect(persona.archetype).toBeDefined();
      expect(persona.alignment).toBeDefined();
      expect(persona.personality).toBeDefined();
      expect(persona.motivations).toBeDefined();
    });
  });

  describe('persona behavior', () => {
    it('Merchant_persona_reflects_trade_archetype', async () => {
      const merchantResponse = 'What can I get for you today?';
      const provider = createSingleResponseProvider(merchantResponse);
      const persona = generatePersona('Merchant', 'Lawful Good');

      const agent = new NPCAgent('npc-1', 'Garrick', persona, provider);
      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe(merchantResponse);
      expect(agent.getPersona().archetype).toBe('Merchant');
    });
    it('Guard_persona_reflects_protective_archetype', async () => {
      const guardResponse = 'Halt! Who goes there?';
      const provider = createSingleResponseProvider(guardResponse);
      const persona = generatePersona('Guard', 'Lawful Neutral');

      const agent = new NPCAgent('npc-1', 'Marcus', persona, provider);
      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe(guardResponse);
      expect(agent.getPersona().archetype).toBe('Guard');
    });
    it('Innkeeper_persona_reflects_hospitable_archetype', async () => {
      const innkeeperResponse = 'Welcome, traveler! Come in, come in!';
      const provider = createSingleResponseProvider(innkeeperResponse);
      const persona = generatePersona('Innkeeper', 'Neutral Good');

      const agent = new NPCAgent('npc-1', 'Mara', persona, provider);
      const response = await agent.processDialogue('Player', 'Hello', 'greeting');

      expect(response).toBe(innkeeperResponse);
      expect(agent.getPersona().archetype).toBe('Innkeeper');
    });
    it('Mysterious_stranger_persona_reflects_enigmatic_archetype', async () => {
      const mysteriousResponse = 'Not all who wander are lost...';
      const provider = createSingleResponseProvider(mysteriousResponse);
      const persona = generatePersona('Mysterious Stranger', 'True Neutral');

      const agent = new NPCAgent('npc-1', 'Shadowman', persona, provider);
      const response = await agent.processDialogue('Player', 'Who are you?', 'conversation');

      expect(response).toBe(mysteriousResponse);
      expect(agent.getPersona().archetype).toBe('Mysterious Stranger');
    });
  });
});

# Mutation Test Todos - Surviving Mutants

## Summary
- Total survivors: 38 mutants
- Current mutation score: 29.08% total, 60.00% covered
- Target: 80%+ mutation score

## High Priority - loadState Edge Cases (5 mutants)
Location: `src/ai/npc-agent.ts:126-130`

### Tests needed:
1. **loadState_handles_missing_memory_object**
   - Test: Call loadState with state that has no memory property
   - Kills: ConditionalExpression at line 126

2. **loadState_handles_missing_lastUpdated**
   - Test: Call loadState with state.memory.lastUpdated = null/undefined
   - Kills: LogicalOperator and ConditionalExpression at line 130 (3 mutants)

3. **loadState_handles_missing_relationships**
   - Test: Call loadState with state.memory.relationships = null/undefined
   - Kills: LogicalOperator at line 129

## Medium Priority - updateRelationship (16 mutants)
Location: `src/ai/npc-agent.ts:217-234`

### Tests needed:
4. **updateRelationship_defaults_to_Neutral_for_unknown_character**
   - Test: Call updateRelationship for character not in map
   - Kills: LogicalOperator and ConditionalExpression at line 218 (4 mutants)

5. **updateRelationship_increases_relationship_level**
   - Test: Start Neutral, call with change +1, verify becomes Friendly
   - Kills: Math.max/Math.min mutations at lines 228-230 (3 mutants)

6. **updateRelationship_decreases_relationship_level**
   - Test: Start Neutral, call with change -1, verify becomes Unfriendly
   - Kills: ArithmeticOperator at line 230

7. **updateRelationship_clamps_at_Hostile**
   - Test: Start Hostile, call with change -10, verify stays Hostile
   - Kills: Math.max mutation at line 228

8. **updateRelationship_clamps_at_Allied**
   - Test: Start Allied, call with change +10, verify stays Allied
   - Kills: Math.min mutation at line 230

9. **updateRelationship_uses_all_relationship_levels**
   - Test: Verify all 5 levels (Hostile, Unfriendly, Neutral, Friendly, Allied) work
   - Kills: StringLiteral mutations at lines 220-224 (5 mutants)

## Medium Priority - buildConversationMessages (8 mutants)
Location: `src/ai/npc-agent.ts:270-283`

### Tests needed:
10. **buildConversationMessages_formats_speaker_role_correctly**
    - Test: Verify player messages → 'user', NPC messages → 'assistant'
    - Kills: EqualityOperator and ConditionalExpression at line 274 (5 mutants)

11. **buildConversationMessages_includes_context_when_present**
    - Test: Verify context is added to message content
    - Kills: StringLiteral at line 276

12. **buildConversationMessages_formats_complete_message**
    - Test: Verify message includes speaker, message, and context
    - Kills: StringLiteral at line 280

13. **buildConversationMessages_respects_limit_parameter**
    - Test: Create 20 interactions, call with limit=5, verify only 5 returned
    - Kills: MethodExpression at line 271

## Medium Priority - addFact (1 mutant)
Location: `src/ai/npc-agent.ts:239-243`

### Tests needed:
14. **addFact_prevents_duplicate_facts**
    - Test: Add same fact twice, verify only stored once
    - Kills: ConditionalExpression at line 240

## Medium Priority - addInteraction history limit (2 mutants)
Location: `src/ai/npc-agent.ts:260-262`

### Tests needed:
15. **addInteraction_truncates_at_exactly_50_interactions**
    - Test: Add 51 interactions, verify 50 remain, first is discarded
    - Kills: EqualityOperator (> vs >=) and ConditionalExpression at line 260

## Low Priority - Error Messages (1 mutant)
Location: `src/ai/npc-agent.ts:151`

### Tests needed:
16. **processDialogue_logs_error_with_agent_name**
    - Test: Mock console.error, trigger error, verify log contains agent name
    - Kills: StringLiteral at line 151

## Low Priority - getFallbackDialogue (6 mutants)
Location: `src/ai/npc-agent.ts:366-377`

### Tests needed:
17. **getFallbackDialogue_returns_non_empty_string**
    - Test: Call getFallbackDialogue multiple times, verify all return non-empty
    - Kills: StringLiteral mutations at lines 368-372 (5 mutants)

18. **getFallbackDialogue_uses_valid_array_index**
    - Test: Mock Math.random, verify index calculation works correctly
    - Kills: ArithmeticOperator at line 375
    - Note: Hard to test randomization, may need to accept this survivor

## Test Implementation Priority
1. **High Priority** (5 mutants) - loadState edge cases - critical for save/load reliability
2. **Medium Priority** (27 mutants) - Core functionality - updateRelationship, message formatting, facts
3. **Low Priority** (6 mutants) - Error messages and fallback strings - nice to have

## Expected Outcome
Implementing all high and medium priority tests should bring mutation score from 60% to ~85%+ for covered code.

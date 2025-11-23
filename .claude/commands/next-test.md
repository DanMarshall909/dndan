Implement the next logical test in the AI provider abstraction test suite.

Follow this process:

1. **Identify the next test**: Look at the test files in `src/ai/__tests__/` and find the first `it.todo()` that should be implemented next. Start with foundational tests (TestTextProvider) before dependent tests (NPCAgent).

2. **Implement ONE test only**:
   - Create any required interfaces/types in `src/ai/providers/types.ts`
   - Create or update the implementation file needed to make the test pass
   - Convert the `it.todo()` to a real `it()` with the test implementation
   - Follow the testing principles from https://enterprisecraftsmanship.com/posts/you-naming-tests-wrong/
   - **Write acceptance tests, not unit tests**: Test behavior from the consumer's perspective, not implementation details. Focus on what the code does, not how it does it internally.

3. **Review and refactor**: Critically review the code for:
   - Best practices
   - Code readability and elegance
   - Minimal code to accomplish the task
   - Modern TypeScript features
   - Fix any issues found

4. **Run tests**: Execute `npm run test:run` and ensure all tests pass

5. **Run mutation testing**:
   - If Stryker is not installed, add `@stryker-mutator/core` and configure it
   - Run mutation tests on the new code
   - Report mutation score and any surviving mutants

6. **Fix mutation and coverage issues**:
   - Kill any surviving mutants by adding assertions or tests that detect the mutations
   - Fix any coverage gaps in the implementation
   - Re-run mutation testing until score is acceptable (aim for 80%+)

7. **Recommend edge cases**: Analyze the current implementation and suggest behavioral edge cases that:
   - Are in scope of the current change
   - Don't already exist in other `it.todo()` tests
   - Test behavior from the consumer's perspective (acceptance tests)
   - Do NOT test internal implementation details
   - List these as new `it.todo()` entries to add to the test file

8. **Summary**: Report:
   - What was implemented
   - Test results (pass/fail count)
   - Final mutation score
   - Recommended edge case tests to add

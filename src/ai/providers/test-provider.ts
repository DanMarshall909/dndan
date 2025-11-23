import { FakeListChatModel } from '@langchain/core/utils/testing';
import { LangChainProvider } from './langchain-provider';
import { ITextProvider } from './types';

/**
 * Configuration for creating a test provider.
 */
export interface TestProviderConfig {
  /** Canned responses to return in sequence */
  responses: string[];
}

/**
 * Creates a test provider using LangChain's FakeListChatModel.
 * This is a convenience function for testing code that uses ITextProvider.
 *
 * @param config - Configuration with canned responses
 * @returns An ITextProvider that returns canned responses
 *
 * @example
 * ```typescript
 * const provider = createTestProvider({
 *   responses: ['Hello!', 'How can I help?'],
 * });
 *
 * const result = await provider.generateText({
 *   messages: [{ role: 'user', content: 'Hi' }],
 * });
 * // result.content === 'Hello!'
 * ```
 */
export function createTestProvider(config: TestProviderConfig): ITextProvider {
  const model = new FakeListChatModel({
    responses: config.responses,
  });
  return new LangChainProvider(model);
}

/**
 * Creates a test provider that always returns the same response.
 *
 * @param response - The response to return
 * @returns An ITextProvider that always returns the given response
 */
export function createSingleResponseProvider(response: string): ITextProvider {
  return createTestProvider({ responses: [response] });
}

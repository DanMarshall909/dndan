import {
  ITextProvider,
  TextGenerationRequest,
  TextGenerationResponse,
} from './types';

/** Error message when no responses are configured */
export const NO_RESPONSES_ERROR = 'No canned responses configured';

/** Configuration for a canned response - same shape as TextGenerationResponse */
export type CannedResponse = TextGenerationResponse;

/**
 * Configuration options for TestTextProvider.
 */
export interface TestTextProviderConfig {
  /** Canned responses to return in sequence */
  responses?: CannedResponse[];
}

/**
 * A test double for ITextProvider that returns canned responses.
 * Useful for testing code that depends on text generation.
 */
export class TestTextProvider implements ITextProvider {
  private responses: CannedResponse[];
  private currentIndex = 0;

  /**
   * Creates a new TestTextProvider with the given configuration.
   * @param config - Configuration options including canned responses
   */
  constructor(config: TestTextProviderConfig = {}) {
    this.responses = config.responses ?? [];
  }

  /**
   * Generates text by returning the next canned response.
   * @param _request - The generation request (ignored for canned responses)
   * @returns Promise resolving to the next canned response
   * @throws Error if no responses are configured
   */
  async generateText(
    _request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    if (this.responses.length === 0) {
      throw new Error(NO_RESPONSES_ERROR);
    }

    const response = this.responses[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.responses.length;

    return response;
  }
}

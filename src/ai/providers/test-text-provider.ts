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
 * A captured request with metadata.
 */
export interface CapturedRequest {
  /** The original request */
  request: TextGenerationRequest;
}

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
  private capturedRequests: CapturedRequest[] = [];

  /**
   * Creates a new TestTextProvider with the given configuration.
   * @param config - Configuration options including canned responses
   */
  constructor(config: TestTextProviderConfig = {}) {
    this.responses = config.responses ?? [];
  }

  /**
   * Gets all captured requests made to this provider.
   * @returns Array of captured requests
   */
  get requests(): CapturedRequest[] {
    return this.capturedRequests;
  }

  /**
   * Generates text by returning the next canned response.
   * @param request - The generation request
   * @returns Promise resolving to the next canned response
   * @throws Error if no responses are configured
   */
  async generateText(
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    this.capturedRequests.push({ request });

    if (this.responses.length === 0) {
      throw new Error(NO_RESPONSES_ERROR);
    }

    const response = this.responses[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.responses.length;

    return response;
  }
}

/**
 * Message in a conversation history.
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Request for text generation from a provider.
 */
export interface TextGenerationRequest {
  /** System prompt to set context */
  system?: string;
  /** Conversation history */
  messages: Message[];
  /** Sampling temperature (0-1) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
}

/**
 * Response from a text generation provider.
 */
export interface TextGenerationResponse {
  /** Generated text content */
  content: string;
  /** Model that generated the response */
  model?: string;
  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Interface for text generation providers.
 * Implementations include Claude, OpenRouter, Ollama, and test doubles.
 */
export interface ITextProvider {
  /**
   * Generate text based on the request.
   * @param request - The generation request
   * @returns Promise resolving to the generation response
   */
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
}

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import {
  ITextProvider,
  TextGenerationRequest,
  TextGenerationResponse,
  Message,
} from './types';

/**
 * Text generation provider that wraps any LangChain chat model.
 * Provides a unified interface for Ollama, Anthropic, OpenAI, etc.
 */
export class LangChainProvider implements ITextProvider {
  /**
   * Creates a new LangChainProvider.
   * @param model - Any LangChain BaseChatModel (ChatOllama, ChatAnthropic, etc.)
   */
  constructor(private readonly model: BaseChatModel) {}

  /**
   * Generates text using the wrapped LangChain model.
   * @param request - The generation request
   * @returns Promise resolving to the generation response
   */
  async generateText(
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    const messages = this.convertMessages(request.system, request.messages);

    // Runtime options like temperature and maxTokens need to be passed as any
    // since different LangChain models have different call options types
    const options: Record<string, unknown> = {};
    if (request.temperature !== undefined) {
      options.temperature = request.temperature;
    }
    if (request.maxTokens !== undefined) {
      options.maxTokens = request.maxTokens;
    }

    const result = await this.model.invoke(messages, options);

    const content = typeof result.content === 'string'
      ? result.content
      : JSON.stringify(result.content);

    return {
      content,
      model: this.model.getName?.() ?? 'unknown',
      usage: result.usage_metadata ? {
        inputTokens: result.usage_metadata.input_tokens,
        outputTokens: result.usage_metadata.output_tokens,
      } : undefined,
    };
  }

  /**
   * Converts our message format to LangChain message format.
   */
  private convertMessages(
    system: string | undefined,
    messages: Message[]
  ): (SystemMessage | HumanMessage | AIMessage)[] {
    const result: (SystemMessage | HumanMessage | AIMessage)[] = [];

    if (system) {
      result.push(new SystemMessage(system));
    }

    for (const msg of messages) {
      if (msg.role === 'user') {
        result.push(new HumanMessage(msg.content));
      } else {
        result.push(new AIMessage(msg.content));
      }
    }

    return result;
  }
}

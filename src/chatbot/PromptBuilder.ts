import { Injectable } from '@nestjs/common';
import { Content } from '@google/generative-ai';
@Injectable()
export class PromptBuilder {
  buildSystemInstruction(): string {
    return `You are a library assistant. Use the available tools to answer questions about books. Only state information returned by tool results — never invent book data.`;
  }
  /** Builds the full contents array: prior history + the new user turn. */
  buildContents(history: Content[], message: string): Content[] {
    const userContent: Content = { role: 'user', parts: [{ text: message }] };
    return [...history, userContent];
  }

  buildUserContent(message: string): Content {
    return { role: 'user', parts: [{ text: message }] };
  }
  build(message: string) {
    return [{ role: 'user' as const, content: message }];
  }
}

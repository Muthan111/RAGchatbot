import { Injectable } from '@nestjs/common';
@Injectable()
export class PromptBuilder {
  buildSystemInstruction(): string {
    return `You are a library assistant. Use the available tools to answer questions about books. Only state information returned by tool results — never invent book data.`;
  }
  build(message: string) {
    return [{ role: 'user' as const, content: message }];
  }
}

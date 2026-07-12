import { Injectable } from '@nestjs/common';
import { ChatRequest } from './request.dto';
import { ChatResponse } from './response.dto';
import { PromptBuilder } from './PromptBuilder';
import { ToolExecutor } from './ToolExecutor';
import { GeminiModel } from './gemini';
import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { toolDeclarations } from './ToolDeclaration';
import { ConversationStore } from './ConversationStore';

@Injectable()
export class ChatOrchestrator {
  constructor(
    private readonly promptBuilder: PromptBuilder,
    // private readonly toolExecutor: ToolExecutor,
    private readonly geminiModel: GeminiModel,
    private readonly conversationStore: ConversationStore
  ) {}
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // 1. Get or create the conversation session
    const conversation = this.conversationStore.getOrCreate(request.conversationId);

    // 2. Merge history with the new message
    const contents = this.promptBuilder.buildContents(conversation.history, request.message);
    // Build prompt from user input
    // const prompt = this.promptBuilder.build(request.message);
    const model = this.geminiModel.initializeModel(
      this.promptBuilder.buildSystemInstruction(),
      toolDeclarations,
    );

    // 4. Run the tool-calling loop
    const { reply } = await this.geminiModel.generateResponse(model, contents, {
      ...request,
      conversationId: conversation.id,
    });

    // 5. Persist ONLY the clean user + model turns — not tool call noise
    const userContent = this.promptBuilder.buildUserContent(request.message);
    const modelContent = { role: 'model' as const, parts: [{ text: reply }] };
    this.conversationStore.appendTurn(conversation.id, userContent, modelContent);

    return { reply, conversationId: conversation.id };


  }
}

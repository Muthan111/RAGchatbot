import { Injectable } from '@nestjs/common';
import { ChatRequest } from './request.dto';
import { ChatResponse } from './response.dto';
import { PromptBuilder } from './PromptBuilder';
import { ToolExecutor } from './ToolExecutor';
import { GeminiModel } from './gemini';
import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { toolDeclarations } from './ToolDeclaration';

const MAX_TOOL_ITERATIONS = 5;
@Injectable()
export class ChatOrchestrator {
  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  constructor(
    private readonly promptBuilder: PromptBuilder,
    // private readonly toolExecutor: ToolExecutor,
    private readonly geminiModel: GeminiModel,
  ) {}
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Build prompt from user input
    const prompt = this.promptBuilder.build(request.message);

    //  Initiate model
    // const model = this.genAI.getGenerativeModel({
    //   model: 'gemini-2.5-flash',
    //   systemInstruction: this.promptBuilder.buildSystemInstruction(),
    //   tools: [{ functionDeclarations: toolDeclarations }],
    // });
    const model = this.geminiModel.initializeModel(
      this.promptBuilder.buildSystemInstruction(),
      toolDeclarations,
    );
    // const contents: Content[] = prompt.map((p) => ({
    //   role: p.role,
    //   parts: [{ text: p.content }],
    // }));
    const initialContents  = this.geminiModel.initializeContents(prompt);
    
    const { reply, conversationId, contents} = await this.geminiModel.generateResponse(
      model,
      initialContents,
      request,
    );
    console.log("initiai"+ initialContents)
    console.log('Final contents:', contents);
    return { reply, conversationId };
  }
}

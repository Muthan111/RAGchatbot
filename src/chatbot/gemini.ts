import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { ToolExecutor } from './ToolExecutor';
import { Injectable } from '@nestjs/common';
const MAX_TOOL_ITERATIONS = 5;
@Injectable()
export class GeminiModel {
  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  constructor(private readonly toolExecutor: ToolExecutor) {}
  initializeModel(systemInstruction: string, Servicetools: any) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: Servicetools }],
    });
    return model;
  }
  initializeContents(prompt: any): Content[] {
    const contents = prompt.map((p: any) => ({
      role: p.role,
      parts: [{ text: p.content }],
    }));
    return contents;
  }
  async generateResponse(model: any, initialContents: Content[], request: any) {
    const contents = [...initialContents];
    let iterations = 0;

    try {
      while (iterations < MAX_TOOL_ITERATIONS) {
        const result = await model.generateContent({ contents });
        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const functionCallParts = parts.filter(
          (p: any) => p.functionCall != null,
        );
        if (functionCallParts.length === 0) {
          const replyText = response.text();
          contents.push({
              role: 'model',
              parts: [{ text: replyText }],
            });
          return {
            reply: replyText,
            conversationId: request.conversationId ?? '',
            contents,
          };
        }
        contents.push({
          role: 'model',
          parts: functionCallParts.map((p) => ({
            functionCall: p.functionCall,
          })),
        });
        const functionResponseParts: Part[] = await Promise.all(
          functionCallParts.map(async (p) => {
            const { name, args } = p.functionCall!;
            const toolResult = await this.toolExecutor.execute(name, args);
            console.log(toolResult);
            return {
              functionResponse: {
                name,
                response: { result: toolResult },
              },
            };
          }),
        );
        contents.push({
          role: 'function',
          parts: functionResponseParts,
        });
        iterations++;
      }
      console.log("initiai"+ initialContents)
      console.log("final"+ contents)
      return {
        reply: 'Unable to complete the request after multiple tool calls. Please rephrase your question.',
        conversationId: request.conversationId ?? '',
        contents,
      };
    } catch (err) {
      console.error('Error generating response:', err);
      throw err;
    }
  }
}

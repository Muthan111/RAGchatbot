import { Injectable } from '@nestjs/common';
import { ChatRequest } from './request.dto';
import { ChatResponse } from './response.dto';
import { PromptBuilder } from './PromptBuilder';
import { ToolExecutor } from './ToolExecutor';
import { gemini } from './gemini';
import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { toolDeclarations } from './ToolDeclaration';

const MAX_TOOL_ITERATIONS = 5;
@Injectable()
export class ChatOrchestrator {
  private readonly genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  constructor(
    private readonly promptBuilder: PromptBuilder,
    private readonly toolExecutor: ToolExecutor,
  ) {}
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Build prompt from user input
    const prompt = this.promptBuilder.build(request.message);

    //  Initiate model
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: this.promptBuilder.buildSystemInstruction(),
      tools: [{ functionDeclarations: toolDeclarations }],
    });
    const contents: Content[] = prompt.map((p) => ({
      role: p.role,
      parts: [{ text: p.content }],
    }));
    let iterations = 0;
    while (iterations < MAX_TOOL_ITERATIONS) {
      const result = await model.generateContent({ contents });
      const response = result.response;
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const functionCallParts = parts.filter((p) => p.functionCall != null);

      if (functionCallParts.length === 0) {
        return {
          reply: response.text(),
          conversationId: request.conversationId ?? '',
        };
      }
      contents.push({
        role: 'model',
        parts: functionCallParts.map((p) => ({ functionCall: p.functionCall })),
      });

      const functionResponseParts: Part[] = await Promise.all(
        functionCallParts.map(async (p) => {
          const { name, args } = p.functionCall!;
          const toolResult = await this.toolExecutor.execute(name, args);
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
    return {
      reply:
        'Unable to complete the request after multiple tool calls. Please rephrase your question.',
      conversationId: request.conversationId ?? '',
    };

    // Generate initial response from model
    // const result = await model.generateContent({
    //   contents: prompt.map((p) => ({
    //     role: p.role === 'assistant' ? 'model' : 'user',
    //     parts: [{ text: p.content }],
    //   })),
    // });
    // Results from initial response
    // const Geminiresponse = result.response;

    // Get Toolcall
    // const parts = Geminiresponse.candidates?.[0]?.content?.parts ?? [];

    // safer extraction
    //     const toolCalls = parts.filter((p) => p.functionCall != null);

    //     if (toolCalls.length > 0) {
    //       console.log('Tool calls detected:', toolCalls);

    //       const toolResults = [];

    //       for (const part of toolCalls) {
    //         const { name, args } = part.functionCall;

    //         const toolResult = await this.toolExecutor.execute(name, args);

    //         toolResults.push({
    //           tool: name,
    //           args,
    //           result: toolResult,
    //         });
    //       }

    //       const finalPrompt = [
    //         ...prompt,
    //         {
    //           role: 'user',
    //           content: `
    // You are given tool execution results.

    // STRICT RULES:
    // - Use ONLY the tool results below
    // - Do NOT guess missing information
    // - If empty, say "No results found"

    // Tool results:
    // ${JSON.stringify(toolResults, null, 2)}
    //       `.trim(),
    //         },
    //       ];

    //       const finalResponse = await model.generateContent({
    //         contents: finalPrompt.map((p) => ({
    //           role: p.role,
    //           parts: [{ text: p.content }],
    //         })),
    //       });

    //       return {
    //         reply: finalResponse.response.text(),
    //         conversationId: request.conversationId ?? '',
    //       };
    //     }
    //     return {
    //       reply: Geminiresponse.text(),
    //       conversationId: request.conversationId ?? '',
    //     };
    //   }

    // const finalResult = await model.generateContent({
    //   contents: [
    //     ...prompt.map((p) => ({
    //       role: p.role,
    //       parts: [{ text: p.content }],
    //     })),

    //     // model's tool request
    //     {
    //       role: 'model',
    //       parts: toolCalls.map((tc) => ({
    //         functionCall: tc.functionCall,
    //       })),
    //     },

    //     // tool execution result (YOUR ToolExecutor output)
    //     {
    //       role: 'user',
    //       parts: toolResults,
    //     },
    //   ],
    // });
    // execute tool
    // Send tool result
    // Return final reply
  }
}

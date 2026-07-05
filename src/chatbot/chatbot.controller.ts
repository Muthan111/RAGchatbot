import { Controller, Post, Body } from '@nestjs/common';
import { ChatOrchestrator } from './chatOrchestrator';
import { ChatRequest } from './request.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import {ChatRequest} from './request.dto';
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly orchestrator: ChatOrchestrator) {}
  @ApiOperation({ summary: 'Chat with the bot' })
  @ApiBody({
    type: ChatRequest,
    description:
      'The chat request containing the user message and optional conversation ID',
  })
  @Post()
  async chat(@Body() request: ChatRequest) {
    return this.orchestrator.chat(request);
  }
}

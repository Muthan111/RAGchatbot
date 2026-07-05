import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { PromptBuilder } from './PromptBuilder';
import { ChatOrchestrator } from './chatOrchestrator';
import { ToolExecutor } from './ToolExecutor';
import { BookModule } from '../book/book.module';
import { GeminiModel } from './gemini';
@Module({
  imports: [BookModule],
  providers: [ChatbotService, PromptBuilder, ChatOrchestrator, ToolExecutor, GeminiModel],
  controllers: [ChatbotController],
})
export class ChatbotModule {}

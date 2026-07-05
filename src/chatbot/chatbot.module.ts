import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { PromptBuilder } from './PromptBuilder';
import { ChatOrchestrator } from './chatOrchestrator';
import { ToolExecutor } from './ToolExecutor';
import { BookModule } from '../book/book.module';

@Module({
  imports: [BookModule],
  providers: [ChatbotService, PromptBuilder, ChatOrchestrator, ToolExecutor],
  controllers: [ChatbotController],
})
export class ChatbotModule {}

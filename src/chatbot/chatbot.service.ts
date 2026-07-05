import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  getHello(): string {
    return 'hello world';
  }
  sendMessage(message: string): string {
    return `Message received: ${message}`;
  }
}

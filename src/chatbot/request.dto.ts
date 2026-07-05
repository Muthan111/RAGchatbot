import { ApiProperty } from '@nestjs/swagger';
export class ChatRequest {
  @ApiProperty()
  message: string;

  @ApiProperty()
  conversationId?: string;
}

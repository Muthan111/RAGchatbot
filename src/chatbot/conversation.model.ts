import { Content } from '@google/generative-ai';

export interface Conversation {
  id: string;
  history: Content[]; // alternating {role:'user'} / {role:'model'} entries only
  createdAt: number;
  updatedAt: number;
}

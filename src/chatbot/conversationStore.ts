import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Content } from '@google/generative-ai';
import { Conversation } from './conversation.model';

const MAX_HISTORY_ENTRIES = 20; // 10 user/model exchanges
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes idle -> evicted
const MAX_SESSIONS = 1000; // hard cap, evict oldest by updatedAt
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class ConversationStore {
  private readonly logger = new Logger(ConversationStore.name);
  private readonly store = new Map<string, Conversation>();

  constructor() {
    setInterval(() => this.cleanupExpired(), CLEANUP_INTERVAL_MS).unref();
  }

  getOrCreate(conversationId?: string): Conversation {
    if (conversationId) {
      const existing = this.store.get(conversationId);
      if (existing) {
        return existing;
      }
      this.logger.warn(
        `conversationId ${conversationId} not found, creating new`,
      );
    }
    return this.create();
  }

  private create(): Conversation {
    const now = Date.now();
    const conversation: Conversation = {
      id: randomUUID(),
      history: [],
      createdAt: now,
      updatedAt: now,
    };
    this.evictIfOverCapacity();
    this.store.set(conversation.id, conversation);
    return conversation;
  }

  /** Append one resolved turn (user text + final model text) to history. */
  appendTurn(
    conversationId: string,
    userContent: Content,
    modelContent: Content,
  ): void {
    const conversation = this.store.get(conversationId);
    if (!conversation) {
      this.logger.warn(
        `appendTurn called for missing conversation ${conversationId}`,
      );
      return;
    }
    conversation.history.push(userContent, modelContent);
    this.trimHistory(conversation);
    conversation.updatedAt = Date.now();
  }

  private trimHistory(conversation: Conversation): void {
    if (conversation.history.length > MAX_HISTORY_ENTRIES) {
      // Trim in pairs so we never cut a user without its model reply
      const excess = conversation.history.length - MAX_HISTORY_ENTRIES;
      const pairsToRemove = Math.ceil(excess / 2) * 2;
      conversation.history.splice(0, pairsToRemove);
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [id, conversation] of this.store) {
      if (now - conversation.updatedAt > SESSION_TTL_MS) {
        this.store.delete(id);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.log(`Cleaned up ${removed} expired conversation(s)`);
    }
  }

  private evictIfOverCapacity(): void {
    if (this.store.size < MAX_SESSIONS) return;
    // Evict the least-recently-updated conversation
    let oldestId: string | null = null;
    let oldestUpdatedAt = Infinity;
    for (const [id, conversation] of this.store) {
      if (conversation.updatedAt < oldestUpdatedAt) {
        oldestUpdatedAt = conversation.updatedAt;
        oldestId = id;
      }
    }
    if (oldestId) {
      this.store.delete(oldestId);
      this.logger.warn(
        `Evicted conversation ${oldestId} — capacity limit reached`,
      );
    }
  }
}

export interface AssistantSessionDto {
  id: string;
  topic: string;
  createdAt: string;
  latestMessage?: AssistantMessageDto;
}

export interface AssistantMessageDto {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: string[]; // image URLs
  createdAt: string;
}

export interface ChatRequest {
  sessionId?: string;
  topic?: string;
  prompt: string;
  contextItemIds?: number[];
  referenceImageKeys?: string[];
}

export interface ChatResponse {
  sessionId: string;
  assistantMessageId: string;
}

export interface AssistantOutfitSuggestionDto {
  id: string;
  sessionId: string;
  sessionTopic: string;
  summary: string;
  wardrobeItemIds: number[];
  createdAt: string;
}

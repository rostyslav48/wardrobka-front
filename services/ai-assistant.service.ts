import { Observable } from 'rxjs';
import { httpService } from '@/services/http.service';
import {
  AssistantMessageDto,
  AssistantOutfitSuggestionDto,
  AssistantSessionDto,
  ChatRequest,
  ChatResponse,
} from '@/types/ai-assistant';

export const aiAssistantService = {
  getSessions(): Observable<AssistantSessionDto[]> {
    return httpService.get<AssistantSessionDto[]>('ai-assistant/sessions');
  },

  getMessages(sessionId: string): Observable<AssistantMessageDto[]> {
    return httpService.get<AssistantMessageDto[]>(
      `ai-assistant/sessions/${sessionId}/messages`,
    );
  },

  chat(request: ChatRequest): Observable<ChatResponse> {
    return httpService.post<ChatResponse>('ai-assistant/chat', request);
  },

  getRecentSuggestions(): Observable<AssistantOutfitSuggestionDto[]> {
    return httpService.get<AssistantOutfitSuggestionDto[]>(
      'ai-assistant/suggestions/recent',
    );
  },
};

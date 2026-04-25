import { Observable } from 'rxjs';
import { httpService } from '@/services/http.service';
import { OutfitLog, OutfitLogPayload } from '@/types/outfit-log';

export const outfitLogService = {
  getAll(): Observable<OutfitLog[]> {
    return httpService.get<OutfitLog[]>('outfit-log');
  },

  create(payload: OutfitLogPayload): Observable<OutfitLog> {
    return httpService.post<OutfitLog>('outfit-log', payload);
  },

  update(id: string, payload: Partial<OutfitLogPayload>): Observable<OutfitLog> {
    return httpService.patch<OutfitLog>(`outfit-log/${id}`, payload);
  },

  remove(id: string): Observable<void> {
    return httpService.delete<void>(`outfit-log/${id}`);
  },
};

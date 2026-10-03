import { Observable } from 'rxjs';
import { httpService } from '@/services/http.service';
import { CalendarOccasionsResponse, CalendarStatus } from '@/types/calendar';

export interface CalendarStatusResponse {
  status: CalendarStatus;
}

export interface CalendarAuthUrlResponse {
  url: string;
}

export const calendarService = {
  getStatus(): Observable<CalendarStatusResponse> {
    return httpService.get<CalendarStatusResponse>('calendar/status');
  },

  getAuthUrl(): Observable<CalendarAuthUrlResponse> {
    return httpService.get<CalendarAuthUrlResponse>('calendar/google/auth-url');
  },

  getOccasions(days?: number): Observable<CalendarOccasionsResponse> {
    return httpService.get<CalendarOccasionsResponse>(
      'calendar/occasions',
      days ? { days } : undefined,
    );
  },

  disconnect(): Observable<CalendarStatusResponse> {
    return httpService.delete<CalendarStatusResponse>('calendar/google');
  },
};

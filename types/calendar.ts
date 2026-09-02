export type CalendarStatus = 'disconnected' | 'active' | 'revoked';

export interface UpcomingOccasion {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

export interface CalendarOccasionsResponse {
  status: 'connected' | 'disconnected';
  occasions: UpcomingOccasion[];
}

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { forkJoin } from 'rxjs';
import { calendarService } from '@/services/calendar.service';
import { googleCalendarService } from '@/services/google-calendar.service';
import { CalendarStatus, UpcomingOccasion } from '@/types/calendar';

interface CalendarContextValue {
  status: CalendarStatus;
  occasions: UpcomingOccasion[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  /** Runs the OAuth flow, then re-fetches state. Resolves to the fresh status. */
  connect: () => Promise<CalendarStatus>;
  disconnect: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<CalendarStatus>('disconnected');
  const [occasions, setOccasions] = useState<UpcomingOccasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback((): Promise<CalendarStatus> => {
    setIsLoading(true);
    setError(null);

    return new Promise<CalendarStatus>((resolve) => {
      forkJoin({
        status: calendarService.getStatus(),
        occasions: calendarService.getOccasions(),
      }).subscribe({
        next: ({ status: statusResponse, occasions: occasionsResponse }) => {
          setStatus(statusResponse.status);
          setOccasions(occasionsResponse.occasions);
          setIsLoading(false);
          resolve(statusResponse.status);
        },
        error: () => {
          setError('Failed to load calendar data.');
          setIsLoading(false);
          resolve('disconnected');
        },
      });
    });
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(() => {
    void fetchAll();
  }, [fetchAll]);

  const connect = useCallback(async (): Promise<CalendarStatus> => {
    await googleCalendarService.connect();
    return fetchAll();
  }, [fetchAll]);

  const disconnect = useCallback(async (): Promise<void> => {
    await googleCalendarService.disconnect();
    await fetchAll();
  }, [fetchAll]);

  return (
    <CalendarContext.Provider
      value={{ status, occasions, isLoading, error, refresh, connect, disconnect }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
}

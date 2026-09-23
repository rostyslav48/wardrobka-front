import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { WardrobeFilters, WardrobeItem } from '@/types/wardrobe';
import { wardrobeService } from '@/services/wardrobe.service';

interface WardrobeContextValue {
  items: WardrobeItem[];
  /**
   * Count of the wardrobe with no filters applied - QA-41 wants the "N OF
   * total" header to keep the real total even when the narrowing happened
   * server-side (a filter chip), where `items` is already the filtered
   * response and has no total of its own. Captured from the `next` branch of
   * any fetch whose filters are empty (the initial load, and after "clear
   * filters"), and nudged by `removeItem`/`upsertItem` so it does not go
   * stale across a delete/create while a filter is active.
   */
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: WardrobeFilters;
  activeFiltersCount: number;
  applyFilters: (filters: WardrobeFilters) => void;
  clearFilters: () => void;
  refresh: (onSettled?: () => void) => void;
  removeItem: (id: number) => void;
  upsertItem: (item: WardrobeItem) => void;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

function hasNoActiveFilters(filters: WardrobeFilters): boolean {
  return Object.values(filters).every((v) => v === undefined || v === null);
}

export function WardrobeProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardrobeFilters>({});

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null,
  ).length;

  const fetchItems = useCallback(
    (activeFilters: WardrobeFilters, onSettled?: () => void) => {
      setIsLoading(true);
      setError(null);
      const sub = wardrobeService.getItems(activeFilters).subscribe({
        next: (data) => {
          setItems(data);
          if (hasNoActiveFilters(activeFilters)) setTotal(data.length);
          setIsLoading(false);
          onSettled?.();
        },
        error: () => {
          setError('Failed to load wardrobe items.');
          setIsLoading(false);
          onSettled?.();
        },
      });
      return () => sub.unsubscribe();
    },
    [],
  );

  useEffect(() => {
    return fetchItems(filters);
  }, [filters, fetchItems]);

  const applyFilters = (next: WardrobeFilters) => setFilters(next);

  const clearFilters = () => setFilters({});

  const refresh = (onSettled?: () => void) => fetchItems(filters, onSettled);

  const removeItem = (id: number) => {
    if (items.some((item) => item.id === id)) setTotal((prev) => Math.max(0, prev - 1));
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const upsertItem = (updated: WardrobeItem) => {
    if (!items.some((item) => item.id === updated.id)) setTotal((prev) => prev + 1);
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  };

  return (
    <WardrobeContext.Provider
      value={{
        items,
        total,
        isLoading,
        error,
        filters,
        activeFiltersCount,
        applyFilters,
        clearFilters,
        refresh,
        removeItem,
        upsertItem,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe(): WardrobeContextValue {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error('useWardrobe must be used within WardrobeProvider');
  return ctx;
}

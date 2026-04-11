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
  isLoading: boolean;
  error: string | null;
  filters: WardrobeFilters;
  activeFiltersCount: number;
  applyFilters: (filters: WardrobeFilters) => void;
  clearFilters: () => void;
  refresh: () => void;
  removeItem: (id: number) => void;
  upsertItem: (item: WardrobeItem) => void;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardrobeFilters>({});

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null,
  ).length;

  const fetchItems = useCallback((activeFilters: WardrobeFilters) => {
    setIsLoading(true);
    setError(null);
    const sub = wardrobeService.getItems(activeFilters).subscribe({
      next: (data) => {
        setItems(data);
        setIsLoading(false);
      },
      error: () => {
        setError('Failed to load wardrobe items.');
        setIsLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    return fetchItems(filters);
  }, [filters, fetchItems]);

  const applyFilters = (next: WardrobeFilters) => setFilters(next);

  const clearFilters = () => setFilters({});

  const refresh = () => fetchItems(filters);

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const upsertItem = (updated: WardrobeItem) =>
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });

  return (
    <WardrobeContext.Provider
      value={{
        items,
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

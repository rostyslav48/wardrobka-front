export interface OutfitLog {
  id: string;
  date: string; // YYYY-MM-DD
  wardrobeItemIds: number[];
  notes: string | null;
  createdAt: string;
}

export interface OutfitLogPayload {
  date: string;
  wardrobeItemIds: number[];
  notes?: string;
}

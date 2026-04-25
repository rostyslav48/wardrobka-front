export interface OutfitLog {
  id: string;
  date: number; // Unix timestamp (seconds)
  wardrobeItemIds: number[];
  notes: string | null;
  createdAt: string;
}

export interface OutfitLogPayload {
  date: number; // Unix timestamp (seconds)
  wardrobeItemIds: number[];
  notes?: string;
}

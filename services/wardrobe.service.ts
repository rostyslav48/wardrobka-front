import { Observable } from 'rxjs';
import { httpService } from '@/services/http.service';
import { WardrobeFilters, WardrobeItem } from '@/types/wardrobe';
import { AnalyzedItemAttributes } from '@/components/pages/app/items/itemForm';

export const wardrobeService = {
  getItems(filters?: WardrobeFilters): Observable<WardrobeItem[]> {
    return httpService.get<WardrobeItem[]>('wardrobe', filters as Record<string, unknown>);
  },

  getItem(id: number): Observable<WardrobeItem> {
    return httpService.get<WardrobeItem>(`wardrobe/${id}`);
  },

  createItem(formData: FormData): Observable<WardrobeItem> {
    return httpService.post<WardrobeItem>('wardrobe', formData);
  },

  updateItem(id: number, formData: FormData): Observable<WardrobeItem> {
    return httpService.patch<WardrobeItem>(`wardrobe/${id}`, formData);
  },

  deleteItem(id: number): Observable<void> {
    return httpService.delete<void>(`wardrobe/${id}`);
  },

  analyzeImage(formData: FormData): Observable<AnalyzedItemAttributes> {
    return httpService.post<AnalyzedItemAttributes>('wardrobe/analyze-image', formData);
  },
};

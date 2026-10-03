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

  /**
   * "Generate again" for an item whose product-image job failed. Re-runs from
   * the original the backend still holds; answers 409 with
   * `IMAGE_ORIGINAL_EXPIRED` when that original is gone.
   */
  retryImageGeneration(id: number): Observable<WardrobeItem> {
    return httpService.post<WardrobeItem>(`wardrobe/${id}/generate-image`, {});
  },

  deleteItem(id: number): Observable<void> {
    return httpService.delete<void>(`wardrobe/${id}`);
  },

  analyzeImage(formData: FormData): Observable<AnalyzedItemAttributes> {
    return httpService.post<AnalyzedItemAttributes>('wardrobe/analyze-image', formData);
  },
};

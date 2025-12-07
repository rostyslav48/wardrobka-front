import { catchError, map, Observable, throwError } from 'rxjs';
import { ajax } from 'rxjs/internal/ajax/ajax';
import { apiBaseUrl } from '@/config';
import { AjaxError } from 'rxjs/internal/ajax/errors';

export interface ApiError extends AjaxError {
  handled: boolean;
}

const defaultHeaders: { [key: string]: string } = {};

export const httpService = {
  post<T>(path: string, body: unknown): Observable<T> {
    return ajax.post(`${apiBaseUrl}/${path}`, body, defaultHeaders).pipe(
      map((res) => res.response as T),
      catchError((e) => throwError(() => e as ApiError)),
    );
  },

  addDefaultHeader(key: string, value: string): void {
    defaultHeaders[key] = value;
  },

  removeDefaultHeader(key: string): void {
    delete defaultHeaders[key];
  },
};

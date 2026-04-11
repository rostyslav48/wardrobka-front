import { catchError, map, Observable, throwError } from 'rxjs';
import { ajax } from 'rxjs/internal/ajax/ajax';
import { apiBaseUrl } from '@/config';
import { AjaxError } from 'rxjs/internal/ajax/errors';

export interface ApiError extends AjaxError {
  handled: boolean;
}

const defaultHeaders: { [key: string]: string } = {};

export const httpService = {
  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    const query = params ? serializeParams(params) : '';
    const url = query
      ? `${apiBaseUrl}/${path}?${query}`
      : `${apiBaseUrl}/${path}`;
    return ajax.get(url, defaultHeaders).pipe(
      map((res) => res.response as T),
      catchError((e) => throwError(() => e as ApiError)),
    );
  },

  post<T>(path: string, body: unknown): Observable<T> {
    return ajax.post(`${apiBaseUrl}/${path}`, body, defaultHeaders).pipe(
      map((res) => res.response as T),
      catchError((e) => throwError(() => e as ApiError)),
    );
  },

  patch<T>(path: string, body: unknown): Observable<T> {
    return ajax.patch(`${apiBaseUrl}/${path}`, body, defaultHeaders).pipe(
      map((res) => res.response as T),
      catchError((e) => throwError(() => e as ApiError)),
    );
  },

  delete<T>(path: string): Observable<T> {
    return ajax.delete(`${apiBaseUrl}/${path}`, defaultHeaders).pipe(
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

function serializeParams(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

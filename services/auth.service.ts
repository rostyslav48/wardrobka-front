import { Observable } from 'rxjs';
import { httpService } from '@/services/http.service';

export interface UserData {
  name: string;
  email: string;
  accessToken: string;
  id: number;
}

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  city: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  city?: string | null;
}

export const AuthApiService = {
  login(email: string, password: string): Observable<UserData> {
    return httpService.post<UserData>('auth/login', { email, password });
  },

  register(
    email: string,
    password: string,
    name: string,
  ): Observable<UserData> {
    return httpService.post<UserData>('auth/signup', { email, password, name });
  },

  getProfile(): Observable<ProfileData> {
    return httpService.get<ProfileData>('auth/profile');
  },

  updateProfile(data: UpdateProfilePayload): Observable<ProfileData> {
    return httpService.patch<ProfileData>('auth/profile', data);
  },

  addAuthHeader(token: string): void {
    httpService.addDefaultHeader('Authorization', `Bearer ${token}`);
  },

  removeAuthHeader(): void {
    httpService.removeDefaultHeader('Authorization');
  },
};

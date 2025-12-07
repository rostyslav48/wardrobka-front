import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthApiService, UserData } from '@/services/auth.service';
import { from, map, Observable, switchMap } from 'rxjs';

interface AuthProps {
  token: string | null;
  onRegister: (
    email: string,
    password: string,
    name: string,
  ) => Observable<UserData>;
  onLogin: (email: string, password: string) => Observable<UserData>;
  onLogout: () => Observable<void>;
}

const AuthContext = createContext<AuthProps | null>(null);

const TOKEN_KEY = 'accessToken';

export const useAuth = (): AuthProps => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    from(SecureStore.getItemAsync(TOKEN_KEY)).subscribe((storedToken) => {
      if (storedToken) {
        setToken(storedToken);
        AuthApiService.addAuthHeader(storedToken);
      }
    });
  }, []);

  const register = (
    email: string,
    password: string,
    name: string,
  ): Observable<UserData> => {
    return AuthApiService.register(email, password, name).pipe(
      switchMap((userData) => {
        setToken(userData.accessToken);
        AuthApiService.addAuthHeader(userData.accessToken);

        return from(
          SecureStore.setItemAsync(TOKEN_KEY, userData.accessToken),
        ).pipe(map(() => userData));
      }),
    );
  };

  const login = (email: string, password: string): Observable<UserData> => {
    return AuthApiService.login(email, password).pipe(
      switchMap((userData) => {
        setToken(userData.accessToken);
        AuthApiService.addAuthHeader(userData.accessToken);

        return from(
          SecureStore.setItemAsync(TOKEN_KEY, userData.accessToken),
        ).pipe(map(() => userData));
      }),
    );
  };

  const logout = (): Observable<void> => {
    setToken(null);
    AuthApiService.removeAuthHeader();

    return from(SecureStore.deleteItemAsync(TOKEN_KEY));
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    token,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

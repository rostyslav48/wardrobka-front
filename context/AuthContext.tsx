import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthApiService, UserData } from '@/services/auth.service';
import { forkJoin, from, map, Observable, switchMap } from 'rxjs';

interface AuthProps {
  token: string | null;
  userData: UserData | null;
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
const USER_DATA_KEY = 'userData';

export const useAuth = (): AuthProps => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    forkJoin({
      storedToken: from(SecureStore.getItemAsync(TOKEN_KEY)),
      storedUser: from(SecureStore.getItemAsync(USER_DATA_KEY)),
    }).subscribe(({ storedToken, storedUser }) => {
      if (storedToken) {
        setToken(storedToken);
        AuthApiService.addAuthHeader(storedToken);
      }
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser) as UserData);
        } catch {}
      }
    });
  }, []);

  const persistUser = (ud: UserData): Observable<UserData> =>
    forkJoin([
      from(SecureStore.setItemAsync(TOKEN_KEY, ud.accessToken)),
      from(SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(ud))),
    ]).pipe(map(() => ud));

  const register = (
    email: string,
    password: string,
    name: string,
  ): Observable<UserData> =>
    AuthApiService.register(email, password, name).pipe(
      switchMap((ud) => {
        setToken(ud.accessToken);
        setUserData(ud);
        AuthApiService.addAuthHeader(ud.accessToken);
        return persistUser(ud);
      }),
    );

  const login = (email: string, password: string): Observable<UserData> =>
    AuthApiService.login(email, password).pipe(
      switchMap((ud) => {
        setToken(ud.accessToken);
        setUserData(ud);
        AuthApiService.addAuthHeader(ud.accessToken);
        return persistUser(ud);
      }),
    );

  const logout = (): Observable<void> => {
    setToken(null);
    setUserData(null);
    AuthApiService.removeAuthHeader();
    return forkJoin([
      from(SecureStore.deleteItemAsync(TOKEN_KEY)),
      from(SecureStore.deleteItemAsync(USER_DATA_KEY)),
    ]).pipe(map(() => undefined));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userData,
        onRegister: register,
        onLogin: login,
        onLogout: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

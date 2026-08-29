import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthApiService, UserData } from '@/services/auth.service';
import { forkJoin, from, map, Observable, switchMap } from 'rxjs';

// expo-secure-store has no web implementation — SecureStore.getValueWithKeyAsync
// throws on web (BUG-F02). Fall back to localStorage there.
const Storage =
  Platform.OS === 'web'
    ? {
        getItemAsync: async (key: string) =>
          typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
        setItemAsync: async (key: string, value: string) => {
          if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        },
        deleteItemAsync: async (key: string) => {
          if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        },
      }
    : SecureStore;

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
      storedToken: from(Storage.getItemAsync(TOKEN_KEY)),
      storedUser: from(Storage.getItemAsync(USER_DATA_KEY)),
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
      from(Storage.setItemAsync(TOKEN_KEY, ud.accessToken)),
      from(Storage.setItemAsync(USER_DATA_KEY, JSON.stringify(ud))),
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
      from(Storage.deleteItemAsync(TOKEN_KEY)),
      from(Storage.deleteItemAsync(USER_DATA_KEY)),
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

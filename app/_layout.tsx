import { Theme, ThemeProvider } from 'expo-router/react-navigation';
import { Slot } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { Alert, LogBox, Platform } from 'react-native';
import { ModalProvider } from '@/context/ModalContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/layout';

// Maestro runs (EXPO_PUBLIC_E2E=1): dev-only LogBox toasts sit over the tab
// bar, so a tap meant for a tab opens the debugger instead.
if (process.env.EXPO_PUBLIC_E2E) LogBox.ignoreAllLogs();

// The app ships one dark palette (theme/colors.ts) and has no light theme
// (redesign-spec.md 7.2: "Light theme - does not exist and must not be
// invented"). The previous `colorScheme === 'dark' ? DarkTheme : DefaultTheme`
// branch off the OS/browser scheme setting painted light nav chrome on the
// web build's first frame (the web-only hook it read from returned a light
// default until hydration by design) and permanently on a device set to
// light mode. `fonts` puts React Navigation's own text (headers, tab labels)
// on the app's one family, `fontFamily.body`.
const navigationTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.error,
  },
  fonts: {
    regular: { fontFamily: fontFamily.body, fontWeight: '400' },
    medium: { fontFamily: fontFamily.body, fontWeight: '500' },
    bold: { fontFamily: fontFamily.body, fontWeight: '600' },
    heavy: { fontFamily: fontFamily.body, fontWeight: '700' },
  },
};

export default function RootLayout() {
  ErrorUtils.setGlobalHandler((error) => {
    if (!error.handled) {
      Alert.alert(error.message);
    }
  });

  return (
    <ThemeProvider value={navigationTheme}>
      {/* expo-router's Head needs a handoff `origin` in the config on native
          (Expo 57) and throws without one; the title only matters on web. */}
      {Platform.OS === 'web' && (
        <Head>
          <title>Wardrobe Assistant</title>
        </Head>
      )}
      <AuthProvider>
        <ModalProvider>
          <Slot />
          <StatusBar style="light" />
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

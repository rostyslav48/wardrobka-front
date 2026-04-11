import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { WardrobeProvider } from '@/context/WardrobeContext';

export default function AuthLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <WardrobeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/new" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
      </Stack>
    </WardrobeProvider>
  );
}

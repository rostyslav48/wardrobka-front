import { Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import UiButton from '@/components/ui/UiButton';
import { useAuth } from '@/context/AuthContext';
import { styles } from './styles';

export default function SignOutSection() {
  const { onLogout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign out of Wardropka?',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            onLogout().subscribe({
              complete: () => router.replace('/(auth)/login'),
            });
          },
        },
      ],
    );
  };

  return (
    <UiButton secondary onPress={handleSignOut}>
      <Text style={styles.signOutText}>Sign out</Text>
    </UiButton>
  );
}

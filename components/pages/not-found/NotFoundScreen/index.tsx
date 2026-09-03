import { Stack, router } from 'expo-router';
import { Text, View } from 'react-native';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiButton from '@/components/ui/UiButton';
import { styles } from './styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <UiPage topInset={0}>
        <View style={styles.container}>
          <UiTitle style={styles.title}>This screen does not exist.</UiTitle>
          <UiButton
            secondary
            onPress={() => router.replace('/')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Go to home screen!</Text>
          </UiButton>
        </View>
      </UiPage>
    </>
  );
}

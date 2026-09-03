import { Text, View } from 'react-native';
import { router } from 'expo-router';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiButton from '@/components/ui/UiButton';
import { styles } from './styles';

export default function ForgotPasswordScreen() {
  return (
    <UiPage topInset={0}>
      <View style={styles.container}>
        <UiTitle sizeL style={styles.title} testID="forgot-password-heading">
          Forgot Password?
        </UiTitle>
        <Text style={styles.body}>
          Self-service password reset isn&apos;t available yet. Contact
          support to regain access to your account.
        </Text>
        <UiButton
          onPress={() => router.back()}
          style={styles.button}
          testID="forgot-password-submit-button"
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </UiButton>
      </View>
    </UiPage>
  );
}

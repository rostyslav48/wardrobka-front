import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiButton from '@/components/ui/UiButton';
import { colors } from '@/theme/colors';

export default function ForgotPassword() {
  return (
    <UiPage indented={false}>
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

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  body: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  button: {
    marginTop: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

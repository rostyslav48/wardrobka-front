import { Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { colors } from '@/theme/colors';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ApiError } from '@/services/http.service';
import { Formik } from 'formik';
import UiFormField from '@/components/ui/form/UiFormField';
import UiInput from '@/components/ui/form/UiInput';
import UiError from '@/components/ui/UiError';
import { LoginSchema } from '@/components/pages/login/validators/loginValidation';
import {
  RegisterSchema,
  friendlyAuthError,
} from '@/components/pages/login/validators/registerValidation';
import UiPage from '@/components/ui/UiPage';
import UiButton from '@/components/ui/UiButton';
import UiTitle from '@/components/ui/UiTitle';
import UiKeyboardToolbar from '@/components/ui/UiKeyboardToolbar';
import { styles } from './styles';

// QA-64: how far above the keyboard the focused field is kept. Enough for the
// submit button under the last field (51pt plus the form's 12pt gap) to stay
// in view with it, so on an iPhone SE the Register button is reachable
// without dismissing the keyboard - including when iOS adds its Passwords
// bar, which is part of the keyboard frame the library measures.
const KEYBOARD_BOTTOM_OFFSET = 72;

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  confirmPassword: string;
  name: string;
}

export default function LoginScreen() {
  const { onLogin, onRegister, token } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // QA-64: on a small screen the submit button can be hidden behind the
  // keyboard. Return chains focus through the form and submits on the last
  // field, so the button never has to be reachable to complete the form.
  const nameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (token) {
      router.replace('/(app)/(tabs)');
    }
  }, [token]);

  const login = (email: string, password: string) => {
    return onLogin(email, password).pipe(
      catchError((e: ApiError) => {
        const statusCode = e.response?.statusCode;

        if (statusCode === 401 || statusCode === 404) {
          setErrorMessage('Wrong email or password');
        } else if (statusCode === 400) {
          setErrorMessage(friendlyAuthError(e.response.message));
        } else if (statusCode === 429) {
          setErrorMessage('Too many attempts. Please wait a moment and try again.');
        } else {
          setErrorMessage('Something went wrong, please try again.');
        }
        e.handled = true;

        return throwError(() => e);
      }),
    );
  };

  const register = (email: string, password: string, name: string) => {
    return onRegister(email, password, name).pipe(
      catchError((e: ApiError) => {
        const statusCode = e.response?.statusCode;

        if (statusCode === 400 || statusCode === 409) {
          setErrorMessage(friendlyAuthError(e.response.message));
        } else if (statusCode === 429) {
          setErrorMessage('Too many attempts. Please wait a moment and try again.');
        } else {
          setErrorMessage('Something went wrong, please try again.');
        }
        e.handled = true;

        return throwError(() => e);
      }),
    );
  };

  const onSubmit = async (values: LoginForm | RegisterForm): Promise<void> => {
    const email = values.email.trim();
    const method = isLogin
      ? login(email, values.password)
      : register(email, values.password, (values as RegisterForm).name.trim());

    // QA-66: `login`/`register` have already put the failure in the banner.
    // Re-throwing it out of `onSubmit` only made Formik log "An unhandled
    // error was caught from submitForm()" on every failed attempt. Resolving
    // still ends `isSubmitting`, so the button's loader stops either way.
    try {
      await firstValueFrom(method);
    } catch {
      // handled in login/register above
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
  };

  // A fragment root: `UiKeyboardToolbar` positions itself absolutely against
  // the route's own screen container, next to the page.
  return (
    <>
    <UiPage topInset={0} keyboardBottomOffset={KEYBOARD_BOTTOM_OFFSET}>
      <View style={styles.container}>
        <UiTitle sizeL style={styles.title} testID="login-heading">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </UiTitle>

        <Formik
          enableReinitialize={true}
          onSubmit={onSubmit}
          initialValues={{
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
          }}
          validationSchema={isLogin ? LoginSchema : RegisterSchema}
          validationContext={{ $isLogin: isLogin }}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ handleChange, handleSubmit, values, errors, isSubmitting }) => {
            // QA-19: the server error banner is a separate piece of state from
            // Formik's own field errors, so it needs its own clear-on-change.
            const onFieldChange = (field: keyof RegisterForm) => (value: string) => {
              setErrorMessage('');
              handleChange(field)(value);
            };

            return (
            <View style={styles.formContent}>
              <UiFormField errorMessage={errors.email}>
                <UiInput
                  value={values.email}
                  onChange={onFieldChange('email')}
                  placeholder="Email"
                  testID="login-email-input"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  hasError={!!errors.email}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() =>
                    (isLogin ? passwordInputRef : nameInputRef).current?.focus()
                  }
                />
              </UiFormField>

              {!isLogin && (
                <UiFormField errorMessage={errors.name}>
                  <UiInput
                    ref={nameInputRef}
                    value={values.name}
                    onChange={onFieldChange('name')}
                    placeholder="Name"
                    testID="login-name-input"
                    textContentType="name"
                    autoComplete="name"
                    hasError={!!errors.name}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </UiFormField>
              )}

              <UiFormField errorMessage={errors.password}>
                <UiInput
                  ref={passwordInputRef}
                  value={values.password}
                  onChange={onFieldChange('password')}
                  placeholder="Password"
                  isSecureText={true}
                  testID="login-password-input"
                  // BUG-iOS-02: both Register password fields are
                  // `newPassword`, so iOS puts its Strong Password cover on
                  // them rather than on the name field.
                  textContentType={isLogin ? 'password' : 'newPassword'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  hasError={!!errors.password}
                  returnKeyType={isLogin ? 'done' : 'next'}
                  blurOnSubmit={isLogin}
                  onSubmitEditing={
                    isLogin
                      ? () => handleSubmit()
                      : () => confirmPasswordInputRef.current?.focus()
                  }
                />
              </UiFormField>

              {!isLogin && (
                <>
                  <UiFormField errorMessage={errors.confirmPassword}>
                    <UiInput
                      ref={confirmPasswordInputRef}
                      value={values.confirmPassword}
                      onChange={onFieldChange('confirmPassword')}
                      placeholder="Confirm password"
                      isSecureText={true}
                      testID="login-confirm-password-input"
                      textContentType="newPassword"
                      autoComplete="new-password"
                      hasError={!!errors.confirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={() => handleSubmit()}
                    />
                  </UiFormField>
                </>
              )}

              {errorMessage ? <UiError errorMessage={errorMessage} /> : null}

              <UiButton
                onPress={() => {
                  handleSubmit();
                }}
                enableLoader={isSubmitting}
                testID="login-submit-button"
              >
                <Text style={styles.buttonText}>
                  {isLogin ? 'Login' : 'Register'}
                </Text>
              </UiButton>
            </View>
            );
          }}
        </Formik>

        <UiButton
          onPress={switchMode}
          secondary
          style={styles.switchButton}
          testID="login-switch-mode-link"
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </Text>
        </UiButton>
        {/* QA-20: no support address and no password reset exist yet, so
            "Forgot Password?" was a dead end ("Contact support" with no way
            to actually contact anyone). Hiding the entry point until a real
            reset flow exists, per the finding's second option. */}
      </View>
    </UiPage>
    <UiKeyboardToolbar />
    </>
  );
}

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors } from '@/theme/colors';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '@/services/http.service';
import { Formik } from 'formik';
import UiFormField from '@/components/ui/form/UiFormField';
import UiInput from '@/components/ui/form/UiInput';
import UiError from '@/components/ui/UiError';
import { LoginSchema } from '@/components/pages/login/validators/loginValidation';
import { RegisterSchema } from '@/components/pages/login/validators/registerValidation';
import UiPage from '@/components/ui/UiPage';
import UiButton from '@/components/ui/UiButton';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  confirmPassword: string;
  name: string;
}

export default function Login() {
  const { onLogin, onRegister, token } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      router.replace('/(app)/(tabs)');
    }
  }, [token]);

  const login = (email: string, password: string) => {
    onLogin(email, password)
      .pipe(
        catchError((e: ApiError) => {
          const statusCode = e.response.statusCode;

          if (statusCode === 401 || statusCode === 404) {
            setErrorMessage('Wrong email or password');
            e.handled = true;
          } else if (statusCode === 400) {
            setErrorMessage(e.response.message);
            e.handled = true;
          }

          return throwError(() => e);
        }),
      )
      .subscribe();
  };

  const register = (email: string, password: string, name: string) => {
    onRegister(email, password, name)
      .pipe(
        catchError((e: ApiError) => {
          const statusCode = e.response.statusCode;

          if (statusCode === 400 || statusCode === 409) {
            setErrorMessage(e.response.message);
            e.handled = true;
          }

          return throwError(() => e);
        }),
      )
      .subscribe();
  };

  const onSubmit = (values: LoginForm | RegisterForm) => {
    isLogin
      ? login(values.email, values.password)
      : register(values.email, values.password, (values as RegisterForm).name);
  };

  return (
    <UiPage>
      <View style={styles.container}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>

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
          {({ handleChange, handleSubmit, values, errors }) => (
            <View style={styles.formContent}>
              <UiFormField errorMessage={errors.email}>
                <UiInput
                  value={values.email}
                  onChange={handleChange('email')}
                  placeholder="Email"
                />
              </UiFormField>

              {!isLogin && (
                <UiFormField errorMessage={errors.name}>
                  <UiInput
                    value={values.name}
                    onChange={handleChange('name')}
                    placeholder="Name"
                  />
                </UiFormField>
              )}

              <UiFormField errorMessage={errors.password}>
                <UiInput
                  value={values.password}
                  onChange={handleChange('password')}
                  placeholder="Password"
                  isSecureText={true}
                />
              </UiFormField>

              {!isLogin && (
                <>
                  <UiFormField errorMessage={errors.confirmPassword}>
                    <UiInput
                      value={values.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      placeholder="Confirm password"
                      isSecureText={true}
                    />
                  </UiFormField>
                </>
              )}

              {errorMessage && <UiError errorMessage={errorMessage} />}

              <UiButton onPress={() => handleSubmit()}>
                <Text style={styles.buttonText}>
                  {isLogin ? 'Login' : 'Register'}
                </Text>
              </UiButton>
            </View>
          )}
        </Formik>

        <UiButton onPress={() => setIsLogin(!isLogin)} secondary>
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </Text>
        </UiButton>

        <TouchableOpacity
          style={{ backgroundColor: colors.secondary }}
        ></TouchableOpacity>
        {isLogin && (
          <TouchableOpacity>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
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
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  formContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    color: colors.highlight,
    fontSize: 14,
    fontWeight: '500',
  },
});
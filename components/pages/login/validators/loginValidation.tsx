import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  // Trimmed so QuickType/autofill's trailing space doesn't read as an
  // invalid address, and so it never reaches the server untrimmed.
  email: Yup.string()
    .trim()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

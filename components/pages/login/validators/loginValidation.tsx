import * as Yup from 'yup';

// Trimmed so QuickType/autofill's trailing space doesn't read as an invalid
// address, and so it never reaches the server untrimmed. Shared with
// RegisterSchema, which layers its own password/name rules on top.
export const emailSchema = Yup.string()
  .trim()
  .email('Invalid email format')
  .required('Email is required');

// QA-22: `min(8)` is a registration rule. Enforcing it on login blocks a
// legacy/short password from ever reaching the server, so login only checks
// for a non-empty value and leaves the rest to the backend.
export const LoginSchema = Yup.object().shape({
  email: emailSchema,
  password: Yup.string().required('Password is required'),
});

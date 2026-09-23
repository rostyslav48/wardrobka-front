import * as Yup from 'yup';
import { LoginSchema } from './loginValidation';

export const RegisterSchema = LoginSchema.shape({
  confirmPassword: Yup.string()
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  // QA-18: mirrors the server's class-validator rules (and profileSchema's
  // own name rule) so a name that is too short/long is rejected here, in
  // friendly copy, instead of round-tripping to the server first.
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
});

// class-validator's raw messages read like "name must be longer than or equal
// to 2 characters" - lower-case field name, "must"/"should" wording. Once
// RegisterSchema mirrors the server's own rules, the client should catch
// these before they round-trip, but a few (unmirrored password rules, a
// backend-only field) can still reach here - QA-18 asks that whatever does
// gets friendly copy instead of the raw class-validator text. Used on both
// the register AND login paths (a malformed-email 400 on login hits the same
// class-validator text), hence the name - not register-specific.
const RAW_VALIDATION_MESSAGE = /^\w+ (must|should)\b/i;

export function friendlyAuthError(message: string): string {
  if (RAW_VALIDATION_MESSAGE.test(message)) {
    return 'Please check your details and try again.';
  }
  return message;
}

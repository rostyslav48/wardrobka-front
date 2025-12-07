import * as Yup from 'yup';
import { LoginSchema } from './loginValidation';

export const RegisterSchema = LoginSchema.shape({
  confirmPassword: Yup.string()
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  name: Yup.string().required('Username is required'),
});

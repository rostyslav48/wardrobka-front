import * as Yup from 'yup';

export const profileSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  city: Yup.string().max(100, 'City must be at most 100 characters').nullable(),
});

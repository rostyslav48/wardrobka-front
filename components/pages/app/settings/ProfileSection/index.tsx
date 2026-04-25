import { Text } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import UiInput from '@/components/ui/form/UiInput';
import UiFormField from '@/components/ui/form/UiFormField';
import UiButton from '@/components/ui/UiButton';
import { ProfileData, UpdateProfilePayload } from '@/services/auth.service';
import { styles } from './styles';

interface Props {
  profile: ProfileData;
  onSave: (
    payload: UpdateProfilePayload,
    onSuccess: () => void,
    onError: () => void,
  ) => void;
}

const schema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  city: Yup.string().max(100, 'City must be at most 100 characters').nullable(),
});

export default function ProfileSection({ profile, onSave }: Props) {
  return (
    <Formik
      initialValues={{ name: profile.name, city: profile.city ?? '' }}
      validationSchema={schema}
      onSubmit={(values, helpers) => {
        const payload: UpdateProfilePayload = {};
        if (values.name !== profile.name) payload.name = values.name;
        if ((values.city || null) !== profile.city)
          payload.city = values.city || null;

        if (Object.keys(payload).length === 0) {
          helpers.setSubmitting(false);
          return;
        }

        onSave(
          payload,
          () => helpers.setSubmitting(false),
          () => helpers.setSubmitting(false),
        );
      }}
    >
      {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
        <>
          <UiFormField errorMessage={touched.name ? errors.name : undefined}>
            <UiInput
              value={values.name}
              onChange={handleChange('name')}
              placeholder="Name"
            />
          </UiFormField>

          <UiFormField>
            <UiInput
              value={profile.email}
              onChange={() => {}}
              placeholder="Email"
              readonly
            />
          </UiFormField>

          <Text style={styles.cityLabel}>
            Used for weather-aware outfit suggestions
          </Text>
          <UiFormField errorMessage={touched.city ? errors.city : undefined}>
            <UiInput
              value={values.city}
              onChange={handleChange('city')}
              placeholder="City (optional)"
            />
          </UiFormField>

          <UiButton
            enableLoader={isSubmitting}
            onPress={() => handleSubmit()}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </UiButton>
        </>
      )}
    </Formik>
  );
}

import { Text, View } from 'react-native';
import { Formik } from 'formik';
import UiInput from '@/components/ui/form/UiInput';
import UiFormField from '@/components/ui/form/UiFormField';
import UiButton from '@/components/ui/UiButton';
import { ProfileData, UpdateProfilePayload } from '@/services/auth.service';
import { profileSchema } from './validators/profileValidation';
import { styles } from './styles';

interface Props {
  profile: ProfileData;
  onSave: (
    payload: UpdateProfilePayload,
    onSuccess: () => void,
    onError: () => void,
  ) => void;
}

export default function ProfileSection({ profile, onSave }: Props) {
  return (
    <Formik
      initialValues={{ name: profile.name, city: profile.city ?? '' }}
      validationSchema={profileSchema}
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
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting,
      }) => (
        <View style={styles.container}>
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

          <UiFormField errorMessage={touched.city ? errors.city : undefined}>
            <UiInput
              value={values.city}
              onChange={handleChange('city')}
              placeholder="City (optional)"
            />
          </UiFormField>

          <UiButton enableLoader={isSubmitting} onPress={() => handleSubmit()}>
            <Text style={styles.saveButtonText}>Save</Text>
          </UiButton>
        </View>
      )}
    </Formik>
  );
}

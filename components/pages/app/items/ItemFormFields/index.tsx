import { Pressable, Switch, Text, View } from 'react-native';
import { FormikErrors } from 'formik';
import { colors } from '@/theme/colors';
import UiFormField from '@/components/ui/form/UiFormField';
import UiInput from '@/components/ui/form/UiInput';
import UiSelect from '@/components/ui/form/UiSelect';
import UiTextArea from '@/components/ui/form/UiTextArea';
import UiTitle from '@/components/ui/UiTitle';
import { ItemStatus } from '@/types/wardrobe';
import {
  FIT_OPTIONS,
  ItemFormValues,
  SEASON_OPTIONS,
  SIZE_OPTIONS,
  STATUS_OPTIONS,
  SWATCHES,
  TYPE_OPTIONS,
} from '@/components/pages/app/items/itemForm';
import { styles } from './styles';

type FieldName = keyof Omit<ItemFormValues, 'generate_image'>;

type Props = {
  values: ItemFormValues;
  errors: FormikErrors<ItemFormValues>;
  onFieldChange: (field: FieldName, value: ItemFormValues[FieldName]) => void;
  nameTestID?: string;
  brandTestID?: string;
  colorSwatchTestID?: (label: string) => string;
};

// The Required / Optional field blocks shared by `item/new` and `item/[id]` -
// the two forms differ only in the photo picker and the generation banner
// around this, and in whether onFieldChange also tracks the field as
// user-edited (new.tsx's analysis-overwrite guard).
export default function ItemFormFields({
  values,
  errors,
  onFieldChange,
  nameTestID,
  brandTestID,
  colorSwatchTestID,
}: Props) {
  return (
    <>
      {/* Spec 4.3's section-eyebrow role names "REQUIRED" among the strings it covers. */}
      <UiTitle style={styles.sectionLabel}>REQUIRED</UiTitle>

      <UiFormField errorMessage={errors.name}>
        <UiInput
          testID={nameTestID}
          value={values.name}
          onChange={(text) => onFieldChange('name', text)}
          placeholder="Item name"
        />
      </UiFormField>

      <UiFormField errorMessage={errors.type}>
        <Text style={styles.fieldLabel}>Type</Text>
        <UiSelect
          options={TYPE_OPTIONS}
          value={values.type || undefined}
          onChange={(v) => onFieldChange('type', v ?? '')}
          required
          horizontal
        />
      </UiFormField>

      <UiFormField errorMessage={errors.color}>
        <Text style={styles.fieldLabel}>Colour</Text>
        <View style={styles.swatchRow}>
          {SWATCHES.map(({ label, hex }) => (
            <View
              key={label}
              style={[styles.swatchRing, values.color === hex && styles.swatchRing__active]}
            >
              <Pressable
                testID={colorSwatchTestID?.(label)}
                style={[styles.swatch, { backgroundColor: hex }]}
                onPress={() => onFieldChange('color', values.color === hex ? '' : hex)}
              />
            </View>
          ))}
        </View>
      </UiFormField>

      <UiFormField errorMessage={errors.season}>
        <Text style={styles.fieldLabel}>Season</Text>
        <UiSelect
          options={SEASON_OPTIONS}
          value={values.season || undefined}
          onChange={(v) => onFieldChange('season', v ?? '')}
          required
        />
      </UiFormField>

      <UiFormField errorMessage={errors.status}>
        <Text style={styles.fieldLabel}>Status</Text>
        <UiSelect
          options={STATUS_OPTIONS}
          value={values.status}
          onChange={(v) => onFieldChange('status', v ?? ItemStatus.Active)}
          required
        />
      </UiFormField>

      <UiTitle style={[styles.sectionLabel, styles.optionalLabel]}>OPTIONAL</UiTitle>

      <UiFormField>
        <UiInput
          testID={brandTestID}
          value={values.brand}
          onChange={(text) => onFieldChange('brand', text)}
          placeholder="Brand"
        />
      </UiFormField>

      <UiFormField>
        <UiInput
          value={values.material}
          onChange={(text) => onFieldChange('material', text)}
          placeholder="Material"
        />
      </UiFormField>

      <UiFormField>
        <UiInput
          value={values.style}
          onChange={(text) => onFieldChange('style', text)}
          placeholder="Style (e.g. casual, formal)"
        />
      </UiFormField>

      <UiFormField>
        <Text style={styles.fieldLabel}>Fit type</Text>
        <UiSelect
          options={FIT_OPTIONS}
          value={values.fit_type || undefined}
          onChange={(v) => onFieldChange('fit_type', v ?? '')}
        />
      </UiFormField>

      <UiFormField>
        <Text style={styles.fieldLabel}>Size</Text>
        <UiSelect
          options={SIZE_OPTIONS}
          value={values.size || undefined}
          onChange={(v) => onFieldChange('size', v ?? '')}
        />
      </UiFormField>

      <UiFormField>
        <UiTextArea
          value={values.description}
          onChange={(text) => onFieldChange('description', text)}
          placeholder="Description"
        />
      </UiFormField>

      {/* Not a heading - the settings-row label role (14/400). */}
      <View style={styles.favouriteRow}>
        <Text style={styles.favouriteLabel}>Favourite</Text>
        <Switch
          value={values.favourite}
          onValueChange={(v) => onFieldChange('favourite', v)}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.accentText}
        />
      </View>
    </>
  );
}

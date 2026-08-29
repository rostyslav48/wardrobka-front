import { UiButton, UiFormField, UiInput, UiSelect, UiTitle, UiPopup } from 'wardrobe-assistant-front';

// UiPopup is the body of a bottom sheet: marginTop:'auto' inside the modal's
// scroll view. The cell supplies that column so the sheet has something to
// bottom-align against.
const sheet: React.CSSProperties = {
  background: 'var(--wa-background)',
  width: 360,
  height: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  overflow: 'hidden',
};
const noop = () => {};

export const FullScreen = () => (
  <div style={sheet}>
    <UiPopup title="Add item">
      <UiFormField>
        <UiInput value="Navy wool coat" onChange={noop} placeholder="Item name" />
      </UiFormField>
      <div style={{ height: 16 }} />
      <UiSelect
        options={[
          { label: 'Winter', value: 'winter' },
          { label: 'Spring', value: 'spring' },
          { label: 'Summer', value: 'summer' },
          { label: 'Autumn', value: 'autumn' },
        ]}
        value="winter"
        onChange={noop}
      />
      <div style={{ height: 24 }} />
      <UiButton onPress={noop}>
        <UiTitle sizeS style={{ color: 'var(--wa-accent-text)' }}>Save item</UiTitle>
      </UiButton>
    </UiPopup>
  </div>
);

export const Compact = () => (
  <div style={sheet}>
    <UiPopup title="Remove this outfit?" fullScreen={false}>
      <UiTitle sizeS style={{ color: 'var(--wa-text-secondary)' }}>
        The suggestion goes, the items stay in your wardrobe.
      </UiTitle>
      <div style={{ height: 20 }} />
      <UiButton onPress={noop}>
        <UiTitle sizeS style={{ color: 'var(--wa-accent-text)' }}>Remove</UiTitle>
      </UiButton>
      <div style={{ height: 12, paddingBottom: 20 }} />
    </UiPopup>
  </div>
);

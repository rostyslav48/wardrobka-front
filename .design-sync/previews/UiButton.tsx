import { UiButton, UiTitle } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = {
  background: 'var(--wa-background)',
  padding: 20,
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};
// UiButton does not colour its label - the caller does. Primary sits on the
// accent fill, so its label needs the inverted text token.
const onAccent: React.CSSProperties = { color: 'var(--wa-accent-text)' };
const noop = () => {};

export const Primary = () => (
  <div style={frame}>
    <UiButton onPress={noop}>
      <UiTitle sizeS style={onAccent}>Add to wardrobe</UiTitle>
    </UiButton>
  </div>
);

export const Secondary = () => (
  <div style={frame}>
    <UiButton secondary onPress={noop}>
      <UiTitle sizeS>Cancel</UiTitle>
    </UiButton>
  </div>
);

export const Loading = () => (
  <div style={frame}>
    <UiButton enableLoader onPress={noop}>
      <UiTitle sizeS style={onAccent}>Saving</UiTitle>
    </UiButton>
  </div>
);

export const Pair = () => (
  <div style={{ ...frame, flexDirection: 'row' }}>
    <UiButton secondary style={{ flex: 1 }} onPress={noop}>
      <UiTitle sizeS>Discard</UiTitle>
    </UiButton>
    <UiButton style={{ flex: 1 }} onPress={noop}>
      <UiTitle sizeS style={onAccent}>Save outfit</UiTitle>
    </UiButton>
  </div>
);

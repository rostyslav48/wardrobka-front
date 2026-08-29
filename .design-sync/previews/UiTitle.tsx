import { UiTitle } from 'wardrobe-assistant-front';

// Preview cards paint their own white body, so every cell re-establishes the
// app's dark ground - otherwise --wa-text-primary text renders white-on-white.
const frame: React.CSSProperties = {
  background: 'var(--wa-background)',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

export const Sizes = () => (
  <div style={frame}>
    <UiTitle sizeL>Your wardrobe</UiTitle>
    <UiTitle sizeM>Recently worn</UiTitle>
    <UiTitle>Autumn layers</UiTitle>
    <UiTitle sizeS>12 items · 3 outfits</UiTitle>
    <UiTitle sizeXS>Updated 4 minutes ago</UiTitle>
  </div>
);

export const Truncated = () => (
  <div style={{ ...frame, width: 260 }}>
    <UiTitle sizeS numberOfLines={2}>
      A charcoal merino crewneck that goes with almost everything you already own,
      which is the entire reason it earns its drawer space.
    </UiTitle>
  </div>
);

export const Meta = () => (
  <div style={frame}>
    <UiTitle sizeM>Navy wool coat</UiTitle>
    <UiTitle sizeXS style={{ color: 'var(--wa-text-secondary)' }}>
      Outerwear · Winter · Size M
    </UiTitle>
  </div>
);

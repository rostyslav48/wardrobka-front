import { UiButton, UiTitle, UiPage } from 'wardrobe-assistant-front';

// UiPage is the screen-level scroll container - it fills its parent, so the
// cell gives it a phone-sized frame to fill. There is no `indented={false}`
// cell: the prop has no observable effect (see UiPage.prompt.md), so a second
// cell would be a pixel-identical duplicate.
const screen: React.CSSProperties = {
  background: 'var(--wa-background)',
  width: 340,
  height: 400,
  display: 'flex',
  overflow: 'hidden',
  borderTop: '1px dashed var(--wa-border)',
};
const row: React.CSSProperties = {
  padding: '14px 0',
  borderBottom: '1px solid var(--wa-border)',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const items = [
  ['Navy wool coat', 'Outerwear · Winter'],
  ['Charcoal merino crewneck', 'Knitwear · Autumn'],
  ['Raw denim straight leg', 'Trousers · All year'],
  ['White oxford shirt', 'Shirts · All year'],
];

export const Indented = () => (
  <div style={screen}>
    <UiPage>
      <UiTitle sizeL>Wardrobe</UiTitle>
      {items.map(([name, meta]) => (
        <div key={name} style={row}>
          <UiTitle sizeS>{name}</UiTitle>
          <UiTitle sizeXS style={{ color: 'var(--wa-text-secondary)' }}>{meta}</UiTitle>
        </div>
      ))}
    </UiPage>
  </div>
);

export const WithAction = () => (
  <div style={screen}>
    <UiPage>
      <UiTitle sizeL>New outfit</UiTitle>
      <UiTitle sizeXS style={{ color: 'var(--wa-text-secondary)', marginBottom: 20 }}>
        Pick the pieces you want the assistant to work from.
      </UiTitle>
      <UiButton onPress={() => {}}>
        <UiTitle sizeS style={{ color: 'var(--wa-accent-text)' }}>Choose items</UiTitle>
      </UiButton>
    </UiPage>
  </div>
);

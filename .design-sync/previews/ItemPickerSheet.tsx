import { ItemPickerSheet } from 'wardrobe-assistant-front';

// Thumbnails are inline SVG data URIs so the cards never depend on the network
// - a remote URL renders as the placeholder glyph in the headless render check.
const swatch = (hex: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23${hex}'/%3E%3C/svg%3E`;

const frame: React.CSSProperties = {
  background: 'var(--wa-background)',
  width: 380,
  display: 'flex',
  flexDirection: 'column',
};
const noop = () => {};

const items = [
  { id: 1, name: 'Navy wool coat', img_url: swatch('27334d') },
  { id: 2, name: 'Charcoal crewneck', img_url: swatch('3a3a3a') },
  { id: 3, name: 'Raw denim', img_url: swatch('2b3f57') },
  { id: 4, name: 'White oxford', img_url: swatch('d8d8d2') },
  { id: 5, name: 'Olive field jacket', img_url: swatch('49512f') },
  { id: 6, name: 'Grey scarf' },
];

export const Picking = () => (
  <div style={frame}>
    <ItemPickerSheet items={items} selectedIds={[1, 3]} onConfirm={noop} />
  </div>
);

export const Untouched = () => (
  <div style={frame}>
    <ItemPickerSheet items={items} selectedIds={[]} onConfirm={noop} />
  </div>
);

export const CustomCopy = () => (
  <div style={frame}>
    <ItemPickerSheet
      items={items.slice(0, 3)}
      selectedIds={[2]}
      title="Build an outfit"
      subtitle="The assistant will work from what you pick"
      confirmLabel="Ask the assistant"
      onConfirm={noop}
    />
  </div>
);

export const EmptyWardrobe = () => (
  <div style={frame}>
    <ItemPickerSheet items={[]} selectedIds={[]} onConfirm={noop} />
  </div>
);

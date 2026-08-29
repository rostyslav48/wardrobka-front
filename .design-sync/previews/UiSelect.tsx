import { UiSelect } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };
const noop = () => {};

const seasons = [
  { label: 'Winter', value: 'winter' },
  { label: 'Spring', value: 'spring' },
  { label: 'Summer', value: 'summer' },
  { label: 'Autumn', value: 'autumn' },
];

const types = [
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'Jacket', value: 'jacket' },
  { label: 'Coat', value: 'coat' },
  { label: 'T-shirt', value: 't-shirt' },
  { label: 'Shirt', value: 'shirt' },
  { label: 'Sweater', value: 'sweater' },
  { label: 'Blazer', value: 'blazer' },
];

export const Selected = () => (
  <div style={frame}>
    <UiSelect options={seasons} value="autumn" onChange={noop} />
  </div>
);

export const Empty = () => (
  <div style={frame}>
    <UiSelect options={seasons} value={undefined} onChange={noop} />
  </div>
);

export const Wrapping = () => (
  <div style={frame}>
    <UiSelect options={types} value="coat" onChange={noop} />
  </div>
);

export const Horizontal = () => (
  <div style={frame}>
    <UiSelect options={types} value="jacket" onChange={noop} horizontal />
  </div>
);

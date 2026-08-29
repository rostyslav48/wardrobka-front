import { UiFormField, UiInput, UiTextArea, UiTitle } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };
const noop = () => {};

export const WithInput = () => (
  <div style={frame}>
    <UiFormField>
      <UiInput value="Navy wool coat" onChange={noop} placeholder="Item name" />
    </UiFormField>
  </div>
);

export const WithError = () => (
  <div style={frame}>
    <UiFormField errorMessage="Name is required">
      <UiInput value="" onChange={noop} placeholder="Item name" />
    </UiFormField>
  </div>
);

export const Stacked = () => (
  <div style={{ ...frame, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <UiTitle sizeM>Add an item</UiTitle>
    <UiFormField>
      <UiInput value="Charcoal merino crewneck" onChange={noop} placeholder="Item name" />
    </UiFormField>
    <UiFormField errorMessage="Pick a brand or leave it blank">
      <UiInput value="" onChange={noop} placeholder="Brand" />
    </UiFormField>
    <UiFormField>
      <UiTextArea value="Pills a little at the cuffs." onChange={noop} placeholder="Notes" numberOfLines={3} />
    </UiFormField>
  </div>
);

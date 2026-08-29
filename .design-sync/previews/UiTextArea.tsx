import { UiTextArea } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };
const noop = () => {};

export const Filled = () => (
  <div style={frame}>
    <UiTextArea
      value="Bought in Lisbon, 2023. Runs a size large — wear it over a t-shirt, not a knit."
      onChange={noop}
      placeholder="Notes"
    />
  </div>
);

export const Placeholder = () => (
  <div style={frame}>
    <UiTextArea value="" onChange={noop} placeholder="Anything worth remembering about this piece?" />
  </div>
);

export const Tall = () => (
  <div style={frame}>
    <UiTextArea value="" onChange={noop} placeholder="Describe the outfit you're after" numberOfLines={8} />
  </div>
);

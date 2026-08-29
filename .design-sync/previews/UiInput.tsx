import { UiInput } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };
const noop = () => {};

export const Filled = () => (
  <div style={frame}>
    <UiInput value="Navy wool coat" onChange={noop} placeholder="Item name" />
  </div>
);

export const Placeholder = () => (
  <div style={frame}>
    <UiInput value="" onChange={noop} placeholder="Brand" />
  </div>
);

export const Secure = () => (
  <div style={frame}>
    <UiInput value="correcthorsebattery" onChange={noop} placeholder="Password" isSecureText />
  </div>
);

export const Readonly = () => (
  <div style={frame}>
    <UiInput value="rostyslav@example.com" onChange={noop} placeholder="Email" readonly />
  </div>
);

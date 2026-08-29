import { UiError } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };

export const Message = () => (
  <div style={frame}>
    <UiError errorMessage="That email and password don't match." />
  </div>
);

export const Long = () => (
  <div style={frame}>
    <UiError errorMessage="We couldn't reach the wardrobe service. Check your connection and try again — nothing you entered has been lost." />
  </div>
);

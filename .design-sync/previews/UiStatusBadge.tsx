import { UiStatusBadge } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20 };

export const Active = () => (
  <div style={frame}>
    <UiStatusBadge label="Ready" tone="active" />
  </div>
);

export const Washing = () => (
  <div style={frame}>
    <UiStatusBadge label="Washing" tone="washing" />
  </div>
);

export const Missing = () => (
  <div style={frame}>
    <UiStatusBadge label="Missing" tone="missing" />
  </div>
);

export const NeedRepair = () => (
  <div style={frame}>
    <UiStatusBadge label="Need Repair" tone="needRepair" />
  </div>
);

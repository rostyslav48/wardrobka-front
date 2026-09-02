import { UiSkeletonCard } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 360 };

export const Single = () => (
  <div style={frame}>
    <UiSkeletonCard />
  </div>
);

// What a first load actually renders: three, in the box the real cards will take.
export const LoadingList = () => (
  <div style={frame}>
    <UiSkeletonCard />
    <UiSkeletonCard />
    <UiSkeletonCard />
  </div>
);

import { PromptShortcutChips } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = {
  background: 'var(--wa-background)',
  padding: 20,
  width: 340,
  overflow: 'hidden',
};
const noop = () => {};

const shortcuts = [
  { label: 'Rainy day', prompt: 'What should I wear if it rains today?' },
  { label: 'Office', prompt: 'Put together something for a day of meetings.' },
  { label: 'Dinner', prompt: 'Something smart for dinner out tonight.' },
  { label: 'Weekend', prompt: 'A relaxed weekend outfit, please.' },
];

export const Row = () => (
  <div style={frame}>
    <PromptShortcutChips shortcuts={shortcuts} onSelect={noop} />
  </div>
);

// The row scrolls rather than wrapping, so a long list overflows the frame edge.
export const Overflowing = () => (
  <div style={frame}>
    <PromptShortcutChips
      shortcuts={[...shortcuts, { label: 'Travel', prompt: 'Pack me three days of outfits.' }]}
      onSelect={noop}
    />
  </div>
);

export const Single = () => (
  <div style={frame}>
    <PromptShortcutChips shortcuts={shortcuts.slice(0, 1)} onSelect={noop} />
  </div>
);

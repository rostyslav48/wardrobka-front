import { OutfitSuggestionCard } from 'wardrobe-assistant-front';

const swatch = (hex: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23${hex}'/%3E%3C/svg%3E`;

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 360 };
const noop = () => {};

const base = {
  id: 'sug_1',
  sessionId: 'sess_1',
  sessionTopic: 'Rainy Thursday, client meeting',
  summary:
    'The navy coat over the charcoal crewneck, raw denim, and the leather derbies — warm enough for the walk, sharp enough for the room.',
  wardrobeItemIds: [1, 2, 3, 4],
  createdAt: new Date().toISOString(),
};

export const Full = () => (
  <div style={frame}>
    <OutfitSuggestionCard
      suggestion={base}
      thumbnails={[swatch('27334d'), swatch('3a3a3a'), swatch('2b3f57'), swatch('4a3423')]}
      itemNames={['Navy wool coat', 'Charcoal crewneck', 'Raw denim', 'Leather derbies']}
      onPress={noop}
      onDelete={noop}
    />
  </div>
);

export const Overflow = () => (
  <div style={frame}>
    <OutfitSuggestionCard
      suggestion={{
        ...base,
        id: 'sug_2',
        sessionTopic: 'Packing for Lisbon',
        summary: 'Six pieces that cover the whole trip and still fit in a carry-on.',
        wardrobeItemIds: [1, 2, 3, 4, 5, 6],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }}
      thumbnails={[
        swatch('27334d'), swatch('3a3a3a'), swatch('2b3f57'),
        swatch('d8d8d2'), swatch('49512f'), swatch('4a3423'),
      ]}
      itemNames={['Navy wool coat', 'Charcoal crewneck', 'Raw denim', 'White oxford', 'Olive jacket', 'Derbies']}
      onPress={noop}
      onDelete={noop}
    />
  </div>
);

export const MissingItems = () => (
  <div style={frame}>
    <OutfitSuggestionCard
      suggestion={{
        ...base,
        id: 'sug_3',
        sessionTopic: 'Weekend errands',
        summary: 'Kept deliberately plain — two of these pieces have since left the wardrobe.',
        createdAt: '2026-07-14T09:00:00.000Z',
      }}
      thumbnails={[swatch('49512f'), null, swatch('2b3f57'), undefined]}
      itemNames={['Olive field jacket', null, 'Raw denim', null]}
      onPress={noop}
      onDelete={noop}
    />
  </div>
);

export const ReadOnly = () => (
  <div style={frame}>
    <OutfitSuggestionCard
      suggestion={{ ...base, id: 'sug_4', sessionTopic: '' }}
      thumbnails={[swatch('27334d'), swatch('3a3a3a')]}
      itemNames={['Navy wool coat', 'Charcoal crewneck']}
      onPress={noop}
    />
  </div>
);

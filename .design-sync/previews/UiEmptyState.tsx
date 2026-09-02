import { UiEmptyState } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };

export const NoSuggestions = () => (
  <div style={frame}>
    <UiEmptyState
      icon="sparkles"
      title="No suggestions yet"
      subtitle="Start a chat below to get personalised outfit ideas from your wardrobe."
    />
  </div>
);

export const NoItems = () => (
  <div style={frame}>
    <UiEmptyState
      icon="tshirt.fill"
      title="Your wardrobe is empty"
      subtitle="Add a few pieces and the assistant can start putting outfits together."
    />
  </div>
);

export const NoLogEntries = () => (
  <div style={frame}>
    <UiEmptyState
      icon="calendar"
      title="Nothing logged yet"
      subtitle="Log what you wore and the outfit history builds itself."
    />
  </div>
);

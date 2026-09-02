import { QuickChatInput } from 'wardrobe-assistant-front';

const frame: React.CSSProperties = { background: 'var(--wa-background)', padding: 20, width: 340 };
const noop = () => {};

// Blank: the send button is dimmed, because there is nothing to send.
export const Empty = () => (
  <div style={frame}>
    <QuickChatInput value="" onChangeText={noop} onSubmit={noop} isLoading={false} />
  </div>
);

export const Filled = () => (
  <div style={frame}>
    <QuickChatInput
      value="What should I wear to a client meeting in the rain?"
      onChangeText={noop}
      onSubmit={noop}
      isLoading={false}
    />
  </div>
);

export const Sending = () => (
  <div style={frame}>
    <QuickChatInput
      value="What should I wear to a client meeting in the rain?"
      onChangeText={noop}
      onSubmit={noop}
      isLoading
    />
  </div>
);

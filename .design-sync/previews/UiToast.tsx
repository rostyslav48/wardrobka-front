import { useEffect, useRef } from 'react';
import { UiToast } from 'wardrobe-assistant-front';

// UiToast is position:absolute and imperative: nothing renders until show() is
// called, and it fades itself out after ~2.7s - well before a screenshot lands.
// `style` is applied last in the component's style array, so pinning opacity
// there holds the toast open without touching its animation.
const frame: React.CSSProperties = {
  background: 'var(--wa-background)',
  position: 'relative',
  width: 360,
  height: 110,
};

type Kind = 'success' | 'error';

const Shown = ({ message, type }: { message: string; type: Kind }) => {
  const ref = useRef<{ show: (m: string, t: Kind) => void } | null>(null);
  useEffect(() => {
    ref.current?.show(message, type);
  }, [message, type]);
  return (
    <div style={frame}>
      <UiToast ref={ref} style={{ opacity: 1 }} />
    </div>
  );
};

export const Success = () => <Shown message="Outfit saved" type="success" />;

export const Error = () => <Shown message="Couldn't reach the wardrobe service" type="error" />;

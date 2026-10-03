import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useCalendar } from '@/context/CalendarContext';
import { styles } from './styles';

interface Props {
  /** Surfaces feedback through the Settings screen's shared toast. */
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export default function CalendarSection({ onNotify }: Props) {
  const { status, isLoading, connect, disconnect } = useCalendar();
  const [isBusy, setIsBusy] = useState(false);

  // Mirrors NotificationsSection: nothing renders until the initial fetch
  // (status + occasions) resolves, so the row never flashes a stale state.
  const isReady = !isLoading;
  if (!isReady) return null;

  const handleConnect = async () => {
    setIsBusy(true);
    const { status: nextStatus, cancelled } = await connect();
    setIsBusy(false);
    // QA-03: the user closing the Google sign-in sheet themselves is not an
    // error - only report a failure when a session actually ran and did not
    // end up connected.
    if (cancelled) return;
    onNotify?.(
      nextStatus === 'active'
        ? 'Google Calendar connected'
        : 'Could not connect Google Calendar',
      nextStatus === 'active' ? 'success' : 'error',
    );
  };

  const handleDisconnect = async () => {
    setIsBusy(true);
    await disconnect();
    setIsBusy(false);
    onNotify?.('Google Calendar disconnected', 'success');
  };

  return (
    <View style={styles.container} testID="settings-calendar-row">
      <Text style={styles.sectionTitle}>GOOGLE CALENDAR</Text>

      <View style={styles.row}>
        <Text style={styles.label}>
          {status === 'active' ? 'Connected' : 'Not connected'}
        </Text>
        <Text style={styles.hint}>
          Wardropka reads event titles, times and locations from your primary
          calendar only — never descriptions or guest lists.
        </Text>
        {status === 'revoked' && (
          <Text style={styles.hint}>
            Google revoked access to your calendar. Reconnect to keep getting
            occasion-based outfit suggestions.
          </Text>
        )}
      </View>

      {Platform.OS === 'web' ? (
        <Text style={styles.hint}>
          Connecting Google Calendar is only available in the mobile app.
        </Text>
      ) : status === 'active' ? (
        <Pressable
          style={[styles.button, isBusy && styles.buttonBusy]}
          onPress={handleDisconnect}
          disabled={isBusy}
          hitSlop={8}
        >
          <Text style={styles.buttonText}>
            {isBusy ? 'Disconnecting…' : 'Disconnect'}
          </Text>
        </Pressable>
      ) : (
        // QA-04: nothing changed for the several seconds it takes the OS
        // sign-in sheet to appear, so a second tap landed in that window.
        <Pressable
          style={[styles.button, isBusy && styles.buttonBusy]}
          onPress={handleConnect}
          disabled={isBusy}
          hitSlop={8}
        >
          <Text style={styles.buttonText}>
            {isBusy ? 'Connecting…' : status === 'revoked' ? 'Reconnect' : 'Connect'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Switch, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';
import { useCalendar } from '@/context/CalendarContext';
import { notificationsService } from '@/services/notifications.service';
import {
  DEFAULT_NOTIFICATION_PREFS,
  formatTime,
  NotificationPrefs,
  parseTime,
} from '@/constants/notifications';
import { colors } from '@/theme/colors';
import { styles } from './styles';

interface Props {
  /** Surfaces feedback through the Settings screen's shared toast. */
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

/** Builds a Date carrying the preference time, for the picker's value. */
function timeToDate(time: string): Date {
  const { hour, minute } = parseTime(time);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export default function NotificationsSection({ onNotify }: Props) {
  const { userData } = useAuth();
  const { status: calendarStatus } = useCalendar();

  const [prefs, setPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  );
  const [isReady, setIsReady] = useState(false);
  const [isPermissionBlocked, setIsPermissionBlocked] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [stored, granted] = await Promise.all([
        notificationsService.loadPrefs(),
        notificationsService.hasPermission(),
      ]);
      if (cancelled) return;
      // The preference defaults to enabled, but permission may never have been
      // granted — show the toggle off in that case so tapping it runs the
      // permission flow rather than implying reminders are active.
      setPrefs({ ...stored, enabled: stored.enabled && granted });
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next: NotificationPrefs) => {
      setPrefs(next);
      await notificationsService.savePrefs(next);
      await notificationsService.applyPrefs(
        next,
        userData?.name,
        calendarStatus === 'active',
      );
    },
    [userData?.name, calendarStatus],
  );

  const handleToggle = useCallback(
    async (enabled: boolean) => {
      if (!enabled) {
        await persist({ ...prefs, enabled: false });
        return;
      }

      const granted = await notificationsService.requestPermissions();
      if (!granted) {
        // Revert the toggle and point the user at system settings — we must
        // not re-prompt once the OS has recorded a denial.
        setIsPermissionBlocked(true);
        setPrefs((current) => ({ ...current, enabled: false }));
        onNotify?.(
          'Notifications are blocked in your device settings',
          'error',
        );
        return;
      }

      setIsPermissionBlocked(false);
      await persist({ ...prefs, enabled: true });
      // Best-effort; never blocks enabling (no-ops without an EAS projectId).
      void notificationsService.syncPushToken();
    },
    [prefs, persist, onNotify],
  );

  const handleIncludeOccasionsToggle = useCallback(
    async (includeOccasions: boolean) => {
      await persist({ ...prefs, includeOccasions });
    },
    [prefs, persist],
  );

  const handleTimeChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === 'android') setIsPickerOpen(false);
      if (event.type === 'dismissed' || !date) return;

      void persist({
        ...prefs,
        time: formatTime(date.getHours(), date.getMinutes()),
      });
    },
    [prefs, persist],
  );

  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

      <View style={styles.row}>
        <View style={styles.rowLabel}>
          <Text style={styles.label}>Daily reminder</Text>
          <Text style={styles.hint}>
            A morning nudge to plan your outfit
          </Text>
        </View>
        <Switch
          value={prefs.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.brand }}
          thumbColor={colors.textPrimary}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowLabel}>
          <Text style={styles.label}>
            Mention calendar events in the reminder
          </Text>
          <Text style={styles.hint}>
            Turn off to keep event titles off your lock screen
          </Text>
        </View>
        <Switch
          value={prefs.includeOccasions}
          onValueChange={handleIncludeOccasionsToggle}
          disabled={!prefs.enabled}
          trackColor={{ false: colors.border, true: colors.brand }}
          thumbColor={colors.textPrimary}
        />
      </View>

      {prefs.enabled && (
        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>

          {Platform.OS === 'ios' ? (
            <DateTimePicker
              mode="time"
              display="compact"
              value={timeToDate(prefs.time)}
              onChange={handleTimeChange}
              themeVariant="dark"
            />
          ) : (
            <Pressable onPress={() => setIsPickerOpen(true)} hitSlop={8}>
              <Text style={styles.timeValue}>{prefs.time}</Text>
            </Pressable>
          )}
        </View>
      )}

      {Platform.OS === 'android' && isPickerOpen && (
        <DateTimePicker
          mode="time"
          display="default"
          value={timeToDate(prefs.time)}
          onChange={handleTimeChange}
        />
      )}

      {isPermissionBlocked && (
        <View style={styles.blockedNotice}>
          <Text style={styles.hint}>
            Notifications are turned off for Wardropka. Enable them in your
            device settings to get the daily reminder.
          </Text>
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <Text style={styles.link}>Open device settings</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

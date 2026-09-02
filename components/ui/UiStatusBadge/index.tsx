import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { styles } from './styles';

export type UiStatusBadgeTone = 'active' | 'washing' | 'missing' | 'needRepair';

const TONE_COLOR: Record<UiStatusBadgeTone, string> = {
  active: colors.statusActive,
  washing: colors.statusWashing,
  missing: colors.statusMissing,
  needRepair: colors.statusNeedRepair,
};

const TONE_GROUND: Record<UiStatusBadgeTone, string> = {
  active: colors.statusActiveSoft,
  washing: colors.statusWashingSoft,
  missing: colors.statusMissingSoft,
  needRepair: colors.statusNeedRepairSoft,
};

type Props = {
  label: string;
  tone: UiStatusBadgeTone;
  /** Renders the badge as a `Pressable` instead of a `View`. Omit for a read-only badge. */
  onPress?: () => void;
  testID?: string;
};

export default function UiStatusBadge({ label, tone, onPress, testID }: Props) {
  const badgeStyle = [styles.badge, { backgroundColor: TONE_GROUND[tone] }];
  const textStyle = [styles.label, { color: TONE_COLOR[tone] }];

  if (onPress) {
    return (
      <Pressable style={badgeStyle} onPress={onPress} hitSlop={4} testID={testID}>
        <Text style={textStyle}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={badgeStyle} testID={testID}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

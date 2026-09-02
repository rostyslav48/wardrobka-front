import { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import { styles } from './styles';

interface Props {
  /** Any name `IconSymbol` maps. */
  icon: ComponentProps<typeof IconSymbol>['name'];
  title: string;
  subtitle: string;
  /** Optional tappable action rendered below the subtitle. Provide both or neither. */
  actionLabel?: string;
  onAction?: () => void;
}

export default function UiEmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <IconSymbol name={icon} size={iconSize.xxl} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.action} onPress={onAction} hitSlop={8}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

import { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import { styles } from './styles';

interface Props {
  /** Any name `IconSymbol` maps. */
  icon: ComponentProps<typeof IconSymbol>['name'];
  title: string;
  subtitle: string;
}

export default function UiEmptyState({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <IconSymbol name={icon} size={iconSize.xxl} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

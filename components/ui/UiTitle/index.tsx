import { PropsWithChildren } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { styles } from './styles';

type Props = PropsWithChildren<{
  sizeXS?: boolean;
  sizeS?: boolean;
  sizeM?: boolean;
  sizeL?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}>;

export default function UiTitle({ children, sizeXS, sizeS, sizeM, sizeL, style, numberOfLines }: Props) {
  const sizeStyle =
    sizeXS ? styles.sizeXS :
    sizeS  ? styles.sizeS  :
    sizeM  ? styles.sizeM  :
    sizeL  ? styles.sizeL  :
    styles.sizeDefault;

  return (
    <Text style={[styles.base, sizeStyle, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

import { StyleSheet, Text, View } from 'react-native';
import UiPopup from '@/components/ui/UiPopup';

export default function FiltersPopup() {
  return (
    <UiPopup fullScreen={false} title={'Filters'}>
      <View style={styles.container}>
        <Text>These are filters</Text>
      </View>
    </UiPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
});

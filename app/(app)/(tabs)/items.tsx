import UiPage from '@/components/ui/UiPage';
import { View } from 'react-native';
import SearchBar from '@/components/pages/app/items/SearchBar';
import { useModal } from '@/context/ModalContext';
import FiltersPopup from '@/components/pages/app/items/FiltersPopup';

export default function Items() {
  const { show, hide } = useModal();

  const openFiltersModal = () => {
    show({
      content: <FiltersPopup />,
    });
  };

  return (
    <UiPage>
      <View>
        <SearchBar />
      </View>
    </UiPage>
  );
}

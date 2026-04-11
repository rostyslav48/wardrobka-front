import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import UiPopup from '@/components/ui/UiPopup';
import UiButton from '@/components/ui/UiButton';
import { useModal } from '@/context/ModalContext';
import { colors } from '@/theme/colors';
import {
  ItemStatus,
  ItemType,
  Season,
  WardrobeFilters,
} from '@/types/wardrobe';
import { styles } from './styles';

// ─── Preset colour swatches ──────────────────────────────────────────────────

const SWATCHES = [
  { label: 'Black',  hex: '#111111' },
  { label: 'White',  hex: '#F5F5F5' },
  { label: 'Gray',   hex: '#808080' },
  { label: 'Beige',  hex: '#D4C5A9' },
  { label: 'Brown',  hex: '#6B4226' },
  { label: 'Navy',   hex: '#1B2A4A' },
  { label: 'Blue',   hex: '#1565C0' },
  { label: 'Green',  hex: '#2E7D32' },
  { label: 'Red',    hex: '#C62828' },
  { label: 'Pink',   hex: '#E91E8C' },
  { label: 'Yellow', hex: '#F9A825' },
  { label: 'Orange', hex: '#E65100' },
  { label: 'Purple', hex: '#6A1B9A' },
];

// ─── Label maps ──────────────────────────────────────────────────────────────

const SEASON_LABEL: Record<Season, string> = {
  [Season.Winter]: 'Winter',
  [Season.Spring]: 'Spring',
  [Season.Summer]: 'Summer',
  [Season.Autumn]: 'Autumn',
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  [ItemStatus.Active]:    'Ready',
  [ItemStatus.Washing]:   'Washing',
  [ItemStatus.Missing]:   'Missing',
  [ItemStatus.NeedRepair]: 'Need Repair',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chip__active]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipText__active]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  initialFilters: WardrobeFilters;
  onApply: (filters: WardrobeFilters) => void;
  onClear: () => void;
};

export default function FiltersPopup({ initialFilters, onApply, onClear }: Props) {
  const { hide } = useModal();

  const [draft, setDraft] = useState<WardrobeFilters>({ ...initialFilters });

  const set = <K extends keyof WardrobeFilters>(
    key: K,
    value: WardrobeFilters[K] | undefined,
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const toggle = <K extends keyof WardrobeFilters>(
    key: K,
    value: WardrobeFilters[K],
  ) => setDraft((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));

  const handleApply = () => {
    onApply(draft);
    hide();
  };

  const handleClear = () => {
    onClear();
    hide();
  };

  return (
    <UiPopup fullScreen={false} title="Filters">
      <View style={styles.content}>

        {/* ── Type ─────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Type" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            {Object.values(ItemType).map((type) => (
              <Chip
                key={type}
                label={type}
                active={draft.type === type}
                onPress={() => toggle('type', type)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Season ───────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Season" />
          <View style={styles.chipRow}>
            {Object.values(Season).map((season) => (
              <Chip
                key={season}
                label={SEASON_LABEL[season]}
                active={draft.season === season}
                onPress={() => toggle('season', season)}
              />
            ))}
          </View>
        </View>

        {/* ── Status ───────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Status" />
          <View style={styles.chipRow}>
            {Object.values(ItemStatus).map((status) => (
              <Chip
                key={status}
                label={STATUS_LABEL[status]}
                active={draft.status === status}
                onPress={() => toggle('status', status)}
              />
            ))}
          </View>
        </View>

        {/* ── Colour ───────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Colour" />
          <View style={styles.swatchRow}>
            {/* "Any" option */}
            <Pressable
              style={[styles.swatchAny, draft.color === undefined && { borderColor: colors.textPrimary }]}
              onPress={() => set('color', undefined)}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                Any
              </Text>
            </Pressable>

            {SWATCHES.map(({ label, hex }) => (
              <Pressable
                key={label}
                style={[
                  styles.swatch,
                  { backgroundColor: hex },
                  draft.color === hex && styles.swatch__active,
                ]}
                onPress={() => set('color', draft.color === hex ? undefined : hex)}
              />
            ))}
          </View>
        </View>

        {/* ── Favourite ────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="Favourite" />
          <View style={styles.favouriteRow}>
            <Text style={styles.favouriteLabel}>Show favourites only</Text>
            <Switch
              value={draft.favourite === true}
              onValueChange={(val) => set('favourite', val || undefined)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.accentText}
            />
          </View>
        </View>

        {/* ── Footer ───────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerButtonWrapper}>
            <UiButton secondary onPress={handleClear}>
              <Text style={[styles.buttonLabel, styles.buttonLabel__secondary]}>
                Clear all
              </Text>
            </UiButton>
          </View>
          <View style={styles.footerButtonWrapper}>
            <UiButton onPress={handleApply}>
              <Text style={[styles.buttonLabel, styles.buttonLabel__primary]}>
                Apply
              </Text>
            </UiButton>
          </View>
        </View>

      </View>
    </UiPopup>
  );
}

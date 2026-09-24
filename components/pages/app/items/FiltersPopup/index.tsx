import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import UiPopup from '@/components/ui/UiPopup';
import UiButton from '@/components/ui/UiButton';
import UiTitle from '@/components/ui/UiTitle';
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

// Spec 4.3's section-eyebrow role names "TYPE" among the strings it covers.
function SectionLabel({ text }: { text: string }) {
  return <UiTitle style={styles.sectionLabel}>{text}</UiTitle>;
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
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
          <SectionLabel text="TYPE" />
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
          <SectionLabel text="SEASON" />
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
          <SectionLabel text="STATUS" />
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
          <SectionLabel text="COLOUR" />
          <View style={styles.swatchRow}>
            {/* "Any" option */}
            <Pressable
              style={[styles.swatchAny, draft.color === undefined && styles.swatchAny__active]}
              onPress={() => set('color', undefined)}
              accessibilityRole="button"
              accessibilityLabel="Any colour"
              accessibilityState={{ selected: draft.color === undefined }}
            >
              <Text style={styles.swatchAnyText}>Any</Text>
            </Pressable>

            {SWATCHES.map(({ label, hex }) => (
              <View
                key={label}
                style={[styles.swatchRing, draft.color === hex && styles.swatchRing__active]}
              >
                <Pressable
                  style={[styles.swatch, { backgroundColor: hex }]}
                  // hitSlop 2: the 30x30 tappable inner circle sits inside a
                  // 34x34 selection ring; this brings the touch target out to
                  // match the ring rather than shrinking the visible swatch.
                  hitSlop={2}
                  onPress={() => set('color', draft.color === hex ? undefined : hex)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: draft.color === hex }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── Favourite ────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="FAVOURITE" />
          <View style={styles.favouriteRow}>
            <Text style={styles.favouriteLabel}>Show favourites only</Text>
            <Switch
              value={draft.favourite === true}
              onValueChange={(val) => set('favourite', val || undefined)}
              trackColor={{ false: colors.border, true: colors.accent }}
              // QA-47: `accentText` (near-black) on the `border` off-track
              // (dark grey) was invisible off. Settings' switches use this
              // light thumb colour in both states - matched here.
              thumbColor={colors.textPrimary}
            />
          </View>
        </View>

        {/* ── Footer ───────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerButtonWrapper}>
            <UiButton secondary onPress={handleClear} style={styles.footerButton}>
              <UiTitle sizeS style={styles.buttonLabel__secondary}>Clear all</UiTitle>
            </UiButton>
          </View>
          <View style={styles.footerButtonWrapper}>
            <UiButton onPress={handleApply} style={styles.footerButton}>
              <UiTitle sizeS style={styles.buttonLabel__primary}>Apply</UiTitle>
            </UiButton>
          </View>
        </View>

      </View>
    </UiPopup>
  );
}

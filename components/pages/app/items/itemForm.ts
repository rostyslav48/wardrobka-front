import * as Yup from 'yup';
import { FitType, ItemStatus, ItemType, Season, Size } from '@/types/wardrobe';

// ─── Colour swatches ──────────────────────────────────────────────────────────

export const SWATCHES = [
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

// ─── Select options ───────────────────────────────────────────────────────────

export const TYPE_OPTIONS = Object.values(ItemType).map((v) => ({ label: v, value: v }));

export const SEASON_OPTIONS = [
  { label: 'Winter', value: Season.Winter },
  { label: 'Spring', value: Season.Spring },
  { label: 'Summer', value: Season.Summer },
  { label: 'Autumn', value: Season.Autumn },
];

export const STATUS_OPTIONS = [
  { label: 'Ready',      value: ItemStatus.Active },
  { label: 'Washing',    value: ItemStatus.Washing },
  { label: 'Missing',    value: ItemStatus.Missing },
  { label: 'Need Repair', value: ItemStatus.NeedRepair },
];

export const FIT_OPTIONS = Object.values(FitType).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

export const SIZE_OPTIONS = Object.values(Size).map((v) => ({
  label: v.toUpperCase(),
  value: v,
}));

// ─── Form values ──────────────────────────────────────────────────────────────

export interface ItemFormValues {
  name:        string;
  type:        ItemType | '';
  color:       string;
  season:      Season | '';
  status:      ItemStatus;
  brand:       string;
  material:    string;
  style:       string;
  fit_type:    FitType | '';
  size:        Size | '';
  description: string;
  favourite:   boolean;
}

export const EMPTY_FORM_VALUES: ItemFormValues = {
  name:        '',
  type:        '',
  color:       '',
  season:      '',
  status:      ItemStatus.Active,
  brand:       '',
  material:    '',
  style:       '',
  fit_type:    '',
  size:        '',
  description: '',
  favourite:   false,
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const itemFormSchema = Yup.object({
  name:   Yup.string().trim().max(50, 'Max 50 characters').required('Name is required'),
  type:   Yup.string().required('Select a type'),
  color:  Yup.string().required('Select a colour'),
  season: Yup.string().required('Select a season'),
  status: Yup.string().required('Select a status'),
});

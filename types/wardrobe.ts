export enum FitType {
  Skinny = 'skinny',
  Slim = 'slim',
  Regular = 'regular',
  Oversize = 'oversize',
}

export enum ItemStatus {
  Active = 'active',
  Washing = 'washing',
  Missing = 'missing',
  NeedRepair = 'need-repair',
}

export enum ItemType {
  Hoodie = 'hoodie',
  Jacket = 'jacket',
  Coat = 'coat',
  TShirt = 't-shirt',
  Shirt = 'shirt',
  Sweater = 'sweater',
  Blazer = 'blazer',
  Pants = 'pants',
  Jeans = 'jeans',
  Shorts = 'shorts',
  Skirt = 'skirt',
  Dress = 'dress',
  Suit = 'suit',
  Vest = 'vest',
  TankTop = 'tank top',
  Cardigan = 'cardigan',
  Tracksuit = 'tracksuit',
  Overalls = 'overalls',
  Raincoat = 'raincoat',
  Windbreaker = 'windbreaker',
  Polo = 'polo',
}

export enum Season {
  Winter = 'winter',
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
}

export enum Size {
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xL',
  XXL = 'xxL',
}

export interface WardrobeItem {
  id: number;
  accountId: number;
  name: string;
  type: ItemType;
  color: string;
  season: Season;
  status: ItemStatus;
  img_url?: string;
  favourite: boolean;
  fit_type?: FitType;
  material?: string;
  description?: string;
  style?: string;
  size?: Size;
  brand?: string;
}

export interface WardrobeFilters {
  type?: ItemType;
  color?: string;
  season?: Season;
  status?: ItemStatus;
  favourite?: boolean;
  fit_type?: FitType;
  material?: string;
  size?: Size;
  brand?: string;
  style?: string;
}

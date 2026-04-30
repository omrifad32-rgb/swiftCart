export interface ProductVariant {
  id: string;
  name: string;
  price?: number; // Optional: variation can have a different price
  img?: string;   // Optional: variation can have a different image
}

export interface Product {
  id: string;
  name: string;
  price: number | string;
  oldPrice?: number | string;
  costPrice?: number; // True cost for admin profit calculations
  img: string;
  extraImages?: string[]; // Additional images for scrolling
  category: string;
  desc?: string;
  stock?: number;
  inS?: boolean | string;
  flashSaleEligible?: boolean;
  shippingCost?: number;
  variants?: ProductVariant[];
  variantLabel?: string; // e.g. "Select Model", "Color", etc.
  customOptions?: { title: string; choices: string[] }[];
}

export interface CartItem extends Product {
  qty: number;
  selectedVariant?: ProductVariant;
  selectedOptions?: Record<string, string>;
}

export interface Order {
  id: string;
  user: string;
  name: string;
  phone: string;
  address: string;
  total: number;
  profit?: number; // Net profit for this order
  status: string;
  items: string;
  time: number;
  email?: string;
  cMsg?: string;
  aMsg?: string;
  cImg?: string;
  aImg?: string;
  trackingNumber?: string;
  usedBalance?: number;
  cashbackEarned?: number;
  paymentMethod?: string;
}

export interface Review {
  id?: string;
  u: string;
  e: string; // Email to identify owner
  t: string;
  s: string | number;
  time: number;
  img?: string; // Image attachment
}

export interface ContactMessage {
  id: string;
  name: string;
  contactInfo: string;
  message: string;
  time: number;
  isRead?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  img?: string;
  timestamp: number;
}

export interface ChatSession {
  userKey: string;
  email: string;
  lastUpdate: number;
  unreadByAdmin: boolean;
  unreadByUser: boolean;
  messages: Record<string, ChatMessage>;
}

export interface AppSettings {
  title: string;
  sub: string;
  pb: string;
  terms: string;
  isWarMode: boolean;
  theme?: 'dark' | 'light';
  shippingCost?: number;
  officeHours?: string;
  ourStory?: string;
  specialDayEnabled?: boolean;
  specialDayName?: string;
  globalDiscountPercent?: number;
  singleProductMode?: boolean;
  featuredProductId?: string;
  relatedProductIds?: string[];
  bitLink?: string;
  paypalLink?: string;
  payboxLink?: string;
  bitLabel?: string;
  paypalLabel?: string;
  payboxLabel?: string;
  flashSaleDuration?: number;
  freeShippingThreshold?: number;
  cashbackPercent?: number;
  aboutImages?: string[];
  aboutImagesPosition?: 'top' | 'bottom';
  categoryImages?: Record<string, string>;
  bankTransferPhone?: string;
}
export interface ProductCardData {
  id?: string;
  name: string;
  category?: string;
  variant?: string;
  capacity?: string;
  inspiredBy?: string;
  fragranceProfile?: string;
  price?: number | string;
  priceDisplay?: string;
  description?: string;
  inStock?: boolean;
  imageUrl?: string | null;
  productUrl?: string | null;
  linkType?: 'product' | 'offer' | 'subcategory' | 'section' | 'page' | 'homepage' | 'catalog_only' | string;
  linkLabel?: string;
  hasDirectPage?: boolean;
  nearestOfficialUrl?: string | null;
  nearestOfficialLabel?: string | null;
}

export interface Message {
  id: string;
  conversationId?: string;
  role: 'customer' | 'assistant' | 'user';
  content: string;
  timestamp: string;
  suggestions?: string[];
  productCards?: ProductCardData[];
  metadata?: {
    detectedIntent?: string;
    targetUsage?: string;
    budgetMentioned?: string | null;
    currentSubject?: string | null;
    confidenceNote?: string;
  };
}

export interface CustomerMessage extends Message {
  conversationId: string;
}

export interface CustomerConversation {
  conversationId: string;
  customerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: CustomerMessage[];
}

export interface ConversationSummary {
  conversationId: string;
  customerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageTime?: string;
}

export interface ProductVariant {
  variantName: string; // e.g., "أوقية", "ثمن كيلو", "ربع كيلو", "نصف كيلو", "كيلو", "تولة", "ربع تولة", "نصف تولة"
  weightGrams?: number | null; // e.g., 28, 125, 250, 500, 1000, 12, 3, 6
  displayedWeight?: string;
  price: number | null; // null if "غير ظاهر"
  priceDisplay: string;
  inStock: boolean;
  notes?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  type?: string;
  displayedCardPrice?: number | null;
  variants: ProductVariant[];
  overallAvailability: 'متوفر' | 'نفدت الكمية' | 'مخلص حالياً' | 'متوفر جزئياً';
  notes?: string;
  imageUrl?: string | null;
  productUrl?: string | null;
  colors?: string[];
  isEmptyBag?: boolean;
  hasDirectPage?: boolean;
  nearestOfficialUrl?: string | null;
  nearestOfficialLabel?: string | null;
  linkType?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: 'عود' | 'دهن عود' | 'مباخر' | 'عطور' | 'ملحقات' | string;
  type?: 'طبيعي' | 'محسن' | 'بيور' | string;
  price?: number;
  currency?: string;
  description?: string;
  features?: string[]; // e.g. ["فوحان عالي", "بارد على العين", "ثبات ممتاز"]
  suitableFor?: string[]; // e.g. ["البيت", "المجلس", "الملابس", "المناسبات", "الإهداء"]
  notes?: string;
  inStock?: boolean;
}

export interface MidhalKnowledgeBase {
  isConfigured: boolean;
  storeName: string;
  tagline?: string;
  branches: Array<{ city: string; locationName: string; address?: string; workingHours?: string }>;
  shippingInfo: {
    availableCities?: string;
    shippingCompanies?: string[];
    standardTime?: string;
    freeShippingThreshold?: number;
  };
  policies: {
    returns?: string;
    paymentMethods?: string[];
  };
  activeOffers: Array<{ title: string; details: string; code?: string }>;
  products: StoreProduct[];
  customKnowledgeNotes: string;
}

export interface ConversationState {
  intent: string | null;
  productType: string | null;
  usage: string | null;
  budget: string | null;
  preferences: string[];
  currentReferencedItem: string | null;
}

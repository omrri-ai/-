/**
 * Conversation utilities: Smart title extraction and Arabic relative time formatting
 */

/**
 * Generates a concise, context-aware title from the first message
 */
export function generateConversationTitle(messageText: string): string {
  if (!messageText || !messageText.trim()) {
    return 'محادثة جديدة';
  }

  const raw = messageText.trim();
  const lower = raw.toLowerCase();

  // Common direct questions and product inquiries:
  // "عندكم شنط؟" -> "الشنط"
  if (lower.includes('شنط') || lower.includes('شنطة')) {
    if (lower.includes('فاضية') || lower.includes('فارغة') || lower.includes('بدون')) {
      if (lower.includes('نص') || lower.includes('نصف')) return 'شنطة نص كيلو فاضية';
      return 'شنطة فارغة';
    }
    if (lower.includes('نص') || lower.includes('نصف')) return 'شنطة نص كيلو';
    if (lower.includes('ربع')) return 'شنطة ربع كيلو';
    if (lower.includes('كيلو')) return 'شنطة كيلو';
    return 'الشنط';
  }

  // "وش أنواع الزعفران؟" -> "الزعفران"
  if (lower.includes('زعفران')) {
    if (lower.includes('سوبر') || lower.includes('نقيل')) return 'زعفران سوبر نقيل';
    if (lower.includes('بكج') || lower.includes('عرض')) return 'بكج الزعفران';
    return 'الزعفران';
  }

  // "أبي عود للبيت" -> "عود للبيت"
  if (lower.includes('عود') || lower.includes('بخور')) {
    if (lower.includes('بيت')) return 'عود للبيت';
    if (lower.includes('مجلس') || lower.includes('مناسب')) return 'عود للمجالس';
    if (lower.includes('طبيعي') && lower.includes('محسن')) return 'الفرق بين الطبيعي والمحسن';
    if (lower.includes('طبيعي')) return 'عود طبيعي';
    if (lower.includes('محسن')) return 'عود محسن';
    if (lower.includes('تايقر') || lower.includes('كمبودي')) return 'عود كمبودي تايقر';
    if (lower.includes('موروكي') || lower.includes('مروكي')) return 'عود مروكي';
    if (lower.includes('كلمنتان') || lower.includes('فيتنامي') || lower.includes('سيوفي')) return 'عود سيوفي فيتنامي';
    if (lower.includes('دقة')) return 'دقة العود';
    if (lower.includes('عرض') || lower.includes('عروض') || lower.includes('بكج')) return 'عروض العود';
    return 'العود';
  }

  // Perfumes
  if (lower.includes('عطر') || lower.includes('عطور')) {
    if (lower.includes('هادي') || lower.includes('هادئ') || lower.includes('ناعم')) return 'عطور هادئة';
    if (lower.includes('رسمي') || lower.includes('مناسب') || lower.includes('فخم')) return 'عطور رسمية';
    if (lower.includes('لكجري') || lower.includes('توباكو')) return 'عطر لكجري';
    if (lower.includes('مارفل')) return 'عطر مارفل';
    if (lower.includes('فلورا')) return 'عطر فلورا';
    return 'عطور مدهال';
  }

  // Offers
  if (lower.includes('عرض') || lower.includes('عروض') || lower.includes('تخفيض')) {
    return 'عروض مدهال';
  }

  // Accessories / Incense Burners
  if (lower.includes('مبخر') || lower.includes('مباخر')) {
    return 'المباخر';
  }

  // Store & Shipping
  if (lower.includes('شحن') || lower.includes('توصيل')) {
    return 'الشحن والتوصيل';
  }
  if (lower.includes('فرع') || lower.includes('موقع') || lower.includes('وينكم')) {
    return 'فروع المتجر';
  }

  // English inquiries
  if (lower.includes('oud') || lower.includes('agarwood')) {
    if (lower.includes('home')) return 'Oud for Home';
    return 'Oud Inquiry';
  }
  if (lower.includes('bag')) {
    if (lower.includes('half')) return 'Half Kilo Bag';
    return 'Bags Inquiry';
  }
  if (lower.includes('saffron')) return 'Saffron Inquiry';
  if (lower.includes('perfume')) return 'Perfumes';

  // General Arabic heuristic: remove common opening verbs/phrases
  let cleaned = raw
    .replace(/[؟?!.,،:؛\-_]/g, ' ')
    .replace(/^(أبي|ابي|ابغى|أبغى|اريد|أريد|ودي بـ|ودي ب|عندكم|وش|ايش|شو|ممكن|عطني|لو سمحت|استفسار عن|سلام عليكم|السلام عليكم|مرحبا|هلا والله|هلا|صباح الخير|مساء الخير)\s+/gi, '')
    .trim();

  // If we cleaned it into a short phrase of 1 to 4 words
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 0 && words.length <= 4) {
    return words.join(' ');
  } else if (words.length > 4) {
    return words.slice(0, 3).join(' ');
  }

  return 'محادثة جديدة';
}

export const MAX_CONVERSATIONS = 2;

/**
 * Prunes conversations so that at most MAX_CONVERSATIONS are kept.
 * Guarantees that the active conversation is NOT removed.
 */
export function pruneConversations(
  convs: any[],
  activeId: string | null
): any[] {
  if (!Array.isArray(convs) || convs.length <= MAX_CONVERSATIONS) {
    return convs || [];
  }

  let list = [...convs];

  while (list.length > MAX_CONVERSATIONS) {
    let targetIndex = -1;
    let oldestTime = Infinity;

    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].conversationId !== activeId) {
        const time = new Date(list[i].updatedAt || list[i].createdAt || 0).getTime();
        if (time < oldestTime) {
          oldestTime = time;
          targetIndex = i;
        }
      }
    }

    if (targetIndex !== -1) {
      list.splice(targetIndex, 1);
    } else {
      list = list.slice(0, MAX_CONVERSATIONS);
      break;
    }
  }

  return list;
}

/**
 * Formats a date or timestamp into authentic Arabic relative time:
 * - "اليوم 9:42 م"
 * - "اليوم 7:15 م"
 * - "أمس"
 * - "20 سبتمبر"
 */
export function formatArabicRelativeTime(dateInput: string | number | Date): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const now = new Date();

  // Check if same calendar day
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Format time (e.g., 9:42 م)
  const timeFormatted = date.toLocaleTimeString('ar-SA', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `اليوم ${timeFormatted}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'أمس';
  }

  // Check if within the current year
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  if (isCurrentYear) {
    return date.toLocaleDateString('ar-SA', {
      month: 'long',
      day: 'numeric',
    });
  }

  // Other years
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

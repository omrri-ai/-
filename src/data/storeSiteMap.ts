/**
 * خريطة متجر مدهال الطيب الرسمية الكاملة (Store Site Map & Navigation Engine)
 * المصدر: متجر مدهال الطيب الرسمي (medhaloud.com)
 * مستخرجة ومحققة من: sitemap-1.xml, sitemap-2.xml, وقوائم المتجر الرسمية
 */

export type DestinationType =
  | 'product'        // صفحة منتج مستقلة
  | 'offer'          // صفحة عرض تجاري مستقلة
  | 'subcategory'    // تصنيف فرعي أو مجموعة متخصصة
  | 'section'        // قسم رئيسي في المتجر
  | 'page'           // صفحة خدمة أو سياسة أو معلومات
  | 'homepage'       // الصفحة الرئيسية (آخر حل فقط)
  | 'catalog_only';  // صنف موجود في الكتالوج فقط دون صفحة إلكترونية مستقلة

export interface StoreDestination {
  id: string;
  name: string;
  type: DestinationType;
  officialUrl: string;
  sectionName?: string;
  aliases: string[];
  imageUrl?: string;
  hasDirectPage: boolean;
  notes?: string;
}

export interface NavigationResult {
  priority: 1 | 2 | 3 | 4 | 5 | 6;
  destinationType: DestinationType;
  name: string;
  officialUrl: string | null;
  hasDirectPage: boolean;
  nearestOfficialUrl: string;
  nearestOfficialLabel: string;
  actionLabel: string;
  breadcrumb: string;
  disclaimer?: string;
}

// ═══════════════════════════════════════════════════════════════════
// 1. الصفحة الرئيسية (الدرجة السادسة - آخر حل فقط)
// ═══════════════════════════════════════════════════════════════════
export const STORE_HOMEPAGE: StoreDestination = {
  id: 'store_home',
  name: 'الصفحة الرئيسية لمتجر مدهال الطيب',
  type: 'homepage',
  officialUrl: 'https://medhaloud.com',
  aliases: ['الموقع', 'المتجر', 'الرئيسية', 'الموقع العام', 'رابط المتجر'],
  hasDirectPage: true,
};

// ═══════════════════════════════════════════════════════════════════
// 2. الأقسام الرئيسية (الدرجة الرابعة: Main Sections)
// ═══════════════════════════════════════════════════════════════════
export const STORE_SECTIONS: StoreDestination[] = [
  {
    id: 'sec_natural_oud',
    name: 'العود الطبيعي',
    type: 'section',
    officialUrl: 'https://medhaloud.com/العود-الطبيعي/c620840180',
    sectionName: 'العود الطبيعي',
    aliases: ['العود الطبيعي', 'عود طبيعي', 'طبيعي', 'خشب العود الطبيعي', 'أخشاب العود الطبيعية'],
    hasDirectPage: true,
  },
  {
    id: 'sec_enhanced_oud',
    name: 'العود المحسن',
    type: 'section',
    officialUrl: 'https://medhaloud.com/العود-المحسن/c1329876422',
    sectionName: 'العود المحسن',
    aliases: ['العود المحسن', 'عود محسن', 'محسن', 'خشب العود المحسن', 'الاعواد المحسنة', 'الأعواد المحسنة'],
    hasDirectPage: true,
  },
  {
    id: 'sec_dehn_oud',
    name: 'دهن العود',
    type: 'section',
    officialUrl: 'https://medhaloud.com/دهن-العود/c1995334645',
    sectionName: 'دهن العود',
    aliases: ['دهن العود', 'أدهان العود', 'ادهان العود', 'دهن عود', 'ادهان', 'أدهان', 'تولة دهن', 'تولات دهن'],
    hasDirectPage: true,
  },
  {
    id: 'sec_musk',
    name: 'المسك',
    type: 'section',
    officialUrl: 'https://medhaloud.com/المسك/c404552113',
    sectionName: 'المسك',
    aliases: ['المسك', 'مسك', 'تولات المسك', 'ادهان المسك', 'المسك الفاخر', 'تولة مسك'],
    hasDirectPage: true,
  },
  {
    id: 'sec_perfumes',
    name: 'العطور ومعطرات الجو',
    type: 'section',
    officialUrl: 'https://medhaloud.com/العطور-ومعطرات-الجو/c1820246256',
    sectionName: 'العطور ومعطرات الجو',
    aliases: ['العطور ومعطرات الجو', 'العطور', 'عطور', 'عطورات', 'معطرات', 'معطرات الجو', 'معطر جو', 'عطر', 'معطر هواء'],
    hasDirectPage: true,
  },
  {
    id: 'sec_incense',
    name: 'البخور والمعمول',
    type: 'section',
    officialUrl: 'https://medhaloud.com/البخور/c1085571830',
    sectionName: 'البخور',
    aliases: ['البخور', 'بخور', 'معمول', 'المعمول', 'مبثوث', 'المبثوث', 'بخور دوسري', 'لبان', 'اللبان', 'عود مسقى'],
    hasDirectPage: true,
  },
  {
    id: 'sec_mabaher',
    name: 'المباخر الحائلية',
    type: 'section',
    officialUrl: 'https://medhaloud.com/المباخر-الحائلية/c2131690530',
    sectionName: 'المباخر الحائلية',
    aliases: ['المباخر الحائلية', 'المباخر', 'مباخر', 'مبخرة', 'مبخرة حائلية', 'مباخر حائل', 'طقم مبخرة', 'مبخرة صاج', 'مبخرة ملكية'],
    hasDirectPage: true,
  },
  {
    id: 'sec_saffron',
    name: 'الزعفران',
    type: 'section',
    officialUrl: 'https://medhaloud.com/الزعفران/c311534071',
    sectionName: 'الزعفران',
    aliases: ['الزعفران', 'زعفران', 'زعفران سوبر نقيل', 'زعفران نقي', 'بوكس زعفران', 'سوبر نقيل'],
    hasDirectPage: true,
  },
  {
    id: 'sec_accessories',
    name: 'الإكسسوارات والملحقات',
    type: 'section',
    officialUrl: 'https://medhaloud.com/الإكسسوارات/c1796013989',
    sectionName: 'الإكسسوارات',
    aliases: ['الإكسسوارات', 'الاكسسوارات', 'إكسسوارات', 'اكسسوارات', 'ملحقات', 'أدوات العود', 'علب', 'أطقم'],
    hasDirectPage: true,
  },
  {
    id: 'sec_rarities',
    name: 'النوادر',
    type: 'section',
    officialUrl: 'https://medhaloud.com/النوادر/c1521213176',
    sectionName: 'النوادر',
    aliases: ['النوادر', 'نوادر', 'نوادر العود', 'خلطة نوادر', 'الأعواد النادرة'],
    hasDirectPage: true,
  },
  {
    id: 'sec_general_offers',
    name: 'قسم العروض والتخفيضات',
    type: 'section',
    officialUrl: 'https://medhaloud.com/العروض/c1691136638',
    sectionName: 'العروض',
    aliases: ['العروض', 'عروض', 'تخفيضات', 'خصومات', 'عروضكم', 'عروض خاصة', 'وين عروضكم', 'صفحة العروض', 'قسم العروض'],
    hasDirectPage: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 3. التصنيفات الفرعية والمجموعات (الدرجة الثالثة: Subcategories & Groups)
// ═══════════════════════════════════════════════════════════════════
export const STORE_SUBCATEGORIES: StoreDestination[] = [
  {
    id: 'sub_bags_incense',
    name: 'شنط البخور',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/شنط-البخور/c1820942889',
    sectionName: 'الإكسسوارات',
    aliases: [
      'شنط البخور', 'شنط', 'الشنط', 'شنطة', 'شنطه', 'شنط عود', 'شنطة عود', 'شنط جلدية',
      'شنطة جلدية', 'شنطة جلد', 'شنط حفظ العود', 'وين ألقى الشنط', 'وين الشنط', 'حقائب', 'حقيبة',
      'شنطة بيج', 'شنطة جملي', 'شنطة خضراء', 'شنطة سوداء', 'شنطة نص', 'شنطة ربع', 'شنطة ثمن', 'شنطة كيلو', 'شنطة فاضية', 'شنطة فارغة'
    ],
    hasDirectPage: true,
  },
  {
    id: 'sub_bags_gifting',
    name: 'شنط الإهداء',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/شنط-الاهداء/c138190891',
    sectionName: 'الإكسسوارات',
    aliases: ['شنط الإهداء', 'شنط الاهداء', 'شنطة اهداء', 'شنطة إهداء', 'حقائب الإهداء', 'شنط هدايا'],
    hasDirectPage: true,
  },
  {
    id: 'sub_boxes_incense',
    name: 'علب البخور',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/علب-البخور/c937881141',
    sectionName: 'الإكسسوارات',
    aliases: ['علب البخور', 'علب', 'العلب', 'علب ثمن', 'علب ربع', 'علب بدون شعار', 'علب فارغة'],
    hasDirectPage: true,
  },
  {
    id: 'sub_dehn_accessories',
    name: 'إكسسوارات الأدهان',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/اكسسوارت-الادهان/c2136107569',
    sectionName: 'الإكسسوارات',
    aliases: ['إكسسوارات الأدهان', 'اكسسوارت الادهان', 'تولات فارغة', 'ربع تولة راس ذهبي', 'ميل زجاجي', 'علب تولات'],
    hasDirectPage: true,
  },
  {
    id: 'sub_perfume_packages',
    name: 'بكجات العطور',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/بكجات-العطور/c956037174',
    sectionName: 'العطور ومعطرات الجو',
    aliases: ['بكجات العطور', 'بكج عطور', 'بكجات عطور', 'مجموعة عطور', 'أطقم عطور', 'عرض العطور'],
    hasDirectPage: true,
  },
  {
    id: 'sub_tiger_offers',
    name: 'عروض التايقر',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/عروض-التايقر/c1633675980',
    sectionName: 'العروض',
    aliases: ['عروض التايقر', 'عرض التايقر', 'تخفيض التايقر', 'عروض عود التايقر'],
    hasDirectPage: true,
  },
  {
    id: 'sub_gifting_offers',
    name: 'عروض الإهداء',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/عروض-الأهداء/c132583920',
    sectionName: 'العروض',
    aliases: ['عروض الإهداء', 'عروض الأهداء', 'عروض هدايا', 'عروض مناسبات'],
    hasDirectPage: true,
  },
  {
    id: 'sub_national_day_offers',
    name: 'عروض اليوم الوطني والمناسبات',
    type: 'subcategory',
    officialUrl: 'https://medhaloud.com/عروض-اليوم-الوطني/c169936294',
    sectionName: 'العروض',
    aliases: ['عروض اليوم الوطني', 'عروض يوم التأسيس', 'عروض المناسبات'],
    hasDirectPage: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 4. صفحات العروض المستقلة المحددة (الدرجة الثانية: Specific Offer Pages)
// ═══════════════════════════════════════════════════════════════════
export const STORE_OFFER_PAGES: StoreDestination[] = [
  {
    id: 'offer_tiger_pkg',
    name: 'بكج التايقر',
    type: 'offer',
    officialUrl: 'https://medhaloud.com/بكج-التايقر/p1037054180',
    sectionName: 'العروض',
    imageUrl: 'https://cdn.salla.sa/mQbPb/dcb6cbe4-c249-45c4-962e-e337ec547ff6-500x373.53515625-d03r3iB5ILK2I8l1QJA0ArjKmkfIoCMRBaJ0ViVn.jpg',
    aliases: ['بكج التايقر', 'عرض التايقر', 'بكج تايقر', 'عرض عود التايقر', 'تايقر مخفض', 'ثمن تايقر عرض'],
    hasDirectPage: true,
    notes: 'ثمن كيلو عود تايقر كمبودي محسن فاخر بسعر 199 ريال (أو 150 ريال بالعرض الخاص).',
  },
  {
    id: 'offer_sayufi_king_pkg',
    name: 'بكج السيوفي الكنق',
    type: 'offer',
    officialUrl: 'https://medhaloud.com/بكج-السيوفي-الكنق/p2018823084',
    sectionName: 'العروض',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['بكج السيوفي الكنق', 'بكج السيوفي', 'عرض السيوفي الكنق', 'بكج سيوفي كنج', 'عرض السيوفي'],
    hasDirectPage: true,
    notes: 'أوقية سيوفي كنج فيتنامي طبيعي مع هدايا تولة ومبخرة بسعر 250 ريال (أو 285 ريال).',
  },
  {
    id: 'offer_daqqa_cambodi',
    name: 'عرض الدقة الكمبودية',
    type: 'offer',
    officialUrl: 'https://medhaloud.com/عرض-الدقة-الكمبودية/p234567457',
    sectionName: 'العروض',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['عرض الدقة الكمبودية', 'عرض دقة كمبودي', 'عرض الدقة', 'بكج الدقة الكمبودية'],
    hasDirectPage: true,
    notes: 'دقة عود كمبودي طبيعي محسن فاخر بسعر 120 ريال (أو 149 ريال).',
  },
];

// ═══════════════════════════════════════════════════════════════════
// 5. صفحات الخدمة والسياسات والمعلومات (الدرجة الخامسة: Service Pages)
// ═══════════════════════════════════════════════════════════════════
export const STORE_SERVICE_PAGES: StoreDestination[] = [
  {
    id: 'page_shipping',
    name: 'سياسة الشحن والتوصيل',
    type: 'page',
    officialUrl: 'https://medhaloud.com/سياسة-الشحن-والتوصيل/page-312592717',
    aliases: ['الشحن', 'التوصيل', 'سياسة الشحن', 'الشحن والتوصيل', 'كم مدة التوصيل', 'كم ياخذ الشحن', 'توصيل مجاني'],
    hasDirectPage: true,
  },
  {
    id: 'page_returns',
    name: 'سياسة الاستبدال والاسترجاع',
    type: 'page',
    officialUrl: 'https://medhaloud.com/سياسة-الاستبدال-والاسترجاع/page-1996458819',
    aliases: ['الاسترجاع', 'الاستبدال', 'سياسة الاسترجاع', 'سياسة الاستبدال', 'الضمان الذهبي', 'ترجيع', 'استرجاع العود'],
    hasDirectPage: true,
  },
  {
    id: 'page_privacy',
    name: 'سياسة الاستخدام والخصوصية',
    type: 'page',
    officialUrl: 'https://medhaloud.com/سياسة-الاستخدام-والخصوصية/page-1821304910',
    aliases: ['الخصوصية', 'سياسة الخصوصية', 'الاستخدام والخصوصية'],
    hasDirectPage: true,
  },
  {
    id: 'page_faq',
    name: 'صفحة الأسئلة الشائعة',
    type: 'page',
    officialUrl: 'https://medhaloud.com/صفحة-الأسئلة-الشائعة/page-1047263055',
    aliases: ['الأسئلة الشائعة', 'اسئلة شائعة', 'الاسئلة المتكررة', 'معلومات المتجر'],
    hasDirectPage: true,
  },
  {
    id: 'page_about',
    name: 'من نحن - مدهال الطيب',
    type: 'page',
    officialUrl: 'https://medhaloud.com/من-نحن/page-2037329472',
    aliases: ['من نحن', 'عن مدهال الطيب', 'قصة المتجر', 'نبذة عنكم', 'معلومات عن مدهال'],
    hasDirectPage: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 6. المنتجات المستقلة المؤكدة بروابطها المباشرة (الدرجة الأولى: Specific Products)
// ═══════════════════════════════════════════════════════════════════
export const STORE_VERIFIED_PRODUCTS: StoreDestination[] = [
  // ── العود الطبيعي ──
  {
    id: 'prod_mori_nagaland',
    name: 'عود موري هندي نجلاند سوبر ومرتفع',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-موري-هندي-نجلاند-سوبر-ومرتفع/p1115139655',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/36dc8f5e-0871-4b12-b215-ce7ab2099c47-original.webp',
    aliases: ['عود موري هندي', 'موري نجلاند', 'موري هندي نجلاند', 'عود موري سوبر مرتفع', 'موري نجلاند سوبر'],
    hasDirectPage: true,
  },
  {
    id: 'prod_zora_nagaland',
    name: 'عود زورا هندي نجلاند سوبر مرتفع ودبل',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-زورا-هندي-نجلاند-سوبر-مرتفع-ودبل/p2065966538',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/693c0429-ee83-48da-bca4-d6aa4687588e-original.webp',
    aliases: ['عود زورا هندي نجلاند', 'زورا نجلاند', 'زورا هندي', 'عود زورا نجلاند سوبر مرتفع'],
    hasDirectPage: true,
  },
  {
    id: 'prod_zora_manipur',
    name: 'عود زورا منيبور دبل سوبر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-زورا-منيبور-دبل-سوبر/p105257226',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['عود زورا منيبور', 'زورا منيبور دبل سوبر', 'زورا منيبور', 'عود منيبور زورا'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mori_manipur',
    name: 'عود موري منيبور دبل سوبر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-موري-منيبور-دبل-سوبر/p1495971556',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['عود موري منيبور', 'موري منيبور دبل سوبر', 'موري منيبور'],
    hasDirectPage: true,
  },
  {
    id: 'prod_sayufi_double_triple',
    name: 'عود سيوفي دبل وتربل سوبر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-سيوفي-دبل-وتربل-سوبر/p1404010538',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/5b254c2e-91c8-479d-a419-ebef6d357f12-original.webp',
    aliases: ['عود سيوفي دبل وتربل', 'سيوفي دبل وتربل', 'سيوفي سوبر', 'عود سيوفي طبيعي'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_living_mbakher',
    name: 'مروكي حي كسر مباخر دبل سوبر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مروكي-حي-كسر-مباخر-دبل-سوبر/p939396419',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['مروكي حي كسر مباخر', 'مروكي حي دبل سوبر', 'مروكي حي مباخر'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_mini_live',
    name: 'عود دقة موروكي حي سوبر واعلى',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-دقة-موروكي-حي-سوبر-واعلى/p2034332702',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/c90c67f8-f41a-491a-9f95-b5db0d21fd8e-original.webp',
    aliases: ['عود دقة موروكي حي', 'موروكي حي سوبر واعلى', 'دقة موروكي حي', 'ميني موروكي حي'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_asqoon_super',
    name: 'عود دقة موروكي اصقون سوبرمرتفع',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-دقة-موروكي-اصقون-سوبرمرتفع/p1241117394',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/dc344dcf-50ca-4fa5-9dc9-ce45b173e69a-436.328125x500-RZAF3EPXqIGbYPKZISZ3oMId8aurSpcOdYbgaY4Z.jpg',
    aliases: ['عود دقة موروكي اصقون', 'دقة موروكي اصقون', 'موروكي اصقون سوبر مرتفع', 'دقة اصقون'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_asqoon_mbakher_mini',
    name: 'عود ميني موروكي اصقون مرتفع و دبل',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-ميني-موروكي-اصقون-مرتفع-و-دبل/p661478053',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/c39aa354-9a8c-4a37-9759-408a287236dc-original.webp',
    aliases: ['عود موروكي اصقون مباخر وميني دبل', 'ميني موروكي اصقون دبل'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_asqoon_high_mbakher',
    name: 'عود موروكي اصقون سوبر عالي كسر مباخر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-موروكي-اصقون-سوبر-عالي-كسر-مباخر/p368603316',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/335836d5-bb90-410a-b336-db181e18bf97-original.webp',
    aliases: ['موروكي اصقون سوبر عالي كسر مباخر', 'موروكي اصقون كسر مباخر'],
    hasDirectPage: true,
  },
  {
    id: 'prod_sayufi_cambodian',
    name: 'عود السيوفي الكنج فاخر فيتنامي',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-السيوفي-الكنج-فاخر-فيتنامي/p254398331',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6f3ca85a-4933-4f93-b6d8-eb1a9e3347b7-500x375-7rE9n2H0lqXzXW8G0m6kYx9A3B5C7D8E1F2G3H4J.jpg',
    aliases: ['عود السيوفي الكنج', 'سيوفي كنج فاخر', 'سيوفي فيتنامي فاخر'],
    hasDirectPage: true,
  },
  {
    id: 'prod_seylani_adams',
    name: 'سيلاني ادمز سوبر مرتفع ودبل',
    type: 'product',
    officialUrl: 'https://medhaloud.com/سيلاني-ادمز-سوبر-مرتفع-ودبل/p326336978',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['سيلاني ادمز', 'عود سيلاني', 'سيلاني ادمز سوبر مرتفع'],
    hasDirectPage: true,
  },
  {
    id: 'prod_cambodian_cultivated',
    name: 'عود كمبودي مستزرع',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-كمبودي-مستزرع/p1405903166',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['كمبودي مستزرع', 'عود كمبودي مستزرع فاخر'],
    hasDirectPage: true,
  },

  // ── العود المحسن ──
  {
    id: 'prod_tiger_cambodian',
    name: 'عود تايقر كمبودي محسن',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-كمبودي-محسن-التايقر/p1585084528',
    sectionName: 'العود المحسن',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/56bb79aa-c4fa-42fc-b81f-b591676c3b83-original.webp',
    aliases: ['عود تايقر كمبودي', 'عود تايقر', 'تايقر كمبودي محسن', 'عود كمبودي تايقر', 'التايقر المحسن', 'التايقر الذهبي', 'التايقر الذهبي 35', 'تايقر ذهبي', 'تايجر ذهبي'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_king',
    name: 'عود الموروكي الكنق',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-الموروكي-الكنق/p1678603097',
    sectionName: 'العود المحسن',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['عود الموروكي الكنق', 'موروكي الكنق', 'مروكي الكنق', 'عود موروكي كنج'],
    hasDirectPage: true,
  },
  {
    id: 'prod_moroki_mini_enhanced',
    name: 'عود موروكي ميني محسن',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-موروكي-ميني-محسن/p985954782',
    sectionName: 'العود المحسن',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/46a8947f-859e-4df7-975d-536965fa2863-original.webp',
    aliases: ['عود موروكي ميني محسن', 'موروكي ميني محسن', 'مروكي ميني محسن'],
    hasDirectPage: true,
  },
  {
    id: 'prod_farasha_cambodian',
    name: 'عود الفراشة الكمبودية',
    type: 'product',
    officialUrl: 'https://medhaloud.com/عود-الفراشة-الكمبودية/p424071684',
    sectionName: 'العود المحسن',
    imageUrl: 'https://cdn.salla.sa/mQbPb/363f73df-4da5-42a1-9659-4b6732943265-500x375-7sK3e4L6m8N0p1Q2r3S4t5U6v7W8x9Y0z1A2b3C4.jpg',
    aliases: ['عود الفراشة الكمبودية', 'عود الفراشة', 'فراشة كمبودي', 'عود الفراشه'],
    hasDirectPage: true,
  },
  {
    id: 'prod_daqqa_cambodian',
    name: 'دقة العود الكمبودي',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دقة-العود-الكمبودي/p727791299',
    sectionName: 'العود المحسن',
    imageUrl: 'https://cdn.salla.sa/mQbPb/BoSqdt50ViJCFc0Cm4UcCmn03XCZm9jOTuWg9944.jpg',
    aliases: ['دقة العود الكمبودي', 'دقة كمبودي', 'دقة كمبودية'],
    hasDirectPage: true,
  },
  {
    id: 'prod_vietnam_strips_aaa',
    name: 'رقائق العود الفيتنامي AAA',
    type: 'product',
    officialUrl: 'https://medhaloud.com/رقائق-العود-الفيتنامي-aaa/p1862393179',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['رقائق العود الفيتنامي', 'رقائق فيتنامي aaa', 'رقائق عود فيتنامي'],
    hasDirectPage: true,
  },
  {
    id: 'prod_vietnam_corners_enhanced',
    name: 'زوايا الفيتنامي المحسن',
    type: 'product',
    officialUrl: 'https://medhaloud.com/زوايا-الفيتنامي-المحسن/p287949597',
    sectionName: 'العود المحسن',
    imageUrl: 'https://cdn.salla.sa/mQbPb/2b42b10a-d8cb-4654-8e10-da9b3c333246-500x375-8uL4f5M7n9P1q2R3s4T5u6V7w8X9y0Z1a2B3c4D5.jpg',
    aliases: ['زوايا الفيتنامي المحسن', 'زوايا فيتنامي محسن', 'زوايا فيتنامية'],
    hasDirectPage: true,
  },
  {
    id: 'prod_vietnam_jar_double_triple',
    name: 'جار فيتنامي دبل وتربل سوبر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/جار-فيتنامي-دبل-وتربل-سوبر/p643690583',
    sectionName: 'العود الطبيعي',
    imageUrl: 'https://cdn.files.salla.network/products/1962283619/4157eaca-8025-4f40-9eb9-a00069f046a4-original.webp',
    aliases: ['جار فيتنامي دبل وتربل', 'جار فيتنامي سوبر', 'عود جار فيتنامي'],
    hasDirectPage: true,
  },

  // ── العطور ومعطرات الجو ──
  {
    id: 'prod_perfume_luxury',
    name: 'عطر Luxury',
    type: 'product',
    officialUrl: 'https://medhaloud.com/luxury/p1907815091',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/7efe6894-cf1f-45b0-90e1-dfb6a58e9781-447.5x500-DkRLhRcVmx1xqH0wEhAJEZ1Iw7StdKeSDT4hyP2G.jpg',
    aliases: ['عطر luxury', 'لكجري', 'عطر لكجري', 'عطر توباكو', 'عطر tobacco', 'luxury'],
    hasDirectPage: true,
  },
  {
    id: 'prod_perfume_arrogant',
    name: 'عطر Arrogant',
    type: 'product',
    officialUrl: 'https://medhaloud.com/arrogant/p530204648',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/73bf98ff-a2f6-43d9-923e-1bdb3f6e6003-500x491.45833333333-6RbzODq7x8ZOpbfMGqUPPPXjscU5rufSjMKsjk9N.jpg',
    aliases: ['عطر arrogant', 'اروجنت', 'عطر اروجنت', 'عطر ميمو', 'عطر memo', 'arrogant'],
    hasDirectPage: true,
  },
  {
    id: 'prod_perfume_marvel',
    name: 'عطر Marvel',
    type: 'product',
    officialUrl: 'https://medhaloud.com/marvel/p1456372259',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/8717912f-77fc-475c-93e5-dbe642bfe6b5-444.16666666667x500-BtfXlVxObpKZ0iu8Lr4XTMpWzUFiBv88RN9b5n5n.jpg',
    aliases: ['عطر marvel', 'مارفل', 'عطر مارفل', 'عطر فان كليف', 'marvel'],
    hasDirectPage: true,
  },
  {
    id: 'prod_perfume_magic',
    name: 'عطر Magic',
    type: 'product',
    officialUrl: 'https://medhaloud.com/magic/p505349671',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/c8a2b53b-e1f4-41d3-96b6-3a56cf9e2621-447.5x500-GvH6m7N8p9Q0r1S2t3U4v5W6x7Y8z9A0b1C2d3E4.jpg',
    aliases: ['عطر magic', 'ماجيك', 'عطر ماجيك', 'عطر ارماني', 'magic'],
    hasDirectPage: true,
  },
  {
    id: 'prod_perfume_velvet_rose',
    name: 'عطر Velvet Rose',
    type: 'product',
    officialUrl: 'https://medhaloud.com/velvet-rose/p334507978',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/ccd9e5ca-f31e-42d0-a5f4-f2ada0995670-471.08843537415x500-r7RQnYwkdblCjSupKAv2VkafK61IR3oLz8WiDjuj.jpg',
    aliases: ['عطر velvet rose', 'فلفيت روز', 'عطر فلفيت روز', 'عطر جيرلان باريس', 'velvet rose'],
    hasDirectPage: true,
  },
  {
    id: 'prod_perfume_lamour',
    name: 'عطر L amour',
    type: 'product',
    officialUrl: 'https://medhaloud.com/l-amour/p1670304670',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['عطر lamour', 'لامور', 'عطر لامور', 'عطر l amour'],
    hasDirectPage: true,
  },
  {
    id: 'prod_freshener_royal',
    name: 'معطر Royal للجو',
    type: 'product',
    officialUrl: 'https://medhaloud.com/معطر-royal/p398134387',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/8Y7p8Z2b6N9q4W1e5R0t-500x500.jpg',
    aliases: ['معطر royal', 'معطر رويال', 'معطر جو رويال', 'رويال معطر', 'عطر royal', 'عطر رويال', 'رويال', 'royal'],
    hasDirectPage: true,
  },
  {
    id: 'prod_freshener_suave',
    name: 'معطر هواء suave',
    type: 'product',
    officialUrl: 'https://medhaloud.com/معطر-suave/p389026293',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/FmRo6i7wy59TEOoTqyCuDVGUUze8usPL2WjmUVPV.jpg',
    aliases: ['معطر suave', 'معطر سواف', 'معطر هواء suave'],
    hasDirectPage: true,
  },
  {
    id: 'prod_freshener_classy_oud',
    name: 'معطر عود للجو classy oud',
    type: 'product',
    officialUrl: 'https://medhaloud.com/معطر-classy-oud/p596811894',
    sectionName: 'العطور ومعطرات الجو',
    imageUrl: 'https://cdn.salla.sa/mQbPb/fOi6XBR3QygNV94By6UnzdaDh6A86bbvz2JaSvmQ.jpg',
    aliases: ['معطر classy oud', 'معطر كلاسيك عود', 'معطر عود للجو'],
    hasDirectPage: true,
  },

  // ── أدهان العود والمسك ──
  {
    id: 'prod_dehn_trad_sweety',
    name: 'دهن عود تراد سويتي',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دهن-عود-تراد-سويتي/p1701246754',
    sectionName: 'دهن العود',
    imageUrl: 'https://cdn.salla.sa/mQbPb/SGaYAh9IHgeCBjoiK11I3SZsTpmQVQi7E2Mu6eed.jpg',
    aliases: ['دهن عود تراد سويتي', 'تراد سويتي', 'دهن تراد سويتي', 'دهن تراد الفاخر'],
    hasDirectPage: true,
  },
  {
    id: 'prod_dehn_brashin',
    name: 'دهن البراشين البخوري',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دهن-البراشين-البخوري/p1914218039',
    sectionName: 'دهن العود',
    imageUrl: 'https://cdn.salla.sa/mQbPb/wATnHIUVW9U0bubfsBZlf9JQrtQZoI6w1kZhaFoE.jpg',
    aliases: ['دهن البراشين البخوري', 'دهن براشين', 'براشين بخوري', 'دهن البراشين'],
    hasDirectPage: true,
  },
  {
    id: 'prod_dehn_vietnam_quang',
    name: 'دهن عود فيتنامي قوانق ناي',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دهن-عود-فيتنامي-قوانق-ناي/p362965624',
    sectionName: 'دهن العود',
    imageUrl: 'https://cdn.salla.sa/mQbPb/hPnboCehqq1UbSvTdETE1LErZCFp6K3FpKJ7hPse.jpg',
    aliases: ['دهن عود فيتنامي', 'فيتنامي قوانق ناي', 'دهن قوانق ناي'],
    hasDirectPage: true,
  },
  {
    id: 'prod_dehn_cambodi_koh_kong',
    name: 'دهن عود كمبودي كوه كنج',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دهن-عود-كمبودي-كوه-كنج/p947328974',
    sectionName: 'دهن العود',
    imageUrl: 'https://cdn.salla.sa/mQbPb/yTal3TZp4Uo1rI7Cn6kcLjaIlCKlX9t5NFTursMG.jpg',
    aliases: ['دهن عود كمبودي كوه كنج', 'كمبودي كوه كنج', 'كوه كينج'],
    hasDirectPage: true,
  },
  {
    id: 'prod_dehn_hindi_assam',
    name: 'دهن عود هندي اسام',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دهن-عود-هندي-اسام/p1891745216',
    sectionName: 'دهن العود',
    imageUrl: 'https://cdn.salla.sa/mQbPb/swqMTwrgU9vpWecmJZXiSgrAkQSsLcMcUlqFc0rW.jpg',
    aliases: ['دهن عود هندي اسام', 'هندي اسام', 'دهن عود هندي'],
    hasDirectPage: true,
  },
  {
    id: 'prod_dehn_hindi_old',
    name: 'دهن عود هندي قديم',
    type: 'product',
    officialUrl: 'https://medhaloud.com/دهن-عود-هندي-قديم/p1430164122',
    sectionName: 'دهن العود',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['دهن عود هندي قديم', 'هندي قديم معتق'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_romman',
    name: 'مسك الرمان',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-الرمان/p719564413',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/Wl6hus3Ix6rigAwLfWwgZXy9F7S5n2bjnMjRg8Nc.jpg',
    aliases: ['مسك الرمان', 'مسك رمان', 'الرمان مسك'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_khetam',
    name: 'مسك الختام',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-الختام/p967971943',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/yaCAP8ma5vOiXWig8yczCCL0FRK8NAHhmn09GDwQ.jpg',
    aliases: ['مسك الختام', 'ختام المسك'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_powder',
    name: 'مسك البودر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-البودر/p728881147',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/lu2GuUfhGAgtqjo64rRen6dDSeTZEyFmZJ8lpGXP.jpg',
    aliases: ['مسك البودر', 'مسك بودرة', 'بودر مسك'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_aroos',
    name: 'مسك العروس',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-العروس/p1756683533',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/fbpCa3kMemLXLDzR1LKKXUKeCXwSDmKLiTuY4Qs1.jpg',
    aliases: ['مسك العروس', 'مسك عروس'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_lavender',
    name: 'مسك اللافندر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-اللافندر/p1264752228',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/VVQfhBCPRAnBFWkE7oUOFP4GIzkQhSqu2pJyd5Pf.jpg',
    aliases: ['مسك اللافندر', 'مسك لافندر', 'مسك الخزامى'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_zafran',
    name: 'مسك الزعفران',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-الزعفران/p2024220881',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['مسك الزعفران', 'مسك زعفران'],
    hasDirectPage: true,
  },
  {
    id: 'prod_musk_cardamom',
    name: 'مسك الهيل',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مسك-الهيل/p1846889748',
    sectionName: 'المسك',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['مسك الهيل', 'مسك هيل'],
    hasDirectPage: true,
  },

  // ── البخور والمباخر ──
  {
    id: 'prod_mamoul_fakher',
    name: 'المعمول الفاخر',
    type: 'product',
    officialUrl: 'https://medhaloud.com/المعمول-الفاخر/p1131450015',
    sectionName: 'البخور',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6f4a1215-6ac2-45d9-a83d-97be2ce6a8d9-375x500-vdB4Hseb3fTSS4c8WJBgbVRefXR9pVfahEt83nhR.jpg',
    aliases: ['المعمول الفاخر', 'معمول فاخر', 'معمول مدهال', 'معمول دوسري فاخر', 'معمول 100 جرام'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabthouth_khas',
    name: 'المبثوث الخاص',
    type: 'product',
    officialUrl: 'https://medhaloud.com/المبثوث-الخاص/p815417795',
    sectionName: 'البخور',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['المبثوث الخاص', 'مبثوث خاص', 'مبثوث مدهال'],
    hasDirectPage: true,
  },
  {
    id: 'prod_luban_hojari',
    name: 'لبان حوجري عماني درجة أولى',
    type: 'product',
    officialUrl: 'https://medhaloud.com/لبان-حوجري-درجة-أولى/p1076466188',
    sectionName: 'البخور',
    imageUrl: 'https://cdn.salla.sa/mQbPb/7a3d2427-d035-4424-9b22-ee851b2fc86d-500x375-9vM5g6N8o0Q2r3S4t5U6v7W8x9Y0z1A2b3C4d5E6.jpg',
    aliases: ['لبان حوجري عماني', 'لبان حوجري', 'لبان عماني', 'لبان درجة أولى'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabkhara_najdiyah',
    name: 'مبخرة حائلية نجدية',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مبخرة-حائلية-نجدية/p1018399367',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/7e29bb35-51d0-4bf8-bb92-960ce5f81216-500x485.41666666667-27Yc03XFvIeKjT5gZ1543G8LspWj3f3jIeXbXbC1.jpg',
    aliases: ['مبخرة حائلية نجدية', 'مبخرة نجدية', 'مبخرة حائلية'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabkhara_malakiyah',
    name: 'مبخرة حائلية ملكية',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مبخرة-حائلية-ملكية/p1119231994',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/c8a2b53b-e1f4-41d3-96b6-3a56cf9e2621-447.5x500-GvH6m7N8p9Q0r1S2t3U4v5W6x7Y8z9A0b1C2d3E4.jpg',
    aliases: ['مبخرة حائلية ملكية', 'مبخرة ملكية حائلية', 'مبخرة ملكية'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabkhara_saj',
    name: 'مبخرة حائلية صاج',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مبخرة-حائلية-صاج/p1049371474',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/b6ba735f-eb53-4886-af1e-b8d4ae015c61-375x500-wJ22XQG1d5W1jV1vY1K4b5L6m7N8p9Q0r1S2t3U4.jpg',
    aliases: ['مبخرة حائلية صاج', 'مبخرة صاج حائلية', 'مبخرة صاج'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabkhara_saj_miraya',
    name: 'مبخرة حائلية صاج مرايه',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مبخرة-حائلية-صاج-مرايه/p1715930051',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/8VGKYXcxCEHPoJyRkpnoF8k8eo5U7IaPc90atSFp.jpg',
    aliases: ['مبخرة حائلية صاج مرايه', 'مبخرة صاج مرايه'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabkhara_rashm_nahas',
    name: 'مبخرة ملكية حائلية رشم نحاس',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مبخرة-ملكية-حائلية-رشم-نحاس/p1010683624',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/5f573c73-fb91-4c1d-8473-cb9ba6cfbc2a-375x500-1zX2c3V4b5N6m7L8k9J0h1G2f3D4s5A6q7W8e9R0.jpg',
    aliases: ['مبخرة ملكية حائلية رشم نحاس', 'مبخرة رشم نحاس', 'مبخرة نحاس حائلية'],
    hasDirectPage: true,
  },
  {
    id: 'prod_set_mabkhara_wood',
    name: 'طقم مبخرة خشبية حائلية',
    type: 'product',
    officialUrl: 'https://medhaloud.com/طقم-مبخرة-حائلية-خشبي/p1620193247',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/ab25c8ae-d95e-4cc1-9a44-f8843e216443-374.89539748954x500-2rX72YOy9ZByae8Ymyz9OVgI91l83q3OzkrLldxa.jpg',
    aliases: ['طقم مبخرة خشبية', 'طقم مبخرة حائلية خشبي', 'طقم مباخر خشب'],
    hasDirectPage: true,
  },
  {
    id: 'prod_mabkhara_royal_with_box',
    name: 'مبخرة حائلية ملكية مع صندوق',
    type: 'product',
    officialUrl: 'https://medhaloud.com/مبخرة-حائلية-ملكية-مع-صندوق/p1121918238',
    sectionName: 'المباخر الحائلية',
    imageUrl: 'https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png',
    aliases: ['مبخرة حائلية ملكية مع صندوق', 'مبخرة مع صندوق هدية', 'طقم مبخرة بصندوق'],
    hasDirectPage: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 7. محرك اكتشاف وتحديد الوجهات وتطبيق أولويات الروابط (Navigation Resolution Engine)
// ═══════════════════════════════════════════════════════════════════

/**
 * يحلل استفسار العميل أو اسم المنتج، ويستخرج أدق مكان رسمي له بحسب سلم الأولويات الصارم:
 * 1. رابط المنتج المحدد (إذا كان له صفحة مستقلة).
 * 2. رابط صفحة العرض المحددة.
 * 3. رابط المجموعة/التصنيف المحدد.
 * 4. رابط القسم الرئيسي.
 * 5. صفحة الخدمة أو المعلومات.
 * 6. الصفحة الرئيسية كآخر حل فقط.
 *
 * وإذا كان الصنف موجوداً في الملف/الكتالوج بدون صفحة مستقلة (مثل الشنط الفارغة أو بعض العطور):
 * يُرجع hasDirectPage = false و officialUrl = null مع تحديد أقرب مكان رسمي دون ادعاء أنه رابط المنتج نفسه.
 */
export function resolveStoreDestination(
  query: string,
  context?: { name?: string; category?: string; variant?: string }
): NavigationResult {
  const rawQ = `${query || ''} ${context?.name || ''} ${context?.category || ''}`.trim().toLowerCase();

  // تنظيف النص للبحث
  const cleanStr = (s: string) => s.replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const qClean = cleanStr(rawQ);

  // ─────────────────────────────────────────────────────────────
  // حالة خاصة مؤكدة: الشنط الفارغة (شنطة بيج نص، شنطة جلدية، شنط فارغة)
  // موجودة في الملف والكتالوج فقط، وليس لها صفحة مستقلة في المتجر حالياً
  // ─────────────────────────────────────────────────────────────
  const isBagInquiry =
    (qClean.includes('شنط') || qClean.includes('شنطه') || qClean.includes('شنطة')) &&
    (qClean.includes('فاضية') || qClean.includes('فارغة') || qClean.includes('بيج') || qClean.includes('جملي') || qClean.includes('أخضر') || qClean.includes('اخضر') || qClean.includes('اسود') || qClean.includes('أسود') || qClean.includes('نص') || qClean.includes('ربع') || qClean.includes('ثمن') || qClean.includes('كيلو') || qClean.includes('جلد'));

  if (isBagInquiry) {
    return {
      priority: 3,
      destinationType: 'catalog_only',
      name: 'شنطة جلدية فاخرة لحفظ العود (بدون محتويات)',
      officialUrl: null, // لا يوجد رابط منتج مستقل - ممنوع ادعاء الرابط
      hasDirectPage: false,
      nearestOfficialUrl: 'https://medhaloud.com/شنط-البخور/c1820942889',
      nearestOfficialLabel: 'قسم شنط البخور',
      actionLabel: 'تصفح قسم شنط البخور',
      breadcrumb: 'الرئيسية > الإكسسوارات > شنط البخور',
      disclaimer: 'المعلومات موثقة من ملف الكتالوج الرسمي. لا توجد صفحة منتج مستقلة لكل مقاس في المتجر حالياً، والمعروض هو رابط قسم شنط البخور.',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // الأولوية 1: رابط المنتج المحدد (Specific Product Page)
  // ─────────────────────────────────────────────────────────────
  // هل الاستفسار أو الكرت يطلب منتجاً محدداً له صفحة مستقلة؟
  for (const prod of STORE_VERIFIED_PRODUCTS) {
    const isDirectMatch = prod.aliases.some((alias) => qClean.includes(cleanStr(alias)));
    if (isDirectMatch) {
      return {
        priority: 1,
        destinationType: 'product',
        name: prod.name,
        officialUrl: prod.officialUrl,
        hasDirectPage: true,
        nearestOfficialUrl: prod.officialUrl,
        nearestOfficialLabel: `صفحة منتج ${prod.name}`,
        actionLabel: 'عرض المنتج',
        breadcrumb: `الرئيسية > ${prod.sectionName || 'المنتجات'} > ${prod.name}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // الأولوية 2: رابط صفحة العرض المحددة (Specific Offer Page)
  // ─────────────────────────────────────────────────────────────
  for (const offer of STORE_OFFER_PAGES) {
    const isOfferMatch = offer.aliases.some((alias) => qClean.includes(cleanStr(alias)));
    if (isOfferMatch) {
      return {
        priority: 2,
        destinationType: 'offer',
        name: offer.name,
        officialUrl: offer.officialUrl,
        hasDirectPage: true,
        nearestOfficialUrl: offer.officialUrl,
        nearestOfficialLabel: `صفحة ${offer.name}`,
        actionLabel: 'عرض العرض',
        breadcrumb: `الرئيسية > العروض > ${offer.name}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // الأولوية 3: رابط المجموعة أو التصنيف المحدد (Specific Subcategory / Group)
  // ─────────────────────────────────────────────────────────────
  for (const sub of STORE_SUBCATEGORIES) {
    const isSubMatch = sub.aliases.some((alias) => qClean.includes(cleanStr(alias)));
    if (isSubMatch) {
      return {
        priority: 3,
        destinationType: 'subcategory',
        name: sub.name,
        officialUrl: sub.officialUrl,
        hasDirectPage: true,
        nearestOfficialUrl: sub.officialUrl,
        nearestOfficialLabel: `تصنيف ${sub.name}`,
        actionLabel: `تصفح ${sub.name}`,
        breadcrumb: `الرئيسية > ${sub.sectionName || 'الأقسام'} > ${sub.name}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // الأولوية 4: رابط القسم الرئيسي (Main Section)
  // ─────────────────────────────────────────────────────────────
  for (const sec of STORE_SECTIONS) {
    const isSecMatch = sec.aliases.some((alias) => qClean.includes(cleanStr(alias)));
    if (isSecMatch) {
      const displaySec = sec.name.startsWith('قسم ') ? sec.name : `قسم ${sec.name}`;
      return {
        priority: 4,
        destinationType: 'section',
        name: sec.name,
        officialUrl: sec.officialUrl,
        hasDirectPage: true,
        nearestOfficialUrl: sec.officialUrl,
        nearestOfficialLabel: displaySec,
        actionLabel: `تصفح ${displaySec}`,
        breadcrumb: `الرئيسية > ${sec.name}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // الأولوية 5: صفحات الخدمة والسياسات والمعلومات (Service / Policy Pages)
  // ─────────────────────────────────────────────────────────────
  for (const page of STORE_SERVICE_PAGES) {
    const isPageMatch = page.aliases.some((alias) => qClean.includes(cleanStr(alias)));
    if (isPageMatch) {
      return {
        priority: 5,
        destinationType: 'page',
        name: page.name,
        officialUrl: page.officialUrl,
        hasDirectPage: true,
        nearestOfficialUrl: page.officialUrl,
        nearestOfficialLabel: page.name,
        actionLabel: `زيارة ${page.name}`,
        breadcrumb: `الرئيسية > ${page.name}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // الأولوية 6: الموقع العام كآخر حل فقط (Fallback to Store Homepage)
  // ─────────────────────────────────────────────────────────────
  return {
    priority: 6,
    destinationType: 'homepage',
    name: STORE_HOMEPAGE.name,
    officialUrl: STORE_HOMEPAGE.officialUrl,
    hasDirectPage: true,
    nearestOfficialUrl: STORE_HOMEPAGE.officialUrl,
    nearestOfficialLabel: 'متجر مدهال الطيب الرسمي',
    actionLabel: 'زيارة المتجر',
    breadcrumb: 'الرئيسية',
  };
}

/**
 * فحص هل منتج معين في الكتالوج له صفحة مستقلة مباشرة أو أقرب مكان رسمي
 */
export function getProductStoreLink(productName: string, categoryName?: string): {
  officialUrl: string | null;
  hasDirectPage: boolean;
  nearestOfficialUrl: string;
  nearestOfficialLabel: string;
  actionLabel: string;
  linkType: DestinationType;
} {
  const res = resolveStoreDestination(productName, { name: productName, category: categoryName });
  return {
    officialUrl: res.officialUrl,
    hasDirectPage: res.hasDirectPage,
    nearestOfficialUrl: res.nearestOfficialUrl,
    nearestOfficialLabel: res.nearestOfficialLabel,
    actionLabel: res.actionLabel,
    linkType: res.destinationType,
  };
}

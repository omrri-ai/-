import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MidhalKnowledgeBase, ProductCardData, CustomerMessage } from './src/types.ts';
import { MIDHAL_OFFICIAL_CATALOG, searchCatalog, findOptionsByBudget } from './src/data/midhalCatalog.ts';
import { PERFUME_PROFILES, getVerifiedMediaForProduct } from './src/data/officialStoreData.ts';
import {
  resolveStoreDestination,
  STORE_SECTIONS,
  STORE_SUBCATEGORIES,
  STORE_OFFER_PAGES,
  STORE_SERVICE_PAGES,
  STORE_VERIFIED_PRODUCTS,
  STORE_HOMEPAGE,
} from './src/data/storeSiteMap.ts';
import { analytics } from './server/analyticsStore.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Knowledge Base store for Midhal Al-Teeb loaded with the Official PDF Data
let midhalKnowledge: MidhalKnowledgeBase = {
  isConfigured: true,
  storeName: 'مدهال الطيب للعود والطيب الفاخر',
  tagline: 'لأصالة العود والطيب الفاخر - أسعار جملة',
  branches: [],
  shippingInfo: {
    availableCities: 'جميع مناطق ومدن المملكة العربية السعودية ودول الخليج والعالم',
    shippingCompanies: ['أرامكس', 'سمسا', 'دي اتش ال (DHL)'],
    standardTime: 'داخل المملكة: 2 إلى 4 أيام عمل (وفي الأسئلة الشائعة من 3 إلى 5 أيام عمل). دول الخليج والعالم: من 4 إلى 6 أيام عمل.',
  },
  policies: {
    returns: 'يحق للعميل الاستبدال أو الاسترجاع خلال 7 أيام من استلام الطلب الإلكتروني (و3 أيام للفرع) بحالته الأصلية وتغليفه وفاتورته. لا يشمل المنتجات المخصصة حسب الطلب. تكلفة شحن الإرجاع على العميل ما لم يكن الخطأ من المتجر.',
    paymentMethods: ['مدى', 'فيزا / ماستركارد', 'أبل باي (Apple Pay)', 'تابي (متاح فقط في قسم العروض)'],
  },
  activeOffers: [
    { title: 'عروض الكميات والعود', details: 'عروض بأوزان ثابتة وشحن مجاني لبعض العروض (مثل عود كمبودي تايقر ربع ونصف كيلو، والدقة الكمبودية ربع ونصف كيلو).' },
    { title: 'تنبيه تابي', details: 'الطلب عن طريق تابي متاح حصرياً من قسم العروض.' },
  ],
  products: MIDHAL_OFFICIAL_CATALOG.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    type: c.type,
    price: c.displayedCardPrice || undefined,
    inStock: c.overallAvailability === 'متوفر' || c.overallAvailability === 'متوفر جزئياً',
    notes: c.notes,
  })),
  customKnowledgeNotes: 'تم ربط واعتماد ملف مدهال-الطيب-البيانات-الكاملة.pdf كمرجع تجاري ورسمي وحيد وأساسي للأسعار والأوزان والكميات والخيارات.',
};

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildCatalogTextRepresentation(): string {
  let text = '';
  for (const item of MIDHAL_OFFICIAL_CATALOG) {
    text += `\n[منتج: ${item.name}] | القسم: ${item.category} | النوع: ${item.type || 'عام'} | الحالة العامة: ${item.overallAvailability}`;
    if (item.colors) text += ` | الألوان المتاحة: ${item.colors.join('، ')}`;
    if (item.isEmptyBag) text += ` | طبيعة المنتج: شنطة فارغة تماماً بدون أي محتويات داخلها`;
    if (item.notes) text += ` | ملاحظة / الوصف: ${item.notes}`;
    text += '\n  الخيارات والأوزان والأسعار المعتمدة:';
    for (const v of item.variants) {
      const stockStr = v.inStock ? 'متوفر' : 'غير متوفر (نفدت الكمية / مخلص حالياً)';
      text += `\n   - الخيار: "${v.variantName}" | الوزن: ${v.displayedWeight || 'غير محدد'} | السعر: ${v.priceDisplay} | الحالة: ${stockStr}`;
      if (v.notes) text += ` (${v.notes})`;
    }
  }
  return text;
}

function buildSiteMapTextRepresentation(): string {
  let text = 'خريطة المتجر وروابط الأقسام والتصنيفات الرسمية المعتمدة (medhaloud.com):\n';
  text += '\n1. الأقسام الرئيسية في المتجر (Main Sections):\n';
  for (const s of STORE_SECTIONS) {
    text += `- [قسم ${s.name}](${s.officialUrl})\n`;
  }
  text += '\n2. التصنيفات والمجموعات الفرعية المتخصصة (Subcategories & Collections):\n';
  for (const sub of STORE_SUBCATEGORIES) {
    text += `- [تصنيف ${sub.name}](${sub.officialUrl}) (يتبع قسم: ${sub.sectionName || 'المتجر'})\n`;
  }
  text += '\n3. صفحات العروض المستقلة المحددة (Specific Offer Pages):\n';
  for (const o of STORE_OFFER_PAGES) {
    text += `- [صفحة ${o.name}](${o.officialUrl}): ${o.notes || ''}\n`;
  }
  text += '\n4. صفحات الخدمة والسياسات والمعلومات (Service & Policy Pages):\n';
  for (const p of STORE_SERVICE_PAGES) {
    text += `- [${p.name}](${p.officialUrl})\n`;
  }
  text += '\n5. صفحات منتجات رئيسية موثقة مستقلة:\n';
  for (const pr of STORE_VERIFIED_PRODUCTS.slice(0, 20)) {
    text += `- [${pr.name}](${pr.officialUrl})\n`;
  }
  return text;
}

const CATALOG_TEXT_REPRESENTATION = buildCatalogTextRepresentation();
const STORE_SITEMAP_REPRESENTATION = buildSiteMapTextRepresentation();

function buildSystemInstruction(knowledge: MidhalKnowledgeBase): string {
  return `
أنت موظف خدمة عملاء ومبيعات حقيقي، خبير ومستشار فاهم في متجر "مدهال الطيب" للعود والطيب الفاخر في المملكة العربية السعودية.
أسلوبك سعودي مهذب، أصيل، فاهم، لطيف ومحترم جداً (مثل: حيّاك الله، يا هلا والله، أبشر بسعدك، سم، الله يسعدك).

══════════════════════════════════════════════════
المرجع التجاري الأساسي الصارم:
══════════════════════════════════════════════════
الكتالوج الرسمي المعتمد أدناه هو المرجع التجاري الوحيد للأسعار والكميات والأوزان والخيارات التجارية.
أي معلومة سعرية أو كمية يجب أن تؤخذ حصراً ومباشرة من جدول الكتالوج الرسمي.

══════════════════════════════════════════════════
قواعد الأسلوب والبيع الذكي والربط بالمتجر (12 قاعدة إلزامية ومحكمة):
══════════════════════════════════════════════════

1. أولوية طلب العميل المحدد (مقدمة بصرامة على نظام الترشيحات والـ 3 بطاقات):
   - إذا حدد العميل منتجاً معيناً باسمه أو صفته (مثل: "أبي تايقر ذهبي"، "أبي تايقر ذهبي كيلو"، "أبي شنطة بيج ثمن"، "أبي شنطة بيج"، "أبي عطر Royal"، "أبي موروكي التميز"، "أبي سيوفي كينغ"، "أبي بكج التايقر"، "أبي زعفران إيراني"):
     * اعرض هذا المنتج المحدد فقط في إجابتك وفي بطاقات المنتجات (CARDS)!
     * ممنوع منعاً باتاً إضافة منتجات أخرى مختلفة أو اقتراح أنواع ثانية من عندك لمجرد ملء 3 بطاقات!
     * الـ 3 خيارات تُستخدم فقط عندما يطلب العميل ترشيحاً مفتوحاً ("رشح لي"، "وش تنصحني") وليس عندما يحدد المنتج بنفسه.
     * إذا كان للمنتج المحدد عدة أوزان/مقاسات متوفرة (مثل أوقية، ثمن، ربع، نصف، كيلو)، يمكنك عرض أوزان نفس هذا المنتج فقط.
     * إذا حدد العميل وزناً معيناً (مثل "كيلو"): اعرض خيار الكيلو لهذا المنتج بالذات.
     * للشنط الفارغة: جميع الشنط جلدية. إذا طلب "شنطة بيج ثمن"، اعرض الشنطة الجلدية الفارغة باللون البيج مقاس ثمن بسعر 20 ريال فقط. ولا تستبدلها بشنطة سوداء أو خضراء تلقائياً. وإذا لم يتوفر المقاس المطلوب باللون البيج، اعرض المقاسات المتوفرة من نفس اللون البيج أولاً واشرح له ذلك، مع تقديم اقتراحات تفاعلية.

2. عدم افتراض نوع العود (قاعدة صارمة - لا تفترض نوع العود):
   - إذا قال العميل: "أبي عود للمجلس"، "أبي عود للبيت"، "أبي عود فواح"، أو طلب "عود" بشكل عام دون تحديد النوع (طبيعي أم محسن):
     * يمنع إطلاقاً افتراض أنه يريد عود طبيعي تلقائياً!
     * يمنع عرض منتجات العود الطبيعي فقط لمجرد استخدام كلمة "عود".
     * افهم الطلب أولاً، وتفهم أنه طلب عوداً، وإذا كان تحديد النوع مهماً لاختيار المنتج، اسأله سؤالاً توضيحياً قصيراً ومباشراً مثل:
       "تفضله طبيعي أو محسن؟ وإذا ما عندك تفضيل، أقدر أرشح لك من الاثنين."
     * ولا تعرض منتجات العود الطبيعي فقط لمجرد أن العميل قال "عود".
   - إذا قال العميل صراحة "أبي عود طبيعي" أو "أبي عود طبيعي للمجلس": ابحث وعرض في العود الطبيعي فقط.
   - إذا قال العميل صراحة "أبي عود محسن": ابحث وعرض في العود المحسن فقط.
   - إذا طلب العميل منتجاً محددات بخصوصيته أو اسمه (مثل "تايقر ذهبي"، "موروكي التميز"): التزم بالمنتج المطلوب فقط ولا تضف أنواعاً أخرى بلا سبب.

3. تصحيح بيانات الشنط (شنط جلدية فقط):
   - جميع الشنط الموجودة في متجر مدهال الطيب هي شنط جلدية فاخرة.
   - لا توجد شنط قماش ضمن بيانات المتجر إطلاقاً.
   - لا تقل للعميل "شنط قماش" ولا تصف أي شنطة بأنها قماش.
   - استخدم وصف جلد / شنطة جلدية دائماً.
   - الشنط الفارغة أيضاً جلد، وليست قماش.
   - الشنط الفارغة متوفرة بالجلد وبأربعة ألوان رسمية: (جملي، بيج، أخضر، أسود).
   - مقاسات وأسعار الشنط الجلدية الفارغة:
     * ثمن كيلو (125 جم): 20 ريال
     * ربع كيلو (250 جم): 25 ريال
     * نصف كيلو (500 جم): 30 ريال
     * كيلو (1000 جم): 35 ريال
   - إذا قال العميل "أبي شنطة": افهم أنه يقصد شنطة جلدية من منتجات مدهال الطيب.
   - إذا قال "شنطة بيج": ابحث عن الشنط الجلدية باللون البيج.
   - إذا قال "شنطة بيج ثمن": ابحث عن شنطة جلدية بيج بالمقاس/الوزن المطلوب (ثمن كيلو بسعر 20 ريال).
   - لا تخترع خامة أو منتجاً غير موجود.

4. عقلية البائع وفهم احتياج العميل والتوضيح دون افتراضات:
   - لا تفترض معلومات لم يذكرها العميل إذا كان الافتراض سيغير نتيجة البحث.
   - افهم الطلب أولاً، ثم اسأل سؤالاً توضيحياً قصيراً عند الحاجة، أو اعرض الخيارات المناسبة إذا كان يمكن ذلك بدون افتراض.

5. عطور مدهال الطيب ومستوحياتها والملامح العطرية:
   - السعة الصحيحة لجميع العطور: 100 مل.
   - السعر الرسمي لكل عطر: 75 ريال (مخفض من 125 ريال).
   - قائمة العطور واستيحائها الرسمي:
     * رويال (Royal) ← مستوحى من Romford (نفدت الكمية حالياً).
     * لكجري (Luxury) ← مستوحى من Tobacco (متوفر - صفحة مستقلة).
     * اروجنت (Arrogant) ← مستوحى من Memo (متوفر - صفحة مستقلة).
     * اتنشن (Attention) ← مستوحى من Dior (متوفر).
     * لورد (Lord) ← مستوحى من Tuxedo (متوفر).
     * ريتش (Rich) ← مستوحى من Nishane (نفدت الكمية حالياً).
     * مارفل (Marvel) ← مستوحى من Van Cleef (متوفر - صفحة مستقلة).
     * ماجيك (Magic) ← مستوحى من Armani (نفدت الكمية حالياً - صفحة مستقلة).
     * اليجنت (Elegant) ← مستوحى من Guerlain (متوفر).
     * فلفيت روز (Velvet Rose) ← مستوحى من Guerlain Paris (متوفر - صفحة مستقلة).
     * بيلا (Bella) ← مستوحى من Chanel (متوفر).
     * فلورا (Flora) ← مستوحى من Parfums de Marly Valaya (متوفر).

6. العروض الحالية بالموقع (قسم العروض المعتمدة):
   - إذا سأل العميل عاماً: "عندكم عروض؟" أو "وش العروض المتوفرة؟" أو "وين عروضكم؟":
     وجّهه إلى [قسم العروض والتخفيضات](https://medhaloud.com/العروض/c1691136638) واعرض العروض الرسمية المؤكدة:
     * بكج التايقر: ثمن كيلو عود كمبودي تايقر محسن فاخر بـ 150 ريال.
     * عرض الدقة الكمبودية: دقة عود كمبودي طبيعي محسن فاخر بـ 149 ريال.
     * بكج السيوفي الكنق: أوقية سيوفي كنج فيتنامي طبيعي مع هدايا تولة ومبخرة بـ 285 ريال.
     * عروض تخفيض العطور الفاخرة: جميع العطور سعة 100 مل بسعر موحد 75 ريال بدلاً من 125 ريال.

7. نظام الروابط والتنقل العام لكامل متجر مدهال الطيب (Store Navigation Hierarchy):
   - التزم بسلم أولويات الروابط التالي بدقة متناهية:
     1. الأولوية 1: منتج له صفحة مستقلة ← استخدم رابط صفحة المنتج نفسها (مثال: عود تايقر محسن: https://medhaloud.com/عود-كمبودي-محسن-التايقر/p1585084528، عطر لكجري: https://medhaloud.com/luxury/p1907815091، موري نجلاند: https://medhaloud.com/عود-موري-هندي-نجلاند-سوبر-ومرتفع/p1115139655).
     2. الأولوية 2: عرض له صفحة مستقلة ← استخدم رابط العرض نفسه (مثال: بكج التايقر: https://medhaloud.com/بكج-التايقر/p1037054180، بكج السيوفي: https://medhaloud.com/بكج-السيوفي-الكنق/p2018823084، عرض الدقة الكمبودية: https://medhaloud.com/عرض-الدقة-الكمبودية/p234567457).
     3. الأولوية 3: تصنيف أو مجموعة فرعية محددة ← استخدم رابط التصنيف نفسه (مثال: [قسم شنط البخور](https://medhaloud.com/شنط-البخور/c1820942889)، علب البخور https://medhaloud.com/علب-البخور/c937881141).
     4. الأولوية 4: قسم رئيسي ← استخدم رابط القسم نفسه.
     5. الأولوية 5: حالة الصنف بدون صفحة مستقلة (مثل الشنط الفارغة): اعرض كافة معلوماته، واستخدم رابط قسم شنط البخور مع التوضيح الصريح في الرد أنه رابط القسم الأقرب وليس صفحة منتج مستقلة.

8. صور المنتجات الرسمية الحقيقية:
   - كافة الأقسام يجب أن تستخدم الصور الرسمية المعتمدة من المتجر وسيرفراته CDN.
   - ممنوع منعاً باتاً استخدام Placeholder أو صور مولدة بالذكاء الاصطناعي.

9. بطاقات المنتجات المخرجة (CARDS):
   - للطلبات المحددة: أخرج كروت المنتج المطلوب فقط (أو أوزانه/مقاساته لنفس المنتج).
   - للترشيح المفتوح: أخرج بحد أقصى 3 كروت مختلفة.
   - صيغة السطر: CARDS: [{"name": "اسم المنتج المطابق", "variant": "الوزن أو السعة أو المقاس", "price": السعر_رقمياً, "description": "وصف موجز موثق"}]

10. الاقتراحات التفاعلية (SUGGESTIONS - بحد أقصى 3 فقط):
    - أضف سطراً مستقلاً: SUGGESTIONS: ["اقتراح 1", "اقتراح 2", "اقتراح 3"]

11. صفر اختلاق (قاعدة أمانة صارمة):
    - لا تخترع أسعاراً أو أوزاناً أو سعات أو روابط أو توفر من عندك إطلاقاً.

══════════════════════════════════════════════════
خريطة أقسام وتصنيفات وروابط متجر مدهال الطيب المعتمدة:
══════════════════════════════════════════════════
${STORE_SITEMAP_REPRESENTATION}

══════════════════════════════════════════════════
الكتالوج التجاري الكامل والأسعار الرسمية المعتمدة (ملف مدهال الطيب):
══════════════════════════════════════════════════
${CATALOG_TEXT_REPRESENTATION}
`;
}

// Helper to extract conversation intent summary for UI inspectability
function extractIntentAndContext(userMessage: string, history: Array<{ role: string; content: string }>) {
  const text = userMessage.toLowerCase();
  
  let intent = 'استفسار عام';
  let targetUsage = 'غير محدد';
  let productType = 'غير محدد';
  let budget: string | null = null;
  let currentSubject: string | null = null;

  // Intent detection
  if (text.includes('تنصحني') || text.includes('أبي') || text.includes('ابي') || text.includes('اريد') || text.includes('أريد') || text.includes('رشح') || text.includes('افضل') || text.includes('أفضل')) {
    intent = 'طلب ترشيح واختيار';
  } else if (text.includes('سعر') || text.includes('كم') || text.includes('بكم') || text.includes('سعره')) {
    intent = 'استفسار عن السعر';
  } else if (text.includes('فرق') || text.includes('طبيعي ومحسن') || text.includes('طبيعي والمحسن')) {
    intent = 'استفسار معرفي عن خصائص العود';
  } else if (text.includes('فرع') || text.includes('وين') || text.includes('موقع') || text.includes('شحن') || text.includes('توصيل')) {
    intent = 'استفسار عن خدمات وفروع المتجر';
  }

  // Product type
  if (text.includes('دهن') || text.includes('تولة') || text.includes('مسك')) {
    productType = 'دهن عود / مسك';
  } else if (text.includes('عود') || text.includes('بخور') || text.includes('خشب')) {
    productType = 'عود بخور';
  } else if (text.includes('مبخر') || text.includes('مبخرة')) {
    productType = 'مبخرة';
  }

  // Usage detection
  if (text.includes('بيت') || text.includes('منزل') || text.includes('غرفة')) {
    targetUsage = 'استخدام منزلي / يومي';
  } else if (text.includes('مجلس') || text.includes('ضيوف') || text.includes('مناسبات') || text.includes('عزيمة')) {
    targetUsage = 'مجلس وضيافة ومناسبات';
  } else if (text.includes('هدية') || text.includes('اهداء') || text.includes('إهداء')) {
    targetUsage = 'إهداء وفاخر';
  } else if (text.includes('ملابس') || text.includes('ثياب') || text.includes('شعر')) {
    targetUsage = 'ملابس وأقمشة شخصية';
  }

  // Budget detection
  const budgetMatch = text.match(/(\d+)\s*(ريال|رس|SAR)?/);
  if (budgetMatch) {
    budget = `${budgetMatch[1]} ريال`;
  }

  // Find subject from context if user says "هذا" or "سعره"
  if (text.includes('سعره') || text.includes('هذا') || text.includes('فرقه')) {
    currentSubject = 'مرتبط بآخر منتج أو موضوع تم ذكره في المحادثة (فهم السياق)';
  }

  return {
    detectedIntent: intent,
    targetUsage,
    productType,
    budgetMentioned: budget,
    currentSubject,
  };
}

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', store: 'مدهال الطيب' });
});

// Official Catalog Endpoints
app.get('/api/catalog', (_req: Request, res: Response) => {
  res.json({
    totalProducts: MIDHAL_OFFICIAL_CATALOG.length,
    catalog: MIDHAL_OFFICIAL_CATALOG,
  });
});

app.get('/api/catalog/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const weight = (req.query.weight as string) || '';
  const maxBudget = req.query.budget ? Number(req.query.budget) : undefined;

  if (maxBudget) {
    const budgetResults = findOptionsByBudget(maxBudget);
    res.json({ count: budgetResults.length, results: budgetResults });
    return;
  }

  const results = searchCatalog(query, weight);
  res.json({ count: results.length, results });
});

// Get current knowledge base config
app.get('/api/knowledge', (_req: Request, res: Response) => {
  res.json(midhalKnowledge);
});

// Update knowledge base (allows manager to upload or paste Midhal's official products)
app.post('/api/knowledge', (req: Request, res: Response) => {
  try {
    const updated = req.body;
    midhalKnowledge = {
      ...midhalKnowledge,
      ...updated,
      isConfigured: (updated.products && updated.products.length > 0) || Boolean(updated.customKnowledgeNotes),
    };
    res.json({ success: true, message: 'تم تحديث قاعدة المعرفة بنجاح', knowledge: midhalKnowledge });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

interface GeminiReplyResult {
  text: string;
  modelUsed: string;
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
}

async function generateGeminiReply(
  ai: GoogleGenAI,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  systemInstruction: string
): Promise<GeminiReplyResult> {
  // Allowed models with fallback hierarchy (gemini-3.5-flash-lite primary)
  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      if (response.text) {
        const usage = (response as any).usageMetadata;
        const promptTokens = usage?.promptTokenCount || 0;
        const candidateTokens = usage?.candidatesTokenCount || 0;
        const totalTokens = usage?.totalTokenCount || (promptTokens + candidateTokens);

        return {
          text: response.text,
          modelUsed: model,
          promptTokens,
          candidateTokens,
          totalTokens,
        };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini API] model: ${model} encountered: ${errMsg}`);

      const nextModel = models[i + 1];
      if (nextModel) {
        analytics.recordFallback(model, nextModel, errMsg.slice(0, 100));
      }
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota')) {
        analytics.recordError('429', errMsg);
      } else {
        analytics.recordError('other', errMsg);
      }

      // If transient 503 or overload, retry once after short delay
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retryResponse = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          });
          if (retryResponse.text) {
            const usage = (retryResponse as any).usageMetadata;
            const promptTokens = usage?.promptTokenCount || 0;
            const candidateTokens = usage?.candidatesTokenCount || 0;
            const totalTokens = usage?.totalTokenCount || (promptTokens + candidateTokens);

            return {
              text: retryResponse.text,
              modelUsed: model,
              promptTokens,
              candidateTokens,
              totalTokens,
            };
          }
        } catch (retryErr: any) {
          lastError = retryErr;
        }
      }
      // On 429 or other errors, immediately proceed to next fallback model
    }
  }

  throw lastError || new Error('تعذر توليد الرد في الوقت الحالي');
}

// Helper to enforce exact single-product matching when user specifies a specific item
function processProductCardsForQuery(userMessage: string, rawCards: ProductCardData[]): ProductCardData[] {
  const normUser = userMessage.toLowerCase().trim();

  // 1. Check Tiger Golden request ("تايقر ذهبي", "تايجر ذهبي")
  if (normUser.includes('تايقر ذهبي') || normUser.includes('تايجر ذهبي')) {
    const tigerItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_1');
    if (tigerItem) {
      let filteredVariants = tigerItem.variants;
      if (normUser.includes('كيلو') && !normUser.includes('ثمن') && !normUser.includes('ربع') && !normUser.includes('نصف') && !normUser.includes('نص')) {
        filteredVariants = tigerItem.variants.filter((v) => v.variantName === 'الكيلو' || v.weightGrams === 1000);
      }
      return filteredVariants.slice(0, 3).map((v) => ({
        id: `${tigerItem.id}_${v.variantName}`,
        name: `${tigerItem.name} - ${v.variantName}`,
        category: tigerItem.category,
        variant: v.displayedWeight || v.variantName,
        price: v.price ?? undefined,
        priceDisplay: v.priceDisplay,
        description: tigerItem.notes,
        inStock: v.inStock,
        imageUrl: tigerItem.imageUrl,
        productUrl: tigerItem.productUrl,
        hasDirectPage: true,
      }));
    }
  }

  // 2. Check Empty Bag request ("شنطة بيج ثمن", "شنطة بيج", etc.)
  if ((normUser.includes('شنطة') || normUser.includes('شنط')) && (normUser.includes('بيج') || normUser.includes('سوداء') || normUser.includes('أسود') || normUser.includes('فاضية') || normUser.includes('فارغة'))) {
    const bagItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.isEmptyBag);
    if (bagItem) {
      let selectedVariants = bagItem.variants;
      if (normUser.includes('ثمن')) {
        selectedVariants = bagItem.variants.filter((v) => v.variantName.includes('ثمن'));
      } else if (normUser.includes('ربع')) {
        selectedVariants = bagItem.variants.filter((v) => v.variantName.includes('ربع'));
      } else if (normUser.includes('نص') || normUser.includes('نصف')) {
        selectedVariants = bagItem.variants.filter((v) => v.variantName.includes('نصف'));
      } else if (normUser.includes('كيلو') && !normUser.includes('ثمن') && !normUser.includes('ربع') && !normUser.includes('نص')) {
        selectedVariants = bagItem.variants.filter((v) => v.variantName === 'كيلو');
      }

      let colorName = 'بيج';
      if (normUser.includes('أسود') || normUser.includes('سوداء')) colorName = 'أسود';
      else if (normUser.includes('جملي')) colorName = 'جملي';
      else if (normUser.includes('أخضر') || normUser.includes('خضراء')) colorName = 'أخضر';

      return selectedVariants.slice(0, 4).map((v) => ({
        id: `empty_bag_${colorName}_${v.variantName}`,
        name: `شنطة حفظ عود جلدية فارغة (${colorName})`,
        category: 'الشنط',
        variant: `مقاس: ${v.displayedWeight || v.variantName}`,
        price: v.price ?? undefined,
        priceDisplay: v.priceDisplay,
        description: `شنطة جلدية فاخرة فارغة باللون (${colorName}) لحفظ البخور والعود.`,
        inStock: true,
        imageUrl: bagItem.imageUrl,
        productUrl: undefined,
        hasDirectPage: false,
      }));
    }
  }

  // 3. Check specific Perfume request ("عطر royal", "عطر لكجري", "عطر أروجنت", etc.)
  if (normUser.includes('عطر') || normUser.includes('معطر')) {
    const specificPerfumes = MIDHAL_OFFICIAL_CATALOG.filter((c) => c.id.startsWith('perfume_indiv_'));
    const matched = specificPerfumes.filter((p) => normUser.includes(p.name.toLowerCase().replace('عطر ', '').replace('معطر ', '')) || normUser.includes(p.id.replace('perfume_indiv_', '')));
    if (matched.length > 0) {
      return matched.map((item) => {
        let perfumeProfile: any = null;
        for (const p of Object.values(PERFUME_PROFILES) as any[]) {
          if (item.name.includes(p.name) || item.name.includes(p.englishName)) {
            perfumeProfile = p;
            break;
          }
        }
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          variant: 'السعة: 100 مل',
          capacity: '100 مل',
          inspiredBy: perfumeProfile?.inspiredBy,
          fragranceProfile: perfumeProfile?.character,
          price: 75,
          priceDisplay: '75 ريال',
          description: item.notes,
          inStock: item.overallAvailability !== 'نفدت الكمية',
          imageUrl: item.imageUrl || perfumeProfile?.imageUrl || null,
          productUrl: item.productUrl || perfumeProfile?.productUrl,
          hasDirectPage: true,
        };
      });
    }
  }

  // 4. Check Moroki Al-Tamayuz ("موروكي التميز", "مروكي التميز")
  if (normUser.includes('التميز') || normUser.includes('موروكي التميز') || normUser.includes('مروكي التميز')) {
    const tamayuzItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_5');
    if (tamayuzItem) {
      return [
        {
          id: tamayuzItem.id,
          name: tamayuzItem.name,
          category: tamayuzItem.category,
          variant: tamayuzItem.variants[0]?.variantName || 'أوقية',
          price: tamayuzItem.displayedCardPrice || 95,
          priceDisplay: tamayuzItem.variants[0]?.priceDisplay || '95 ريال',
          description: tamayuzItem.notes,
          inStock: true,
          imageUrl: tamayuzItem.imageUrl,
          productUrl: tamayuzItem.productUrl,
        },
      ];
    }
  }

  // 5. Check Seyoufi King ("سيوفي كينغ", "السيوفي الكنق")
  if (normUser.includes('سيوفي كينغ') || normUser.includes('سيوفي كنج') || normUser.includes('السيوفي الكنق')) {
    const seyoufiItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_8' || c.id === 'offer_3');
    if (seyoufiItem) {
      return [
        {
          id: seyoufiItem.id,
          name: seyoufiItem.name,
          category: seyoufiItem.category,
          variant: seyoufiItem.variants[0]?.variantName || 'أوقية',
          price: seyoufiItem.displayedCardPrice || 100,
          priceDisplay: seyoufiItem.variants[0]?.priceDisplay || '100 ريال',
          description: seyoufiItem.notes,
          inStock: true,
          imageUrl: seyoufiItem.imageUrl,
          productUrl: seyoufiItem.productUrl,
        },
      ];
    }
  }

  // 6. Check Saffron ("زعفران إيراني")
  if (normUser.includes('زعفران إيراني') || normUser.includes('زعفران ايراني')) {
    const saffronItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'saffron_1');
    if (saffronItem) {
      return [
        {
          id: saffronItem.id,
          name: saffronItem.name,
          category: saffronItem.category,
          variant: saffronItem.variants[0]?.variantName || 'جرام',
          price: saffronItem.displayedCardPrice || 18,
          priceDisplay: saffronItem.variants[0]?.priceDisplay || '18 ريال',
          description: saffronItem.notes,
          inStock: true,
          imageUrl: saffronItem.imageUrl,
          productUrl: saffronItem.productUrl,
        },
      ];
    }
  }

  // Filter rawCards if user requested a specific product name that rawCards mixed up
  if (rawCards.length > 0) {
    const lowerUser = normUser.toLowerCase();
    if (lowerUser.includes('تايقر ذهبي') || lowerUser.includes('تايجر ذهبي')) {
      const filtered = rawCards.filter((c) => c.name.includes('التايقر') || c.name.includes('تايقر') || Boolean(c.id && c.id.includes('enh_1')));
      if (filtered.length > 0) return filtered;
    }
  }

  return rawCards;
}

function parseReplyAndSuggestions(text: string, userMessage: string): {
  reply: string;
  suggestions: string[];
  productCards: ProductCardData[];
} {
  if (!text) return { reply: '', suggestions: [], productCards: [] };
  // Remove any thought or reasoning tags if generated
  let cleaned = text.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  // Remove explicit thinking prefixes if any
  cleaned = cleaned.replace(/^(التفكير الداخلي|تحليل الطلب|خطوات الاستدلال):.*$/gmi, '');

  let productCards: ProductCardData[] = [];
  const cardsMatch = cleaned.match(/CARDS:\s*(\[[^\]]*\])/i);
  if (cardsMatch) {
    try {
      const parsedCards = JSON.parse(cardsMatch[1]);
      if (Array.isArray(parsedCards)) {
        productCards = parsedCards;
      }
    } catch {
      // Fallback regex parsing if needed
    }
    cleaned = cleaned.replace(/CARDS:\s*(\[[^\]]*\])/gi, '').trim();
  }

  let suggestions: string[] = [];
  const suggestionsMatch = cleaned.match(/SUGGESTIONS:\s*(\[[^\]]*\])/i);
  if (suggestionsMatch) {
    try {
      const parsed = JSON.parse(suggestionsMatch[1]);
      if (Array.isArray(parsed)) {
        suggestions = parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, 3);
      }
    } catch {
      const matches = suggestionsMatch[1].match(/"([^"]+)"|'([^']+)'/g);
      if (matches) {
        suggestions = matches.map((m) => m.replace(/["']/g, '').trim()).filter(Boolean).slice(0, 3);
      }
    }
    cleaned = cleaned.replace(/SUGGESTIONS:\s*(\[[^\]]*\])/gi, '').trim();
  }

  // Enrich product cards with official catalog media and verified data
  productCards = productCards.map((card) => {
    // Find matching catalog item
    const matchedItem = MIDHAL_OFFICIAL_CATALOG.find((cat) => {
      const cName = cat.name.toLowerCase();
      const cardName = (card.name || '').toLowerCase();
      return cName.includes(cardName) || cardName.includes(cName);
    });

    // Check if it is a perfume profile
    let perfumeInfo: any = null;
    const cardTitle = (card.name || matchedItem?.name || '').toLowerCase();
    for (const [key, p] of (Object.entries(PERFUME_PROFILES) as [string, any][])) {
      if (cardTitle.includes(p.name.toLowerCase().replace('عطر ', '')) || cardTitle.includes(p.englishName.toLowerCase())) {
        perfumeInfo = p;
        break;
      }
    }

    if (matchedItem) {
      const matchedVariant = card.variant
        ? matchedItem.variants.find((v) => v.variantName.includes(card.variant!) || (card.variant && card.variant.includes(v.variantName)))
        : matchedItem.variants[0];

      const rawUrl = matchedItem.productUrl || perfumeInfo?.productUrl || getVerifiedMediaForProduct(card.name || matchedItem.name).productUrl;
      const validProductUrl = (rawUrl && rawUrl !== 'https://medhaloud.com/' && rawUrl !== 'https://medhaloud.com') ? rawUrl : undefined;

      const isPerfume = matchedItem.category === 'العطور ومعطرات الجو' || Boolean(perfumeInfo) || cardTitle.includes('عطر');

      return {
        id: matchedItem.id,
        name: card.name || matchedItem.name,
        category: card.category || matchedItem.category,
        variant: isPerfume ? 'السعة: 100 مل' : (card.variant || (matchedVariant ? matchedVariant.displayedWeight || matchedVariant.variantName : undefined)),
        capacity: isPerfume ? '100 مل' : undefined,
        inspiredBy: perfumeInfo?.inspiredBy || card.inspiredBy,
        fragranceProfile: perfumeInfo?.character || card.fragranceProfile,
        price: isPerfume ? 75 : (card.price || matchedVariant?.price || matchedItem.displayedCardPrice || undefined),
        priceDisplay: isPerfume ? '75 ريال' : (card.priceDisplay || matchedVariant?.priceDisplay || (card.price ? `${card.price} ريال` : undefined)),
        description: card.description || matchedItem.notes,
        inStock: card.inStock !== undefined ? card.inStock : (perfumeInfo ? perfumeInfo.inStock : (matchedVariant ? matchedVariant.inStock : matchedItem.overallAvailability !== 'نفدت الكمية')),
        imageUrl: matchedItem.imageUrl || perfumeInfo?.imageUrl || getVerifiedMediaForProduct(card.name || matchedItem.name).imageUrl || null,
        productUrl: validProductUrl,
      };
    }

    if (perfumeInfo) {
      const validProductUrl = (perfumeInfo.productUrl && perfumeInfo.productUrl !== 'https://medhaloud.com/' && perfumeInfo.productUrl !== 'https://medhaloud.com') ? perfumeInfo.productUrl : undefined;
      return {
        ...card,
        category: 'العطور ومعطرات الجو',
        capacity: '100 مل',
        variant: 'السعة: 100 مل',
        inspiredBy: perfumeInfo.inspiredBy,
        fragranceProfile: perfumeInfo.character,
        price: 75,
        priceDisplay: '75 ريال',
        inStock: perfumeInfo.inStock,
        imageUrl: perfumeInfo.imageUrl || null,
        productUrl: validProductUrl,
      };
    }

    return card;
  });

  // Fallback: If no cards were generated by model, scan for mentioned catalog items
  if (productCards.length === 0) {
    const lowerText = cleaned.toLowerCase();
    const candidates: ProductCardData[] = [];
    const isDirectSearch = (lowerText.includes('عندكم عطور') || lowerText.includes('وش العطور') || lowerText.includes('قائمة العطور') || lowerText.includes('انواع العطور') || lowerText.includes('أنواع العطور'));

    // Check empty bag request
    if ((lowerText.includes('شنطة') || lowerText.includes('شنط')) && (lowerText.includes('فاضية') || lowerText.includes('فارغة') || lowerText.includes('بدون'))) {
      const emptyBag = MIDHAL_OFFICIAL_CATALOG.find((c) => c.isEmptyBag);
      if (emptyBag) {
        let matchedV = emptyBag.variants[2]; // default half kilo (30 SAR)
        if (lowerText.includes('نص') || lowerText.includes('نصف') || lowerText.includes('half')) matchedV = emptyBag.variants[2];
        else if (lowerText.includes('كيلو') && !lowerText.includes('نص') && !lowerText.includes('ربع') && !lowerText.includes('ثمن')) matchedV = emptyBag.variants[3];
        else if (lowerText.includes('ربع') || lowerText.includes('quarter')) matchedV = emptyBag.variants[1];
        else if (lowerText.includes('ثمن') || lowerText.includes('eighth')) matchedV = emptyBag.variants[0];

        candidates.push({
          id: emptyBag.id,
          name: emptyBag.name,
          category: emptyBag.category,
          variant: matchedV.displayedWeight || matchedV.variantName,
          price: matchedV.price || 30,
          priceDisplay: matchedV.priceDisplay,
          description: `متوفرة بالألوان: ${emptyBag.colors?.join('، ')}`,
          inStock: true,
          imageUrl: emptyBag.imageUrl,
          productUrl: emptyBag.productUrl,
        });
      }
    }

    // Check perfumes mentioned
    if (candidates.length === 0 && (lowerText.includes('عطر') || lowerText.includes('عطور') || lowerText.includes('perfume'))) {
      for (const item of MIDHAL_OFFICIAL_CATALOG) {
        if (item.id.startsWith('perfume_indiv_')) {
          const isMatch = isDirectSearch || lowerText.includes(item.name.toLowerCase().replace('عطر ', ''));
          if (isMatch) {
            let perfumeProfile: any = null;
            for (const p of (Object.values(PERFUME_PROFILES) as any[])) {
              if (item.name.includes(p.name) || item.name.includes(p.englishName)) {
                perfumeProfile = p;
                break;
              }
            }

            const rawUrl = item.productUrl || perfumeProfile?.productUrl;
            const validProductUrl = (rawUrl && rawUrl !== 'https://medhaloud.com/' && rawUrl !== 'https://medhaloud.com') ? rawUrl : undefined;

            candidates.push({
              id: item.id,
              name: item.name,
              category: item.category,
              variant: 'السعة: 100 مل',
              capacity: '100 مل',
              inspiredBy: perfumeProfile?.inspiredBy,
              fragranceProfile: perfumeProfile?.character,
              price: 75,
              priceDisplay: '75 ريال',
              description: item.notes,
              inStock: item.overallAvailability !== 'نفدت الكمية',
              imageUrl: item.imageUrl || perfumeProfile?.imageUrl || null,
              productUrl: validProductUrl,
            });

            // In recommendation mode, limit to max 3. In direct search, show all!
            if (!isDirectSearch && candidates.length >= 3) break;
          }
        }
      }
    }

    // Check active offers mentioned
    if (candidates.length === 0 && (lowerText.includes('عرض') || lowerText.includes('عروض') || lowerText.includes('بكج') || lowerText.includes('offer'))) {
      for (const item of MIDHAL_OFFICIAL_CATALOG) {
        if (item.category === 'العروض') {
          const rawUrl = item.productUrl;
          const validProductUrl = (rawUrl && rawUrl !== 'https://medhaloud.com/' && rawUrl !== 'https://medhaloud.com') ? rawUrl : undefined;

          candidates.push({
            id: item.id,
            name: item.name,
            category: item.category,
            variant: item.variants[0]?.variantName,
            price: item.displayedCardPrice ?? item.variants[0]?.price ?? undefined,
            priceDisplay: item.variants[0]?.priceDisplay,
            description: item.notes,
            inStock: true,
            imageUrl: item.imageUrl,
            productUrl: validProductUrl,
          });
          if (candidates.length >= 3) break;
        }
      }
    }

    // Check if query is about bags generally ("وين ألقى الشنط؟", "شنط البخور", "وين الشنط")
    if (candidates.length === 0 && (lowerText.includes('شنط') || lowerText.includes('شنطة') || lowerText.includes('bag'))) {
      const bagItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.category === 'الشنط' || c.isEmptyBag);
      if (bagItem) {
        candidates.push({
          id: bagItem.id,
          name: bagItem.name,
          category: bagItem.category,
          variant: bagItem.variants[2]?.displayedWeight || bagItem.variants[2]?.variantName,
          price: bagItem.variants[2]?.price || 30,
          priceDisplay: bagItem.variants[2]?.priceDisplay,
          description: bagItem.notes,
          inStock: true,
          imageUrl: bagItem.imageUrl,
          productUrl: undefined,
        });
      }
    }

    // Check if query is about saffron ("زعفران")
    if (candidates.length === 0 && lowerText.includes('زعفران')) {
      const saffronItems = MIDHAL_OFFICIAL_CATALOG.filter((c) => c.category === 'الزعفران');
      for (const s of saffronItems) {
        candidates.push({
          id: s.id,
          name: s.name,
          category: s.category,
          variant: s.variants[0]?.variantName,
          price: (s.displayedCardPrice ?? s.variants[0]?.price) || undefined,
          priceDisplay: s.variants[0]?.priceDisplay,
          description: s.notes,
          inStock: s.overallAvailability !== 'نفدت الكمية',
          imageUrl: s.imageUrl,
          productUrl: s.productUrl,
        });
        if (candidates.length >= 3) break;
      }
    }

    // Check other catalog items specifically named
    if (candidates.length === 0) {
      for (const item of MIDHAL_OFFICIAL_CATALOG) {
        if (item.name.length > 5 && lowerText.includes(item.name.toLowerCase())) {
          const rawUrl = item.productUrl;
          const validProductUrl = (rawUrl && rawUrl !== 'https://medhaloud.com/' && rawUrl !== 'https://medhaloud.com') ? rawUrl : undefined;

          candidates.push({
            id: item.id,
            name: item.name,
            category: item.category,
            variant: item.variants[0]?.variantName,
            price: item.displayedCardPrice ?? item.variants[0]?.price ?? undefined,
            priceDisplay: item.variants[0]?.priceDisplay,
            description: item.notes,
            inStock: item.overallAvailability !== 'نفدت الكمية',
            imageUrl: item.imageUrl,
            productUrl: validProductUrl,
          });
          if (candidates.length >= 3) break;
        }
      }
    }

    if (candidates.length > 0) {
      productCards = isDirectSearch ? candidates : candidates.slice(0, 3);
    }
  }

  // Apply strict specific-query product card matching and filtering
  productCards = processProductCardsForQuery(userMessage, productCards);

  // Enrich all product cards with unified store navigation resolution
  productCards = productCards.map((card, idx) => {
    const nav = resolveStoreDestination(card.name, {
      name: card.name,
      category: card.category,
      variant: card.variant,
    });

    const isDirect = card.hasDirectPage !== undefined ? card.hasDirectPage : nav.hasDirectPage;
    const directUrl = isDirect ? (nav.officialUrl || card.productUrl) : null;
    const validUrl = (directUrl && directUrl !== 'https://medhaloud.com/' && directUrl !== 'https://medhaloud.com') ? directUrl : undefined;

    const baseId = card.id || `card_${idx}`;
    const isDuplicateId = productCards.filter((c) => c.id === card.id).length > 1;
    const uniqueId = isDuplicateId ? `${baseId}_${idx}` : baseId;

    return {
      ...card,
      id: uniqueId,
      productUrl: validUrl || null,
      hasDirectPage: isDirect,
      linkType: nav.destinationType,
      linkLabel: nav.actionLabel,
      nearestOfficialUrl: nav.nearestOfficialUrl,
      nearestOfficialLabel: nav.nearestOfficialLabel,
    };
  });

  // If 2 or 3 products are presented, ensure "قارن بينهم" option is available in suggestions
  if (productCards.length >= 2 && !suggestions.some((s) => s.includes('قارن'))) {
    if (suggestions.length < 3) {
      suggestions.push('قارن بينهم');
    } else {
      suggestions[2] = 'قارن بينهم';
    }
  }

  // Contextual fallback suggestions if model didn't provide any
  if (suggestions.length === 0) {
    const msg = userMessage.toLowerCase();
    if (msg.includes('شنط') || msg.includes('شنطة') || msg.includes('bag')) {
      suggestions = ['شنطة فارغة', 'شنطة مع محتويات', 'عرض كل الشنط'];
    } else if (msg.includes('زعفران') || msg.includes('saffron')) {
      suggestions = ['بكج الزعفران الخاص', 'زعفران إيراني سوبر نقيل', 'زعفران مغربي'];
    } else if (msg.includes('محسن')) {
      suggestions = ['للاستخدام بالبيت', 'للمجلس والضيافة', 'خيارات العروض'];
    } else if (msg.includes('عود') || msg.includes('oud')) {
      suggestions = ['عود طبيعي', 'عود محسن', 'عروض العود'];
    } else if (msg.includes('عطر') || msg.includes('عطور') || msg.includes('perfume')) {
      suggestions = ['عطور هادئة', 'عطور رسمية للمناسبات', 'عرض كل العطور'];
    }
  }

  return {
    reply: cleaned.trim(),
    suggestions: suggestions.slice(0, 3),
    productCards: productCards.slice(0, 3),
  };
}

// Chat endpoint (stateless AI assistant)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'حقل الرسالة مطلوب' });
      return;
    }

    // Extract metadata & intent
    const intentAnalysis = extractIntentAndContext(message, conversationHistory);

    const ai = getGeminiClient();
    const systemInstruction = buildSystemInstruction(midhalKnowledge);

    // Format contents array for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add previous conversation turns
    for (const item of conversationHistory.slice(-8)) {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }],
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiResult = await generateGeminiReply(ai, contents, systemInstruction);
    const { reply, suggestions, productCards } = parseReplyAndSuggestions(geminiResult.text, message);

    // Record agent request telemetry with real token metadata
    analytics.recordAgentRequest({
      model: geminiResult.modelUsed,
      promptTokens: geminiResult.promptTokens,
      candidateTokens: geminiResult.candidateTokens,
      totalTokens: geminiResult.totalTokens,
      userQuery: message,
      agentReply: reply,
      detectedTopic: intentAnalysis.detectedIntent,
    });

    if (productCards && productCards.length > 0) {
      analytics.recordProductImpressions(productCards.map((c) => c.name));
    }

    res.json({
      reply: reply || 'حيّاك الله في مدهال الطيب، سم كيف أقدر أخدمك اليوم في العود والطيب؟',
      suggestions: suggestions.slice(0, 3),
      productCards: productCards || [],
      analysis: {
        ...intentAnalysis,
        confidenceNote: midhalKnowledge.products.length === 0
          ? 'المرحلة الحالية: قاعدة المنتجات المعتمدة غير مدخلة بعد (الالتزام بعدم اختلاق أسعار أو منتجات وهمية).'
          : `قاعدة المنتجات المعتمدة مفعلة (${midhalKnowledge.products.length} منتج).`,
      },
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة الطلب',
      details: error?.message || 'خطأ غير معروف',
    });
  }
});

// Client Telemetry Track API (Anonymous, zero-PII)
app.post('/api/analytics/track', (req: Request, res: Response) => {
  try {
    const { eventType, visitorId, sessionId, isNew, device, referrer, path: pagePath, metadata } = req.body || {};

    // Region detection from Vercel deployment headers if available
    const country = (req.headers['x-vercel-ip-country'] as string) || '';
    const city = (req.headers['x-vercel-ip-city'] as string) || '';
    const location = city && country ? `${decodeURIComponent(city)}، ${country}` : country === 'SA' ? 'الرياض، السعودية' : undefined;

    if (eventType === 'pageview') {
      analytics.recordPageView({
        visitorId: visitorId || 'anon',
        sessionId,
        isNew: Boolean(isNew),
        device,
        referrer,
        path: pagePath,
        location,
      });
    } else if (eventType === 'conversation_start') {
      analytics.recordConversationStart();
    } else if (eventType === 'product_click') {
      if (metadata?.productName) {
        analytics.recordProductClick(metadata.productName, false);
      }
    } else if (eventType === 'product_link_click') {
      if (metadata?.productName) {
        analytics.recordProductClick(metadata.productName, true);
      }
    } else if (eventType === 'product_impression') {
      if (Array.isArray(metadata?.products)) {
        analytics.recordProductImpressions(metadata.products);
      }
    }

    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false });
  }
});

// Admin Authentication API
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'midhal@2026';

  if (username === expectedUser && password === expectedPass) {
    const token = analytics.createAdminSession(username);
    res.json({ success: true, token, user: username });
  } else {
    res.status(401).json({
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    });
  }
});

// Admin Metrics API
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

  if (!analytics.verifyAdminToken(token)) {
    res.status(401).json({
      success: false,
      error: 'غير مصرح بالدخول، يرجى تسجيل الدخول مجدداً',
    });
    return;
  }

  const period = (req.query.period as any) || '7d';
  const metrics = analytics.getFilteredMetrics(period);
  res.json({ success: true, ...metrics });
});

// Admin Logout API
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  if (token) analytics.revokeAdminToken(token);
  res.json({ success: true });
});

// Admin Resolve Unanswered Question API
app.post('/api/admin/unanswered/resolve', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

  if (!analytics.verifyAdminToken(token)) {
    res.status(401).json({ success: false, error: 'غير مصرح بالدخول' });
    return;
  }

  const { id } = req.body || {};
  if (id) {
    analytics.resolveUnansweredQuestion(id);
  }
  res.json({ success: true });
});


// Start Vite server or static handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Midhal Al-Teeb Assistant running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

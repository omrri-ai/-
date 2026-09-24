import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { MidhalKnowledgeBase, ProductCardData, CustomerMessage } from './src/types.ts';
import {
  MIDHAL_OFFICIAL_CATALOG,
  searchCatalog,
  findOptionsByBudget,
  ENHANCED_OUD_OFFERS,
  findEnhancedOudOffer,
  getAllEnhancedOudOffers,
} from './src/data/midhalCatalog.ts';
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
    { title: 'عروض العود المحسن (باقة 99 ريال)', details: 'عرض عود محسن خاص: 99 ريال للعرض كاملاً لـ 16 منتجاً معتمداً بعدد أوقيات محدد لكل منتج (2 أو 3 أو 4 أوقيات)، مع بقاء السعر الأصلي للأوقية مستقلاً وثابتاً.' },
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

// Single GEMINI_API_KEY client managed directly by Google AI Studio
let geminiClientInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('متغير GEMINI_API_KEY غير متوفر في بيئة التشغيل');
  }
  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClientInstance;
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
      const weightStr = v.displayedWeight || (v.weightGrams ? `${v.weightGrams} جرام` : 'غير محدد');
      text += `\n   - الخيار: "${v.variantName}" | الوزن: ${weightStr} | السعر: ${v.priceDisplay} | الحالة: ${stockStr}`;
      if (v.notes) text += ` (${v.notes})`;
    }
  }

  text += '\n\n══════════════════════════════════════════════════';
  text += '\nعروض باقة العود المحسن الرسمية المعتمدة (99 ريال للعرض كاملاً):';
  text += '\n══════════════════════════════════════════════════';
  text += '\nقاعدة صارمة: 99 ريال هي سعر العرض كاملاً بعدد الأوقيات المذكور وليست سعر الأوقية. السعر الأصلي للأوقية يبقى مستقلاً تماماً.';
  for (const off of ENHANCED_OUD_OFFERS) {
    const origPriceStr = off.regularPrice !== null ? `${off.regularPrice} ريال` : 'غير مسعر كأوقية مفردة في قاعدة البيانات';
    text += `\n- [عرض: ${off.productName}] | كمية العرض: ${off.offer.quantity} | سعر العرض كاملاً: 99 ريال | السعر الأصلي للأوقية: ${origPriceStr} | نوع العرض: ${off.offer.type}`;
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
  text += '\n4. صفحة العروض الرسمية المعتمدة وتصنيفاتها (Official Offers Hub - https://medhaloud.com/عروض-اليوم-الوطني/c169936294):\n';
  text += 'المصدر الرسمي الأول للعروض يتفرع إلى:\n';
  text += '- [عروض التايقر](https://medhaloud.com/عروض-التايقر/c1633675980)\n';
  text += '- [النوادر](https://medhaloud.com/النوادر/c1521213176)\n';
  text += '- [عروض اليوم الوطني والمناسبات](https://medhaloud.com/عروض-اليوم-الوطني/c169936294)\n';
  text += '- [عروض الإهداء](https://medhaloud.com/عروض-الأهداء/c132583920)\n';
  text += '- [قسم العروض العامة](https://medhaloud.com/عروض-مدهال-الطيب/c1995874283)\n';
  text += '- [العود الطبيعي](https://medhaloud.com/العود-الطبيعي/c693006277)\n';
  text += '- [العود المحسن - باقة الـ 99 ريال](https://medhaloud.com/العود-المحسن/c2090886574)\n';
  text += '- [بكجات العطور](https://medhaloud.com/بكجات-العطور/c956037174)\n';
  text += '- [الزعفران](https://medhaloud.com/زعفران/c813586073)\n';
  text += '\n5. صفحات الخدمة والسياسات والمعلومات (Service & Policy Pages):\n';
  for (const p of STORE_SERVICE_PAGES) {
    text += `- [${p.name}](${p.officialUrl})\n`;
  }
  text += '\n6. صفحات منتجات رئيسية موثقة مستقلة:\n';
  for (const pr of STORE_VERIFIED_PRODUCTS.slice(0, 20)) {
    text += `- [${pr.name}](${pr.officialUrl})\n`;
  }
  return text;
}

const CATALOG_TEXT_REPRESENTATION = buildCatalogTextRepresentation();
const STORE_SITEMAP_REPRESENTATION = buildSiteMapTextRepresentation();

function buildSystemInstruction(knowledge: MidhalKnowledgeBase, isFollowUp: boolean = false): string {
  const followUpDirective = isFollowUp
    ? `
══════════════════════════════════════════════════
⚠️ تنبيه صارم لحالة الرسالة الحالية (رسالة متابعة وليست بداية محادثة):
══════════════════════════════════════════════════
- ممنوع منعاً باتاً البدء بعبارات ترحيبية أو ديباجات أو مجاملات مكررة مثل:
  ("حيّاك الله"، "يا هلا والله"، "أبشر بسعدك طال عمرك"، "سم طال عمرك"، "عساك على القوة"، "يسعدنا خدمتك"... إلخ).
- ادخل في صلب الإجابة مباشرة باختصار وطبيعية:
  * إذا سأل عن السعر أو المقاس: أجب مباشرة (مثال: "الأوقية بـ35 ريال، والثمن بـ125 ريال.").
  * إذا قال "طيب الكيلو؟": أجب مباشرة (مثال: "سعر الكيلو 800 ريال.").
  * إذا سأل عن الزعفران أو غيّر الموضوع: أجب مباشرة بالبيانات المؤكدة دون ديباجة ولا تذكر العود القديم.
`
    : `
- إذا كانت هذه الرسالة الأولى للعميل في بداية المحادثة: رحّب به باختصار ودود وسعودي طبيعي دون إطالة.
`;

  return `
أنت مستشار مبيعات وخدمة عملاء خبير في متجر "مدهال الطيب" للعود والطيب الفاخر بالمملكة العربية السعودية.
أسلوبك: ودود + رسمي بشكل خفيف + طبيعي + مختصر.
(غير جاف، وغير مبالغ في المجاملة والتكلف).

${followUpDirective}

══════════════════════════════════════════════════
المرجع التجاري الأساسي الصارم:
══════════════════════════════════════════════════
الكتالوج الرسمي المعتمد أدناه هو المرجع التجاري الوحيد والنهائي للأسعار والكميات والأوزان والخيارات التجارية.
أي معلومة سعرية أو كمية أو توفر يجب أن تؤخذ حصراً ومباشرة من جدول الكتالوج الرسمي. لا تخترع سعراً أو وزناً أو عرضاً من عندك إطلاقاً.

══════════════════════════════════════════════════
قواعد فهم العميل وسلوك المحادثة وأسلوب الرد (قواعد صارمة وإلزامية):
══════════════════════════════════════════════════

1. افهم نية العميل قبل الرد:
   - لا تتعامل مع كل رسالة على أنها طلب مستقل معزول، ولا تتعامل معها أيضاً على أنها استمرار إجباري للموضوع السابق.
   - في كل رسالة، حدد:
     * ما المنتج أو الفئة التي يتحدث عنها العميل الآن؟
     * ما الذي كان يتحدث عنه في الرسائل السابقة؟
     * هل الرسالة الحالية متابعة للموضوع السابق؟
     * أم أن العميل غيّر الموضوع؟
     * ما الشيء الذي طلبه العميل تحديداً؟
     * ما الشيء الذي لم يطلبه؟
   - إذا كانت الرسالة متابعة، حافظ على السياق.
   - إذا غيّر العميل الموضوع بوضوح، انتقل للموضوع الجديد طبيعياً وتلقائياً ولا تتمسك بالموضوع القديم.

2. لا تستنتج منتجات لم يطلبها العميل إطلاقاً (قاعدة أساسية وحاسمة):
   - إذا قال العميل: "أبي عود بخور" ثم: "أبيه للمكتب والسيارة".
     المقصود حصراً: عود/بخور يناسب المكتب والسيارة.
     ممنوع منعاً باتاً أن تعرض:
     * دهن عود
     * عطر
     * مسك
     * زعفران
     * إكسسوارات أو مباخر
     إلا إذا طلب العميل هذه الأشياء صراحة أو سأل عنها!
   - لا تعتبر كلمة "مكتب" أو "سيارة" أو "مجلس" طلباً لمنتجات أخرى.
   - إذا لم توجد معلومة مؤكدة عن منتج مخصص للسيارة، قل ذلك بوضوح وصراحة (مثل: العود يحتاج جمر ومبخرة فيناسب الأماكن الثابتة كالمكتب، ولا نوفر منتجاً مخصصاً للسيارة حالياً)، ولا تخترع منتجاً.

3. افصل بين "الاستخدام" و"المنتج":
   - كلمات مثل: (البيت، المجلس، المكتب، السيارة، الملابس، الشعر، المناسبات، الإهداء) تصف مكان أو غرض الاستخدام، وليست اسم منتج جديد.
   - "أبي عود للمكتب": لا تحولها تلقائياً إلى عطر للمكتب أو دهن عود للمكتب. بل ابحث عن العود المناسب للغرض المطلوب (مثل التايقر أو المروكي للاستخدام المكتبي واليومي).
   - إذا قال العميل بشكل غامض: "أبي شيء للمكتب" دون تحديد منتج، هنا فقط اسأل سؤالاً واحداً مفيداً: "أكيد، تفضله عود، عطر، أو دهن عود؟".

4. حافظ على موضوع المحادثة حتى يتغير:
   - العميل: "أبي عود محسن" ← المساعد يعرض خيارات العود المحسن.
   - العميل: "أبيه للمكتب" ← المقصود: عود محسن للمكتب.
   - العميل: "وش الأرخص؟" ← المقصود: أرخص عود محسن من الخيارات والسياق الحالي.
   - العميل: "طيب الكيلو؟" ← المقصود: كيلو من المنتج الذي نتحدث عنه (التايقر الكيلو 800 ريال)، وليس البحث عن كيلو لجميع المنتجات.
   - أما إذا قال: "عندكم زعفران؟" ← هنا تغيّر الموضوع إلى الزعفران، ويبدأ المساعد موضوع الزعفران مباشرة دون ذكر العود أو المجلس القديم.

5. افهم الضمائر والإشارات بذكاء وبدون طلب إعادة:
   - افهم الضمائر والإشارات التالية حسب آخر موضوع ومنتجات تم ذكرها أو عرضها:
     (سعره، سعرها، هذا، هذي، الثاني، الأول، بينهم، الأرخص، الأغلى، فيه أكبر؟، طيب النص؟، طيب الكيلو؟، طيب الثمن؟، وش الفرق؟، وش تنصحني؟، غيره، عندكم مثله؟، أبي نفس هذا).
   - لا تطلب من العميل إعادة اسم المنتج إذا كان المقصود واضحاً من السياق.
   - إذا قال: "أبي تايقر" ثم "كم سعره؟" ← افهم مباشرة عود تايقر كمبودي المحسن، واذكر أسعار أوزانه وأخرج بطاقته فوراً دون سؤاله أي منتج يقصد.

6. المنتجات التي عرضها المساعد جزء لا يتجزأ من السياق:
   - إذا عرض المساعد منتجات ثم قال العميل: "قارن بينهم" ← قارن بدقة بين تلك المنتجات المذكورة أو المعروضة في المحادثة السابقة من حيث الرائحة، الثبات، الاستخدام، والأسعار المعتمدة، وأخرج كروتها.
   - إذا قال العميل: "وش الأرخص؟" ← يقارن المنتجات التي كانت ضمن السياق الحالي ويحدد الأرخص وسعره.
   - إذا قال العميل: "الثاني" ← يفهم أنه المنتج الثاني الذي عرضه المساعد.
   - إذا قال العميل: "أبي منه ثمن" ← يفهم المنتج المقصود من السياق ويبحث عن خيار الثمن لذلك المنتج فقط.

7. لا تستخدم "الأفضل" كحقيقة مطلقة:
   - لا تقل: "هذا أفضل عود عندنا" إلا إذا كان هناك مصدر رسمي موثق يثبت ذلك.
   - بدلاً من ذلك استخدم عبارات دقيقة:
     "إذا تبيه للمجلس، هذا خيار مناسب ومجمل حسب وصفه وثباته."
     "إذا تهمك الفوحان والنكهة السويتية، عندك هذا الخيار."
   - الترشيح يعتمد على معلومات مؤكدة وموثقة في الكتالوج.

8. أسلوب الكلام وضبط الترحيب (ودود + رسمي خفيف + طبيعي + مختصر):
   - ممنوع منعاً باتاً أن تبدأ كل رد بعبارات ترحيبية أو إنشائية مكررة مثل:
     "حيّاك الله يا الغالي وبياك، يا هلا والله ومرحباً بك، أبشر بسعدك طال عمرك، سم وتفضل..."
   - هذه العبارات يمكن استخدامها باختصار في بداية المحادثة فقط (أول رسالة).
   - في جميع رسائل المتابعة: تكون الردود طبيعية ومباشرة في صلب الإجابة.
   - مثال:
     بدل: "أبشر بسعدك طال عمرك! بالنسبة لعود تايقر كمبودي المحسن..."
     استخدم: "أكيد، تايقر كمبودي المحسن متوفر عندنا. الأوقية 30 ريال، وإذا تبي أعطيك باقي الأوزان أطلعها لك."
     ثم إذا قال: "طيب الكيلو؟"
     يكون الرد: "الكيلو 800 ريال." مباشرة دون ترحيب جديد.

9. لا تكرر المعلومات:
   - إذا سبق أن ذكرت تفاصيل المنتج، ثم قال العميل: "طيب الثمن؟"، لا تعيد شرح المنتج بالكامل، قل فقط: "الثمن 125 ريال." وأخرج الكرت المناسب.
   - إذا قال: "وش الفرق بينه وبين موروكي؟"، أعط المقارنة المطلوبة فقط دون إعادة ديباجة الكتالوج.

10. الرد على قدر السؤال (تجنب الإطالة التسويقية):
    - السؤال القصير ← جواب قصير.
    - السؤال التفصيلي ← جواب تفصيلي.
    - لا تجعل كل إجابة فقرة تسويقية طويلة.
    - لا تعرض روابط وأقساماً ومنتجات إضافية إذا لم تكن مرتبطة مباشرة بالسؤال.
    - لا تختم كل رد بعبارات آلية مكررة مثل "إذا حاب أقدر...".

11. لا توسع الطلب من تلقاء نفسك:
    - إذا قال: "أبي عود" ← لا تعرض عطوراً ولا دهن عود ولا بخوراً ولا زعفراناً ولا شنطاً.
    - إذا كان الطلب عاماً، اسأل سؤالاً واحداً مفيداً لتحديده: "تفضله طبيعي أو محسن؟".
    - إذا قال: "أبي عود للمجلس" ← لا تفترض أنه طبيعي، بل اسأله: "تفضله طبيعي أو محسن؟"، وإذا قال: "محسن"، التزم بالعود المحسن فقط.

12. إذا غيّر العميل الموضوع بوضوح:
    - لا تتمسك بالموضوع القديم إطلاقاً.
    - مثال: العميل سأل: "أبي عود للمجلس" ثم قال: "عندكم زعفران؟" ← الرد يكون عن الزعفران فوراً وببياناته المؤكدة، دون إعادة الحديث عن العود ولا ربطه بالمجلس القديم.

13. التعامل مع الغموض:
    - لا تخمّن إذا كان التخمين قد يؤدي إلى منتج من فئة مختلفة.
    - اسأل سؤالاً واحداً فقط لتوضيح الطلب.
    - أما إذا كان السياق واضحاً فلا تسأل وأجب مباشرة.

14. الشنط الجلدية الفارغة:
    - جميع الشنط في متجر مدهال الطيب جلدية فاخرة (جملي، بيج، أخضر، أسود).
    - إذا قال العميل: "أبي شنطة" ثم: "أبيها فاضية" ← المطلوب شنطة جلدية فارغة لحفظ العود بدون محتويات (ثمن كيلو: 20 ريال، ربع كيلو: 25 ريال، نصف كيلو: 30 ريال، كيلو: 35 ريال). وليس بكج أو شنطة تحتوي على منتجات.

15. عطور مدهال الطيب:
    - السعة: 100 مل موحدة لجميع العطور.
    - السعر الرسمي: 75 ريال (مخفض من 125 ريال).
    - قائمة الاستيحاء المعتمدة: رويال (Romford - نفد)، لكجري (Tobacco)، اروجنت (Memo)، اتنشن (Dior)، لورد (Tuxedo)، ريتش (Nishane - نفد)، مارفل (Van Cleef)، ماجيك (Armani - نفد)، اليجنت (Guerlain)، فلفيت روز (Guerlain Paris)، بيلا (Chanel)، فلورا (Valaya).

16. بيانات الزعفران التجارية المؤكدة والمثبتة (بيانات حاسمة):
    - الزعفران الإيراني (سوبر نقيل):
      * 5 جرام = 45 ريال (أبو 45 هو 5 جرام)
      * 10 جرام = 90 ريال
    - الزعفران المغربي (شامل الضريبة):
      * 5 جرام = 75 ريال
      * 10 جرام = 150 ريال
    - بكج الزعفران الخاص:
      * 6 جرام = 65 ريال
    ⚠️ تنبيه حاسم: هذه الأوزان والأسعار بيانات تجارية مؤكدة وثابتة؛ لا تقل بعد الآن إن الوزن غير محدد لهذه المنتجات!
    - إذا قال: "زعفران إيراني" ← "الإيراني متوفر 5 جرام بـ45 ريال، و10 جرام بـ90 ريال."
    - إذا قال: "أبو 45 كم جرام؟" ← الإجابة المباشرة: "5 جرام."
    - إذا قال: "المغربي بكم؟" أو "نبغى زعفران مغربي" ← الإجابة المباشرة: "المغربي 5 جرام بـ75 ريال، و10 جرام بـ150 ريال."
    - إذا قال: "بكج الزعفران الخاص كم وزنه؟" ← الإجابة المباشرة: "6 جرام وسعره 65 ريال."

17. قواعد التعامل مع العروض والترشيح الذكي (قواعد إلزامية وصارمة):
    أ) السؤال العام عن العروض ("عندكم عروض؟" / "وش العروض؟" / "فيه عروض؟" / "عروضكم"):
       - ممنوع منعاً باتاً عرض جميع العروض أو سرد الـ 16 منتجاً أو إخراج أي Product Cards مباشرة عند السؤال العام.
       - اسأله سؤالاً واحداً طبيعياً يساعد على تحديد العرض المناسب:
         "أكيد، تبي عرض عود للبيت، للمجلس والمناسبات، أو شيء للإهداء؟"
         أو بصياغة طبيعية أقصر حسب السياق: "أكيد، تبيها للبيت أو للمجلس والمناسبات أو للإهداء؟"
       - لا تجعل السؤال ثابتاً حرفياً دائماً؛ المهم أن يجمع المعلومة التي ستغيّر الترشيح فعلاً.
       - الاقتراحات التفاعلية تكون: [ للبيت ] [ للمجلس والمناسبات ] [ للإهداء ].
       - لا تخرج أي بطاقات منتجات (Product Cards) إطلاقاً في هذا الرد العام.

    ب) إذا حدد العميل الاستخدام:
       - إذا قال: "للبيت" (أو استخدام يومي):
         ابحث في بيانات العروض المتاحة واختر العروض التي تتناسب مع استخدام البيت، فقط إذا كانت هناك معلومات موثقة تسمح بهذا الترشيح.
         رشح حتى 3 خيارات موثقة مناسبة للبيت من عروض العود المحسن (بـ 99 ريال للعرض كاملاً):
         * عود تايقر كمبودي: 4 أوقيات بـ 99 ريال (كمية وافرة وثبات ممتاز للبيت).
         * عود الفراشة: 4 أوقيات بـ 99 ريال (كسر مباخر خفيفة مناسبة لتبخير البيت اليومي).
         * عود مروكي ميني: 4 أوقيات بـ 99 ريال (اقتصادي ومناسب جداً للبيت).
         وأخرج كروت هذه الخيارات الثلاثة فقط.
         (قاعدة هامة: إذا كانت بيانات العرض لا تحتوي على وصف أو معلومة كافية لتحديد الاستخدام، لا تخترع أن العرض مناسب للبيت، ويمكنك بدل ذلك قول: "عندي عدة عروض عود، وإذا تبي أرشح لك بينها حسب النوع والكمية والميزانية").
       - إذا قال: "للمجلس" أو "للمناسبات" أو "أبي شيء فخم للمناسبات":
         افهم أن المطلوب هو ترشيح عروض مناسبة لهذا الاستخدام. ابحث في قاعدة بيانات العروض والمنتجات عن الخيارات التي تتطابق مع المعلومات الموثقة (لا تعرض عروضاً عشوائية لمجرد أنها موجودة في صفحة العروض).
         رشح حتى 3 خيارات موثقة مناسبة للمجالس والضيافة:
         * موروكي التميز: أوقيتين بـ 99 ريال (نكهة سويتية بخورية فخمة للمجالس).
         * سيوفي رويال: أوقيتين بـ 99 ريال (طابع رسمي وثقيل للمناسبات).
         * سيوفي كنج فيتنامي: أوقيتين بـ 99 ريال (كسر مباخر فخمة تجمّل بالضيافة).
         وأخرج كروت هذه الخيارات الثلاثة فقط.
       - إذا قال: "للإهداء" أو "أبي عرض هدية":
         ابحث عن عروض الإهداء أو العروض التي تحتوي على معلومات مؤكدة تجعلها مناسبة للإهداء (ولا تعرض عروض العود العادية على أنها عروض هدايا إلا إذا كانت البيانات تثبت ذلك).
         مثل: بكج الزعفران الخاص 65 ريال، توزيعات مدهال الطيب 99 ريال، أو بكج الأدهان 422 ريال.

    ج) الميزانية:
       - إذا قال العميل ميزانية مثل "عندي 100 ريال" أو "ميزانيتي 100" بعد سؤال العروض:
         استخدم الميزانية مع الاستخدام. مثال: "أبي عرض للبيت وميزانيتي 100" ← ابحث في العروض المتاحة التي سعرها فعلياً 100 ريال أو أقل (عروض الـ 99 ريال تناسب الميزانية تماماً). لا تغيّر السعر ولا تحسب سعراً جديداً.
       - إذا قال "عندي 100 ريال" دون تحديد استخدام: وضّح أن عروض الـ 99 ريال تناسب ميزانيته واسأله إن كان يفضلها للبيت أو للمجلس أو للإهداء دون إخراج كروت قبل تحديد الاستخدام.

    د) التفريق بين طلب الترشيح والبحث المباشر:
       - إذا قال: "أبي عود محسن للبيت": رشح حتى 3 خيارات مناسبة فقط (مثل تايقر كمبودي، فراشة، مروكي ميني).
       - إذا قال: "عندكم عروض عود محسن؟" أو "أبي عرض عود محسن" ← هذا استفسار أو طلب ترشيح: لا تعرض الـ 16 عرضاً دفعة واحدة، بل وضّح باقة الـ 99 ريال ورشح حتى 3 خيارات مناسبة فقط (مثل تايقر كمبودي، مروكي تميز، تايقر ذهبي) واسأله عن الاستخدام (للبيت أو للمجلس) أو إن كان يرغب برؤية القائمة كاملة.
       - إذا قال: "وش عروض العود المحسن الموجودة؟" أو "اعرض كل عروض العود المحسن" ← هذه عملية بحث مباشر: اعرض القائمة الكاملة للعروض الـ16 بوضوح وأخرج كروتها، ولا تطبق حد الـ 3.

    هـ) بيانات عروض العود المحسن الـ 16 (باقة 99 ريال) والتفريق التام عن السعر الأصلي للأوقية:
       - 99 ريال هو سعر العرض كاملاً بعدد الأوقيات الموضح، وممنوع نهائياً اعتباره سعر الأوقية!
       - السعر الأصلي للأوقية يبقى مستقلاً ومنفصلاً في قاعدة البيانات دون أي تعديل.
       - "كم الأوقية؟" ← السعر الأصلي للأوقية فقط (مثال: أوقية تايقر كمبودي = 30 ريال، أوقية مروكي تميز = 95 ريال).
       - "كم العرض؟" أو "وش العرض؟" ← 99 ريال مع توضيح عدد الأوقيات (مثال: عرض تايقر كمبودي = 99 ريال ويحتوي على 4 أوقيات).
       - المنتجات الـ 16 المشمولة في العرض حصراً:
         1. تايقر ذهبي: 3 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 35 ريال)
         2. تايقر كمبودي: 4 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 30 ريال)
         3. فراشة: 4 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 30 ريال)
         4. زوايا فيتنامي: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 75 ريال)
         5. سيوفي رويال: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 100 ريال)
         6. سيوفي كنج فيتنامي: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 100 ريال)
         7. زوايا سبيشال فيتنامي: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 75 ريال)
         8. دقة كمبودي: 3 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 50 ريال)
         9. مروكي فيتنامي: 3 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 75 ريال)
         10. سيوفي فيتنامي: 3 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 50 ريال)
         11. كلمنتان: 2 أوقية بـ 99 ريال (سعر العرض فقط، لا يوجد سعر أوقية مفردة مسجل)
         12. مروكي تميز: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 95 ريال)
         13. مروكي ملكي: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 75 ريال)
         14. مروكي شيوخ: 2 أوقية بـ 99 ريال (سعر العرض فقط، لا يوجد سعر أوقية مفردة مسجل)
         15. دقة مدهال: 2 أوقية بـ 99 ريال (السعر الأصلي للأوقية: 65 ريال)
         16. مروكي ميني: 4 أوقيات بـ 99 ريال (السعر الأصلي للأوقية: 30 ريال)

    و) صفحة العروض الرسمية المعتمدة والتصنيفات:
       - رابط صفحة العروض الرسمية: https://medhaloud.com/عروض-اليوم-الوطني/c169936294
       - استخدم هذه الصفحة كمصدر للعروض الموجودة على الموقع لاكتشاف: عروض التايقر، النوادر، عروض اليوم الوطني، عروض الإهداء، العروض، العود الطبيعي، العود المحسن، بكجات العطور، الزعفران، وأي عروض أخرى في المصدر الرسمي.
       - الصفحة الرسمية تعرض تصنيفات متعددة، فلا تعتبر كل ما يظهر فيها عرضاً واحداً أو قائمة واحدة.
       - إذا طُلب رابط لمنتج محدد، لا تستخدم رابط صفحة العروض كبديل، بل ابحث عن صفحة المنتج الفعلية واستخدم رابطها المباشر الموثق.
       - إذا لم يعرف المساعد كيف يستخرج العروض: لا يعرض كل شيء كحل بديل، بل يوضح باختصار ويسأل عن الغرض أو الميزانية.

18. نظام إخراج الكروت:
    - إذا طلب العميل منتجاً محدداً أو وزناً محدداً: أخرج كرت المنتج المطلوب فقط.
    - إذا طلب ترشيحاً مفتوحاً أو مقارنة: أخرج بطاقات الخيارات المعنية (بحد أقصى 3 كروت).
    - صيغة الكروت: CARDS: [{"name": "اسم المنتج المطابق", "variant": "الوزن أو السعة أو المقاس", "price": السعر_رقمياً, "description": "وصف موجز موثق"}]
    (لا تضف أي وسم أو نص SUGGESTIONS في ردك؛ النظام البرمجي للواجهة يحدد الاقتراحات المناسبة تلقائياً حسب السياق).

19. قاعدة حاسمة للغموض: إذا لم تفهم طلب العميل بوضوح، لا تخمّن ولا تقم بعرض منتجات عشوائية. اسأل سؤالاً واحداً فقط وبشكل مباشر لتوضيح الطلب. (مثال: "تقصد معطر مفارش أم عطر شخصي؟").


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
  if (text.includes('قارن') || text.includes('بينهم')) {
    intent = 'مقارنة بين منتجات';
  } else if (text.includes('تنصحني') || text.includes('أبي') || text.includes('ابي') || text.includes('اريد') || text.includes('أريد') || text.includes('رشح') || text.includes('افضل') || text.includes('أفضل')) {
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

  // Find subject from context if user says "هذا" or "سعره" or follow-ups
  const historyText = history.map((h) => h.content || '').join(' ').toLowerCase();
  if (text.includes('سعره') || text.includes('هذا') || text.includes('فرقه') || text.includes('قارن') || text.includes('الأرخص') || text.includes('الكيلو')) {
    if (historyText.includes('تايقر') || historyText.includes('تايجر')) {
      currentSubject = 'عود تايقر كمبودي';
    } else if (historyText.includes('التميز') || historyText.includes('موروكي')) {
      currentSubject = 'موروكي التميز';
    } else if (historyText.includes('اهداء') || historyText.includes('إهداء')) {
      currentSubject = 'خيارات الإهداء والهدايا';
    } else {
      currentSubject = 'مرتبط بآخر منتج أو موضوع تم ذكره في المحادثة (فهم السياق)';
    }
  }

  return {
    detectedIntent: intent,
    targetUsage,
    productType,
    budgetMentioned: budget,
    currentSubject,
  };
}

export interface ConversationState {
  currentSection: string | null;
  currentProductId: string | null;
  currentProductName: string | null;
  currentType: string | null;
  requestedWeight: string | null;
  budget: string | null;
  targetUsage: string | null;
  recentProductIds: string[];
  recentProductNames: string[];
  lastIntent: string;
  confirmedChoice: string | null;
}

function extractConversationState(
  userMessage: string,
  history: Array<{ role: string; content: string; productCards?: ProductCardData[] }>
): ConversationState {
  const normUser = userMessage.toLowerCase().trim();

  let currentSection: string | null = null;
  let currentProductId: string | null = null;
  let currentProductName: string | null = null;
  let currentType: string | null = null;
  let requestedWeight: string | null = null;
  let budget: string | null = null;
  let targetUsage: string | null = null;
  let recentProductIds: string[] = [];
  let recentProductNames: string[] = [];
  let lastIntent: string = 'استفسار عام';
  let confirmedChoice: string | null = null;

  // Process history turns chronologically
  for (const item of history) {
    const text = (item.content || '').toLowerCase();

    // Check for section shifts in history
    if (text.includes('زعفران') || text.includes('سوبر نقيل')) {
      currentSection = 'الزعفران';
      currentProductId = text.includes('مغربي') ? 'saffron_moroccan' : (text.includes('بكج') ? 'saffron_package' : 'saffron_iranian');
      currentProductName = text.includes('مغربي') ? 'زعفران مغربي' : (text.includes('بكج') ? 'بكج الزعفران الخاص' : 'زعفران إيراني سوبر نقيل');
      currentType = 'زعفران';
    } else if (text.includes('معطر') || text.includes('عطر') || text.includes('عطور') || text.includes('مفارش')) {
      currentSection = 'العطور ومعطرات الجو';
      currentProductId = null;
      currentProductName = null;
      currentType = 'عطور';
    } else if (text.includes('شنطة') || text.includes('شنط') || text.includes('فاضية')) {
      currentSection = 'الشنط';
      currentProductId = 'acc_empty_bag';
      currentProductName = 'شنطة حفظ عود جلدية فارغة';
      currentType = 'شنط جلدية فارغة';
    } else if (text.includes('دهن') || text.includes('كوه كنج') || text.includes('تولة')) {
      currentSection = 'دهن العود';
      currentProductId = 'oil_11';
      currentProductName = 'دهن عود كمبودي كوه كنج 125';
      currentType = 'دهن عود طبيعي';
    } else if (text.includes('تميز')) {
      currentSection = 'العود المحسن';
      currentProductId = 'enh_5';
      currentProductName = 'موروكي التميز 95';
      currentType = 'محسن';
    } else if (text.includes('تايقر') || text.includes('تايجر')) {
      currentSection = 'العود المحسن';
      if (text.includes('ذهب')) {
        currentProductId = 'enh_1';
        currentProductName = 'التايقر الذهبي 35';
      } else {
        currentProductId = 'enh_4';
        currentProductName = 'عود تايقر كمبودي 30';
      }
      currentType = 'محسن';
    } else if (text.includes('سيوفي') || text.includes('كنق')) {
      currentSection = 'العود المحسن';
      currentProductId = 'enh_6';
      currentProductName = 'السيوفي كينغ 100';
      currentType = 'محسن';
    }

    // Capture usage in history
    if (text.includes('مجلس') || text.includes('ضيوف') || text.includes('عزيمة')) {
      targetUsage = 'مجلس وضيافة';
    } else if (text.includes('مكتب') || text.includes('سيارة')) {
      targetUsage = 'مكتب وسيارة';
    } else if (text.includes('يومي') || text.includes('بيت')) {
      targetUsage = 'استخدام يومي وشخصي';
    } else if (text.includes('إهداء') || text.includes('اهداء') || text.includes('هدية')) {
      targetUsage = 'إهداء وفاخر';
    }

    // Capture budget in history
    const bMatch = text.match(/(\d+)\s*(ريال|رس|sar)/);
    if (bMatch) {
      budget = `${bMatch[1]} ريال`;
    }

    // Capture product cards displayed by assistant
    if (item.productCards && Array.isArray(item.productCards) && item.productCards.length > 0) {
      recentProductIds = item.productCards.map((c) => c.id || c.name);
      recentProductNames = item.productCards.map((c) => c.name);
      if (item.productCards.length === 1 && !currentProductId) {
        currentProductId = item.productCards[0].id || null;
        currentProductName = item.productCards[0].name || null;
      }
    }
  }

  // Now process the current user message (current message overrides or refines state)
  // Check topic switch
  if (normUser.includes('زعفران') || normUser.includes('سوبر نقيل') || normUser.includes('أبو 45') || normUser.includes('ابو 45') || normUser.includes('المغربي')) {
    currentSection = 'الزعفران';
    if (normUser.includes('مغربي') || normUser.includes('المغربي')) {
      currentProductId = 'saffron_moroccan';
      currentProductName = 'زعفران مغربي';
    } else if (normUser.includes('بكج')) {
      currentProductId = 'saffron_package';
      currentProductName = 'بكج الزعفران الخاص';
    } else {
      currentProductId = 'saffron_iranian';
      currentProductName = 'زعفران إيراني سوبر نقيل';
    }
    currentType = 'زعفران';
    recentProductIds = [];
    recentProductNames = [];
  } else if (normUser.includes('معطر') || normUser.includes('عطر') || normUser.includes('عطور') || normUser.includes('مفارش')) {
    currentSection = 'العطور ومعطرات الجو';
    currentProductId = null;
    currentProductName = null;
    currentType = 'عطور';
    recentProductIds = [];
    recentProductNames = [];
  } else if (normUser.includes('شنطة') || normUser.includes('شنط') || normUser.includes('فاضية')) {
    currentSection = 'الشنط';
    currentProductId = 'acc_empty_bag';
    currentProductName = 'شنطة حفظ عود جلدية فارغة';
    currentType = 'شنط جلدية فارغة';
    recentProductIds = [];
    recentProductNames = [];
  } else if (normUser.includes('دهن') || normUser.includes('كوه كنج')) {
    currentSection = 'دهن العود';
    currentProductId = 'oil_11';
    currentProductName = 'دهن عود كمبودي كوه كنج 125';
    currentType = 'دهن عود طبيعي';
  } else if (normUser.includes('تميز')) {
    currentSection = 'العود المحسن';
    currentProductId = 'enh_5';
    currentProductName = 'موروكي التميز 95';
    currentType = 'محسن';
  } else if (normUser.includes('تايقر') || normUser.includes('تايجر')) {
    currentSection = 'العود المحسن';
    if (normUser.includes('ذهب')) {
      currentProductId = 'enh_1';
      currentProductName = 'التايقر الذهبي 35';
    } else {
      currentProductId = 'enh_4';
      currentProductName = 'عود تايقر كمبودي 30';
    }
    currentType = 'محسن';
  }

  // Weight detection
  if (normUser.includes('كيلو') && !normUser.includes('نص') && !normUser.includes('ربع') && !normUser.includes('ثمن')) {
    requestedWeight = 'الكيلو';
  } else if (normUser.includes('نصف') || normUser.includes('نص')) {
    requestedWeight = 'النصف';
  } else if (normUser.includes('ربع') && !normUser.includes('ربع تولة')) {
    requestedWeight = 'الربع';
  } else if (normUser.includes('ثمن')) {
    requestedWeight = 'الثمن';
  } else if (normUser.includes('أوقية') || normUser.includes('اوقية')) {
    requestedWeight = 'الأوقية';
  } else if (normUser.includes('أبو 45') || normUser.includes('ابو 45') || normUser.includes('5 جرام')) {
    requestedWeight = '5 جرام';
  } else if (normUser.includes('10 جرام') || normUser.includes('عشرة جرام')) {
    requestedWeight = '10 جرام';
  } else if (normUser.includes('6 جرام') || normUser.includes('ستة جرام')) {
    requestedWeight = '6 جرام';
  } else if (normUser.includes('ربع تولة')) {
    requestedWeight = 'ربع تولة';
  } else if (normUser.includes('تولة') && !normUser.includes('ربع') && !normUser.includes('نصف')) {
    requestedWeight = 'تولة';
  }

  // Usage detection
  if (normUser.includes('مجلس') || normUser.includes('ضيوف')) {
    targetUsage = 'مجلس وضيافة';
  } else if (normUser.includes('مكتب') || normUser.includes('سيارة')) {
    targetUsage = 'مكتب وسيارة';
  } else if (normUser.includes('يومي') || normUser.includes('بيت')) {
    targetUsage = 'استخدام يومي وشخصي';
  } else if (normUser.includes('إهداء') || normUser.includes('اهداء') || normUser.includes('هدية')) {
    targetUsage = 'إهداء وفاخر';
  }

  // Budget detection
  const bMatch = normUser.match(/(\d+)\s*(ريال|رس|sar)/);
  if (bMatch) {
    budget = `${bMatch[1]} ريال`;
  }

  // Intent detection
  if (normUser.includes('قارن') || normUser.includes('بينهم')) {
    lastIntent = 'مقارنة بين منتجات';
  } else if (normUser.includes('سعر') || normUser.includes('كم') || normUser.includes('بكم') || normUser.includes('سعره')) {
    lastIntent = 'استفسار عن السعر';
  } else if (normUser.includes('رشح') || normUser.includes('تنصحني') || normUser.includes('وش تنصح') || normUser.includes('أبي') || normUser.includes('ابغى')) {
    lastIntent = 'طلب ترشيح واختيار';
  }

  return {
    currentSection,
    currentProductId,
    currentProductName,
    currentType,
    requestedWeight,
    budget,
    targetUsage,
    recentProductIds,
    recentProductNames,
    lastIntent,
    confirmedChoice,
  };
}

interface DirectLookupResult {
  reply: string;
  suggestions: string[];
  productCards: ProductCardData[];
}

function tryDirectLookup(
  userMessage: string,
  state: ConversationState,
  history: Array<any>
): DirectLookupResult | null {
  const normUser = userMessage.toLowerCase().trim();

  // Guard: NEVER trigger direct lookup if user asks for recommendation, comparison, difference, or complex advice
  const isComplexOrAdvice =
    normUser.includes('قارن') ||
    normUser.includes('بينهم') ||
    normUser.includes('الفرق') ||
    normUser.includes('رشح') ||
    normUser.includes('تنصحني') ||
    normUser.includes('أفضل') ||
    normUser.includes('افضل') ||
    normUser.includes('وش الأفضل') ||
    normUser.includes('خيارات') ||
    normUser.includes('بدائل') ||
    normUser.includes('وش رايك') ||
    normUser.includes('طبيعي أو محسن') ||
    normUser.includes('طبيعي او محسن');

  if (isComplexOrAdvice) {
    return null;
  }

  // 1. Direct inquiry about Saffron:
  // "أبو 45 كم جرام؟" or "ابو 45 كم جرام؟"
  if ((normUser.includes('أبو 45') || normUser.includes('ابو 45')) && (normUser.includes('كم جرام') || normUser.includes('كم وزن') || normUser.includes('وزنه'))) {
    const iranianItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'saffron_iranian');
    const card: ProductCardData = {
      id: 'saffron_iranian_5g',
      name: 'زعفران إيراني سوبر نقيل',
      category: 'الزعفران',
      variant: '5 جرام',
      price: 45,
      priceDisplay: '45 ريال',
      description: 'زعفران إيراني سوبر نقيل أصلي، نكهة ولون فاخر.',
      inStock: true,
      imageUrl: iranianItem?.imageUrl || null,
      productUrl: iranianItem?.productUrl,
      hasDirectPage: true,
    };
    return {
      reply: '5 جرام.',
      suggestions: [],
      productCards: [card],
    };
  }

  // "المغربي بكم؟" or "كم سعر الزعفران المغربي؟"
  if (normUser.includes('المغربي') && (normUser.includes('بكم') || normUser.includes('كم سعر') || normUser.includes('سعره') || normUser === 'المغربي بكم' || normUser === 'المغربي بكم؟')) {
    const moroccanItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'saffron_moroccan');
    const card: ProductCardData = {
      id: 'saffron_moroccan_5g',
      name: 'زعفران مغربي',
      category: 'الزعفران',
      variant: '5 جرام',
      price: 75,
      priceDisplay: '75 ريال',
      description: 'زعفران مغربي طبيعي فاخر برائحة زكية، شامل الضريبة.',
      inStock: true,
      imageUrl: moroccanItem?.imageUrl || null,
      productUrl: moroccanItem?.productUrl,
      hasDirectPage: true,
    };
    return {
      reply: 'الزعفران المغربي متوفر بوزنين:\n- 5 جرام بـ 75 ريال.\n- 10 جرام بـ 150 ريال (شامل الضريبة).',
      suggestions: [],
      productCards: [card],
    };
  }

  // "بكج الزعفران الخاص كم وزنه؟" or "كم وزن بكج الزعفران"
  if (normUser.includes('بكج الزعفران') && (normUser.includes('كم وزن') || normUser.includes('كم وزنه') || normUser.includes('وزنه'))) {
    const pkgItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'saffron_package');
    const card: ProductCardData = {
      id: 'saffron_package_6g',
      name: 'بكج الزعفران الخاص',
      category: 'الزعفران',
      variant: '6 جرام',
      price: 65,
      priceDisplay: '65 ريال',
      description: 'بكج الزعفران الخاص وزن 6 جرام متكامل وأنيق.',
      inStock: true,
      imageUrl: pkgItem?.imageUrl || null,
      productUrl: pkgItem?.productUrl,
      hasDirectPage: true,
    };
    return {
      reply: 'وزنه 6 جرام وسعره 65 ريال.',
      suggestions: [],
      productCards: [card],
    };
  }

  // ── عروض المتجر الرسمية والترشيح الذكي المعتمد ──

  // 1. السؤال العام عن العروض ("عندكم عروض؟" / "عندكم عروض" / "وش العروض؟" / "فيه عروض؟" / "عروضكم")
  const isGeneralOffersInquiry =
    /^(عندكم\s*عروض|وش\s*(هي\s*)?العروض|فيه\s*عروض|عروضكم|العروض|عروض|وش\s*عندكم\s*عروض|عندكم\s*تخفيضات|وش\s*التخفيضات|عروض\s*اليوم|وش\s*عروض\s*اليوم|عندكم\s*خصومات|وش\s*الخصومات|أبي\s*عروض|ابي\s*عروض|ابغى\s*عروض|أبغى\s*عروض|اعطني\s*العروض|اعرض\s*العروض|ماهي\s*العروض)(\s*(\?|؟))?$/i.test(normUser) ||
    normUser === 'عندكم عروض؟' || normUser === 'عندكم عروض' ||
    normUser === 'وش العروض؟' || normUser === 'وش العروض' ||
    normUser === 'وش عروضكم؟' || normUser === 'وش عروضكم' ||
    normUser === 'عروضكم' || normUser === 'عروض' || normUser === 'العروض' ||
    normUser === 'فيه عروض؟' || normUser === 'فيه عروض' ||
    normUser === 'عندكم تخفيضات؟' || normUser === 'عندكم تخفيضات' ||
    normUser === 'عندكم خصومات؟' || normUser === 'عندكم خصومات' ||
    (normUser.includes('عروض') && (normUser.includes('عندكم') || normUser.includes('وش') || normUser.includes('فيه')) &&
     !normUser.includes('محسن') && !normUser.includes('طبيعي') && !normUser.includes('بيت') && !normUser.includes('منزل') &&
     !normUser.includes('مجلس') && !normUser.includes('مناسب') && !normUser.includes('اهداء') && !normUser.includes('إهداء') &&
     !normUser.includes('هدية') && !normUser.includes('تايقر') && !normUser.includes('تميز') && !normUser.includes('100'));

  if (isGeneralOffersInquiry) {
    return {
      reply: 'أكيد، تبيها للبيت أو للمجلس والمناسبات أو للإهداء؟',
      suggestions: ['للبيت', 'للمجلس والمناسبات', 'للإهداء'],
      productCards: [],
    };
  }

  // 2. فحص سياق المحادثة لمعرفة ما إذا كان العميل يتابع استفسار العروض السابق
  const historyText = history.map((h) => (h.content || '')).join(' ').toLowerCase();
  const prevAssistantMessage = history.length > 0 ? (history[history.length - 1].content || '').toLowerCase() : '';
  const isAfterOfferQuestion = prevAssistantMessage.includes('للبيت') && (prevAssistantMessage.includes('للمجلس') || prevAssistantMessage.includes('للإهداء'));
  const isOfferContext = isAfterOfferQuestion || historyText.includes('عروض') || historyText.includes('تبيها للبيت') || state.currentSection === 'قسم العروض';

  // فحص الميزانية في سياق العروض إذا لم يحدد الاستخدام بعد:
  const isBudgetOnlyInquiry =
    (normUser === 'عندي 100 ريال' || normUser === 'عندي 100' || normUser === 'ميزانيتي 100 ريال' ||
     normUser === 'ميزانيتي 100' || normUser === '100 ريال' || normUser === 'بحدود 100' || normUser === 'ميزانيتي 100 ريال ابي عرض') &&
    (isOfferContext || normUser.includes('عرض') || normUser.includes('عروض'));

  if (isBudgetOnlyInquiry) {
    return {
      reply: 'ضمن ميزانية 100 ريال، متوفرة عروض ممتازة بـ 99 ريال للعرض كاملاً (مثل عروض باقة العود المحسن 99 ريال، أو بكج الزعفران 65 ريال). تبيها للبيت والاستخدام اليومي أو للمجلس والمناسبات أو للإهداء؟',
      suggestions: ['للبيت', 'للمجلس والمناسبات', 'للإهداء'],
      productCards: [],
    };
  }

  // أ) للبيت / استخدام يومي
  const isHomeOfferInquiry =
    (normUser === 'للبيت' || normUser === 'بيت' || normUser === 'للمنزل' || normUser === 'يومي' || normUser === 'استخدام للبيت' ||
     normUser.includes('للبيت') || normUser.includes('عروض للبيت') || normUser.includes('عرض للبيت') ||
     (normUser.includes('محسن') && (normUser.includes('بيت') || normUser.includes('منزل')))) &&
    (isOfferContext || normUser.includes('عرض') || normUser.includes('عروض') || normUser.includes('100'));

  if (isHomeOfferInquiry) {
    const featuredHomeOffers = [
      { id: 'enh_4_offer', name: 'عود تايقر كمبودي محسن - عرض 4 أوقيات', variant: '4 أوقيات (عرض عود محسن)', price: 99, catalogId: 'enh_4', desc: 'عرض خاص: 4 أوقيات كاملة بـ 99 ريال (كمية وافرة وممتاز للبيت).' },
      { id: 'enh_13_offer', name: 'عود الفراشة الكمبودية - عرض 4 أوقيات', variant: '4 أوقيات (عرض عود محسن)', price: 99, catalogId: 'enh_13', desc: 'عرض خاص: 4 أوقيات كاملة بـ 99 ريال (كسر مباخر خفيفة مناسبة لتبخير البيت اليومي).' },
      { id: 'enh_11_offer', name: 'عود موروكي ميني محسن - عرض 4 أوقيات', variant: '4 أوقيات (عرض عود محسن)', price: 99, catalogId: 'enh_11', desc: 'عرض خاص: 4 أوقيات كاملة بـ 99 ريال (اقتصادي ومناسب جداً للبيت).' },
    ];

    const cards: ProductCardData[] = featuredHomeOffers.map((o) => {
      const item = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === o.catalogId);
      return {
        id: o.id,
        name: o.name,
        category: 'العود المحسن',
        variant: o.variant,
        price: o.price,
        priceDisplay: '99 ريال',
        description: o.desc,
        inStock: true,
        imageUrl: item?.imageUrl || null,
        productUrl: item?.productUrl,
        hasDirectPage: true,
      };
    });

    const hasBudgetMention = normUser.includes('100');
    const replyText = hasBudgetMention
      ? `تناسبك للبيت والاستخدام اليومي ضمن ميزانية 100 ريال هذه الخيارات من عروض العود المحسن (بـ 99 ريال للعرض كاملاً):
- عود تايقر كمبودي: 4 أوقيات بـ 99 ريال (كمية وافرة وثبات ممتاز للبيت).
- عود الفراشة: 4 أوقيات بـ 99 ريال (كسر مباخر خفيفة مناسبة لتبخير البيت اليومي).
- عود مروكي ميني: 4 أوقيات بـ 99 ريال (اقتصادي ومناسب جداً للبيت).`
      : `تناسبك للبيت والاستخدام اليومي هذه الخيارات من عروض العود المحسن (بـ 99 ريال للعرض كاملاً):
- عود تايقر كمبودي: 4 أوقيات بـ 99 ريال (كمية وافرة وثبات ممتاز للبيت).
- عود الفراشة: 4 أوقيات بـ 99 ريال (كسر مباخر خفيفة مناسبة لتبخير البيت اليومي).
- عود مروكي ميني: 4 أوقيات بـ 99 ريال (اقتصادي ومناسب جداً للبيت).`;

    return {
      reply: replyText,
      suggestions: ['كم أوقية التايقر؟', 'كم أوقية الفراشة؟', 'وش يجي في عرض التايقر؟'],
      productCards: cards,
    };
  }

  // ب) للمجلس والمناسبات
  const isMajlisOfferInquiry =
    (normUser === 'للمجلس والمناسبات' ||
     normUser === 'للمجلس' ||
     normUser === 'مجلس' ||
     normUser === 'للمناسبات' ||
     normUser === 'مناسبات' ||
     normUser.includes('للمجلس') ||
     normUser.includes('للمناسبات') ||
     normUser.includes('فخم للمناسبات') ||
     normUser.includes('عروض للمجلس') ||
     normUser.includes('عرض للمجلس')) &&
    (isOfferContext || normUser.includes('عرض') || normUser.includes('عروض') || normUser.includes('مجلس') || normUser.includes('مناسب'));

  if (isMajlisOfferInquiry) {
    const featuredMajlisOffers = [
      { id: 'enh_5_offer', name: 'موروكي التميز 95 - عرض أوقيتين', variant: '2 أوقية (عرض عود محسن)', price: 99, catalogId: 'enh_5', desc: 'عرض خاص: أوقيتين (2 أوقية) بـ 99 ريال (نكهة سويتية بخورية فخمة للمجالس والضيوف).' },
      { id: 'enh_7_offer', name: 'السيوفي الرويال 100 - عرض أوقيتين', variant: '2 أوقية (عرض عود محسن)', price: 99, catalogId: 'enh_7', desc: 'عرض خاص: أوقيتين (2 أوقية) بـ 99 ريال (طابع رسمي وثقيل للمناسبات).' },
      { id: 'enh_6_offer', name: 'السيوفي كينغ 100 - عرض أوقيتين', variant: '2 أوقية (عرض عود محسن)', price: 99, catalogId: 'enh_6', desc: 'عرض خاص: أوقيتين (2 أوقية) بـ 99 ريال (كسر مباخر فخمة تجمّل بالضيافة).' },
    ];

    const cards: ProductCardData[] = featuredMajlisOffers.map((o) => {
      const item = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === o.catalogId);
      return {
        id: o.id,
        name: o.name,
        category: 'العود المحسن',
        variant: o.variant,
        price: o.price,
        priceDisplay: '99 ريال',
        description: o.desc,
        inStock: true,
        imageUrl: item?.imageUrl || null,
        productUrl: item?.productUrl,
        hasDirectPage: true,
      };
    });

    const hasBudgetMention = normUser.includes('100');
    const replyText = hasBudgetMention
      ? `تناسبك للمجلس والمناسبات ضمن ميزانية 100 ريال هذه الخيارات المميزة من عروض العود المحسن (بـ 99 ريال للعرض كاملاً):
- موروكي التميز: أوقيتين (2 أوقية) بـ 99 ريال (نكهة سويتية بخورية فخمة للمجالس والضيوف).
- سيوفي رويال: أوقيتين (2 أوقية) بـ 99 ريال (طابع رسمي وثقيل للمناسبات).
- سيوفي كنج فيتنامي: أوقيتين (2 أوقية) بـ 99 ريال (كسر مباخر فخمة تجمّل بالضيافة).`
      : `تناسبك للمجلس والمناسبات هذه الخيارات المميزة من عروض العود المحسن (بـ 99 ريال للعرض كاملاً):
- موروكي التميز: أوقيتين (2 أوقية) بـ 99 ريال (نكهة سويتية بخورية فخمة للمجالس والضيوف).
- سيوفي رويال: أوقيتين (2 أوقية) بـ 99 ريال (طابع رسمي وثقيل للمناسبات).
- سيوفي كنج فيتنامي: أوقيتين (2 أوقية) بـ 99 ريال (كسر مباخر فخمة تجمّل بالضيافة).`;

    return {
      reply: replyText,
      suggestions: ['وش يجي في عرض مروكي تميز؟', 'كم أوقية مروكي تميز؟', 'كم أوقية سيوفي رويال؟'],
      productCards: cards,
    };
  }

  // ج) للإهداء
  const isGiftOfferInquiry =
    (normUser === 'للإهداء' ||
     normUser === 'للأهداء' ||
     normUser === 'إهداء' ||
     normUser === 'اهداء' ||
     normUser === 'هدية' ||
     normUser.includes('عرض هدية') ||
     normUser.includes('عرض للإهداء') ||
     normUser.includes('عروض الإهداء') ||
     normUser.includes('عروض الاهداء') ||
     normUser.includes('هدية للمناسبات')) &&
    (isOfferContext || normUser.includes('عرض') || normUser.includes('عروض') || normUser.includes('إهداء') || normUser.includes('اهداء') || normUser.includes('هدية'));

  if (isGiftOfferInquiry) {
    const giftCards: ProductCardData[] = [
      {
        id: 'saffron_package',
        name: 'بكج الزعفران الخاص',
        category: 'الزعفران',
        variant: '6 جرام',
        price: 65,
        priceDisplay: '65 ريال',
        description: 'بكج الزعفران الخاص وزن 6 جرام بتغليف أنيق وفاخر مناسب جداً للإهداء.',
        inStock: true,
        hasDirectPage: true,
      },
      {
        id: 'pkg_1',
        name: 'توزيعات مدهال الطيب',
        category: 'قسم العروض',
        variant: 'توزيعات ومناسبات',
        price: 99,
        priceDisplay: '99 ريال',
        description: 'توزيعات وهدايا مدهال الطيب المناسبة للضيوف والمناسبات.',
        inStock: true,
        hasDirectPage: true,
      },
      {
        id: 'oil_2',
        name: 'بكج الادهان 422',
        category: 'أدهان العود',
        variant: '4 أرباع تولة',
        price: 422,
        priceDisplay: '422 ريال',
        description: 'بكج أدهان بيور وطبيعية فاخرة 4 أرباع تولة في علبة إهداء مميزة.',
        inStock: true,
        hasDirectPage: true,
      },
    ];

    return {
      reply: `تناسبك للإهداء هذه الخيارات الموثقة من عروض المتجر:
- بكج الزعفران الخاص: 6 جرام بـ 65 ريال (تغليف أنيق وفاخر مناسب جداً للإهداء).
- توزيعات مدهال الطيب: مناسبة لإهداء المناسبات والضيوف.
- بكج الأدهان: 4 أرباع تولة دهن عود طبيعي فاخر بـ 422 ريال.`,
      suggestions: ['كم وزن بكج الزعفران؟', 'وش مكونات بكج الأدهان؟'],
      productCards: giftCards,
    };
  }

  // د) البحث المباشر عن كل عروض العود المحسن (Direct Search for all 16 offers):
  // مثل: "وش عروض العود المحسن الموجودة؟" / "وش كل عروض العود المحسن؟" / "عروض العود المحسن الموجودة" / "اعرض كل عروض العود المحسن"
  const isDirectSearchAllEnhancedOffers =
    (normUser.includes('عروض') || normUser.includes('عرض')) &&
    (normUser.includes('محسن') || normUser.includes('المحسن')) &&
    (normUser.includes('الموجودة') || normUser.includes('الموجوده') || normUser.includes('كل') || normUser.includes('جميع') || normUser.includes('قائمة') || normUser.includes('وش عروض') || normUser.includes('ماهي عروض') || normUser.includes('اعرض') || normUser === 'وش عروض العود المحسن؟' || normUser === 'وش عروض العود المحسن');

  if (isDirectSearchAllEnhancedOffers) {
    const reply = `متوفرة حالياً 16 عرضاً للعود المحسن بسعر 99 ريال للعرض كاملاً:
- تايقر كمبودي: 4 أوقيات بـ 99 ريال
- فراشة: 4 أوقيات بـ 99 ريال
- مروكي ميني: 4 أوقيات بـ 99 ريال
- تايقر ذهبي: 3 أوقيات بـ 99 ريال
- دقة كمبودي: 3 أوقيات بـ 99 ريال
- مروكي فيتنامي: 3 أوقيات بـ 99 ريال
- سيوفي فيتنامي: 3 أوقيات بـ 99 ريال
- مروكي تميز: أوقيتين بـ 99 ريال
- مروكي ملكي: أوقيتين بـ 99 ريال
- سيوفي رويال: أوقيتين بـ 99 ريال
- سيوفي كنج فيتنامي: أوقيتين بـ 99 ريال
- زوايا فيتنامي: أوقيتين بـ 99 ريال
- زوايا سبيشال فيتنامي: أوقيتين بـ 99 ريال
- دقة مدهال: أوقيتين بـ 99 ريال
- كلمنتان: أوقيتين بـ 99 ريال
- مروكي شيوخ: أوقيتين بـ 99 ريال

(ملاحظة هامة: سعر 99 ريال هو للعرض كاملاً بعدد الأوقيات الموضح لكل منتج، وليس سعراً للأوقية المفردة).`;

    const allCards: ProductCardData[] = ENHANCED_OUD_OFFERS.map((o) => {
      const item = o.catalogItemId ? MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === o.catalogItemId) : null;
      return {
        id: `${o.id}_card`,
        name: item ? `${item.name} - عرض ${o.offer.quantity}` : `${o.productName} - عرض ${o.offer.quantity}`,
        category: 'العود المحسن',
        variant: `${o.offer.quantity} (عرض عود محسن)`,
        price: 99,
        priceDisplay: '99 ريال',
        description: `عرض خاص: ${o.offer.quantity} بـ 99 ريال للعرض كاملاً${o.regularPrice ? ` (السعر الأصلي للأوقية ${o.regularPrice} ريال)` : ''}.`,
        inStock: true,
        imageUrl: item?.imageUrl || null,
        productUrl: item?.productUrl,
        hasDirectPage: true,
      };
    });

    return {
      reply,
      suggestions: ['وش عرض التايقر الكمبودي؟', 'كم سعر الأوقية للتايقر الكمبودي؟', 'وش يجي في عرض مروكي تميز؟'],
      productCards: allCards,
    };
  }

  // هـ) السؤال أو طلب الترشيح في عروض العود المحسن ("عندكم عروض عود محسن؟" / "أبي عرض عود محسن" / "عروض عود محسن"):
  const isRecommendationEnhancedOffer =
    (normUser.includes('عرض') || normUser.includes('عروض')) &&
    (normUser.includes('محسن') || normUser.includes('المحسن')) &&
    !isDirectSearchAllEnhancedOffers;

  if (isRecommendationEnhancedOffer) {
    const featuredOffers = [
      { id: 'enh_4_offer', name: 'عود تايقر كمبودي محسن - عرض 4 أوقيات', variant: '4 أوقيات (عرض عود محسن)', price: 99, catalogId: 'enh_4', desc: 'عرض خاص: 4 أوقيات كاملة بـ 99 ريال (كمية وافرة وثبات ممتاز للبيت).' },
      { id: 'enh_5_offer', name: 'موروكي التميز 95 - عرض أوقيتين', variant: '2 أوقية (عرض عود محسن)', price: 99, catalogId: 'enh_5', desc: 'عرض خاص: أوقيتين (2 أوقية) بـ 99 ريال (نكهة سويتية بخورية فخمة للمجالس والضيوف).' },
      { id: 'enh_1_offer', name: 'التايقر الذهبي 35 - عرض 3 أوقيات', variant: '3 أوقيات (عرض عود محسن)', price: 99, catalogId: 'enh_1', desc: 'عرض خاص: 3 أوقيات كاملة بـ 99 ريال (نكهة كمبودية سويتية مميزة).' },
    ];

    const cards: ProductCardData[] = featuredOffers.map((o) => {
      const item = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === o.catalogId);
      return {
        id: o.id,
        name: o.name,
        category: 'العود المحسن',
        variant: o.variant,
        price: o.price,
        priceDisplay: '99 ريال',
        description: o.desc,
        inStock: true,
        imageUrl: item?.imageUrl || null,
        productUrl: item?.productUrl,
        hasDirectPage: true,
      };
    });

    return {
      reply: `نعم، متوفرة باقة عروض العود المحسن بسعر 99 ريال للعرض كاملاً (تشمل 16 صنفاً بعدد أوقيات محدد لكل نوع، مع بقاء السعر الأصلي للأوقية مستقلاً):
- عود تايقر كمبودي: 4 أوقيات بـ 99 ريال (مناسب للبيت والاستخدام اليومي).
- موروكي التميز: أوقيتين بـ 99 ريال (فخم ومجمل للمجالس والضيوف).
- التايقر الذهبي: 3 أوقيات بـ 99 ريال (نكهة كمبودية سويتية مميزة).

تبيها للبيت والاستخدام اليومي أو للمجلس والمناسبات؟ (أو إذا تحب تشوف قائمة الـ 16 عرضاً كاملة أبشر).`,
      suggestions: ['للبيت', 'للمجلس والمناسبات', 'وش عروض العود المحسن الموجودة؟'],
      productCards: cards,
    };
  }

  // و) تحديد المنتج من رسالة العميل الحالية أو من سياق المحادثة:
  let matchedOffer = ENHANCED_OUD_OFFERS.find((o) =>
    o.aliases.some((a) => normUser.includes(a.toLowerCase()))
  );

  if (!matchedOffer && state.currentProductId) {
    matchedOffer = ENHANCED_OUD_OFFERS.find((o) => o.catalogItemId === state.currentProductId);
  }
  if (!matchedOffer && state.currentProductName) {
    const curNorm = state.currentProductName.toLowerCase();
    matchedOffer = ENHANCED_OUD_OFFERS.find((o) =>
      o.aliases.some((a) => curNorm.includes(a.toLowerCase()) || a.toLowerCase().includes(curNorm))
    );
  }

  if (matchedOffer) {
    const isOfferInquiry =
      normUser.includes('عرض') ||
      normUser.includes('العرض') ||
      normUser.includes('يجي في') ||
      normUser.includes('وش يجي') ||
      normUser.includes('محتويات') ||
      normUser.includes('كم أوقية في') ||
      normUser.includes('كم اوقية في') ||
      normUser.includes('كم اوقيه في') ||
      normUser.includes('كم أوقيه في');

    const isOunceInquiry =
      (normUser.includes('أوقية') || normUser.includes('اوقية') || normUser.includes('أوقيه') || normUser.includes('اوقيه')) &&
      !isOfferInquiry;

    // 1. استفسار العرض: (كم عرض التايقر الكمبودي؟ / وش عرض التايقر الكمبودي؟ / وش يجي في عرض مروكي تميز؟ / كم العرض؟)
    if (isOfferInquiry) {
      const catItem = matchedOffer.catalogItemId
        ? MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === matchedOffer.catalogItemId)
        : null;

      let reply = '';
      const displayQty = matchedOffer.offer.quantity === '2 أوقية' ? '2 أوقية (أوقيتين)' : matchedOffer.offer.quantity;
      if (normUser.includes('يجي') || normUser.includes('محتويات') || normUser.includes('كم أوقية') || normUser.includes('كم اوقية')) {
        reply = `عرض ${matchedOffer.productName} يحتوي على ${displayQty} بسعر 99 ريال للعرض كاملاً.`;
      } else {
        reply = `عرض ${matchedOffer.productName} بـ 99 ريال للعرض كاملاً، ويحتوي على ${displayQty}.`;
      }

      const card: ProductCardData = {
        id: `${matchedOffer.id}_card`,
        name: catItem ? `${catItem.name} - عرض ${matchedOffer.offer.quantity}` : `${matchedOffer.productName} - عرض ${matchedOffer.offer.quantity}`,
        category: 'العود المحسن',
        variant: `${matchedOffer.offer.quantity} (عرض عود محسن)`,
        price: 99,
        priceDisplay: '99 ريال',
        description: `عرض عود محسن خاص: ${matchedOffer.offer.quantity} بـ 99 ريال للعرض كاملاً${matchedOffer.regularPrice ? ` (السعر الأصلي للأوقية المفردة ${matchedOffer.regularPrice} ريال)` : ''}.`,
        inStock: true,
        imageUrl: catItem?.imageUrl || null,
        productUrl: catItem?.productUrl,
        hasDirectPage: true,
      };

      return {
        reply,
        suggestions: matchedOffer.regularPrice ? [`كم سعر الأوقية لـ${matchedOffer.productName}؟`] : [],
        productCards: [card],
      };
    }

    // 2. استفسار سعر الأوقية الأصلي: (كم سعر الأوقية للتايقر الكمبودي؟ / كم أوقية التايقر الكمبودي؟ / كم أوقية مروكي تميز؟ / كم الأوقية؟)
    if (isOunceInquiry) {
      if (matchedOffer.regularPrice !== null) {
        const catItem = matchedOffer.catalogItemId
          ? MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === matchedOffer.catalogItemId)
          : null;
        const ounceVariant = catItem?.variants.find(
          (v) => v.variantName === 'الأوقية' || v.variantName === 'أوقية' || (v.weightGrams && v.weightGrams === 28)
        );

        const reply = `سعر أوقية ${matchedOffer.productName} هو ${matchedOffer.regularPrice} ريال.`;
        const card: ProductCardData = {
          id: `${matchedOffer.catalogItemId || matchedOffer.id}_ounce`,
          name: catItem ? `${catItem.name} - ${ounceVariant?.variantName || 'الأوقية'}` : `${matchedOffer.productName} - الأوقية`,
          category: 'العود المحسن',
          variant: ounceVariant?.displayedWeight || '٢٨ جم',
          price: matchedOffer.regularPrice,
          priceDisplay: `${matchedOffer.regularPrice} ريال`,
          description: catItem?.notes || `أوقية مفردة (28 جم) بالسعر الأصلي المعتمد في الكتالوج.`,
          inStock: true,
          imageUrl: catItem?.imageUrl || null,
          productUrl: catItem?.productUrl,
          hasDirectPage: true,
        };

        return {
          reply,
          suggestions: [`وش عرض ${matchedOffer.productName}؟`],
          productCards: [card],
        };
      } else {
        // لا يوجد سعر أصلي مسجل للأوقية المفردة في الكتالوج (مثل كلمنتان أو مروكي شيوخ)
        const reply = `المنتج متوفر ضمن عروض العود المحسن بسعر 99 ريال لـ ${matchedOffer.offer.quantity} للعرض كاملاً.`;
        return {
          reply,
          suggestions: [],
          productCards: [],
        };
      }
    }
  }

  // "كم سعر كيلو التايقر الكمبودي؟" or "سعر كيلو التايقر"
  if ((normUser.includes('تايقر') || normUser.includes('تايجر')) && normUser.includes('كيلو') && (normUser.includes('كم') || normUser.includes('سعر') || normUser.includes('بكم'))) {
    const tigerKilo = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_1_kilo') || MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_1');
    const card: ProductCardData = {
      id: 'enh_1_kilo',
      name: 'التايقر الذهبي 35 - الكيلو',
      category: 'العود المحسن',
      variant: '١٠٠٠ جم',
      price: 800,
      priceDisplay: '800 ريال',
      description: 'عود كمبودي تايقر محسن فاخر مناسب للضيافة والاستخدام اليومي.',
      inStock: true,
      imageUrl: tigerKilo?.imageUrl || null,
      productUrl: tigerKilo?.productUrl,
      hasDirectPage: true,
    };
    return {
      reply: 'سعر كيلو عود تايقر كمبودي المحسن هو 800 ريال.',
      suggestions: [],
      productCards: [card],
    };
  }

  // 2. Direct lookup for weights/variants when product is already known from ConversationState (e.g. enh_5 موروكي التميز):
  if (state.currentProductId) {
    const catalogItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === state.currentProductId);
    if (catalogItem && catalogItem.variants && catalogItem.variants.length > 0) {
      // Check if message is a clean, direct inquiry about weight/size:
      // Examples: "كم الكيلو؟", "طيب الكيلو؟", "سعر الكيلو", "كم النص؟", "طيب النص؟", "كم الربع؟", "طيب الربع؟", "كم الثمن؟", "طيب الثمن؟", "كم الأوقية؟", "طيب الأوقية؟"
      const isWeightQuery =
        /^(كم|طيب|سعر|بكم)\s*(سعر\s*)?(الكيلو|كيلو|النص|النصف|الربع|الثمن|الأوقية|الاوقية)\s*(\?)?$/i.test(normUser) ||
        normUser === 'كم الكيلو؟' || normUser === 'كم الكيلو' || normUser === 'طيب الكيلو؟' || normUser === 'طيب الكيلو' || normUser === 'سعر الكيلو' ||
        normUser === 'كم النص؟' || normUser === 'كم النص' || normUser === 'طيب النص؟' || normUser === 'طيب النص' || normUser === 'سعر النص' ||
        normUser === 'كم الربع؟' || normUser === 'كم الربع' || normUser === 'طيب الربع؟' || normUser === 'طيب الربع' || normUser === 'سعر الربع' ||
        normUser === 'كم الثمن؟' || normUser === 'كم الثمن' || normUser === 'طيب الثمن؟' || normUser === 'طيب الثمن' || normUser === 'سعر الثمن' ||
        normUser === 'كم الأوقية؟' || normUser === 'كم الأوقية' || normUser === 'طيب الأوقية؟' || normUser === 'طيب الأوقية' || normUser === 'سعر الأوقية';

      if (isWeightQuery) {
        let targetVariant: any = null;
        let weightLabel = '';

        if (normUser.includes('كيلو')) {
          targetVariant = catalogItem.variants.find((v) => v.variantName === 'الكيلو' || (v.weightGrams && v.weightGrams >= 1000));
          weightLabel = 'الكيلو';
        } else if (normUser.includes('نصف') || normUser.includes('نص')) {
          targetVariant = catalogItem.variants.find((v) => v.variantName === 'النصف' || (v.weightGrams && v.weightGrams === 500));
          weightLabel = 'النص';
        } else if (normUser.includes('ربع')) {
          targetVariant = catalogItem.variants.find((v) => v.variantName === 'الربع' || (v.weightGrams && v.weightGrams === 250));
          weightLabel = 'الربع';
        } else if (normUser.includes('ثمن')) {
          targetVariant = catalogItem.variants.find((v) => v.variantName.includes('ثمن') || (v.weightGrams && v.weightGrams === 125));
          weightLabel = 'الثمن';
        } else if (normUser.includes('أوقية') || normUser.includes('اوقية')) {
          targetVariant = catalogItem.variants.find((v) => v.variantName === 'الأوقية' || (v.weightGrams && v.weightGrams === 28));
          weightLabel = 'الأوقية';
        }

        if (targetVariant) {
          const card: ProductCardData = {
            id: `${catalogItem.id}_${targetVariant.variantName}`,
            name: `${catalogItem.name} - ${targetVariant.variantName}`,
            category: catalogItem.category,
            variant: targetVariant.displayedWeight || targetVariant.variantName,
            price: targetVariant.price,
            priceDisplay: targetVariant.priceDisplay,
            description: catalogItem.notes,
            inStock: targetVariant.inStock,
            imageUrl: catalogItem.imageUrl,
            productUrl: catalogItem.productUrl,
            hasDirectPage: true,
          };

          const replyText = weightLabel === 'الكيلو'
            ? `سعر الكيلو من ${catalogItem.name.replace(/\s*\d+$/, '')} ${targetVariant.priceDisplay}.`
            : `${weightLabel} بـ${targetVariant.priceDisplay}.`;

          return {
            reply: replyText,
            suggestions: [],
            productCards: [card],
          };
        }
      }
    }
  }

  // 3. Direct inquiry about empty bag colors: "وش الألوان؟" or "الألوان المتاحة"
  if (
    (state.currentSection === 'الشنط' || state.currentProductId === 'acc_empty_bag' || normUser.includes('شنطة') || normUser.includes('شنط')) &&
    (normUser.includes('وش الألوان') || normUser.includes('وش الالوان') || normUser.includes('الألوان المتاحة') || normUser.includes('الالوان المتاحة') || normUser.includes('وش الوانها') || normUser === 'وش الألوان؟' || normUser === 'وش الالوان؟')
  ) {
    const bagItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.isEmptyBag);
    const colors = ['بيج', 'جملي', 'أسود', 'أخضر'];
    const cards: ProductCardData[] = colors.map((col) => ({
      id: `empty_bag_${col}`,
      name: `شنطة حفظ عود جلدية فارغة (${col})`,
      category: 'الشنط',
      variant: 'متوفرة بعدة مقاسات (ثمن، ربع، نصف، كيلو)',
      price: 20,
      priceDisplay: 'تبدأ من 20 ريال',
      description: `شنطة جلدية فاخرة فارغة باللون (${col}) لحفظ البخور والعود.`,
      inStock: true,
      imageUrl: bagItem?.imageUrl || null,
      productUrl: undefined,
      hasDirectPage: false,
    }));

    return {
      reply: 'شنط حفظ العود الجلدية الفارغة متوفرة بأربعة ألوان فاخرة: البيج، الجملي، الأسود، والأخضر.',
      suggestions: [],
      productCards: cards,
    };
  }

  // 4. Direct availability question: "هل متوفر؟" or "متوفر؟"
  if (state.currentProductId && (normUser === 'هل متوفر؟' || normUser === 'هل متوفر' || normUser === 'متوفر؟' || normUser === 'متوفر منه؟')) {
    const catalogItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === state.currentProductId);
    if (catalogItem) {
      const isAvail = catalogItem.overallAvailability === 'متوفر' || catalogItem.overallAvailability === 'متوفر جزئياً';
      const card: ProductCardData = {
        id: catalogItem.id,
        name: catalogItem.name,
        category: catalogItem.category,
        variant: catalogItem.variants[0]?.variantName || 'متوفر',
        price: catalogItem.displayedCardPrice ?? undefined,
        priceDisplay: catalogItem.variants[0]?.priceDisplay || `${catalogItem.displayedCardPrice} ريال`,
        description: catalogItem.notes,
        inStock: isAvail,
        imageUrl: catalogItem.imageUrl,
        productUrl: catalogItem.productUrl,
        hasDirectPage: true,
      };
      return {
        reply: isAvail ? 'نعم، متوفر وجاهز للطلب مباشرة.' : 'للأسف نفدت الكمية حالياً، لكن يتوفر منه بدائل مناسبة.',
        suggestions: [],
        productCards: [card],
      };
    }
  }

  return null;
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
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  isComplexRequest: boolean = false
): Promise<GeminiReplyResult> {
  const ai = getGeminiClient();

  // Model Fallback Hierarchy (Strictly using single GEMINI_API_KEY):
  // 1. gemini-3.1-flash-lite: Fast, lightweight, lowest cost & separate quota for basic requests
  // 2. gemini-3.8-flash: Standard tier with high quality and reasoning
  // 3. gemini-3.1-pro-preview: Deep reasoning and complex query fallback
  // 4. gemini-flash-latest: Stable fallback alias
  const models = isComplexRequest
    ? ['gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
    : ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest'];
  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];

    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      if (response.text) {
        const usage = (response as any).usageMetadata;
        const promptTokens = usage?.promptTokenCount || 0;
        const candidateTokens = usage?.candidatesTokenCount || 0;
        const totalTokens = usage?.totalTokenCount || (promptTokens + candidateTokens);

        if (i > 0) {
          console.log(`[Model Fallback Success] Fallback succeeded with model: ${model}`);
          analytics.recordFallback(models[0], model, `Switched from ${models[i - 1]} to ${model}`);
        }

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
      console.warn(`[Model Fallback] Model ${model} encountered error: ${errMsg.slice(0, 120)}`);

      const nextModel = models[i + 1];
      if (nextModel) {
        analytics.recordFallback(model, nextModel, errMsg.slice(0, 100));
      }
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota')) {
        analytics.recordError('429', `${model}: quota exceeded`);
      } else {
        analytics.recordError('other', `${model}: ${errMsg.slice(0, 80)}`);
      }
      // Continue loop to try next model in the fallback hierarchy with full context
    }
  }

  throw lastError || new Error('تعذر توليد الرد في الوقت الحالي');
}

// Helper to enforce exact product matching and maintain context across conversation turns
function processProductCardsForQuery(
  userMessage: string,
  rawCards: ProductCardData[],
  history: Array<{ role: string; content: string; productCards?: ProductCardData[] }> = []
): ProductCardData[] {
  const normUser = userMessage.toLowerCase().trim();

  // Extract recent context for follow-up resolutions
  const recentHistoryText = history.map((h) => h.content || '').join(' ').toLowerCase();
  const lastAssistantMsg = [...history].reverse().find((h) => h.role === 'assistant' || h.role === 'model');
  const lastAssistantCards = lastAssistantMsg?.productCards || [];

  const isFollowUp = 
    normUser.includes('كم سعره') ||
    normUser.includes('سعره') ||
    normUser.includes('بكم') ||
    normUser.includes('قارن') ||
    normUser.includes('بينهم') ||
    normUser.includes('الأرخص') ||
    normUser.includes('الارخص') ||
    normUser.includes('أرخص') ||
    normUser.includes('ارخص') ||
    normUser.includes('حجم أكبر') ||
    normUser.includes('حجم اكبر') ||
    normUser.includes('فيه أكبر') ||
    normUser.includes('فيه اكبر') ||
    normUser.includes('سعر الكيلو') ||
    normUser.includes('النص') ||
    normUser.includes('هذا') ||
    normUser.includes('الثاني');

  // Comparison request: "قارن بينهم"
  if (normUser.includes('قارن') || normUser.includes('بينهم')) {
    if (rawCards.length >= 2) return rawCards;
    if (lastAssistantCards.length >= 2) return lastAssistantCards.slice(0, 3);

    // If history mentions both Tiger and Tamayuz / Moroki
    const hasTiger = recentHistoryText.includes('تايقر') || recentHistoryText.includes('تايجر');
    const hasTamayuz = recentHistoryText.includes('التميز') || recentHistoryText.includes('موروكي');
    if (hasTiger && hasTamayuz) {
      const tigerItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_1');
      const tamayuzItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_5');
      const res: ProductCardData[] = [];
      if (tigerItem) {
        res.push({
          id: tigerItem.id,
          name: tigerItem.name,
          category: tigerItem.category,
          variant: tigerItem.variants[0]?.variantName || 'أوقية',
          price: tigerItem.variants[0]?.price || 35,
          priceDisplay: tigerItem.variants[0]?.priceDisplay || '35 ريال',
          description: tigerItem.notes,
          inStock: true,
          imageUrl: tigerItem.imageUrl,
          productUrl: tigerItem.productUrl,
          hasDirectPage: true,
        });
      }
      if (tamayuzItem) {
        const v = tamayuzItem.variants[0];
        res.push({
          id: tamayuzItem.id,
          name: tamayuzItem.name,
          category: tamayuzItem.category,
          variant: v?.displayedWeight || v?.variantName || 'أوقيتين',
          price: v?.price || tamayuzItem.displayedCardPrice || 95,
          priceDisplay: v?.priceDisplay || '95 ريال',
          description: tamayuzItem.notes,
          inStock: true,
          imageUrl: tamayuzItem.imageUrl,
          productUrl: tamayuzItem.productUrl,
          hasDirectPage: true,
        });
      }
      if (res.length >= 2) return res;
    }
  }

  // 1. Check Tiger request ("تايقر ذهبي", "تايجر ذهبي", "تايقر كمبودي", "تايقر", "تايجر")
  const refersToTiger = normUser.includes('تايقر') || normUser.includes('تايجر') ||
    (isFollowUp && (recentHistoryText.includes('تايقر') || recentHistoryText.includes('تايجر')));

  if (refersToTiger && !normUser.includes('قارن')) {
    const tigerItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_1');
    if (tigerItem) {
      let filteredVariants = tigerItem.variants;
      if (normUser.includes('كيلو') || normUser.includes('الكيلو')) {
        filteredVariants = tigerItem.variants.filter((v) => v.variantName === 'الكيلو' || v.weightGrams === 1000);
      } else if (normUser.includes('نصف') || normUser.includes('نص')) {
        filteredVariants = tigerItem.variants.filter((v) => v.variantName.includes('نصف') || v.weightGrams === 500);
      } else if (normUser.includes('ربع')) {
        filteredVariants = tigerItem.variants.filter((v) => v.variantName.includes('ربع') || v.weightGrams === 250);
      } else if (normUser.includes('ثمن')) {
        filteredVariants = tigerItem.variants.filter((v) => v.variantName.includes('ثمن') || v.weightGrams === 125);
      } else if (normUser.includes('أوقية') || normUser.includes('اوقية')) {
        filteredVariants = tigerItem.variants.filter((v) => v.variantName.includes('أوقية') || v.weightGrams === 28);
      } else if (normUser.includes('حجم أكبر') || normUser.includes('فيه أكبر')) {
        filteredVariants = tigerItem.variants.filter((v) => (v.weightGrams || 0) >= 500);
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

  // 2. Check Empty Bag request ("شنطة بيج ثمن", "شنطة بيج", "أبيها فاضية", etc.)
  const refersToEmptyBag =
    ((normUser.includes('شنطة') || normUser.includes('شنط')) && (normUser.includes('بيج') || normUser.includes('سوداء') || normUser.includes('أسود') || normUser.includes('فاضية') || normUser.includes('فارغة') || normUser.includes('جملي') || normUser.includes('أخضر'))) ||
    ((normUser.includes('فاضية') || normUser.includes('فارغة')) && (recentHistoryText.includes('شنطة') || recentHistoryText.includes('شنط')));

  if (refersToEmptyBag) {
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

  // 3. Check Gifting request ("أبي الاهداء", "هدايا", "إهداء", "اهداء")
  if (normUser.includes('اهداء') || normUser.includes('إهداء') || normUser.includes('هدية')) {
    const giftingCandidates: ProductCardData[] = [];
    const accItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'acc_1');
    const tigerPackage = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'offer_1');
    const seyoufiPackage = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'offer_3');

    if (accItem) {
      giftingCandidates.push({
        id: accItem.id,
        name: accItem.name,
        category: accItem.category,
        variant: accItem.variants[0]?.variantName || 'الشنطة',
        price: accItem.displayedCardPrice || 95,
        priceDisplay: accItem.variants[0]?.priceDisplay || '95 ريال',
        description: 'شنطة بني أكريلك فاخرة مناسبة للإهداء',
        inStock: true,
        imageUrl: accItem.imageUrl,
        productUrl: accItem.productUrl,
        hasDirectPage: true,
      });
    }
    if (tigerPackage) {
      giftingCandidates.push({
        id: tigerPackage.id,
        name: tigerPackage.name,
        category: tigerPackage.category,
        variant: tigerPackage.variants[0]?.variantName || 'ثمن كيلو',
        price: tigerPackage.displayedCardPrice || 150,
        priceDisplay: tigerPackage.variants[0]?.priceDisplay || '150 ريال',
        description: tigerPackage.notes,
        inStock: true,
        imageUrl: tigerPackage.imageUrl,
        productUrl: tigerPackage.productUrl,
        hasDirectPage: true,
      });
    }
    if (seyoufiPackage) {
      giftingCandidates.push({
        id: seyoufiPackage.id,
        name: seyoufiPackage.name,
        category: seyoufiPackage.category,
        variant: seyoufiPackage.variants[0]?.variantName || 'أوقية + هدايا',
        price: seyoufiPackage.displayedCardPrice || 285,
        priceDisplay: seyoufiPackage.variants[0]?.priceDisplay || '285 ريال',
        description: seyoufiPackage.notes,
        inStock: true,
        imageUrl: seyoufiPackage.imageUrl,
        productUrl: seyoufiPackage.productUrl,
        hasDirectPage: true,
      });
    }

    if (giftingCandidates.length > 0) return giftingCandidates;
  }

  // 4. Check specific Perfume request ("عطر royal", "عطر لكجري", "عطر أروجنت", etc.)
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

  // 5. Check Moroki Al-Tamayuz ("موروكي التميز", "مروكي التميز")
  const refersToTamayuz = normUser.includes('التميز') || 
    (isFollowUp && recentHistoryText.includes('التميز') && !refersToTiger);

  if (refersToTamayuz && !normUser.includes('قارن')) {
    const tamayuzItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'enh_5');
    if (tamayuzItem) {
      let filteredVariants = tamayuzItem.variants;
      if (normUser.includes('كيلو') && !normUser.includes('نص') && !normUser.includes('ربع') && !normUser.includes('ثمن')) {
        filteredVariants = tamayuzItem.variants.filter((v) => v.variantName === 'الكيلو' || v.weightGrams === 1000);
      } else if (normUser.includes('نصف') || normUser.includes('نص')) {
        filteredVariants = tamayuzItem.variants.filter((v) => v.variantName === 'النصف' || v.weightGrams === 500);
      } else if (normUser.includes('ربع')) {
        filteredVariants = tamayuzItem.variants.filter((v) => v.variantName === 'الربع' || v.weightGrams === 250);
      } else if (normUser.includes('ثمن')) {
        filteredVariants = tamayuzItem.variants.filter((v) => v.variantName.includes('ثمن') || v.weightGrams === 125);
      } else if (normUser.includes('أوقية') || normUser.includes('اوقية')) {
        filteredVariants = tamayuzItem.variants.filter((v) => v.variantName === 'الأوقية' || v.weightGrams === 28);
      }
      const v = filteredVariants[0] || tamayuzItem.variants[0];
      return [
        {
          id: tamayuzItem.id,
          name: tamayuzItem.name,
          category: tamayuzItem.category,
          variant: v?.displayedWeight || v?.variantName || 'أوقية',
          price: v?.price || tamayuzItem.displayedCardPrice || 95,
          priceDisplay: v?.priceDisplay || '95 ريال',
          description: tamayuzItem.notes,
          inStock: true,
          imageUrl: tamayuzItem.imageUrl,
          productUrl: tamayuzItem.productUrl,
          hasDirectPage: true,
        },
      ];
    }
  }

  // 6. Check Seyoufi King ("سيوفي كينغ", "السيوفي الكنق")
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

  // 7. Check Cambodian Oud Oil ("دهن عود", "دهن كمبودي", "كوه كنج")
  if (normUser.includes('دهن') || normUser.includes('كوه كنج')) {
    const kohKong = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'oil_11');
    if (kohKong) {
      let matchedV = kohKong.variants[0]; // ربع تولة (96 ريال)
      if (normUser.includes('نصف') || normUser.includes('نص')) {
        matchedV = kohKong.variants[1] || matchedV;
      } else if (normUser.includes('تولة') && !normUser.includes('ربع') && !normUser.includes('نصف') && !normUser.includes('نص')) {
        matchedV = kohKong.variants[2] || matchedV;
      }
      return [
        {
          id: kohKong.id,
          name: kohKong.name,
          category: kohKong.category,
          variant: matchedV.variantName,
          price: matchedV.price || 96,
          priceDisplay: matchedV.priceDisplay || '96 ريال',
          description: kohKong.notes,
          inStock: true,
          imageUrl: kohKong.imageUrl,
          productUrl: kohKong.productUrl,
        },
      ];
    }
  }

  // 8. Check Saffron ("زعفران", "المغربي", "الإيراني", "بكج الزعفران", "أبو 45")
  const refersToSaffron =
    normUser.includes('زعفران') ||
    normUser.includes('مغربي') ||
    (normUser.includes('خاص') && (recentHistoryText.includes('زعفران') || normUser.includes('بكج'))) ||
    (normUser.includes('45') && (normUser.includes('جرام') || recentHistoryText.includes('زعفران')));

  if (refersToSaffron) {
    if (normUser.includes('مغربي')) {
      const saffronItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'zaf_4');
      if (saffronItem) {
        let v = saffronItem.variants[0]; // 5 جرام (75 ريال)
        if (normUser.includes('10') || normUser.includes('عشرة')) {
          v = saffronItem.variants[1] || v;
        }
        return [
          {
            id: saffronItem.id,
            name: saffronItem.name,
            category: saffronItem.category,
            variant: v.variantName,
            price: v.price || 75,
            priceDisplay: v.priceDisplay || '75 ريال',
            description: saffronItem.notes,
            inStock: true,
            imageUrl: saffronItem.imageUrl,
            productUrl: saffronItem.productUrl,
          },
        ];
      }
    }

    if (normUser.includes('خاص') || normUser.includes('بكج الزعفران')) {
      const saffronItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'zaf_1');
      if (saffronItem) {
        const v = saffronItem.variants[0];
        return [
          {
            id: saffronItem.id,
            name: saffronItem.name,
            category: saffronItem.category,
            variant: v.variantName,
            price: v.price || 65,
            priceDisplay: v.priceDisplay || '65 ريال',
            description: saffronItem.notes,
            inStock: true,
            imageUrl: saffronItem.imageUrl,
            productUrl: saffronItem.productUrl,
          },
        ];
      }
    }

    if (normUser.includes('إيراني') || normUser.includes('ايراني') || normUser.includes('نقيل') || normUser.includes('45')) {
      const saffronItem = MIDHAL_OFFICIAL_CATALOG.find((c) => c.id === 'zaf_3');
      if (saffronItem) {
        let v = saffronItem.variants[0]; // 5 جرام (45 ريال)
        if (normUser.includes('10') || normUser.includes('عشرة')) {
          v = saffronItem.variants[1] || v;
        }
        return [
          {
            id: saffronItem.id,
            name: saffronItem.name,
            category: saffronItem.category,
            variant: v.variantName,
            price: v.price || 45,
            priceDisplay: v.priceDisplay || '45 ريال',
            description: saffronItem.notes,
            inStock: true,
            imageUrl: saffronItem.imageUrl,
            productUrl: saffronItem.productUrl,
          },
        ];
      }
    }

    // General saffron request
    const saffronItems = MIDHAL_OFFICIAL_CATALOG.filter((c) => c.category === 'الزعفران');
    if (saffronItems.length > 0) {
      return saffronItems.slice(0, 3).map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        variant: item.variants[0]?.variantName,
        price: (item.displayedCardPrice ?? item.variants[0]?.price) ?? undefined,
        priceDisplay: item.variants[0]?.priceDisplay,
        description: item.notes,
        inStock: true,
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
      }));
    }
  }

  // Filter rawCards if user requested a specific product name that rawCards mixed up
  if (rawCards.length > 0) {
    const lowerUser = normUser.toLowerCase();
    if (lowerUser.includes('تايقر') || lowerUser.includes('تايجر')) {
      const filtered = rawCards.filter((c) => c.name.includes('التايقر') || c.name.includes('تايقر') || Boolean(c.id && c.id.includes('enh_1')));
      if (filtered.length > 0) return filtered;
    }
  }

  // If follow-up and rawCards is empty, retain last assistant cards only if context hasn't changed
  if (rawCards.length === 0 && isFollowUp && lastAssistantCards.length > 0) {
    // If user changed topic to saffron, perfume, air/linen freshener, bags, or oil, do not retain unrelated cards
    const changedTopic =
      refersToSaffron ||
      normUser.includes('عطر') ||
      normUser.includes('معطر') ||
      normUser.includes('مفارش') ||
      normUser.includes('شنط') ||
      normUser.includes('شنطة') ||
      normUser.includes('دهن');
    if (!changedTopic) {
      return lastAssistantCards;
    }
  }

  return rawCards;
}

// Contextual suggestion generator strictly decoupled from AI text generation
function determineContextualSuggestions(
  replyText: string,
  userMessage: string,
  history: Array<{ role: string; content: string; productCards?: ProductCardData[] }> = [],
  productCards: ProductCardData[] = []
): string[] {
  const normUser = userMessage.toLowerCase().trim();
  const normReply = replyText.toLowerCase().trim();

  // 1. Direct questions about price, weight, size, location, delivery, or a single specific item:
  // In all direct questions, show ZERO suggestions (do not clutter the interface or fill space).
  const isDirectQuestion =
    normUser.includes('كم سعره') ||
    normUser.includes('كم سعر') ||
    normUser.includes('سعره بكم') ||
    normUser.includes('بكم') ||
    normUser.includes('كم جرام') ||
    normUser.includes('كم وزنه') ||
    normUser.includes('كم وزن') ||
    normUser.includes('أبو 45') ||
    normUser.includes('ابو 45') ||
    normUser.includes('المغربي بكم') ||
    normUser.includes('الكيلو بكم') ||
    normUser.includes('الأوقية بكم') ||
    normUser.includes('الاوقية بكم') ||
    normUser.includes('طيب الكيلو') ||
    normUser.includes('طيب النص') ||
    normUser.includes('طيب الربع') ||
    normUser.includes('طيب الثمن') ||
    normUser.includes('وين موقعكم') ||
    normUser.includes('وين مكانكم') ||
    normUser.includes('عندكم توصيل') ||
    normUser.includes('كيف التوصيل') ||
    normUser.includes('الضمان الذهبي') ||
    normUser.includes('طرق الدفع') ||
    normUser.includes('كود الخصم') ||
    // Specific single variant/product inquiry like "ربع تولة دهن كمبودي" or "أبي كوه كنج"
    (normUser.includes('دهن') && (normUser.includes('ربع') || normUser.includes('تولة') || normUser.includes('كمبودي') || normUser.includes('كوه كنج'))) ||
    // Specific direct inquiry about single saffron item (e.g., "نبغى زعفران مغربي" or "بكج الزعفران الخاص كم وزنه")
    (normUser.includes('زعفران مغربي') && !normUser.includes('قارن') && !normUser.includes('رشح')) ||
    (normUser.includes('بكج الزعفران الخاص') && !normUser.includes('قارن'));

  if (isDirectQuestion) {
    return [];
  }

  // 2. Comparison suggestion: [قارن بينهم]
  // Rule: ONLY show "قارن بينهم" if the assistant presented 2 or more DISTINCT products
  // as actual choices in the same context, and comparing them makes sense (e.g. recommendations or multiple options).
  const distinctProductNames = new Set(productCards.map((c) => c.name.trim()));
  const hasMultipleDistinctProducts = distinctProductNames.size >= 2;

  const isComparativeContext =
    normUser.includes('رشح لي') ||
    normUser.includes('وش تنصحني') ||
    normUser.includes('وش الأفضل') ||
    normUser.includes('وش الافضل') ||
    normUser.includes('خيارات') ||
    normUser.includes('عروض') ||
    normUser.includes('بدائل') ||
    normUser.includes('للمجلس') ||
    normUser.includes('للمناسبات') ||
    normReply.includes('يتوفر عندنا نوعان') ||
    normReply.includes('خيارات ممتازة') ||
    normReply.includes('عدة خيارات') ||
    normReply.includes('الفرق بين');

  if (hasMultipleDistinctProducts && isComparativeContext) {
    return ['قارن بينهم'];
  }

  // 3. Open exploration / broad inquiries where user needs guidance or classification:
  // Example: "أبي عود" or "وش عندكم عود" -> clarify type
  if (
    normUser === 'أبي عود' ||
    normUser === 'ابى عود' ||
    normUser === 'ابغى عود' ||
    normUser === 'عندكم عود' ||
    normUser === 'وش عندكم عود' ||
    normUser === 'بخور' ||
    normUser === 'أبي بخور' ||
    (normUser.includes('عود') && normReply.includes('طبيعي أو محسن'))
  ) {
    return ['طبيعي', 'محسن', 'رشح لي'];
  }

  // Example: "أبي عود محسن" -> clarify usage / purpose
  if (
    normUser === 'أبي عود محسن' ||
    normUser === 'ابغى عود محسن' ||
    normUser === 'عندكم عود محسن' ||
    normUser === 'عود محسن'
  ) {
    return ['طبيعي', 'محسن', 'رشح لي'];
  }

  // Example: "أبي عود للمجلس" without distinct cards -> clarify natural vs enhanced
  if (normUser.includes('عود للمجلس') || (normUser.includes('مجلس') && normUser.includes('عود'))) {
    if (normReply.includes('طبيعي أو محسن') || normReply.includes('طبيعي او محسن') || normReply.includes('تفضله')) {
      return ['طبيعي', 'محسن', 'رشح لي'];
    }
  }

  // Example: General perfume inquiry ("وش عندكم عطور", "عندكم عطور")
  if (
    normUser === 'وش عندكم عطور' ||
    normUser === 'عندكم عطور' ||
    normUser === 'أبي عطر' ||
    normUser === 'عطور'
  ) {
    return ['عطور رسمية', 'عطور يومية هادئة'];
  }

  // 4. Single product with multiple weights:
  // If the user showed interest in an oud product without specifying weight (e.g. "أبي تايقر كمبودي" or "وش أسعار التايقر")
  // and 1 distinct product is present with multiple weights:
  if (
    (normUser.includes('تايقر') || normUser.includes('موروكي') || normUser.includes('سيوفي') || normUser.includes('كلمنتان')) &&
    !normUser.includes('كم سعره') &&
    !normUser.includes('بكم') &&
    !normUser.includes('أوقية') &&
    !normUser.includes('كيلو') &&
    !normUser.includes('ثمن') &&
    distinctProductNames.size === 1
  ) {
    return ['الأوقية', 'النص', 'الكيلو'];
  }

  // 5. Default: If no suggestion adds clear value, return 0 suggestions.
  return [];
}

function parseReplyAndSuggestions(
  text: string,
  userMessage: string,
  history: Array<{ role: string; content: string; productCards?: ProductCardData[] }> = []
): {
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

    // Check if query is about saffron ("زعفران")
    if (candidates.length === 0 && (lowerText.includes('زعفران') || userMessage.includes('زعفران'))) {
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

  // Apply strict specific-query product card matching and filtering with context
  productCards = processProductCardsForQuery(userMessage, productCards, history);

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

  // Strictly compute suggestions contextually (0, 1, 2, or 3 maximum)
  const computedSuggestions = determineContextualSuggestions(cleaned.trim(), userMessage, history, productCards);

  const isDirectSearch =
    userMessage.includes('كل') ||
    userMessage.includes('جميع') ||
    userMessage.includes('ابحث') ||
    userMessage.includes('اعرض') ||
    userMessage.includes('قائمة') ||
    (userMessage.includes('عطور') && !userMessage.includes('رشح') && !userMessage.includes('تنصحني'));

  return {
    reply: cleaned.trim(),
    suggestions: computedSuggestions.slice(0, 3),
    productCards: isDirectSearch ? productCards : productCards.slice(0, 3),
  };
}

// Chat endpoint (stateless AI assistant with structured memory & direct lookup optimization)
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const message = req.body.message;
    const rawHistory = req.body.conversationHistory || req.body.history || [];
    const conversationHistory = Array.isArray(rawHistory) ? rawHistory : [];

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'حقل الرسالة مطلوب' });
      return;
    }

    // Clean conversationHistory to remove any trailing duplicate of the current message
    const cleanHistory = Array.isArray(conversationHistory) ? [...conversationHistory] : [];
    while (
      cleanHistory.length > 0 &&
      cleanHistory[cleanHistory.length - 1].content &&
      cleanHistory[cleanHistory.length - 1].content.trim() === message.trim() &&
      (cleanHistory[cleanHistory.length - 1].role === 'customer' || cleanHistory[cleanHistory.length - 1].role === 'user')
    ) {
      cleanHistory.pop();
    }

    // 1. Structured Conversation State (Requirement 1 & 8)
    const conversationState = extractConversationState(message, cleanHistory);

    // 2. Safe Zero-LLM Direct Lookup (Requirement 4)
    const directLookup = tryDirectLookup(message, conversationState, cleanHistory);
    if (directLookup) {
      const responseTimeMs = Date.now() - startTime;
      console.log(`[Zero-LLM Direct Lookup] Query "${message}" answered via direct catalog lookup in ${responseTimeMs}ms with 0 tokens!`);

      // Record agent request telemetry with 0 tokens
      analytics.recordAgentRequest({
        model: 'Direct-Lookup (Zero-Tokens)',
        promptTokens: 0,
        candidateTokens: 0,
        totalTokens: 0,
        userQuery: message,
        agentReply: directLookup.reply,
        detectedTopic: conversationState.lastIntent,
        responseTimeMs,
        isDirectLookup: true,
      });

      if (directLookup.productCards && directLookup.productCards.length > 0) {
        analytics.recordProductImpressions(directLookup.productCards.map((c) => c.name));
      }

      res.json({
        reply: directLookup.reply,
        suggestions: directLookup.suggestions.slice(0, 3),
        productCards: directLookup.productCards,
        analysis: {
          detectedIntent: conversationState.lastIntent,
          targetUsage: conversationState.targetUsage || 'غير محدد',
          productType: conversationState.currentSection || 'غير محدد',
          budgetMentioned: conversationState.budget,
          currentSubject: conversationState.currentProductName,
          confidenceNote: 'إجابة مباشرة وسريعة من قاعدة البيانات الرسمية (بدون استهلاك توكنات).',
        },
        telemetry: {
          model: 'Direct-Lookup (Zero-Tokens)',
          promptTokens: 0,
          candidateTokens: 0,
          totalTokens: 0,
          responseTimeMs,
          isDirectLookup: true,
        },
        conversationState,
      });
      return;
    }

    // 3. Complex or conversational inquiry: use Gemini with Recent History (last 6-8 turns) and Compact Card References (Requirements 2 & 3)
    const recentHistory = cleanHistory.slice(-8);

    const isFollowUp = cleanHistory.length > 0;
    const isComplex = message.includes('قارن') || message.includes('بينهم') || message.includes('الفرق بين');
    const systemInstruction = buildSystemInstruction(midhalKnowledge, isFollowUp);

    // Compact structured state injected into system instruction (Requirement 1 & 8)
    const stateInstruction = `
══════════════════════════════════════════════════
حالة وسياق المحادثة المعتمدة (Conversation State):
══════════════════════════════════════════════════
- القسم/الموضوع الحالي: ${conversationState.currentSection || 'عام'}
- المنتج الحالي: ${conversationState.currentProductName || 'غير محدد'} (معرّف المنتج: ${conversationState.currentProductId || 'غير محدد'})
- النوع: ${conversationState.currentType || 'غير محدد'}
- الوزن/الخيار المطلوب: ${conversationState.requestedWeight || 'غير محدد'}
- الاستخدام المذكور: ${conversationState.targetUsage || 'غير محدد'}
- الميزانية المحددة: ${conversationState.budget || 'غير محددة'}
- المنتجات المعروضة في آخر ترشيح: ${conversationState.recentProductNames.length > 0 ? conversationState.recentProductNames.join('، ') : 'لا توجد'}
- آخر نية مؤكدة للعميل: ${conversationState.lastIntent}
- أي طلب أو اختيار مؤكد: ${conversationState.confirmedChoice || 'غير محدد'}
- تذكير حاسم: لا تعرض منتجات خارج هذه الفئة ولا تعرض بطاقات من مواضيع قديمة انتهت.
`;
    const finalSystemInstruction = systemInstruction + stateInstruction;

    // Format contents array for Gemini with proper turn alternation and compact card references
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent conversation turns
    for (const item of recentHistory) {
      const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
      let textContent = item.content || '';

      // Compact card references (NO long descriptions, NO images, NO web links sent to LLM)
      if (role === 'model' && item.productCards && Array.isArray(item.productCards) && item.productCards.length > 0) {
        const compactCards = item.productCards
          .map((c: any) => `[معروض: id=${c.id || ''}, name=${c.name}, variant=${c.variant || ''}, price=${c.priceDisplay || c.price || ''}]`)
          .join('، ');
        textContent += `\n${compactCards}`;
      }

      // Maintain strict user <-> model turn alternation
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${textContent}`;
      } else {
        contents.push({
          role,
          parts: [{ text: textContent }],
        });
      }
    }

    // Add current user prompt
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${message}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const geminiResult = await generateGeminiReply(contents, finalSystemInstruction, isComplex);
    const { reply, suggestions, productCards } = parseReplyAndSuggestions(geminiResult.text, message, cleanHistory);
    const responseTimeMs = Date.now() - startTime;

    // Record agent request telemetry with real token metadata
    analytics.recordAgentRequest({
      model: geminiResult.modelUsed,
      promptTokens: geminiResult.promptTokens,
      candidateTokens: geminiResult.candidateTokens,
      totalTokens: geminiResult.totalTokens,
      userQuery: message,
      agentReply: reply,
      detectedTopic: conversationState.lastIntent,
      responseTimeMs,
      isDirectLookup: false,
    });

    if (productCards && productCards.length > 0) {
      analytics.recordProductImpressions(productCards.map((c) => c.name));
    }

    res.json({
      reply: reply || 'حيّاك الله في مدهال الطيب، سم كيف أقدر أخدمك اليوم في العود والطيب؟',
      suggestions: suggestions.slice(0, 3),
      productCards: productCards || [],
      analysis: {
        detectedIntent: conversationState.lastIntent,
        targetUsage: conversationState.targetUsage || 'غير محدد',
        productType: conversationState.currentSection || 'غير محدد',
        budgetMentioned: conversationState.budget,
        currentSubject: conversationState.currentProductName,
        confidenceNote: `قاعدة المنتجات المعتمدة مفعلة (${midhalKnowledge.products.length} منتج).`,
      },
      telemetry: {
        model: geminiResult.modelUsed,
        promptTokens: geminiResult.promptTokens,
        candidateTokens: geminiResult.candidateTokens,
        totalTokens: geminiResult.totalTokens,
        responseTimeMs,
        isDirectLookup: false,
      },
      conversationState,
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

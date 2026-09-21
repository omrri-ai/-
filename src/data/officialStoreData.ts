import { CatalogItem } from "../types.ts";

export interface PerfumeProfile {
  name: string;
  englishName: string;
  inspiredBy: string; // مستوحى من
  capacity: string; // "100 مل"
  character: string; // الطابع العام
  notes: string; // النوتات البارزة
  occasion: string; // الاستخدام المناسب
  price: number;
  inStock: boolean;
  productUrl?: string;
  imageUrl?: string;
}

/**
 * قاعدة أوصاف العطور المؤكدة ومرجعياتها
 * السعة الصحيحة لجميع العطور: 100 مل (ممنوع ذكر 75 مل)
 * الاستلهام العطري: مستوحى من / طابعه قريب من (بدون جزم بالمطابقة 100%)
 */
export const PERFUME_PROFILES: Record<string, PerfumeProfile> = {
  royal: {
    name: "عطر Royal",
    englishName: "Royal",
    inspiredBy: "Romford",
    capacity: "100 مل",
    character: "طابع ملكي دافئ وفخم وقوي الحضور",
    notes: "نفحات عنبرية خشبية فاخرة مع لمسات توابل دافئة راقية",
    occasion: "المناسبات الرسمية والشتوية واللقاءات الراقية",
    price: 75,
    inStock: false,
    productUrl: "https://medhaloud.com/معطر-royal/p398134387",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  luxury: {
    name: "عطر Luxury",
    englishName: "Luxury",
    inspiredBy: "Tobacco",
    capacity: "100 مل",
    character: "طابع شرقي دافئ وغني بالفخامة والعمق",
    notes: "مزيج التبغ الفاخر مع الفانيليا والأخشاب الدافئة واللمسات التابلية اللطيفة",
    occasion: "الأجواء الهادئة، المساء، وعشاق الطابع الدافئ المميز",
    price: 75,
    inStock: true,
    productUrl: "https://medhaloud.com/luxury/p1907815091",
    imageUrl: "https://cdn.salla.sa/mQbPb/7efe6894-cf1f-45b0-90e1-dfb6a58e9781-447.5x500-DkRLhRcVmx1xqH0wEhAJEZ1Iw7StdKeSDT4hyP2G.jpg",
  },
  arrogant: {
    name: "عطر Arrogant",
    englishName: "Arrogant",
    inspiredBy: "Memo",
    capacity: "100 مل",
    character: "طابع جلدي أرستقراطي فريد وفاخر",
    notes: "نفحات الجلود الفاخرة الممزوجة بتوابل عطرية وأخشاب شرقية أنيقة",
    occasion: "المناسبات الخاصة ولأصحاب الذوق الجريء والمميز",
    price: 75,
    inStock: true,
    productUrl: "https://medhaloud.com/arrogant/p530204648",
    imageUrl: "https://cdn.salla.sa/mQbPb/73bf98ff-a2f6-43d9-923e-1bdb3f6e6003-500x491.45833333333-6RbzODq7x8ZOpbfMGqUPPPXjscU5rufSjMKsjk9N.jpg",
  },
  attention: {
    name: "عطر Attention",
    englishName: "Attention",
    inspiredBy: "Dior",
    capacity: "100 مل",
    character: "طابع منعش أروماتك فخم وجذاب ومتوازن",
    notes: "نفحات حمضية منعشة ممتزجة مع لمسات خشبية أروماتيك وأمبروكسان راقٍ",
    occasion: "الاستخدام اليومي الراقي والمناسبات، عطر يلفت الانتباه بفوحانه المتزن",
    price: 75,
    inStock: true,
  },
  lord: {
    name: "عطر Lord",
    englishName: "Lord",
    inspiredBy: "Tuxedo",
    capacity: "100 مل",
    character: "طابع مسائي رسمي فخم ومخملي",
    notes: "الباتشولي الراقي مع لمسات الفلفل الأسود والورد والأخشاب الدخانية الدافئة",
    occasion: "السهرات الرسمية، البشت، والمناسبات الكبرى",
    price: 75,
    inStock: true,
  },
  rich: {
    name: "عطر Rich",
    englishName: "Rich",
    inspiredBy: "Nishane",
    capacity: "100 مل",
    character: "طابع فاكهي خشبي غني وثابت وشديد التميز",
    notes: "نفحات منعشة من البرغموت والأناناس مع أخشاب الأرز والباتشولي والطحالب العطرية",
    occasion: "المناسبات والعمل واليومي لمن يحب الفوحان والثبات العالي",
    price: 75,
    inStock: false,
  },
  marvel: {
    name: "عطر Marvel",
    englishName: "Marvel",
    inspiredBy: "Van Cleef",
    capacity: "100 مل",
    character: "طابع بودري دافئ وهادئ فخم ومريح للأعصاب",
    notes: "نفحات خشبية ناعمة، لمسات عنبرية دافئة، حبوب التونكا والمسك المخملي الهادئ",
    occasion: "الأجواء الراقية الهادئة والملابس الشخصية والأمسيات الخاصة",
    price: 75,
    inStock: true,
    productUrl: "https://medhaloud.com/marvel/p1456372259",
    imageUrl: "https://cdn.salla.sa/mQbPb/8717912f-77fc-475c-93e5-dbe642bfe6b5-444.16666666667x500-BtfXlVxObpKZ0iu8Lr4XTMpWzUFiBv88RN9b5n5n.jpg",
  },
  magic: {
    name: "عطر Magic",
    englishName: "Magic",
    inspiredBy: "Armani",
    capacity: "100 مل",
    character: "طابع شرقي جذاب وساحر وفخم",
    notes: "أخشاب راقية وعنبر دافئ مع لمسات زعفرانية أو زهرية متناغمة",
    occasion: "المناسبات والأمسيات الراقية",
    price: 75,
    inStock: false,
    productUrl: "https://medhaloud.com/magic/p505349671",
    imageUrl: "https://cdn.salla.sa/mQbPb/d1be7615-8b8e-4288-ada2-d98b00f871c2-500x447.30077120823-uKVsnwIyBbcnMVZqZCkRU6obUEXuOt5NUNnJmPsO.jpg",
  },
  elegant: {
    name: "عطر Elegant",
    englishName: "Elegant",
    inspiredBy: "Guerlain",
    capacity: "100 مل",
    character: "طابع شرقي راقٍ وهادئ ومتوازن في منتهى الأناقة",
    notes: "خشب الصندل الدافئ مع لمسات خشبية شرقية وبلسمية ناعمة تمنح شعوراً بالفخامة الهادئة",
    occasion: "الاستخدام الشخصي الراقي، الاجتماعات الهامة، واللقاءات الهادئة",
    price: 75,
    inStock: true,
  },
  velvet_rose: {
    name: "عطر Velvet Rose",
    englishName: "Velvet Rose",
    inspiredBy: "Guerlain Paris",
    capacity: "100 مل",
    character: "طابع زهري مخملي ناعم وهادئ وفخم",
    notes: "ورد مخملي راقٍ مع لمسات مسكية بودرية دافئة تبعث على الهدوء والسكينة والفخامة الناعمة",
    occasion: "الاستخدام اليومي الهادئ، الأمسيات الرايقة، ومحبي الروائح الوردية غير الحادة",
    price: 75,
    inStock: true,
    productUrl: "https://medhaloud.com/velvet-rose/p334507978",
    imageUrl: "https://cdn.salla.sa/mQbPb/ccd9e5ca-f31e-42d0-a5f4-f2ada0995670-471.08843537415x500-r7RQnYwkdblCjSupKAv2VkafK61IR3oLz8WiDjuj.jpg",
  },
  bella: {
    name: "عطر Bella",
    englishName: "Bella",
    inspiredBy: "Chanel",
    capacity: "100 مل",
    character: "طابع أنثوي كلاسيكي فخم ومنعش",
    notes: "أزهار منعشة مع لمسات حمضية مشرقة وباتشولي راقٍ يعطي فخامة عصرية متجددة",
    occasion: "الإهداء، الاستخدام اليومي الأنيق والمناسبات النهارية والمسائية",
    price: 75,
    inStock: true,
  },
  flora: {
    name: "عطر Flora",
    englishName: "Flora",
    inspiredBy: "Parfums de Marly Valaya",
    capacity: "100 مل",
    character: "طابع نقي وهادئ جداً وفخم ومريح",
    notes: "أزهار بيضاء نقية مع مسك ناعم قطني ولمسات مخملية خفيفة من الخوخ والبرتقال الهادئ",
    occasion: "محبي العطور الهادئة الفاخرة، والصباح، والملابس، والاسترخاء الراقي",
    price: 75,
    inStock: true,
  },
};

/**
 * الشنط الفارغة المؤكدة (4 ألوان ومقاساتها وأسعارها الرسمية)
 * الألوان: جملي، بيج، أخضر، أسود
 * المقاسات والأسعار: كيلو (35 ريال)، نصف كيلو (30 ريال)، ربع كيلو (25 ريال)، ثمن كيلو (20 ريال)
 * شنط فارغة تماماً بدون محتويات
 */
export const CONFIRMED_EMPTY_BAGS: CatalogItem[] = [
  {
    id: "bag_empty_collection",
    name: "شنطة جلدية فارغة لحفظ العود والطيب (بدون محتويات)",
    category: "الشنط والإكسسوارات",
    type: "شنط فارغة",
    displayedCardPrice: 20,
    overallAvailability: "متوفر",
    isEmptyBag: true,
    colors: ["جملي", "بيج", "أخضر", "أسود"],
    notes: "شنطة جلدية فاخرة فارغة تماماً بدون محتويات لحفظ الطيب والعود. الألوان: جملي، بيج، أخضر، أسود. المقاسات: ثمن كيلو (20 ريال)، ربع كيلو (25 ريال)، نصف كيلو (30 ريال)، كيلو (35 ريال). جميع الشنط جلدية.",
    imageUrl: "https://cdn.salla.sa/mQbPb/cuaDiiyUcB5vb0YanPYRDXH5dxEh3TJzMQYh6yBm.jpg",
    productUrl: "https://medhaloud.com/شنط-البخور/c1820942889",
    variants: [
      {
        variantName: "ثمن كيلو",
        displayedWeight: "ثمن كيلو (125 جم)",
        price: 20,
        priceDisplay: "20 ريال",
        inStock: true,
        notes: "شنطة جلدية فارغة تماماً بدون محتويات. الألوان: جملي، بيج، أخضر، أسود",
      },
      {
        variantName: "ربع كيلو",
        displayedWeight: "ربع كيلو (250 جم)",
        price: 25,
        priceDisplay: "25 ريال",
        inStock: true,
        notes: "فارغة تماماً بدون محتويات. الألوان: جملي، بيج، أخضر، أسود",
      },
      {
        variantName: "نصف كيلو",
        displayedWeight: "نصف كيلو (500 جم)",
        price: 30,
        priceDisplay: "30 ريال",
        inStock: true,
        notes: "فارغة تماماً بدون محتويات. الألوان: جملي، بيج، أخضر، أسود",
      },
      {
        variantName: "كيلو",
        displayedWeight: "كيلو كامل (1000 جم)",
        price: 35,
        priceDisplay: "35 ريال",
        inStock: true,
        notes: "فارغة تماماً بدون محتويات. الألوان: جملي، بيج، أخضر، أسود",
      },
    ],
  },
];

/**
 * قسم العروض الحالية المؤكدة بالموقع الرسمي لمدهال الطيب
 */
export const OFFICIAL_ACTIVE_OFFERS: CatalogItem[] = [
  {
    id: "offer_tiger_pkg",
    name: "بكج التايقر (ثمن كيلو عود كمبودي تايقر)",
    category: "العروض",
    type: "عروض خاصة / بكجات",
    displayedCardPrice: 150,
    overallAvailability: "متوفر",
    notes: "عرض خاص في قسم العروض، ثمن كيلو عود كمبودي تايقر محسن فاخر مع إمكانية التقسيط عبر تابي.",
    productUrl: "https://medhaloud.com/بكج-التايقر/p1037054180",
    imageUrl: "https://cdn.salla.sa/mQbPb/dcb6cbe4-c249-45c4-962e-e337ec547ff6-500x373.53515625-d03r3iB5ILK2I8l1QJA0ArjKmkfIoCMRBaJ0ViVn.jpg",
    variants: [
      {
        variantName: "ثمن كيلو",
        displayedWeight: "ثمن كيلو (125 جم)",
        price: 150,
        priceDisplay: "150 ريال",
        inStock: true,
        notes: "متاح في قسم العروض",
      },
    ],
  },
  {
    id: "offer_cambodian_deqqa",
    name: "عرض الدقة الكمبودية الفاخرة",
    category: "العروض",
    type: "عروض خاصة",
    displayedCardPrice: 149,
    overallAvailability: "متوفر",
    notes: "عرض دقة العود الكمبودي الطبيعي المحسن الفاخر من قسم العروض بالموقع الرسمي.",
    productUrl: "https://medhaloud.com/عرض-الدقة-الكمبودية/p234567457",
    imageUrl: "https://cdn.salla.sa/mQbPb/aa3189e3-770c-4f18-84db-9b2fea08e049-750x1000-N4HNVeL5cOW92xvlFp5WwnwoVbFJfJNJsPhe0zLL.jpg",
    variants: [
      {
        variantName: "عرض الدقة",
        displayedWeight: "أوقية / عرض خاص",
        price: 149,
        priceDisplay: "149 ريال",
        inStock: true,
        notes: "عرض حالي بالموقع",
      },
    ],
  },
  {
    id: "offer_sioufi_king",
    name: "بكج السيوفي الكنق الفاخر",
    category: "العروض",
    type: "عروض خاصة / بكجات",
    displayedCardPrice: 285,
    overallAvailability: "متوفر",
    notes: "عرض بكج السيوفي الكنق الفاخر الفيتنامي مع هدايا الطيب في قسم العروض.",
    productUrl: "https://medhaloud.com/بكج-السيوفي-الكنق/p2018823084",
    imageUrl: "https://cdn.salla.sa/mQbPb/7d029f45-c8db-4e6a-b0a7-b69620e334f6-1000x746.03174603175-ZqLWqbFyNH2M5AWG8XWflo98hDExR7Nb9cmZgum0.jpg",
    variants: [
      {
        variantName: "بكج السيوفي",
        displayedWeight: "أوقية فاخرة + هدايا",
        price: 285,
        priceDisplay: "285 ريال",
        inStock: true,
        notes: "متاح في قسم العروض",
      },
    ],
  },
];

/**
 * خريطة الروابط والصور الحقيقية المؤكدة لجميع منتجات المتجر الرسمي medhaloud.com
 */
export const VERIFIED_STORE_MEDIA: Record<string, { productUrl: string; imageUrl?: string }> = {
  "معطر هواء suave": {
    productUrl: "https://medhaloud.com/معطر-suave/p389026293",
    imageUrl: "https://cdn.salla.sa/mQbPb/FmRo6i7wy59TEOoTqyCuDVGUUze8usPL2WjmUVPV.jpg",
  },
  "دهن عود كمبودي كوه كينج": {
    productUrl: "https://medhaloud.com/دهن-عود-كمبودي-كوه-كنج/p947328974",
    imageUrl: "https://cdn.salla.sa/mQbPb/yTal3TZp4Uo1rI7Cn6kcLjaIlCKlX9t5NFTursMG.jpg",
  },
  "عود كمبودي كوه كينج": {
    productUrl: "https://medhaloud.com/دهن-عود-كمبودي-كوه-كنج/p947328974",
    imageUrl: "https://cdn.salla.sa/mQbPb/yTal3TZp4Uo1rI7Cn6kcLjaIlCKlX9t5NFTursMG.jpg",
  },
  "معطر عود للجو": {
    productUrl: "https://medhaloud.com/معطر-classy-oud/p596811894",
    imageUrl: "https://cdn.salla.sa/mQbPb/fOi6XBR3QygNV94By6UnzdaDh6A86bbvz2JaSvmQ.jpg",
  },
  "معمول فاخر بثبات عالى 100 جرام": {
    productUrl: "https://medhaloud.com/المعمول-الفاخر/p1131450015",
    imageUrl: "https://cdn.salla.sa/mQbPb/6f4a1215-6ac2-45d9-a83d-97be2ce6a8d9-375x500-vdB4Hseb3fTSS4c8WJBgbVRefXR9pVfahEt83nhR.jpg",
  },
  "عود تايقر كمبودي محسن": {
    productUrl: "https://medhaloud.com/عود-كمبودي-محسن-التايقر/p1585084528",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/56bb79aa-c4fa-42fc-b81f-b591676c3b83-original.webp",
  },
  "تايقر كمبودي محسن": {
    productUrl: "https://medhaloud.com/عود-كمبودي-محسن-التايقر/p1585084528",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/56bb79aa-c4fa-42fc-b81f-b591676c3b83-original.webp",
  },
  "متجر عود وبخور - مدهال الطيب": {
    productUrl: "https://medhaloud.com/عود-الموروكي-الكنق/p1678603097",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "دهن عود فيتنامي": {
    productUrl: "https://medhaloud.com/دهن-عود-فيتنامي-قوانق-ناي/p362965624",
    imageUrl: "https://cdn.salla.sa/mQbPb/hPnboCehqq1UbSvTdETE1LErZCFp6K3FpKJ7hPse.jpg",
  },
  "عود فيتنامي": {
    productUrl: "https://medhaloud.com/دهن-عود-فيتنامي-قوانق-ناي/p362965624",
    imageUrl: "https://cdn.salla.sa/mQbPb/hPnboCehqq1UbSvTdETE1LErZCFp6K3FpKJ7hPse.jpg",
  },
  "مسك الختام": {
    productUrl: "https://medhaloud.com/مسك-الختام/p967971943",
    imageUrl: "https://cdn.salla.sa/mQbPb/yaCAP8ma5vOiXWig8yczCCL0FRK8NAHhmn09GDwQ.jpg",
  },
  "الختام": {
    productUrl: "https://medhaloud.com/مسك-الختام/p967971943",
    imageUrl: "https://cdn.salla.sa/mQbPb/yaCAP8ma5vOiXWig8yczCCL0FRK8NAHhmn09GDwQ.jpg",
  },
  "عود دقة موروكي اصقون سوبر و مرتفع": {
    productUrl: "https://medhaloud.com/عود-دقة-موروكي-اصقون-سوبرمرتفع/p1241117394",
    imageUrl: "https://cdn.salla.sa/mQbPb/dc344dcf-50ca-4fa5-9dc9-ce45b173e69a-436.328125x500-RZAF3EPXqIGbYPKZISZ3oMId8aurSpcOdYbgaY4Z.jpg",
  },
  "دقة موروكي اصقون سوبر و مرتفع": {
    productUrl: "https://medhaloud.com/عود-دقة-موروكي-اصقون-سوبرمرتفع/p1241117394",
    imageUrl: "https://cdn.salla.sa/mQbPb/dc344dcf-50ca-4fa5-9dc9-ce45b173e69a-436.328125x500-RZAF3EPXqIGbYPKZISZ3oMId8aurSpcOdYbgaY4Z.jpg",
  },
  "مسك الرمان بجودة عالية وثبات لفترة طويلة": {
    productUrl: "https://medhaloud.com/مسك-الرمان/p719564413",
    imageUrl: "https://cdn.salla.sa/mQbPb/Wl6hus3Ix6rigAwLfWwgZXy9F7S5n2bjnMjRg8Nc.jpg",
  },
  "الرمان بجودة عالية وثبات لفترة طويلة": {
    productUrl: "https://medhaloud.com/مسك-الرمان/p719564413",
    imageUrl: "https://cdn.salla.sa/mQbPb/Wl6hus3Ix6rigAwLfWwgZXy9F7S5n2bjnMjRg8Nc.jpg",
  },
  "مسك البودر برائحة ناعمة ومميزة": {
    productUrl: "https://medhaloud.com/مسك-البودر/p728881147",
    imageUrl: "https://cdn.salla.sa/mQbPb/lu2GuUfhGAgtqjo64rRen6dDSeTZEyFmZJ8lpGXP.jpg",
  },
  "البودر برائحة ناعمة ومميزة": {
    productUrl: "https://medhaloud.com/مسك-البودر/p728881147",
    imageUrl: "https://cdn.salla.sa/mQbPb/lu2GuUfhGAgtqjo64rRen6dDSeTZEyFmZJ8lpGXP.jpg",
  },
  "مسك العروس برائحة جذابة لاتقاوم": {
    productUrl: "https://medhaloud.com/مسك-العروس/p1756683533",
    imageUrl: "https://cdn.salla.sa/mQbPb/fbpCa3kMemLXLDzR1LKKXUKeCXwSDmKLiTuY4Qs1.jpg",
  },
  "العروس برائحة جذابة لاتقاوم": {
    productUrl: "https://medhaloud.com/مسك-العروس/p1756683533",
    imageUrl: "https://cdn.salla.sa/mQbPb/fbpCa3kMemLXLDzR1LKKXUKeCXwSDmKLiTuY4Qs1.jpg",
  },
  "مسك الافندر برائحته الجذابة": {
    productUrl: "https://medhaloud.com/مسك-اللافندر/p1264752228",
    imageUrl: "https://cdn.salla.sa/mQbPb/VVQfhBCPRAnBFWkE7oUOFP4GIzkQhSqu2pJyd5Pf.jpg",
  },
  "الافندر برائحته الجذابة": {
    productUrl: "https://medhaloud.com/مسك-اللافندر/p1264752228",
    imageUrl: "https://cdn.salla.sa/mQbPb/VVQfhBCPRAnBFWkE7oUOFP4GIzkQhSqu2pJyd5Pf.jpg",
  },
  "مسك التفاح الاخضر": {
    productUrl: "https://medhaloud.com/مسك-التفاح-الاخضر/p251357951",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "دهن عود تراد الفاخر | يتميز برائحته الغنية والمميزة": {
    productUrl: "https://medhaloud.com/دهن-عود-تراد-سويتي/p1701246754",
    imageUrl: "https://cdn.salla.sa/mQbPb/SGaYAh9IHgeCBjoiK11I3SZsTpmQVQi7E2Mu6eed.jpg",
  },
  "عود تراد الفاخر | يتميز برائحته الغنية والمميزة": {
    productUrl: "https://medhaloud.com/دهن-عود-تراد-سويتي/p1701246754",
    imageUrl: "https://cdn.salla.sa/mQbPb/SGaYAh9IHgeCBjoiK11I3SZsTpmQVQi7E2Mu6eed.jpg",
  },
  "دهن البراشين البخوري": {
    productUrl: "https://medhaloud.com/دهن-البراشين-البخوري/p1914218039",
    imageUrl: "https://cdn.salla.sa/mQbPb/wATnHIUVW9U0bubfsBZlf9JQrtQZoI6w1kZhaFoE.jpg",
  },
  "البراشين البخوري": {
    productUrl: "https://medhaloud.com/دهن-البراشين-البخوري/p1914218039",
    imageUrl: "https://cdn.salla.sa/mQbPb/wATnHIUVW9U0bubfsBZlf9JQrtQZoI6w1kZhaFoE.jpg",
  },
  "ARROGANT": {
    productUrl: "https://medhaloud.com/arrogant/p530204648",
    imageUrl: "https://cdn.salla.sa/mQbPb/73bf98ff-a2f6-43d9-923e-1bdb3f6e6003-500x491.45833333333-6RbzODq7x8ZOpbfMGqUPPPXjscU5rufSjMKsjk9N.jpg",
  },
  "MARVEL": {
    productUrl: "https://medhaloud.com/marvel/p1456372259",
    imageUrl: "https://cdn.salla.sa/mQbPb/8717912f-77fc-475c-93e5-dbe642bfe6b5-444.16666666667x500-BtfXlVxObpKZ0iu8Lr4XTMpWzUFiBv88RN9b5n5n.jpg",
  },
  "عود موري هندي نجلاند سوبر ومرتفع": {
    productUrl: "https://medhaloud.com/عود-موري-هندي-نجلاند-سوبر-ومرتفع/p1115139655",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/36dc8f5e-0871-4b12-b215-ce7ab2099c47-original.webp",
  },
  "موري هندي نجلاند سوبر ومرتفع": {
    productUrl: "https://medhaloud.com/عود-موري-هندي-نجلاند-سوبر-ومرتفع/p1115139655",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/36dc8f5e-0871-4b12-b215-ce7ab2099c47-original.webp",
  },
  "عود ميني موروكي حي سوبر واعلى": {
    productUrl: "https://medhaloud.com/عود-دقة-موروكي-حي-سوبر-واعلى/p2034332702",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/c90c67f8-f41a-491a-9f95-b5db0d21fd8e-original.webp",
  },
  "ميني موروكي حي سوبر واعلى": {
    productUrl: "https://medhaloud.com/عود-دقة-موروكي-حي-سوبر-واعلى/p2034332702",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/c90c67f8-f41a-491a-9f95-b5db0d21fd8e-original.webp",
  },
  "رقائق العود الفيتنامي": {
    productUrl: "https://medhaloud.com/رقائق-العود-الفيتنامي-aaa/p1862393179",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "دهن تراد": {
    productUrl: "https://medhaloud.com/دهن-تراد-غابات/p739689668",
    imageUrl: "https://cdn.salla.sa/mQbPb/n0OHouMo9oyCw1SSIWprwLInLqqpdXVwZ33jvszL.jpg",
  },
  "تراد": {
    productUrl: "https://medhaloud.com/دهن-تراد-غابات/p739689668",
    imageUrl: "https://cdn.salla.sa/mQbPb/n0OHouMo9oyCw1SSIWprwLInLqqpdXVwZ33jvszL.jpg",
  },
  "زوايا فيتنامي المحسن خشب عود طبيعي": {
    productUrl: "https://medhaloud.com/زوايا-الفيتنامي-المحسن/p287949597",
    imageUrl: "https://cdn.salla.sa/mQbPb/Rk9yTvv2RSCfWUMKLhOYBGDA2HSZtpETBgX4KG6P.jpg",
  },
  "مسك الزعفران برائحة جذابة": {
    productUrl: "https://medhaloud.com/مسك-الزعفران/p2024220881",
    imageUrl: "https://cdn.salla.sa/mQbPb/rJ4sfG5QZ4pLHD8WKWDdbKrEw3TR2gHQw8sWJMA1.jpg",
  },
  "الزعفران برائحة جذابة": {
    productUrl: "https://medhaloud.com/مسك-الزعفران/p2024220881",
    imageUrl: "https://cdn.salla.sa/mQbPb/rJ4sfG5QZ4pLHD8WKWDdbKrEw3TR2gHQw8sWJMA1.jpg",
  },
  "مسك الهيل مناسب للجنسين": {
    productUrl: "https://medhaloud.com/مسك-الهيل/p1846889748",
    imageUrl: "https://cdn.salla.sa/mQbPb/Wgu2FvfpLDMXsK1AwQcihKApuWp4XkC0mJ5iIgHn.jpg",
  },
  "الهيل مناسب للجنسين": {
    productUrl: "https://medhaloud.com/مسك-الهيل/p1846889748",
    imageUrl: "https://cdn.salla.sa/mQbPb/Wgu2FvfpLDMXsK1AwQcihKApuWp4XkC0mJ5iIgHn.jpg",
  },
  "عطر LUXURY": {
    productUrl: "https://medhaloud.com/luxury/p1907815091",
    imageUrl: "https://cdn.salla.sa/mQbPb/7efe6894-cf1f-45b0-90e1-dfb6a58e9781-447.5x500-DkRLhRcVmx1xqH0wEhAJEZ1Iw7StdKeSDT4hyP2G.jpg",
  },
  "عطر MAGIC": {
    productUrl: "https://medhaloud.com/magic/p505349671",
    imageUrl: "https://cdn.salla.sa/mQbPb/d1be7615-8b8e-4288-ada2-d98b00f871c2-500x447.30077120823-uKVsnwIyBbcnMVZqZCkRU6obUEXuOt5NUNnJmPsO.jpg",
  },
  "ورد كيشاني": {
    productUrl: "https://medhaloud.com/دهن-ورد-كشميري/p951379814",
    imageUrl: "https://cdn.salla.sa/mQbPb/rfNz1BIgqWNnUeW9Es0AYFado7GbGVBWyRekiccD.jpg",
  },
  "دهن عود هندي قديم": {
    productUrl: "https://medhaloud.com/دهن-عود-هندي-قديم/p1430164122",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "عود السيوفي": {
    productUrl: "https://medhaloud.com/عود-السيوفي-الكنج-فاخر-فيتنامي/p254398331",
    imageUrl: "https://cdn.salla.sa/mQbPb/1e0f03cc-0ba4-409d-af40-69ead67e4784-500x500-p0PIqj1lOSftuaskxmCy7p55V1pKsaYy7UmYuGQC.png",
  },
  "السيوفي": {
    productUrl: "https://medhaloud.com/عود-السيوفي-الكنج-فاخر-فيتنامي/p254398331",
    imageUrl: "https://cdn.salla.sa/mQbPb/1e0f03cc-0ba4-409d-af40-69ead67e4784-500x500-p0PIqj1lOSftuaskxmCy7p55V1pKsaYy7UmYuGQC.png",
  },
  "دقة العود الكمبودي": {
    productUrl: "https://medhaloud.com/دقة-العود-الكمبودي/p727791299",
    imageUrl: "https://cdn.salla.sa/mQbPb/BoSqdt50ViJCFc0Cm4UcCmn03XCZm9jOTuWg9944.jpg",
  },
  "عود كمبودي مستزرع": {
    productUrl: "https://medhaloud.com/عود-كمبودي-مستزرع/p1405903166",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "دهن عود مروكي اخضر": {
    productUrl: "https://medhaloud.com/دهن-عود-الموروكي-الاخضر/p1248584386",
    imageUrl: "https://cdn.salla.sa/mQbPb/xLAC7iTlchDDDbPqpZfunjf1TiVyJfRaSdofGwzh.jpg",
  },
  "عود مروكي اخضر": {
    productUrl: "https://medhaloud.com/دهن-عود-الموروكي-الاخضر/p1248584386",
    imageUrl: "https://cdn.salla.sa/mQbPb/xLAC7iTlchDDDbPqpZfunjf1TiVyJfRaSdofGwzh.jpg",
  },
  "عود الفراشه الكمبودي خشب طبيعي": {
    productUrl: "https://medhaloud.com/عود-الفراشة-الكمبودية/p424071684",
    imageUrl: "https://cdn.salla.sa/mQbPb/siXHw6PwB7rHDKShHJWYB8cTc0r1ytSzpbAwY1Xj.jpg",
  },
  "الفراشه الكمبودي خشب طبيعي": {
    productUrl: "https://medhaloud.com/عود-الفراشة-الكمبودية/p424071684",
    imageUrl: "https://cdn.salla.sa/mQbPb/siXHw6PwB7rHDKShHJWYB8cTc0r1ytSzpbAwY1Xj.jpg",
  },
  "دهن عود كمبودي": {
    productUrl: "https://medhaloud.com/دهن-عود-لخلطة-الكمبودية/p1086037293",
    imageUrl: "https://cdn.salla.sa/mQbPb/fIdHtT4L1CpaWZta7xGWoZgot040Vp6y0QZS3KBF.jpg",
  },
  "عود كمبودي": {
    productUrl: "https://medhaloud.com/دهن-عود-لخلطة-الكمبودية/p1086037293",
    imageUrl: "https://cdn.salla.sa/mQbPb/fIdHtT4L1CpaWZta7xGWoZgot040Vp6y0QZS3KBF.jpg",
  },
  "تسوق العينات المميزة من عود فيتنامي محسن": {
    productUrl: "https://medhaloud.com/عينات-العود-الفيتنامي-المحسن/p1792152142",
    imageUrl: "https://cdn.salla.sa/mQbPb/yDSQGBS4aSKK4iNGjkdi938dC8D26UvrlpEEJo3H.jpg",
  },
  "عطر لامور": {
    productUrl: "https://medhaloud.com/l-amour/p1670304670",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "Velvet rose": {
    productUrl: "https://medhaloud.com/velvet-rose/p334507978",
    imageUrl: "https://cdn.salla.sa/mQbPb/ccd9e5ca-f31e-42d0-a5f4-f2ada0995670-471.08843537415x500-r7RQnYwkdblCjSupKAv2VkafK61IR3oLz8WiDjuj.jpg",
  },
  "مبخرة حائلية نجدية": {
    productUrl: "https://medhaloud.com/مبخرة-حائلية-نجدية/p1018399367",
    imageUrl: "https://cdn.salla.sa/mQbPb/MNrBY4SxZkDqXA33xWuGEIwJdb9V3PuybRw8FBws.jpg",
  },
  "مباخر حائلية ملكية": {
    productUrl: "https://medhaloud.com/مبخرة-حائلية-ملكية/p1119231994",
    imageUrl: "https://cdn.salla.sa/mQbPb/35QsNC9HgnzJrsh4BNxoTa9MhpC0VHXdiXqA1wDQ.jpg",
  },
  "مبخرة حائلية صاج": {
    productUrl: "https://medhaloud.com/مبخرة-حائلية-صاج/p1049371474",
    imageUrl: "https://cdn.salla.sa/mQbPb/38d19203-49b1-4aaf-83dc-40a9bbe2aa6a-500x326.70454545455-6Hm5ZHEzeadzIBRv1gkijts6H0eBMfjXtgpdzKf3.jpg",
  },
  "طقم مبخرة خشبية": {
    productUrl: "https://medhaloud.com/طقم-مبخرة-خشبية/p1708872949",
    imageUrl: "https://cdn.salla.sa/mQbPb/M395br9665SI3WnYzngQHo4nHySRTyvPGTmTGpNU.jpg",
  },
  "خلطة نوادر بأكثر من 16 نوع دهن العود البيور الصافيه": {
    productUrl: "https://medhaloud.com/خلطة-نوادر/p975828586",
    imageUrl: "https://cdn.salla.sa/mQbPb/WfAPay635nx5MFtn6w9D4gDW1bUU2bIyG9YpxiM9.jpg",
  },
  "مبخرة ملكية حائلية رشم نحاس": {
    productUrl: "https://medhaloud.com/مبخرة-ملكية-حائلية-رشم-نحاس/p1010683624",
    imageUrl: "https://cdn.salla.sa/mQbPb/fa0136c6-4539-4be1-a7bd-c8712819a25a-375x500-qpRGW6BoIsbW70H91AMLi62LLUZhl6P5XUXNiRIM.jpg",
  },
  "مبخرة حائلية صاج مرايه": {
    productUrl: "https://medhaloud.com/مبخرة-حائلية-صاج-مرايه/p1715930051",
    imageUrl: "https://cdn.salla.sa/mQbPb/8VGKYXcxCEHPoJyRkpnoF8k8eo5U7IaPc90atSFp.jpg",
  },
  "عود كلمنتان المالينو": {
    productUrl: "https://medhaloud.com/عود-كلمنتان-المالينو/p1280046522",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "مخلط توق": {
    productUrl: "https://medhaloud.com/مخلط-توق/p2127589895",
    imageUrl: "https://cdn.salla.sa/mQbPb/Nb0W4PVB0aYlRduVlXhkch4XlWVSwBBpmLr74k12.jpg",
  },
  "عرض التايقر": {
    productUrl: "https://medhaloud.com/بكج-التايقر/p1037054180",
    imageUrl: "https://cdn.salla.sa/mQbPb/dcb6cbe4-c249-45c4-962e-e337ec547ff6-500x373.53515625-d03r3iB5ILK2I8l1QJA0ArjKmkfIoCMRBaJ0ViVn.jpg",
  },
  "عود زورا منيبور دبل سوبر": {
    productUrl: "https://medhaloud.com/عود-زورا-منيبور-دبل-سوبر/p105257226",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "عود موري منيبور دبل سوبر": {
    productUrl: "https://medhaloud.com/عود-موري-منيبور-دبل-سوبر/p1495971556",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "عود مروكي محسن ميني": {
    productUrl: "https://medhaloud.com/عود-موروكي-ميني-محسن/p985954782",
    imageUrl: "https://cdn.salla.sa/mQbPb/gNiXn4Z09LTInvXj0P0MAmEYgxomRVjC1weqZTm2.jpg",
  },
  "مروكي محسن ميني": {
    productUrl: "https://medhaloud.com/عود-موروكي-ميني-محسن/p985954782",
    imageUrl: "https://cdn.salla.sa/mQbPb/gNiXn4Z09LTInvXj0P0MAmEYgxomRVjC1weqZTm2.jpg",
  },
  "عود سيوفي دبل وتربل سوبر": {
    productUrl: "https://medhaloud.com/عود-سيوفي-دبل-وتربل-سوبر/p1404010538",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/5b254c2e-91c8-479d-a419-ebef6d357f12-original.webp",
  },
  "سيوفي دبل وتربل سوبر": {
    productUrl: "https://medhaloud.com/عود-سيوفي-دبل-وتربل-سوبر/p1404010538",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/5b254c2e-91c8-479d-a419-ebef6d357f12-original.webp",
  },
  "سيلاني ادمز سوبر مرتفع ودبل": {
    productUrl: "https://medhaloud.com/سيلاني-ادمز-سوبر-مرتفع-ودبل/p326336978",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "مروكي حي كسر مباخر دبل سوبر": {
    productUrl: "https://medhaloud.com/مروكي-حي-كسر-مباخر-دبل-سوبر/p939396419",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "عود موروكي اصقون مباخر وميني دبل": {
    productUrl: "https://medhaloud.com/عود-ميني-موروكي-اصقون-مرتفع-و-دبل/p661478053",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/e97b7191-3c46-4776-8705-bde492e8b436-original.webp",
  },
  "موروكي اصقون مباخر وميني دبل": {
    productUrl: "https://medhaloud.com/عود-ميني-موروكي-اصقون-مرتفع-و-دبل/p661478053",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/e97b7191-3c46-4776-8705-bde492e8b436-original.webp",
  },
  "معطر رويال": {
    productUrl: "https://medhaloud.com/معطر-royal/p398134387",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "عود موروكي اصقون سوبر عالي كسر مباخر": {
    productUrl: "https://medhaloud.com/عود-موروكي-اصقون-سوبر-عالي-كسر-مباخر/p368603316",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/87ac74ae-f770-4f0e-a53a-85f25fd21131-original.webp",
  },
  "موروكي اصقون سوبر عالي كسر مباخر": {
    productUrl: "https://medhaloud.com/عود-موروكي-اصقون-سوبر-عالي-كسر-مباخر/p368603316",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/87ac74ae-f770-4f0e-a53a-85f25fd21131-original.webp",
  },
  "عود زورا هندي نجلاند سوبر مرتفع ودبل": {
    productUrl: "https://medhaloud.com/عود-زورا-هندي-نجلاند-سوبر-مرتفع-ودبل/p2065966538",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/7deb3373-2c1c-4757-acb0-4eb59a005852-original.webp",
  },
  "زورا هندي نجلاند سوبر مرتفع ودبل": {
    productUrl: "https://medhaloud.com/عود-زورا-هندي-نجلاند-سوبر-مرتفع-ودبل/p2065966538",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/7deb3373-2c1c-4757-acb0-4eb59a005852-original.webp",
  },
  "دهن عود هندي": {
    productUrl: "https://medhaloud.com/دهن-عود-هندي-اسام/p1891745216",
    imageUrl: "https://cdn.salla.sa/mQbPb/swqMTwrgU9vpWecmJZXiSgrAkQSsLcMcUlqFc0rW.jpg",
  },
  "عود هندي": {
    productUrl: "https://medhaloud.com/دهن-عود-هندي-اسام/p1891745216",
    imageUrl: "https://cdn.salla.sa/mQbPb/swqMTwrgU9vpWecmJZXiSgrAkQSsLcMcUlqFc0rW.jpg",
  },
  "عود مسقى": {
    productUrl: "https://medhaloud.com/عود-مسقى/p1471932077",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "المبثوث الخاص": {
    productUrl: "https://medhaloud.com/المبثوث-الخاص/p815417795",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "دهن تراد كمبودي": {
    productUrl: "https://medhaloud.com/دهن-تراد-كمبودي/p376071099",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "زوايا فيتنامي دبل وتربل": {
    productUrl: "https://medhaloud.com/زوايا-فيتنامي-دبل-وتربل/p54828734",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "ربع تولة راس ذهبي ميل زجاجي": {
    productUrl: "https://medhaloud.com/ربع-توله-راس-ذهبي-ميل-زجاجي/p1562723544",
    imageUrl: "https://cdn.salla.sa/mQbPb/4f75c3e5-8719-44b4-890b-ab2263f6690c-500x428.125-fg88eh9k2wbCBZJ6l02akRugLyOwabwYWP3ZAiL8.jpg",
  },
  "طقم مبخرة خشبية حائلية": {
    productUrl: "https://medhaloud.com/طقم-مبخرة-حائلية-خشبي/p1620193247",
    imageUrl: "https://cdn.salla.sa/mQbPb/ab25c8ae-d95e-4cc1-9a44-f8843e216443-374.89539748954x500-2rX72YOy9ZByae8Ymyz9OVgI91l83q3OzkrLldxa.jpg",
  },
  "مبخرة حائلية ملكية مع صندوق": {
    productUrl: "https://medhaloud.com/مبخرة-حائلية-ملكية-مع-صندوق/p1121918238",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "لبان حوجري عماني درجة أولى": {
    productUrl: "https://medhaloud.com/لبان-حوجري-درجة-أولى/p1076466188",
    imageUrl: "https://cdn.salla.sa/mQbPb/uAhRmPvqbyueWmNd2wJZ314sD8YfhDFzZmCLbLI3.jpg",
  },
  "جار فيتنامي دبل وتربل سوبر": {
    productUrl: "https://medhaloud.com/جار-فيتنامي-دبل-وتربل-سوبر/p643690583",
    imageUrl: "https://cdn.files.salla.network/products/1962283619/4157eaca-8025-4f40-9eb9-a00069f046a4-original.webp",
  },
  "سيوفي دبل وتربل": {
    productUrl: "https://medhaloud.com/سيوفي-دبل-وتربل/p231649673",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "عود كمبودي تايقر": {
    productUrl: "https://medhaloud.com/عود-كمبودي-محسن-التايقر/p1585084528",
    imageUrl: "https://cdn.salla.sa/mQbPb/RxMqEnSgEO1QrYoXfV3hSyOaqP6hYcFbZlQZ9EEg.jpg",
  },
  "عود موروكي محسن": {
    productUrl: "https://medhaloud.com/عود-الموروكي-الكنق/p1678603097",
    imageUrl: "https://cdn.salla.sa/mQbPb/hh7Hun6126WaNdn3aDqlRoodSRaghRp6GRkLXEE3.jpg",
  },
  "موروكي محسن": {
    productUrl: "https://medhaloud.com/عود-الموروكي-الكنق/p1678603097",
    imageUrl: "https://cdn.salla.sa/mQbPb/hh7Hun6126WaNdn3aDqlRoodSRaghRp6GRkLXEE3.jpg",
  },
  "عطر Luxury": {
    productUrl: "https://medhaloud.com/luxury/p1907815091",
    imageUrl: "https://cdn.salla.sa/mQbPb/7efe6894-cf1f-45b0-90e1-dfb6a58e9781-447.5x500-DkRLhRcVmx1xqH0wEhAJEZ1Iw7StdKeSDT4hyP2G.jpg",
  },
  "عطر Arrogant": {
    productUrl: "https://medhaloud.com/arrogant/p530204648",
    imageUrl: "https://cdn.salla.sa/mQbPb/73bf98ff-a2f6-43d9-923e-1bdb3f6e6003-500x491.45833333333-6RbzODq7x8ZOpbfMGqUPPPXjscU5rufSjMKsjk9N.jpg",
  },
  "عطر Marvel": {
    productUrl: "https://medhaloud.com/marvel/p1456372259",
    imageUrl: "https://cdn.salla.sa/mQbPb/8717912f-77fc-475c-93e5-dbe642bfe6b5-444.16666666667x500-BtfXlVxObpKZ0iu8Lr4XTMpWzUFiBv88RN9b5n5n.jpg",
  },
  "عطر Magic": {
    productUrl: "https://medhaloud.com/magic/p505349671",
    imageUrl: "https://cdn.salla.sa/mQbPb/d1be7615-8b8e-4288-ada2-d98b00f871c2-500x447.30077120823-uKVsnwIyBbcnMVZqZCkRU6obUEXuOt5NUNnJmPsO.jpg",
  },
  "عطر Velvet Rose": {
    productUrl: "https://medhaloud.com/velvet-rose/p334507978",
    imageUrl: "https://cdn.salla.sa/mQbPb/ccd9e5ca-f31e-42d0-a5f4-f2ada0995670-471.08843537415x500-r7RQnYwkdblCjSupKAv2VkafK61IR3oLz8WiDjuj.jpg",
  },
  "عطر Royal": {
    productUrl: "https://medhaloud.com/معطر-royal/p398134387",
    imageUrl: "https://cdn.salla.sa/mQbPb/6YJB02T3JC7k13bDushOWTlQmzdkKXQX93DQBAoE.png",
  },
  "بكج التايقر": {
    productUrl: "https://medhaloud.com/بكج-التايقر/p1037054180",
    imageUrl: "https://cdn.salla.sa/mQbPb/dcb6cbe4-c249-45c4-962e-e337ec547ff6-500x373.53515625-d03r3iB5ILK2I8l1QJA0ArjKmkfIoCMRBaJ0ViVn.jpg",
  },
  "عرض الدقة الكمبودية": {
    productUrl: "https://medhaloud.com/عرض-الدقة-الكمبودية/p234567457",
    imageUrl: "https://cdn.salla.sa/mQbPb/aa3189e3-770c-4f18-84db-9b2fea08e049-750x1000-N4HNVeL5cOW92xvlFp5WwnwoVbFJfJNJsPhe0zLL.jpg",
  },
  "بكج السيوفي الكنق": {
    productUrl: "https://medhaloud.com/بكج-السيوفي-الكنق/p2018823084",
    imageUrl: "https://cdn.salla.sa/mQbPb/7d029f45-c8db-4e6a-b0a7-b69620e334f6-1000x746.03174603175-ZqLWqbFyNH2M5AWG8XWflo98hDExR7Nb9cmZgum0.jpg",
  },
};

/**
 * دالة مساعدة لجلب الوسائط الموثقة لأي منتج
 * ملاحظة هامة: لا تُرجع إطلاقاً رابط الصفحة الرئيسية https://medhaloud.com/ كبديل إذا لم يتوفر رابط المنتج الفعلي.
 */
export function getVerifiedMediaForProduct(name: string): { productUrl?: string; imageUrl?: string } {
  if (!name) return {};
  const cleanName = name.trim().toLowerCase();
  
  for (const [key, val] of Object.entries(VERIFIED_STORE_MEDIA)) {
    const k = key.toLowerCase();
    if (k === cleanName || cleanName.includes(k) || k.includes(cleanName)) {
      return val;
    }
  }

  // عدم اختراع روابط وعدم وضع رابط الموقع العام كرابط بديل
  return {};
}

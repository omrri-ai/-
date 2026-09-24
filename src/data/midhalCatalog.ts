import { CatalogItem } from '../types.ts';
import {
  CONFIRMED_EMPTY_BAGS,
  OFFICIAL_ACTIVE_OFFERS,
  PERFUME_PROFILES,
  VERIFIED_STORE_MEDIA,
} from './officialStoreData.ts';
import { resolveStoreDestination } from './storeSiteMap.ts';

/**
 * بيانات متجر مدهال الطيب الرسمية
 * المرجع الأساسي: ملف مدهال-الطيب-البيانات-الكاملة.pdf (33 صفحة)
 * تاريخ الاستخراج: 16 سبتمبر 2026
 * العملة: ريال سعودي (SAR)
 * 
 * القواعد الصارمة المطبقة:
 * 1. كل وزن أو خيار سعري هو سجل مستقل.
 * 2. الحالات التي بلا سعر تظل بدقة "غير ظاهر" و price: null دون أي تخمين أو تقدير حسابي.
 * 3. الحالات النافدة تظل بدقة "نفدت الكمية" أو "مخلص حالياً" مع inStock: false.
 * 4. الأوقية = 28 جم، الثمن = 125 جم، الربع = 250 جم، النصف = 500 جم، الكيلو = 1000 جم، التولة = 12 جم، ربع تولة = 3 جم، نصف تولة = 6 جم.
 */

const RAW_MIDHAL_CATALOG: CatalogItem[] = [
  // ═══════════════════════════════════════════════════════════════════
  // أولاً: العود الطبيعي (15 منتجاً مع الملحق التفصيلي لجميع الأوزان)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'nat_1',
    name: 'دقة موروكي اصقون دبل سوبر 200',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 200,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'التولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 200, priceDisplay: '200 ريال', inStock: true },
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 400, priceDisplay: '400 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 1750, priceDisplay: '1750 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 3500, priceDisplay: '3500 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 7000, priceDisplay: '7000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 14000, priceDisplay: '14000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_2',
    name: 'دقة موروكي اصقون فصفص 135',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 135,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 135, priceDisplay: '135 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 500, priceDisplay: '500 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 1000, priceDisplay: '1000 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 2000, priceDisplay: '2000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 4000, priceDisplay: '4000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_3',
    name: 'كلمنتان مالينو دبل وتربل واندر ووتر 500',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 500,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 500, priceDisplay: '500 ريال', inStock: true },
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 1000, priceDisplay: '1000 ريال', inStock: true },
      { variantName: 'ثمن كيلو', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 3750, priceDisplay: '3750 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 7500, priceDisplay: '7500 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 15000, priceDisplay: '15000 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 30000, priceDisplay: '30000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_4',
    name: 'مروكي اصقون ميني شيب سوبر مرتفع 190',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 190,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 190, priceDisplay: '190 ريال', inStock: true },
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 385, priceDisplay: '385 ريال', inStock: true },
      { variantName: 'ثمن كيلو', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 1700, priceDisplay: '1700 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 3375, priceDisplay: '3375 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 6750, priceDisplay: '6750 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 13500, priceDisplay: '13500 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_5',
    name: 'كلمنتان مالينو سوبر مرتفع 285',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 285,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '٠٫١٢ كجم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٠٫٢٨ كجم', price: 285, priceDisplay: '285 ريال', inStock: true },
      { variantName: 'ثمن', weightGrams: 125, displayedWeight: '٠٫١٢٥ كجم', price: 1250, priceDisplay: '1250 ريال', inStock: true },
      { variantName: 'ربع', weightGrams: 250, displayedWeight: '—', price: 2500, priceDisplay: '2500 ريال', inStock: true },
      { variantName: 'نصف', weightGrams: 500, displayedWeight: '—', price: 5000, priceDisplay: '5000 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '—', price: 10000, priceDisplay: '10000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_6',
    name: 'موري هندي نجلاند دبل سوير 150',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 150,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '٠٫١٢ كجم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: '50 غرام', weightGrams: 50, displayedWeight: '—', price: 300, priceDisplay: '300 ريال', inStock: true },
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٠٫٢٨ كجم', price: 300, priceDisplay: '300 ريال', inStock: true },
      { variantName: '100 غرام', weightGrams: 100, displayedWeight: '—', price: null, priceDisplay: 'غير ظاهر (بدون سعر)', inStock: true, notes: 'لم يرجع الموقع سعراً لهذا الخيار' },
      { variantName: 'ثمن', weightGrams: 125, displayedWeight: '٠٫١٢٥ كجم', price: 1250, priceDisplay: '1250 ريال', inStock: true },
      { variantName: 'ربع', weightGrams: 250, displayedWeight: '٠٫٢٥ كجم', price: 2500, priceDisplay: '2500 ريال', inStock: true },
      { variantName: 'نصف', weightGrams: 500, displayedWeight: '—', price: 5000, priceDisplay: '5000 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '—', price: 10000, priceDisplay: '10000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_7',
    name: 'موري سيوفي فيتنامي دبل وتربل 250',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 250,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 225, priceDisplay: '225 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 1000, priceDisplay: '1000 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 2000, priceDisplay: '2000 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 4000, priceDisplay: '4000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '—', price: 8000, priceDisplay: '8000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_8',
    name: 'سيوفي دبل سوبر 350',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 350,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '—', price: 285, priceDisplay: '285 ريال', inStock: true },
      { variantName: 'ثمن', weightGrams: 125, displayedWeight: '٠٫١٢٥ كجم', price: 1250, priceDisplay: '1250 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '—', price: 2500, priceDisplay: '2500 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '—', price: 5000, priceDisplay: '5000 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '—', price: 10000, priceDisplay: '10000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_9',
    name: 'عود سيوفي فيتنامي تربل سوبر 600',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 600,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 600, priceDisplay: '600 ريال', inStock: true },
      { variantName: '100 غرام', weightGrams: 100, displayedWeight: '—', price: 600, priceDisplay: '600 ريال', inStock: true },
      { variantName: 'نص ثمن', weightGrams: 62.5, displayedWeight: '—', price: 2500, priceDisplay: '2500 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 2500, priceDisplay: '2500 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 5000, priceDisplay: '5000 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '—', price: 10000, priceDisplay: '10000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '—', price: 20000, priceDisplay: '20000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_10',
    name: 'جار فيتنامي دبل وتربل سوبر 235',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 235,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 185, priceDisplay: '185 ريال', inStock: true },
      { variantName: '50 جرام', weightGrams: 50, displayedWeight: '٥٠ جم', price: 350, priceDisplay: '350 ريال', inStock: true },
      { variantName: '100 جرام', weightGrams: 100, displayedWeight: '١٠٠ جم', price: 675, priceDisplay: '675 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '—', price: null, priceDisplay: 'غير ظاهر (بدون سعر)', inStock: true, notes: 'لم يرجع الموقع سعراً لهذا الخيار' },
      { variantName: '358 جرام', weightGrams: 358, displayedWeight: '—', price: null, priceDisplay: 'غير ظاهر (بدون سعر)', inStock: true, notes: 'لم يرجع الموقع سعراً لهذا الخيار' },
      { variantName: 'ربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 1500, priceDisplay: '1500 ريال', inStock: true },
      { variantName: 'نصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 3000, priceDisplay: '3000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '—', price: 6000, priceDisplay: '6000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_11',
    name: 'عود زورا هندي نجلاند سوبر مرتفع ودبل 233',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 233,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٠٫٢ جم', price: 253, priceDisplay: '253 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '٠٫٢ جم', price: 1028, priceDisplay: '1028 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٠٫٢ جم', price: 2054, priceDisplay: '2054 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٠٫٢ جم', price: 4106, priceDisplay: '4106 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '٠٫٢ جم', price: 10000, priceDisplay: '10000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_12',
    name: 'موروكي حي ميني سوبر مرتفع 250',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 250,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '—', price: 100, priceDisplay: '100 ريال', inStock: true },
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '—', price: 195, priceDisplay: '195 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 1000, priceDisplay: '1000 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 2000, priceDisplay: '2000 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 4000, priceDisplay: '4000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '—', price: 6500, priceDisplay: '6500 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_13',
    name: 'عود موري هندي نجلاند سوبر ومرتفع 290',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 290,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٠٫٢٨ كجم', price: 250, priceDisplay: '250 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '٠٫٢ كجم', price: 1125, priceDisplay: '1125 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٠٫٢ كجم', price: 2250, priceDisplay: '2250 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٠٫٢ كجم', price: 4500, priceDisplay: '4500 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '٠٫٢ كجم', price: 9000, priceDisplay: '9000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_14',
    name: 'عود موروكي اصقون ميني سوبر مرتفع ودبل 450',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 450,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 225, priceDisplay: '225 ريال', inStock: true },
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 450, priceDisplay: '450 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 1875, priceDisplay: '1875 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '—', price: 3750, priceDisplay: '3750 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '—', price: 7500, priceDisplay: '7500 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '—', price: 15000, priceDisplay: '15000 ريال', inStock: true },
    ],
  },
  {
    id: 'nat_15',
    name: 'عود موروكي اصقون كسر مباخر وميني دبل سوبر 750',
    category: 'العود الطبيعي',
    type: 'طبيعي',
    displayedCardPrice: 750,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 750, priceDisplay: '750 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 3200, priceDisplay: '3200 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 6300, priceDisplay: '6300 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 12500, priceDisplay: '12500 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 25000, priceDisplay: '25000 ريال', inStock: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ثانياً: العود المحسن (15 منتجاً مع الملحق التفصيلي لجميع الأوزان)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'enh_1',
    name: 'التايقر الذهبي 35',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 35,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 35, priceDisplay: '35 ريال', inStock: true },
      { variantName: 'ثمن كيلو', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 125, priceDisplay: '125 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 220, priceDisplay: '220 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 400, priceDisplay: '400 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 800, priceDisplay: '800 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_2',
    name: 'موروكي الملكي 75',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 75, priceDisplay: '75 ريال', inStock: true },
      { variantName: 'ثمن كيلو', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 225, priceDisplay: '225 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 425, priceDisplay: '425 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 850, priceDisplay: '850 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 1700, priceDisplay: '1700 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_3',
    name: 'دقة مدهال 65',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 65,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 65, priceDisplay: '65 ريال', inStock: true },
      { variantName: 'ثمن كيلو', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 175, priceDisplay: '175 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 350, priceDisplay: '350 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 700, priceDisplay: '700 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 1400, priceDisplay: '1400 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_4',
    name: 'عود تايقر كمبودي 30',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 30,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 30, priceDisplay: '30 ريال', inStock: true },
      { variantName: '4 اوقيات', weightGrams: 112, displayedWeight: '١١٢ جم', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 125, priceDisplay: '125 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 225, priceDisplay: '225 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 400, priceDisplay: '400 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 800, priceDisplay: '800 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_5',
    name: 'موروكي التميز 95',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 95,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: '2 اوقيات', weightGrams: 56, displayedWeight: '٠٫١٣ جم', price: 99, priceDisplay: '99 ريال', inStock: true },
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 95, priceDisplay: '95 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 200, priceDisplay: '200 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 400, priceDisplay: '400 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 800, priceDisplay: '800 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 1600, priceDisplay: '1600 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_6',
    name: 'السيوفي كينغ 100',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 100,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 100, priceDisplay: '100 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 250, priceDisplay: '250 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 500, priceDisplay: '500 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 1000, priceDisplay: '1000 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 2000, priceDisplay: '2000 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_7',
    name: 'السيوفي الرويال 100',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 100,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'نصف اوقية', weightGrams: 14, displayedWeight: '—', price: 75, priceDisplay: '75 ريال', inStock: true },
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 100, priceDisplay: '100 ريال', inStock: true },
      { variantName: 'ثمن', weightGrams: 125, displayedWeight: '—', price: 235, priceDisplay: '235 ريال', inStock: true },
      { variantName: 'ربع', weightGrams: 250, displayedWeight: '—', price: 475, priceDisplay: '475 ريال', inStock: true },
      { variantName: 'نصف', weightGrams: 500, displayedWeight: '—', price: 950, priceDisplay: '950 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '—', price: 1800, priceDisplay: '1800 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_8',
    name: 'المروكي الفيتنامي 75',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 75, priceDisplay: '75 ريال', inStock: true },
      { variantName: 'ثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'ربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 300, priceDisplay: '300 ريال', inStock: true },
      { variantName: 'نصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 600, priceDisplay: '600 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 1200, priceDisplay: '1200 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_9',
    name: 'زوايا كينغ فيتنامي 75',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 75, priceDisplay: '75 ريال', inStock: true },
      { variantName: 'ثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 175, priceDisplay: '175 ريال', inStock: true },
      { variantName: 'ربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 325, priceDisplay: '325 ريال', inStock: true },
      { variantName: 'نصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 650, priceDisplay: '650 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '—', price: 1300, priceDisplay: '1300 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_10',
    name: 'زوايا فيتنامي سبيشل 75',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'أوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 75, priceDisplay: '75 ريال', inStock: true },
      { variantName: 'ثمن كيلو', weightGrams: 125, displayedWeight: '١٢٨ جم', price: 175, priceDisplay: '175 ريال', inStock: true },
      { variantName: 'ربع كيلو', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 325, priceDisplay: '325 ريال', inStock: true },
      { variantName: 'نصف كيلو', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 650, priceDisplay: '650 ريال', inStock: true },
      { variantName: 'كيلو', weightGrams: 1000, displayedWeight: '—', price: 1300, priceDisplay: '1300 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_11',
    name: 'عود موروكي ميني محسن 30',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 30,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 30, priceDisplay: '30 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '—', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 300, priceDisplay: '300 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 400, priceDisplay: '400 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 800, priceDisplay: '800 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_12',
    name: 'عينات العود الفيتنامي المحسن 50',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'عبوة عينات', weightGrams: null, displayedWeight: '—', price: 50, priceDisplay: '50 ريال', inStock: true, notes: 'لا توجد خيارات أوزان ظاهرة' },
    ],
  },
  {
    id: 'enh_13',
    name: 'عود الفراشة الكمبودية 50',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 30, priceDisplay: '30 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 130, priceDisplay: '130 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 250, priceDisplay: '250 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '—', price: 400, priceDisplay: '400 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 800, priceDisplay: '800 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_14',
    name: 'دقة العود الكمبودي 50',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٢٨ جم', price: 50, priceDisplay: '50 ريال', inStock: true },
      { variantName: '100 غرام', weightGrams: 100, displayedWeight: '٣٠ جم', price: 125, priceDisplay: '125 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '١٢٥ جم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٢٥٠ جم', price: 275, priceDisplay: '275 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٥٠٠ جم', price: 525, priceDisplay: '525 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١٠٠٠ جم', price: 1050, priceDisplay: '1050 ريال', inStock: true },
    ],
  },
  {
    id: 'enh_15',
    name: 'عود السيوفي الفيتنامي 50',
    category: 'العود المحسن',
    type: 'محسن',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الأوقية', weightGrams: 28, displayedWeight: '٠٫٢٨ كجم', price: 50, priceDisplay: '50 ريال', inStock: true },
      { variantName: 'الثمن', weightGrams: 125, displayedWeight: '٠٫١٢٥ كجم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'الربع', weightGrams: 250, displayedWeight: '٠٫٢٥ كجم', price: 285, priceDisplay: '285 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 500, displayedWeight: '٠٫٥ كجم', price: 550, priceDisplay: '550 ريال', inStock: true },
      { variantName: 'الكيلو', weightGrams: 1000, displayedWeight: '١ كجم', price: 1100, priceDisplay: '1100 ريال', inStock: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ثالثاً: أدهان العود (15 منتجاً مع الملحق التفصيلي وحالات التوفر)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'oil_1',
    name: 'كلاكاس هندي 150',
    category: 'أدهان العود',
    type: 'دهن بيور',
    displayedCardPrice: 150,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'ربع تولة', weightGrams: 3, displayedWeight: '٣ جم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'نصف تولة', weightGrams: 6, displayedWeight: '٦ جم', price: 300, priceDisplay: '300 ريال', inStock: true },
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 600, priceDisplay: '600 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_2',
    name: 'بكج الادهان 422',
    category: 'أدهان العود',
    type: 'بكج أدهان',
    displayedCardPrice: 422,
    overallAvailability: 'متوفر',
    notes: 'مكونات: ربع تولة كمبودي كوه كينغ + ربع تولة دهن الكوتشان + ربع تولة دهن تراد كمبودي + ربع تولة دهن البراشين الحطب. الوزن الإجمالي: 200 جم.',
    variants: [
      { variantName: 'بكج كامل (4 أرباع تولة)', weightGrams: 200, displayedWeight: '٢٠٠ جم', price: 422, priceDisplay: '422 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_3',
    name: 'دهن تراد فروتي 95',
    category: 'أدهان العود',
    type: 'دهن طبيعي',
    displayedCardPrice: 95,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الربع توله', weightGrams: 3, displayedWeight: '٣ جم', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'النصف توله', weightGrams: 6, displayedWeight: '٦ جم', price: 150, priceDisplay: '150 ريال', inStock: true },
      { variantName: 'التوله', weightGrams: 12, displayedWeight: '١٢ جم', price: 300, priceDisplay: '300 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_4',
    name: 'دهن كوتشان 125',
    category: 'أدهان العود',
    type: 'دهن طبيعي',
    displayedCardPrice: 125,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الربع توله', weightGrams: 3, displayedWeight: '٣ جم', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'النصف توله', weightGrams: 6, displayedWeight: '٦ جم', price: 200, priceDisplay: '200 ريال', inStock: true },
      { variantName: 'التوله', weightGrams: 12, displayedWeight: '١٢ جم', price: 350, priceDisplay: '350 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_5',
    name: 'دهن كلمنتان المالينو 250',
    category: 'أدهان العود',
    type: 'دهن طبيعي',
    displayedCardPrice: 250,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'ربع توله', weightGrams: 3, displayedWeight: '٣ جم', price: 250, priceDisplay: '250 ريال', inStock: true },
      { variantName: 'النصف توله', weightGrams: 6, displayedWeight: '٦ جم', price: 425, priceDisplay: '425 ريال', inStock: true },
      { variantName: 'التوله', weightGrams: 12, displayedWeight: '١٢ جم', price: 850, priceDisplay: '850 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_6',
    name: 'مخلط توق 25',
    category: 'أدهان العود',
    type: 'مخلط خاص',
    displayedCardPrice: 25,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'ربع تولة', weightGrams: 3, displayedWeight: '٠٫٣ كجم', price: 25, priceDisplay: '25 ريال', inStock: true },
      { variantName: 'نصف تولة', weightGrams: 6, displayedWeight: '٠٫٦ كجم', price: 50, priceDisplay: '50 ريال', inStock: true },
      { variantName: 'التولة', weightGrams: 12, displayedWeight: '٠٫١٢ كجم', price: 100, priceDisplay: '100 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_7',
    name: 'دهن عود الموروكي الأخضر 95',
    category: 'أدهان العود',
    type: 'دهن طبيعي',
    displayedCardPrice: 95,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [
      { variantName: 'ربع تولة', weightGrams: 3, displayedWeight: '٣ جم', price: 96, priceDisplay: '96 ريال', inStock: true, notes: 'شامل الضريبة' },
      { variantName: 'نصف توله', weightGrams: 6, displayedWeight: '٦ جم', price: 150, priceDisplay: '150 ريال', inStock: true, notes: 'شامل الضريبة' },
      { variantName: 'توله', weightGrams: 12, displayedWeight: '١٢ جم', price: 275, priceDisplay: '275 ريال', inStock: true, notes: 'شامل الضريبة' },
    ],
  },
  {
    id: 'oil_8',
    name: 'دهن تراد كمبودي 125',
    category: 'أدهان العود',
    type: 'دهن طبيعي',
    displayedCardPrice: 125,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الربع', weightGrams: 3, displayedWeight: '—', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'نص', weightGrams: 6, displayedWeight: '٦ جم', price: 185, priceDisplay: '185 ريال', inStock: true },
      { variantName: 'التولة', weightGrams: 12, displayedWeight: '—', price: 350, priceDisplay: '350 ريال', inStock: true },
      { variantName: 'نانو', weightGrams: null, displayedWeight: '—', price: null, priceDisplay: 'غير ظاهر (بدون سعر)', inStock: true, notes: 'لم يرجع الموقع سعراً لهذا الخيار' },
    ],
  },
  {
    id: 'oil_9',
    name: 'دهن ورد كيشاني 75',
    category: 'أدهان العود',
    type: 'دهن ورد فاخر',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الربع', weightGrams: 3, displayedWeight: '٣ جم', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'النصف', weightGrams: 6, displayedWeight: '٦ جم', price: 180, priceDisplay: '180 ريال', inStock: true },
      { variantName: 'التولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 300, priceDisplay: '300 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_10',
    name: 'دهن البراشين البخوري 125',
    category: 'أدهان العود',
    type: 'دهن بخوري',
    displayedCardPrice: 125,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'الربع', weightGrams: 3, displayedWeight: '٣ جم', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'نصف توله', weightGrams: 6, displayedWeight: '٦ جم', price: 185, priceDisplay: '185 ريال', inStock: true },
      { variantName: 'التولة', weightGrams: 12, displayedWeight: '—', price: 350, priceDisplay: '350 ريال', inStock: true },
    ],
  },
  {
    id: 'oil_11',
    name: 'دهن عود كمبودي كوه كنج 125',
    category: 'أدهان العود',
    type: 'دهن كمبودي',
    displayedCardPrice: 125,
    overallAvailability: 'متوفر',
    variants: [
      { variantName: 'ربع تولة', weightGrams: 3, displayedWeight: '٣ جم', price: 96, priceDisplay: '96 ريال', inStock: true },
      { variantName: 'نصف توله', weightGrams: 6, displayedWeight: '٦ جم', price: 200, priceDisplay: '200 ريال', inStock: true },
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '١٢ جم', price: 350, priceDisplay: '350 ريال', inStock: true },
      { variantName: 'نانو', weightGrams: null, displayedWeight: '—', price: null, priceDisplay: 'غير ظاهر (بدون سعر)', inStock: true, notes: 'لم يرجع الموقع سعراً لهذا الخيار' },
    ],
  },
  {
    id: 'oil_12',
    name: 'دهن عود الخلطة الكمبودية 79',
    category: 'أدهان العود',
    type: 'خلطة خاصة',
    displayedCardPrice: 79,
    overallAvailability: 'مخلص حالياً',
    notes: 'نفدت الكمية / مخلص حالياً، ويعاد التحقق من الموقع عند توفره',
    variants: [
      { variantName: 'ربع', weightGrams: 3, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
    ],
  },
  {
    id: 'oil_13',
    name: 'دهن عود هندي قاروهيلز 400',
    category: 'أدهان العود',
    type: 'دهن هندي معتق',
    displayedCardPrice: 400,
    overallAvailability: 'مخلص حالياً',
    notes: 'نفدت الكمية / مخلص حالياً، ويعاد التحقق من الموقع عند توفره',
    variants: [
      { variantName: 'الربع', weightGrams: 3, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
      { variantName: 'النصف توله', weightGrams: 6, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
      { variantName: 'التولة', weightGrams: 12, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
    ],
  },
  {
    id: 'oil_14',
    name: 'دهن عود هندي آسام 130',
    category: 'أدهان العود',
    type: 'دهن هندي',
    displayedCardPrice: 130,
    overallAvailability: 'مخلص حالياً',
    notes: 'نفدت الكمية / مخلص حالياً',
    variants: [
      { variantName: 'ربع', weightGrams: 3, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
    ],
  },
  {
    id: 'oil_15',
    name: 'دهن عود تراد سويتي 104',
    category: 'أدهان العود',
    type: 'دهن سويتي',
    displayedCardPrice: 104,
    overallAvailability: 'مخلص حالياً',
    notes: 'نفدت الكمية / مخلص حالياً',
    variants: [
      { variantName: 'ربع توله', weightGrams: 3, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
      { variantName: 'تولة', weightGrams: 12, displayedWeight: '—', price: null, priceDisplay: 'مخلص حالياً', inStock: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // رابعاً: قسم العروض (أوزان ثابتة وأسعار محددة)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'off_1',
    name: 'ثمن سيوفي فيتنامي',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 195,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'ثمن كيلو (125 جم)', weightGrams: 125, price: 195, priceDisplay: '195 ريال', inStock: true }],
  },
  {
    id: 'off_2',
    name: 'ثمن كيلو عود كمبودي تايقر',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 150,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'ثمن كيلو (125 جم)', weightGrams: 125, price: 150, priceDisplay: '150 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'off_3',
    name: 'نصف كيلو عود كمبودي تايقر',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 500,
    overallAvailability: 'متوفر',
    notes: 'شحن مجاني',
    variants: [{ variantName: 'نصف كيلو (500 جم)', weightGrams: 500, price: 500, priceDisplay: '500 ريال', inStock: true, notes: 'شحن مجاني' }],
  },
  {
    id: 'off_4',
    name: 'ربع كيلو عود كمبودي تايقر',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 285,
    overallAvailability: 'متوفر',
    notes: 'شحن مجاني',
    variants: [{ variantName: 'ربع كيلو (250 جم)', weightGrams: 250, price: 285, priceDisplay: '285 ريال', inStock: true, notes: 'شحن مجاني' }],
  },
  {
    id: 'off_5',
    name: 'ثمن كيلو عود الدقة الكمبودية',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 195,
    overallAvailability: 'متوفر',
    notes: 'شحن مجاني',
    variants: [{ variantName: 'ثمن كيلو (125 جم)', weightGrams: 125, price: 195, priceDisplay: '195 ريال', inStock: true, notes: 'شحن مجاني' }],
  },
  {
    id: 'off_6',
    name: 'ربع كيلو الدقة الكمبودية',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 345,
    overallAvailability: 'متوفر',
    notes: 'شحن مجاني',
    variants: [{ variantName: 'ربع كيلو (250 جم)', weightGrams: 250, price: 345, priceDisplay: '345 ريال', inStock: true, notes: 'شحن مجاني' }],
  },
  {
    id: 'off_7',
    name: 'نصف كيلو الدقة الكمبودية',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 635,
    overallAvailability: 'متوفر',
    notes: 'شحن مجاني',
    variants: [{ variantName: 'نصف كيلو (500 جم)', weightGrams: 500, price: 635, priceDisplay: '635 ريال', inStock: true, notes: 'شحن مجاني' }],
  },
  {
    id: 'off_8',
    name: 'ثمن كيلو دقة كلمنتان كنق',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 260,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'ثمن كيلو (125 جم)', weightGrams: 125, price: 260, priceDisplay: '260 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },
  {
    id: 'off_9',
    name: 'ربع كيلو دقة كلمنتان كنق',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 500,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'ربع كيلو (250 جم)', weightGrams: 250, price: 500, priceDisplay: '500 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },
  {
    id: 'off_10',
    name: 'نصف كيلو دقة كلمنتان كنق',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 960,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'نصف كيلو (500 جم)', weightGrams: 500, price: 960, priceDisplay: '960 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },
  {
    id: 'off_11',
    name: 'ثمن كيلو كلمنتان كنق كسر مباخر',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 260,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'ثمن كيلو (125 جم)', weightGrams: 125, price: 260, priceDisplay: '260 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },
  {
    id: 'off_12',
    name: 'ثمن كيلو مروكي كنق',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 260,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'ثمن كيلو (125 جم)', weightGrams: 125, price: 260, priceDisplay: '260 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },
  {
    id: 'off_13',
    name: 'ربع كيلو دقة المروكي الذهبية',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 370,
    overallAvailability: 'نفدت الكمية',
    notes: 'شحن مجاني',
    variants: [{ variantName: 'ربع كيلو (250 جم)', weightGrams: 250, price: 370, priceDisplay: '370 ريال', inStock: false, notes: 'نفدت الكمية، شحن مجاني' }],
  },
  {
    id: 'off_14',
    name: 'نصف كيلو كلمنتان كنق كسر مباخر',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 940,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'نصف كيلو (500 جم)', weightGrams: 500, price: 940, priceDisplay: '940 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },
  {
    id: 'off_15',
    name: 'نصف كيلو مروكي كنق',
    category: 'قسم العروض',
    type: 'عرض عود',
    displayedCardPrice: 940,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'نصف كيلو (500 جم)', weightGrams: 500, price: 940, priceDisplay: '940 ريال', inStock: false, notes: 'نفدت الكمية' }],
  },

  // ═══════════════════════════════════════════════════════════════════
  // خامساً: بكجات العطور والزعفران والبخور والعطور والمسك والمباخر والإكسسوارات
  // ═══════════════════════════════════════════════════════════════════
  // بكجات العطور
  {
    id: 'pkg_1',
    name: 'توزيعات مدهال الطيب',
    category: 'بكجات العطور',
    displayedCardPrice: 100,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'طقم توزيعات', price: 100, priceDisplay: '100 ريال', inStock: true }],
  },
  {
    id: 'pkg_2',
    name: 'أوقية التايقر الكمبودي',
    category: 'بكجات العطور',
    displayedCardPrice: 30,
    overallAvailability: 'متوفر',
    notes: 'السابق 50، خصم 40%',
    variants: [{ variantName: 'أوقية', weightGrams: 28, price: 30, priceDisplay: '30 ريال (السابق 50)', inStock: true }],
  },
  {
    id: 'pkg_3',
    name: 'بكجات Velvet Rose, Marvel, Luxure, Arrogant, Lord, Rich, Attention, Flora, Elegant, Bella',
    category: 'بكجات العطور',
    displayedCardPrice: 99,
    overallAvailability: 'متوفر',
    notes: 'السعر الحالي 99 لكل منتج (السابق 159، خصم 38%)',
    variants: [{ variantName: 'العبوة الواحدة', price: 99, priceDisplay: '99 ريال لكل منتج', inStock: true }],
  },
  {
    id: 'pkg_4',
    name: 'بكجات Royal و Magic',
    category: 'بكجات العطور',
    displayedCardPrice: 99,
    overallAvailability: 'نفدت الكمية',
    notes: 'نفدت الكمية (السابق 159، خصم 38%)',
    variants: [{ variantName: 'العبوة الواحدة', price: 99, priceDisplay: '99 ريال (نفدت الكمية)', inStock: false }],
  },

  // الزعفران
  {
    id: 'zaf_1',
    name: 'بكج الزعفران الخاص',
    category: 'الزعفران',
    displayedCardPrice: 65,
    overallAvailability: 'متوفر',
    notes: '6 جرام = 65 ريال',
    variants: [{ variantName: '6 جرام', weightGrams: 6, displayedWeight: '6 جرام', price: 65, priceDisplay: '65 ريال', inStock: true }],
  },
  {
    id: 'zaf_2',
    name: 'بكج الزعفران — أقوى العروض',
    category: 'الزعفران',
    displayedCardPrice: 65,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'بكج الزعفران — أقوى العروض', price: 65, priceDisplay: '65 ريال', inStock: true }],
  },
  {
    id: 'zaf_3',
    name: 'زعفران إيراني سوبر نقيل',
    category: 'الزعفران',
    displayedCardPrice: 45,
    overallAvailability: 'متوفر',
    notes: '5 جرام = 45 ريال، 10 جرام = 90 ريال',
    variants: [
      { variantName: '5 جرام', weightGrams: 5, displayedWeight: '5 جرام', price: 45, priceDisplay: '45 ريال', inStock: true },
      { variantName: '10 جرام', weightGrams: 10, displayedWeight: '10 جرام', price: 90, priceDisplay: '90 ريال', inStock: true },
    ],
  },
  {
    id: 'zaf_4',
    name: 'زعفران مغربي',
    category: 'الزعفران',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    notes: '5 جرام = 75 ريال، 10 جرام = 150 ريال (شامل الضريبة)',
    variants: [
      { variantName: '5 جرام', weightGrams: 5, displayedWeight: '5 جرام', price: 75, priceDisplay: '75 ريال', inStock: true },
      { variantName: '10 جرام', weightGrams: 10, displayedWeight: '10 جرام', price: 150, priceDisplay: '150 ريال', inStock: true, notes: 'شامل الضريبة' },
    ],
  },

  // الإكسسوارات وشنط الهدايا
  {
    id: 'acc_1',
    name: 'شنطة بني أكريلك مع 8 ربع تولة و8 نصف تولة و8 تولة',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 95,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'الشنطة', price: 95, priceDisplay: '95 ريال', inStock: true }],
  },
  {
    id: 'acc_2',
    name: 'شنطة بني كبير أكريلك مع 48 ربع تولة',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 90,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'الشنطة', price: 90, priceDisplay: '90 ريال', inStock: true }],
  },
  {
    id: 'acc_3',
    name: 'شنطة بني كبير أكريلك مع أرباع التولة عدد 24',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 70,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'الشنطة', price: 70, priceDisplay: '70 ريال', inStock: true }],
  },
  {
    id: 'acc_4',
    name: 'درزن عينات عطور زجاج',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 10,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'درزن', price: 10, priceDisplay: '10 ريال', inStock: true }],
  },
  {
    id: 'acc_5',
    name: 'علب زعفران ألمنيوم أحمر كبس',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 18,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'العبوة', price: 18, priceDisplay: '18 ريال', inStock: true }],
  },
  {
    id: 'acc_6',
    name: 'درزن تولة ميل زجاج',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 18,
    overallAvailability: 'متوفر',
    notes: 'السابق 23، خصم 22%',
    variants: [{ variantName: 'درزن', price: 18, priceDisplay: '18 ريال (السابق 23)', inStock: true }],
  },
  {
    id: 'acc_7',
    name: 'شنطة جلد اللون البني زجاج',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 40,
    overallAvailability: 'متوفر',
    notes: 'السابق 65، خصم 38%',
    variants: [{ variantName: 'الشنطة', price: 40, priceDisplay: '40 ريال (السابق 65)', inStock: true }],
  },
  {
    id: 'acc_8',
    name: 'شدة عينات دهن العود زجاجي 1 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 250,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'شدة عينات', price: 250, priceDisplay: '250 ريال', inStock: true }],
  },
  {
    id: 'acc_9',
    name: 'علب زجاج صيني 100 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 190,
    overallAvailability: 'متوفر',
    variants: [{ variantName: '100 مل', price: 190, priceDisplay: '190 ريال', inStock: true }],
  },
  {
    id: 'acc_10',
    name: 'علب زجاج صيني 250 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 300,
    overallAvailability: 'متوفر',
    variants: [{ variantName: '250 مل', price: 300, priceDisplay: '300 ريال', inStock: true }],
  },
  {
    id: 'acc_11',
    name: 'علب زجاج صيني 500 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 500,
    overallAvailability: 'متوفر',
    variants: [{ variantName: '500 مل', price: 500, priceDisplay: '500 ريال', inStock: true }],
  },
  {
    id: 'acc_12',
    name: 'درزن علب ألمنيوم معدني 100 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 15,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'درزن 100 مل', price: 15, priceDisplay: '15 ريال', inStock: true }],
  },
  {
    id: 'acc_13',
    name: 'درزن علب ألمنيوم معدني 150 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 18,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'درزن 150 مل', price: 18, priceDisplay: '18 ريال', inStock: true }],
  },
  {
    id: 'acc_14',
    name: 'درزن علب ألمنيوم معدني 500 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 35,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'درزن 500 مل', price: 35, priceDisplay: '35 ريال', inStock: true }],
  },
  {
    id: 'acc_15',
    name: 'درزن علب ألمنيوم معدني 1000 مل',
    category: 'الإكسسوارات وشنط الهدايا',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    notes: 'السابق 75، خصم 33%',
    variants: [{ variantName: 'درزن 1000 مل', price: 50, priceDisplay: '50 ريال (السابق 75)', inStock: true }],
  },

  // البخور والمعمول
  {
    id: 'bkh_1',
    name: 'معمول دوسري قديم — عبوة صغيرة',
    category: 'البخور',
    displayedCardPrice: 65,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'عبوة صغيرة', price: 65, priceDisplay: '65 ريال', inStock: true }],
  },
  {
    id: 'bkh_2',
    name: 'مسقى الدقة الفيتنامية',
    category: 'البخور',
    displayedCardPrice: 150,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'العبوة', price: 150, priceDisplay: '150 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'bkh_3',
    name: 'عود موروكي مسقى',
    category: 'البخور',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'العبوة', price: 50, priceDisplay: '50 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'bkh_4',
    name: 'معمول دوسري قديم، شامل الضريبة',
    category: 'البخور',
    displayedCardPrice: 650,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'العبوة الكبيرة', price: 650, priceDisplay: '650 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'bkh_5',
    name: 'المعمول الخاص / المعمول الفاخر',
    category: 'البخور',
    displayedCardPrice: 53,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'العبوة', price: 53, priceDisplay: '53 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },

  // العطور ومعطرات الجو
  {
    id: 'prf_1',
    name: 'عطر عود التراد',
    category: 'العطور ومعطرات الجو',
    displayedCardPrice: 200,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'زجاجة العطر', price: 200, priceDisplay: '200 ريال', inStock: true }],
  },
  {
    id: 'prf_2',
    name: 'عطور BELLA, ELEGANT, FLORA, ATTENTION, LORD, Velvet Rose, LUXURY, MARVEL, ARROGANT',
    category: 'العطور ومعطرات الجو',
    displayedCardPrice: 75,
    overallAvailability: 'متوفر',
    notes: 'السعر الحالي 75 لكل منتج (السابق 125، خصم 40%)',
    variants: [{ variantName: 'العبوة', price: 75, priceDisplay: '75 ريال لكل منتج', inStock: true }],
  },
  {
    id: 'prf_3',
    name: 'عطور ROYAL, RICH, MAGIC',
    category: 'العطور ومعطرات الجو',
    displayedCardPrice: 75,
    overallAvailability: 'نفدت الكمية',
    notes: 'السابق 125، خصم 40%، نفدت الكمية',
    variants: [{ variantName: 'العبوة', price: 75, priceDisplay: '75 ريال (نفدت الكمية)', inStock: false }],
  },

  // المسك
  {
    id: 'msk_1',
    name: 'مسك مدهال (الهيل، الزعفران، العروس، البودر، الرمان، الختام)',
    category: 'المسك',
    displayedCardPrice: 15,
    overallAvailability: 'متوفر',
    notes: '15 ريال لكل منتج',
    variants: [
      { variantName: 'مسك الهيل', price: 15, priceDisplay: '15 ريال', inStock: true },
      { variantName: 'مسك الزعفران', price: 15, priceDisplay: '15 ريال', inStock: true },
      { variantName: 'مسك العروس', price: 15, priceDisplay: '15 ريال', inStock: true },
      { variantName: 'مسك البودر', price: 15, priceDisplay: '15 ريال', inStock: true },
      { variantName: 'مسك الرمان', price: 15, priceDisplay: '15 ريال', inStock: true },
      { variantName: 'مسك الختام', price: 15, priceDisplay: '15 ريال', inStock: true },
    ],
  },
  {
    id: 'msk_2',
    name: 'مسك اللافندر',
    category: 'المسك',
    displayedCardPrice: 15,
    overallAvailability: 'نفدت الكمية',
    notes: 'نفدت الكمية',
    variants: [{ variantName: 'مسك اللافندر', price: 15, priceDisplay: '15 ريال (نفدت الكمية)', inStock: false }],
  },

  // المباخر الحائلية
  {
    id: 'mbk_1',
    name: 'مبخرة رشم حجر أحمر',
    category: 'المباخر الحائلية',
    displayedCardPrice: 150,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'مبخرة حجر أحمر', price: 150, priceDisplay: '150 ريال', inStock: true }],
  },
  {
    id: 'mbk_2',
    name: 'مبخرة رشم النقشة الهندية',
    category: 'المباخر الحائلية',
    displayedCardPrice: 650,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'مبخرة رشم النقشة الهندية', price: 650, priceDisplay: '650 ريال', inStock: true }],
  },
  {
    id: 'mbk_3',
    name: 'مباخر حائلية رشم، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 185,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة حائلية رشم', price: 185, priceDisplay: '185 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_4',
    name: 'مبخرة ملكية حائلية رشم نحاس، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 400,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة ملكية رشم نحاس', price: 400, priceDisplay: '400 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_5',
    name: 'طقم مبخرة خشبية',
    category: 'المباخر الحائلية',
    displayedCardPrice: 185,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'طقم مبخرة خشبية', price: 185, priceDisplay: '185 ريال', inStock: true }],
  },
  {
    id: 'mbk_6',
    name: 'مبخرة حائلية ملكية، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 361,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة حائلية ملكية', price: 361, priceDisplay: '361 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_7',
    name: 'طقم مبخرة حائلية خشبي، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 150,
    overallAvailability: 'متوفر',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'طقم مبخرة حائلية خشبي', price: 150, priceDisplay: '150 ريال', inStock: true, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_8',
    name: 'مبخرة كرستال',
    category: 'المباخر الحائلية',
    displayedCardPrice: 50,
    overallAvailability: 'متوفر',
    variants: [{ variantName: 'مبخرة كرستال', price: 50, priceDisplay: '50 ريال', inStock: true }],
  },
  {
    id: 'mbk_9',
    name: 'مبخرة رشم قلادة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 150,
    overallAvailability: 'نفدت الكمية',
    variants: [{ variantName: 'مبخرة رشم قلادة', price: 150, priceDisplay: '150 ريال (نفدت الكمية)', inStock: false }],
  },
  {
    id: 'mbk_10',
    name: 'مبخرة ملكية مع صندوق عود بني، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 525,
    overallAvailability: 'نفدت الكمية',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة ملكية مع صندوق عود بني', price: 525, priceDisplay: '525 ريال (نفدت الكمية)', inStock: false, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_11',
    name: 'مبخرة حائلية صاج مراية، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 669,
    overallAvailability: 'نفدت الكمية',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة حائلية صاج مراية', price: 669, priceDisplay: '669 ريال (نفدت الكمية)', inStock: false, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_12',
    name: 'مبخرة حائلية ملكية مع صندوق، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 361,
    overallAvailability: 'نفدت الكمية',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة حائلية ملكية مع صندوق', price: 361, priceDisplay: '361 ريال (نفدت الكمية)', inStock: false, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_13',
    name: 'مبخرة حائلية صاج، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 200,
    overallAvailability: 'نفدت الكمية',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة حائلية صاج', price: 200, priceDisplay: '200 ريال (نفدت الكمية)', inStock: false, notes: 'شامل الضريبة' }],
  },
  {
    id: 'mbk_14',
    name: 'مبخرة حائلية نجدية، شامل الضريبة',
    category: 'المباخر الحائلية',
    displayedCardPrice: 361,
    overallAvailability: 'نفدت الكمية',
    notes: 'شامل الضريبة',
    variants: [{ variantName: 'مبخرة حائلية نجدية', price: 361, priceDisplay: '361 ريال (نفدت الكمية)', inStock: false, notes: 'شامل الضريبة' }],
  },
];

// إنشاء بطاقات العطور المستقلة حسب الأوصاف المعتمدة والمستوحاة
const PERFUME_INDIVIDUAL_ITEMS: CatalogItem[] = Object.entries(PERFUME_PROFILES).map(([key, p], idx) => ({
  id: `perfume_indiv_${idx + 1}`,
  name: p.name,
  category: 'العطور ومعطرات الجو',
  type: 'عطور مستوحاة / فاخرة',
  displayedCardPrice: p.price,
  overallAvailability: p.inStock ? 'متوفر' : 'نفدت الكمية',
  notes: `السعة: 100 مل | مستوحى من ${p.inspiredBy} | ${p.character} | النوتات: ${p.notes} | مناسب لـ: ${p.occasion}`,
  imageUrl: p.imageUrl,
  productUrl: p.productUrl,
  variants: [
    {
      variantName: 'السعة: 100 مل',
      displayedWeight: 'السعة: 100 مل',
      price: p.price,
      priceDisplay: `${p.price} ريال${!p.inStock ? ' (نفدت الكمية)' : ''}`,
      inStock: p.inStock,
      notes: `السعة: 100 مل | مستوحى من ${p.inspiredBy} (${p.englishName})`,
    },
  ],
}));

/**
 * الكتالوج الرسمي الموحد لمدهال الطيب مضافاً إليه:
 * 1. بيانات الكتالوج الكامل من ملف PDF
 * 2. ربط الروابط والصور المؤكدة من المتجر الرسمي medhaloud.com
 * 3. بيانات الشنط الفارغة المؤكدة (4 ألوان ومقاساتها بأسعارها المحددة)
 * 4. بيانات العطور الفردية الموثقة بأوصاف النوتات واستيحائها المعتمد
 * 5. قسم العروض الحالية المؤكدة بالموقع
 */
export const MIDHAL_OFFICIAL_CATALOG: CatalogItem[] = [
  ...RAW_MIDHAL_CATALOG.map((item) => {
    // محاولة ربط الصورة والرابط المعتمد إذا توفرا
    let media = VERIFIED_STORE_MEDIA[item.name.trim()];
    if (!media) {
      for (const [k, v] of Object.entries(VERIFIED_STORE_MEDIA)) {
        if (item.name.includes(k) || k.includes(item.name)) {
          media = v;
          break;
        }
      }
    }
    const nav = resolveStoreDestination(item.name, { name: item.name, category: item.category });
    return {
      ...item,
      imageUrl: item.imageUrl || media?.imageUrl,
      productUrl: nav.hasDirectPage ? (nav.officialUrl || media?.productUrl) : null,
      hasDirectPage: nav.hasDirectPage,
      nearestOfficialUrl: nav.nearestOfficialUrl,
      nearestOfficialLabel: nav.nearestOfficialLabel,
      linkType: nav.destinationType,
    };
  }),
  ...CONFIRMED_EMPTY_BAGS.map((item) => {
    const nav = resolveStoreDestination(item.name, { name: item.name, category: item.category });
    return {
      ...item,
      productUrl: nav.hasDirectPage ? nav.officialUrl : null,
      hasDirectPage: nav.hasDirectPage,
      nearestOfficialUrl: nav.nearestOfficialUrl,
      nearestOfficialLabel: nav.nearestOfficialLabel,
      linkType: nav.destinationType,
    };
  }),
  ...OFFICIAL_ACTIVE_OFFERS.map((item) => {
    const nav = resolveStoreDestination(item.name, { name: item.name, category: item.category });
    return {
      ...item,
      productUrl: nav.officialUrl || item.productUrl,
      hasDirectPage: true,
      nearestOfficialUrl: nav.nearestOfficialUrl,
      nearestOfficialLabel: nav.nearestOfficialLabel,
      linkType: 'offer',
    };
  }),
  ...PERFUME_INDIVIDUAL_ITEMS.map((item) => {
    const nav = resolveStoreDestination(item.name, { name: item.name, category: item.category });
    return {
      ...item,
      productUrl: nav.hasDirectPage ? (nav.officialUrl || item.productUrl) : null,
      hasDirectPage: nav.hasDirectPage,
      nearestOfficialUrl: nav.nearestOfficialUrl,
      nearestOfficialLabel: nav.nearestOfficialLabel,
      linkType: nav.destinationType,
    };
  }),
];

/**
 * دالة البحث المباشر في الكتالوج بالاسم أو القسم أو الوزن
 */
export function searchCatalog(query: string, weightFilter?: string): CatalogItem[] {
  const q = query.trim().toLowerCase();
  const w = weightFilter ? weightFilter.trim().toLowerCase() : '';

  if (!q && !w) return MIDHAL_OFFICIAL_CATALOG;

  return MIDHAL_OFFICIAL_CATALOG.filter((item) => {
    const matchesName = !q || (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.type && item.type.toLowerCase().includes(q))
    );

    const matchesVariant = !w || item.variants.some((v) => 
      v.variantName.toLowerCase().includes(w) || 
      (v.displayedWeight && v.displayedWeight.toLowerCase().includes(w))
    );

    return matchesName && matchesVariant;
  });
}

/**
 * دالة البحث عن خيارات تناسب ميزانية محددة (بالريال السعودي)
 */
export function findOptionsByBudget(maxBudget: number, minBudget: number = 0): Array<{
  productName: string;
  category: string;
  variantName: string;
  price: number;
  inStock: boolean;
}> {
  const matches: Array<{
    productName: string;
    category: string;
    variantName: string;
    price: number;
    inStock: boolean;
  }> = [];

  for (const item of MIDHAL_OFFICIAL_CATALOG) {
    for (const v of item.variants) {
      if (v.price !== null && v.price <= maxBudget && v.price >= minBudget) {
        matches.push({
          productName: item.name,
          category: item.category,
          variantName: v.variantName,
          price: v.price,
          inStock: v.inStock,
        });
      }
    }
  }

  // فرز حسب الأقرب للميزانية نزولاً
  return matches.sort((a, b) => b.price - a.price);
}

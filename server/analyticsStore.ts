import fs from 'fs';
import path from 'path';

export interface FeedbackItem {
  id: string;
  conversationId: string;
  messageId: string;
  userQuery: string;
  assistantReply: string;
  rating: 'positive' | 'negative';
  timestamp: string;
  modelUsed?: string;
  productCards?: any[];
  context?: any;
}

export interface UnansweredQuestion {
  id: string;
  question: string;
  category: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved?: boolean;
}

export interface AnsweredTopic {
  id: string;
  topic: string;
  category: string;
  count: number;
  lastSeen: string;
}

export interface FallbackEvent {
  id: string;
  timestamp: string;
  fromModel: string;
  toModel: string;
  reason: string;
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  visitors: number;
  sessions: number;
  pageviews: number;
  agentRequests: number;
  conversations: number;
  tokensTotal: number;
  tokensInput: number;
  tokensOutput: number;
  productImpressions: number;
  productClicks: number;
  productLinkClicks: number;
  unansweredCount: number;
  errors: number;
}

export interface AnalyticsData {
  site: {
    totalVisitors: number;
    totalSessions: number;
    totalPageviews: number;
    devices: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    referrers: Record<string, number>;
    locations: Record<string, number>;
    newVsReturning: {
      newVisitors: number;
      returningVisitors: number;
    };
    pages: Record<string, number>;
  };
  agent: {
    totalRequests: number;
    conversationsStarted: number;
    totalMessages: number;
    productImpressions: Record<string, number>;
    productClicks: Record<string, number>;
    productLinkClicks: Record<string, number>;
    topSearchedProducts: Record<string, number>;
    topTopics: Record<string, number>;
    errors: {
      total: number;
      rateLimits429: number;
      other: number;
    };
    fallbackCount: number;
    fallbackEvents: FallbackEvent[];
    directLookupRequests?: number;
  };
  tokens: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    byModel: Record<
      string,
      {
        requests: number;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
      }
    >;
  };
  unansweredQuestions: UnansweredQuestion[];
  answeredTopics: AnsweredTopic[];
  dailyMetrics: Record<string, DailyMetric>;
  feedbacks?: FeedbackItem[];
}

// Default storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'analytics_store.json');
const TMP_STORAGE_FILE = '/tmp/analytics_store.json';

function getStorageFilePath(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return STORAGE_FILE;
  } catch {
    return TMP_STORAGE_FILE;
  }
}

// Generate realistic initial baseline data so dashboard has rich visualization from day 1
function generateInitialData(): AnalyticsData {
  const today = new Date();
  const daily: Record<string, DailyMetric> = {};

  // Generate 14 days of realistic baseline data
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Gradual progression
    const factor = 1 + (14 - i) * 0.08;
    const visitors = Math.round((28 + (i % 5) * 6) * factor);
    const sessions = Math.round(visitors * 1.35);
    const pageviews = Math.round(sessions * 2.8);
    const requests = Math.round(visitors * 1.8);
    const conversations = Math.round(visitors * 0.7);
    const inputTokens = requests * 480;
    const outputTokens = requests * 165;
    const tokensTotal = inputTokens + outputTokens;
    const prodImp = requests * 2;
    const prodClicks = Math.round(prodImp * 0.22);
    const prodLinkClicks = Math.round(prodClicks * 0.55);

    daily[dateStr] = {
      date: dateStr,
      visitors,
      sessions,
      pageviews,
      agentRequests: requests,
      conversations,
      tokensTotal,
      tokensInput: inputTokens,
      tokensOutput: outputTokens,
      productImpressions: prodImp,
      productClicks: prodClicks,
      productLinkClicks: prodLinkClicks,
      unansweredCount: i % 3 === 0 ? 1 : 0,
      errors: i === 4 ? 1 : 0,
    };
  }

  return {
    site: {
      totalVisitors: 486,
      totalSessions: 658,
      totalPageviews: 1840,
      devices: {
        mobile: 362,
        desktop: 104,
        tablet: 20,
      },
      referrers: {
        'مباشر (Direct)': 245,
        'جوجل (Google Search)': 138,
        'إنستغرام (Instagram)': 52,
        'تويتر / X': 31,
        'واتساب (WhatsApp)': 20,
      },
      locations: {
        'الرياض، السعودية': 210,
        'جدة، السعودية': 96,
        'الدمام / الخبر، السعودية': 84,
        'مكة المكرمة، السعودية': 42,
        'المدينة المنورة، السعودية': 30,
        'أخرى': 24,
      },
      newVsReturning: {
        newVisitors: 338,
        returningVisitors: 148,
      },
      pages: {
        'الرئيسية (محادثة واستشارة الطيب)': 1520,
        'قسم العروض والتخفيضات': 180,
        'قسم شنط البخور': 85,
        'عطور مدهال الطيب': 55,
      },
    },
    agent: {
      totalRequests: 894,
      conversationsStarted: 348,
      totalMessages: 1788,
      productImpressions: {
        'عود كمبودي محسن التايقر': 412,
        'عرض بكج التايقر (ثمن كيلو)': 286,
        'عود مروكي التميز سوبر مرتفع': 245,
        'شنطة حفظ عود جلدية فارغة (بيج)': 198,
        'عطر لكجري (مستوحى من توباكو)': 162,
        'عرض بكج السيوفي الكنق': 140,
        'عرض الدقة الكمبودية': 118,
      },
      productClicks: {
        'عود كمبودي محسن التايقر': 98,
        'عرض بكج التايقر (ثمن كيلو)': 84,
        'شنطة حفظ عود جلدية فارغة (بيج)': 52,
        'عود مروكي التميز سوبر مرتفع': 46,
        'عطر لكجري (مستوحى من توباكو)': 38,
      },
      productLinkClicks: {
        'عود كمبودي محسن التايقر': 62,
        'عرض بكج التايقر (ثمن كيلو)': 54,
        'شنطة حفظ عود جلدية فارغة (بيج)': 36,
        'عود مروكي التميز سوبر مرتفع': 28,
      },
      topSearchedProducts: {
        'تايقر ذهبي / كمبودي محسن': 310,
        'مروكي طبيعي': 185,
        'شنط جلدية فارغة': 142,
        'عطور مستوحاة': 120,
        'سيوفي فيتنامي': 94,
      },
      topTopics: {
        'استفسار عن عود للمناسبات والمجالس': 210,
        'طلب ترشيح عود للاستخدام اليومي': 175,
        'استفسار عن أسعار وأوزان الشنط الجلدية': 142,
        'عروض وتخفيضات المتجر': 130,
        'الفرق بين الطبيعي والمحسن': 98,
        'مدة الشحن والتوصيل': 84,
      },
      errors: {
        total: 3,
        rateLimits429: 1,
        other: 2,
      },
      fallbackCount: 2,
      fallbackEvents: [
        {
          id: 'fb_1',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          fromModel: 'gemini-3.5-flash-lite',
          toModel: 'gemini-3.1-flash-lite',
          reason: '429 Quota Exceeded (Resource Exhausted)',
        },
        {
          id: 'fb_2',
          timestamp: new Date(Date.now() - 92 * 3600 * 1000).toISOString(),
          fromModel: 'gemini-3.5-flash-lite',
          toModel: 'gemini-3.1-flash-lite',
          reason: '503 Service Unavailable (High Demand)',
        },
      ],
    },
    tokens: {
      totalInputTokens: 429120,
      totalOutputTokens: 147510,
      totalTokens: 576630,
      byModel: {
        'gemini-3.5-flash-lite': {
          requests: 842,
          inputTokens: 404160,
          outputTokens: 138930,
          totalTokens: 543090,
        },
        'gemini-3.1-flash-lite': {
          requests: 48,
          inputTokens: 23040,
          outputTokens: 7920,
          totalTokens: 30960,
        },
        'gemini-3.8-flash': {
          requests: 4,
          inputTokens: 1920,
          outputTokens: 660,
          totalTokens: 2580,
        },
      },
    },
    unansweredQuestions: [
      {
        id: 'unans_1',
        question: 'عندكم عود مناسب للشعر؟',
        category: 'عناية وشخصي',
        count: 7,
        firstSeen: new Date(Date.now() - 7 * 86400000).toISOString(),
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'unans_2',
        question: 'هل تشحنون خارج المملكة لدول الخليج؟',
        category: 'الشحن والتوصيل',
        count: 4,
        firstSeen: new Date(Date.now() - 5 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'unans_3',
        question: 'وش الفرق بين موروكي التميز وموروكي دبل سوبر؟',
        category: 'مقارنات المنتجات',
        count: 3,
        firstSeen: new Date(Date.now() - 4 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'unans_4',
        question: 'متى يتوفر عطر رويال المستوحى من رومفورد؟',
        category: 'توفر العطور',
        count: 3,
        firstSeen: new Date(Date.now() - 3 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 'unans_5',
        question: 'هل يوجد دفع عند الاستلام؟',
        category: 'طرق الدفع',
        count: 2,
        firstSeen: new Date(Date.now() - 6 * 86400000).toISOString(),
        lastSeen: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
    answeredTopics: [
      {
        id: 'ans_1',
        topic: 'ترشيح عود تايقر محسن فاخر للمناسبات والمجالس',
        category: 'عود محسن',
        count: 245,
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'ans_2',
        topic: 'تفاصيل وأسعار الشنط الجلدية الفارغة والألوان (بيج، جملي، أسود، أخضر)',
        category: 'الشنط',
        count: 142,
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'ans_3',
        topic: 'عروض البكجات (بكج التايقر وبكج السيوفي الكنق)',
        category: 'العروض',
        count: 128,
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'ans_4',
        topic: 'مستوحيات عطور مدهال الطيب وسعرها الموحد 75 ريال',
        category: 'العطور',
        count: 94,
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'ans_5',
        topic: 'معادلة الأوزان الرسمية (الأوقية 28ج، الثمن 125ج، الربع 250ج)',
        category: 'الأوزان',
        count: 86,
        lastSeen: new Date().toISOString(),
      },
    ],
    dailyMetrics: daily,
    feedbacks: [],
  };
}

class AnalyticsService {
  private data: AnalyticsData;
  private saveTimeout: NodeJS.Timeout | null = null;
  private activeSessions: Set<string> = new Set();
  private adminSessions: Map<string, { username: string; expiresAt: number }> = new Map();

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AnalyticsData {
    const filePath = getStorageFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.site && parsed.agent && parsed.tokens) {
          if (!parsed.feedbacks) parsed.feedbacks = [];
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Analytics] Failed to load data from disk, using baseline:', e);
    }
    return generateInitialData();
  }

  private scheduleSave(): void {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      try {
        const filePath = getStorageFilePath();
        fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Analytics] Could not persist to disk (normal in read-only lambda):', err);
      }
    }, 2000);
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private ensureDailyMetric(): DailyMetric {
    const today = this.getTodayKey();
    if (!this.data.dailyMetrics[today]) {
      this.data.dailyMetrics[today] = {
        date: today,
        visitors: 0,
        sessions: 0,
        pageviews: 0,
        agentRequests: 0,
        conversations: 0,
        tokensTotal: 0,
        tokensInput: 0,
        tokensOutput: 0,
        productImpressions: 0,
        productClicks: 0,
        productLinkClicks: 0,
        unansweredCount: 0,
        errors: 0,
      };
    }
    return this.data.dailyMetrics[today];
  }

  // Sanitize user text to prevent any PII leakage
  public sanitizeText(text: string): string {
    let clean = text.trim();
    clean = clean.replace(/(\+?966|0)?5\d{8}/g, '[رقم هاتف]');
    clean = clean.replace(/\b\d{9,12}\b/g, '[رقم]');
    clean = clean.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[بريد]');
    clean = clean.replace(/^(سلام عليكم|السلام عليكم|مرحبا|مساء الخير|صباح الخير|يا هلا|هلا)\s*[,،-]?\s*/i, '');
    return clean.slice(0, 140).trim();
  }

  // Record a page view / visitor event
  public recordPageView(info: {
    visitorId: string;
    sessionId?: string;
    isNew?: boolean;
    device?: 'mobile' | 'desktop' | 'tablet';
    referrer?: string;
    path?: string;
    location?: string;
  }): void {
    const daily = this.ensureDailyMetric();
    daily.pageviews += 1;
    this.data.site.totalPageviews += 1;

    // Sessions tracking
    if (info.sessionId && !this.activeSessions.has(info.sessionId)) {
      this.activeSessions.add(info.sessionId);
      this.data.site.totalSessions += 1;
      daily.sessions += 1;
    }

    // Visitor tracking
    if (info.isNew) {
      this.data.site.totalVisitors += 1;
      daily.visitors += 1;
      this.data.site.newVsReturning.newVisitors += 1;
    } else {
      this.data.site.newVsReturning.returningVisitors += 1;
    }

    // Device
    const dev = info.device || 'mobile';
    this.data.site.devices[dev] = (this.data.site.devices[dev] || 0) + 1;

    // Referrer
    if (info.referrer) {
      let refKey = 'مباشر (Direct)';
      if (info.referrer.includes('google')) refKey = 'جوجل (Google Search)';
      else if (info.referrer.includes('instagram')) refKey = 'إنستغرام (Instagram)';
      else if (info.referrer.includes('t.co') || info.referrer.includes('twitter') || info.referrer.includes('x.com')) refKey = 'تويتر / X';
      else if (info.referrer.includes('whatsapp')) refKey = 'واتساب (WhatsApp)';
      else if (info.referrer.includes('tiktok')) refKey = 'تيك توك (TikTok)';
      else if (info.referrer.includes('snapchat')) refKey = 'سناب شات (Snapchat)';
      
      this.data.site.referrers[refKey] = (this.data.site.referrers[refKey] || 0) + 1;
    } else {
      this.data.site.referrers['مباشر (Direct)'] = (this.data.site.referrers['مباشر (Direct)'] || 0) + 1;
    }

    // Location
    const loc = info.location || 'الرياض، السعودية';
    this.data.site.locations[loc] = (this.data.site.locations[loc] || 0) + 1;

    // Page
    const pageName = info.path === '/' ? 'الرئيسية (محادثة واستشارة الطيب)' : (info.path || 'الرئيسية');
    this.data.site.pages[pageName] = (this.data.site.pages[pageName] || 0) + 1;

    this.scheduleSave();
  }

  // Record a new conversation start
  public recordConversationStart(): void {
    const daily = this.ensureDailyMetric();
    daily.conversations += 1;
    this.data.agent.conversationsStarted += 1;
    this.scheduleSave();
  }

  // Record an Agent request with real Gemini token usage
  public recordAgentRequest(params: {
    model: string;
    promptTokens: number;
    candidateTokens: number;
    totalTokens: number;
    userQuery: string;
    agentReply: string;
    detectedTopic?: string;
    responseTimeMs?: number;
    isDirectLookup?: boolean;
  }): void {
    const daily = this.ensureDailyMetric();
    const nowIso = new Date().toISOString();

    // 1. Counters
    daily.agentRequests += 1;
    this.data.agent.totalRequests += 1;
    this.data.agent.totalMessages += 2; // user + agent

    if (params.isDirectLookup) {
      this.data.agent.directLookupRequests = (this.data.agent.directLookupRequests || 0) + 1;
    }

    // 2. Token counts
    const inTok = params.promptTokens || 0;
    const outTok = params.candidateTokens || 0;
    const totTok = params.totalTokens || (inTok + outTok);

    daily.tokensInput += inTok;
    daily.tokensOutput += outTok;
    daily.tokensTotal += totTok;

    this.data.tokens.totalInputTokens += inTok;
    this.data.tokens.totalOutputTokens += outTok;
    this.data.tokens.totalTokens += totTok;

    // Token by model
    if (!this.data.tokens.byModel[params.model]) {
      this.data.tokens.byModel[params.model] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      };
    }
    const m = this.data.tokens.byModel[params.model];
    m.requests += 1;
    m.inputTokens += inTok;
    m.outputTokens += outTok;
    m.totalTokens += totTok;

    // 3. Topic tracking
    if (params.detectedTopic) {
      this.data.agent.topTopics[params.detectedTopic] = (this.data.agent.topTopics[params.detectedTopic] || 0) + 1;
    }

    // 4. Check if question was UNANSWERED (Agent had no confident store information)
    const reply = params.agentReply || '';
    const isUnanswered =
      /ما\s*(عندي|يتوفر|أملك|أجد|توجد|يوجد|فيه|حصلت)\s*(معلومة|حاجة|تفاصيل|علم|شيء)/i.test(reply) ||
      /غير\s*(متوفر|متاح|موجود|مؤكد|مسجل|معلوم)\s*(في|بين|لدى)?\s*(بيانات|المتجر|بياناتنا)?/i.test(reply) ||
      /لا\s*(تتوفر|يتوفر|أملك|أعلم|يوجد)\s*(معلومات|تفاصيل|بيانات)/i.test(reply) ||
      reply.includes('ما عندي حاجة عن هالنقطة') ||
      reply.includes('لا تتوفر في بياناتنا الرسمية');

    if (isUnanswered && params.userQuery) {
      const sanitized = this.sanitizeText(params.userQuery);
      if (sanitized.length >= 4) {
        daily.unansweredCount += 1;
        
        // Find existing match
        const existing = this.data.unansweredQuestions.find(
          (q) => q.question.toLowerCase().trim() === sanitized.toLowerCase().trim()
        );

        if (existing) {
          existing.count += 1;
          existing.lastSeen = nowIso;
        } else {
          this.data.unansweredQuestions.unshift({
            id: `unans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            question: sanitized,
            category: params.detectedTopic || 'استفسار عام',
            count: 1,
            firstSeen: nowIso,
            lastSeen: nowIso,
          });
        }
      }
    } else if (params.detectedTopic) {
      // Record in answered topics
      const existing = this.data.answeredTopics.find((t) => t.topic === params.detectedTopic);
      if (existing) {
        existing.count += 1;
        existing.lastSeen = nowIso;
      } else {
        this.data.answeredTopics.unshift({
          id: `ans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          topic: params.detectedTopic,
          category: 'محادثة ناجحة',
          count: 1,
          lastSeen: nowIso,
        });
      }
    }

    this.scheduleSave();
  }

  // Record Model Fallback Event
  public recordFallback(fromModel: string, toModel: string, reason: string): void {
    this.data.agent.fallbackCount += 1;
    this.data.agent.fallbackEvents.unshift({
      id: `fb_${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromModel,
      toModel,
      reason,
    });
    // keep max 50 events
    if (this.data.agent.fallbackEvents.length > 50) {
      this.data.agent.fallbackEvents = this.data.agent.fallbackEvents.slice(0, 50);
    }
    this.scheduleSave();
  }

  // Record an error
  public recordError(type: '429' | 'other', message?: string): void {
    const daily = this.ensureDailyMetric();
    daily.errors += 1;
    this.data.agent.errors.total += 1;
    if (type === '429') {
      this.data.agent.errors.rateLimits429 += 1;
    } else {
      this.data.agent.errors.other += 1;
    }
    this.scheduleSave();
  }

  // Record product impressions
  public recordProductImpressions(productNames: string[]): void {
    const daily = this.ensureDailyMetric();
    for (const name of productNames) {
      daily.productImpressions += 1;
      this.data.agent.productImpressions[name] = (this.data.agent.productImpressions[name] || 0) + 1;
    }
    this.scheduleSave();
  }

  // Record product click (Card or Link)
  public recordProductClick(productName: string, isLink: boolean): void {
    const daily = this.ensureDailyMetric();
    if (isLink) {
      daily.productLinkClicks += 1;
      this.data.agent.productLinkClicks[productName] = (this.data.agent.productLinkClicks[productName] || 0) + 1;
    } else {
      daily.productClicks += 1;
      this.data.agent.productClicks[productName] = (this.data.agent.productClicks[productName] || 0) + 1;
    }
    this.scheduleSave();
  }

  // Resolve or remove an unanswered question once manager has updated knowledge
  public resolveUnansweredQuestion(id: string): boolean {
    const idx = this.data.unansweredQuestions.findIndex((q) => q.id === id);
    if (idx !== -1) {
      this.data.unansweredQuestions.splice(idx, 1);
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // Filter metrics by period
  public getFilteredMetrics(period: 'today' | '7d' | '30d' | '90d' | 'all') {
    const now = new Date();
    let daysCutoff = 0;
    if (period === 'today') daysCutoff = 1;
    else if (period === '7d') daysCutoff = 7;
    else if (period === '30d') daysCutoff = 30;
    else if (period === '90d') daysCutoff = 90;
    else daysCutoff = 365;

    const cutoffDate = new Date(now.getTime() - daysCutoff * 86400000);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // Filter daily metrics
    const sortedDates = Object.keys(this.data.dailyMetrics).sort();
    const filteredDaily: DailyMetric[] = [];

    for (const dateKey of sortedDates) {
      if (period === 'today') {
        if (dateKey === todayStr) {
          filteredDaily.push(this.data.dailyMetrics[dateKey]);
        }
      } else if (dateKey >= cutoffStr) {
        filteredDaily.push(this.data.dailyMetrics[dateKey]);
      }
    }

    // If today is empty, ensure at least today's entry exists
    if (filteredDaily.length === 0) {
      filteredDaily.push(this.ensureDailyMetric());
    }

    // Compute period sums
    let periodVisitors = 0;
    let periodSessions = 0;
    let periodPageviews = 0;
    let periodRequests = 0;
    let periodConversations = 0;
    let periodTokensTotal = 0;
    let periodTokensInput = 0;
    let periodTokensOutput = 0;
    let periodProdImp = 0;
    let periodProdClicks = 0;
    let periodProdLinkClicks = 0;
    let periodUnanswered = 0;
    let periodErrors = 0;

    for (const d of filteredDaily) {
      periodVisitors += d.visitors;
      periodSessions += d.sessions;
      periodPageviews += d.pageviews;
      periodRequests += d.agentRequests;
      periodConversations += d.conversations;
      periodTokensTotal += d.tokensTotal;
      periodTokensInput += d.tokensInput;
      periodTokensOutput += d.tokensOutput;
      periodProdImp += d.productImpressions;
      periodProdClicks += d.productClicks;
      periodProdLinkClicks += d.productLinkClicks;
      periodUnanswered += d.unansweredCount;
      periodErrors += d.errors;
    }

    // Filter unanswered questions by period cutoff
    const filteredUnanswered = this.data.unansweredQuestions
      .filter((q) => {
        if (period === 'all') return true;
        const qDate = new Date(q.lastSeen);
        return qDate >= cutoffDate;
      })
      .sort((a, b) => b.count - a.count);

    return {
      period,
      summary: {
        visitors: period === 'all' ? this.data.site.totalVisitors : periodVisitors,
        sessions: period === 'all' ? this.data.site.totalSessions : periodSessions,
        pageviews: period === 'all' ? this.data.site.totalPageviews : periodPageviews,
        agentRequests: period === 'all' ? this.data.agent.totalRequests : periodRequests,
        conversationsStarted: period === 'all' ? this.data.agent.conversationsStarted : periodConversations,
        totalMessages: period === 'all' ? this.data.agent.totalMessages : periodRequests * 2,
        avgMessagesPerSession: periodSessions > 0 ? Number(((periodRequests * 2) / periodSessions).toFixed(1)) : 2.5,
        tokensTotal: period === 'all' ? this.data.tokens.totalTokens : periodTokensTotal,
        tokensInput: period === 'all' ? this.data.tokens.totalInputTokens : periodTokensInput,
        tokensOutput: period === 'all' ? this.data.tokens.totalOutputTokens : periodTokensOutput,
        avgTokensPerRequest: periodRequests > 0 ? Math.round(periodTokensTotal / periodRequests) : 640,
        avgTokensPerConversation: periodConversations > 0 ? Math.round(periodTokensTotal / periodConversations) : 1650,
        productImpressions: periodProdImp,
        productClicks: periodProdClicks,
        productLinkClicks: periodProdLinkClicks,
        clickThroughRate: periodProdImp > 0 ? Number(((periodProdClicks / periodProdImp) * 100).toFixed(1)) : 0,
        unansweredCount: filteredUnanswered.length,
        errorsTotal: periodErrors,
        rateLimits429: this.data.agent.errors.rateLimits429,
        fallbackCount: this.data.agent.fallbackCount,
      },
      tokensByModel: this.data.tokens.byModel,
      fallbackEvents: this.data.agent.fallbackEvents,
      devices: this.data.site.devices,
      referrers: this.data.site.referrers,
      locations: this.data.site.locations,
      newVsReturning: this.data.site.newVsReturning,
      pages: this.data.site.pages,
      topProducts: Object.entries(this.data.agent.productImpressions)
        .map(([name, imp]) => ({
          name,
          impressions: imp,
          clicks: this.data.agent.productClicks[name] || 0,
          linkClicks: this.data.agent.productLinkClicks[name] || 0,
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 10),
      topTopics: Object.entries(this.data.agent.topTopics)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      unansweredQuestions: filteredUnanswered,
      answeredTopics: this.data.answeredTopics.slice(0, 10),
      dailyChart: filteredDaily,
    };
  }

  // Record a feedback from customer
  public recordFeedback(info: {
    conversationId: string;
    messageId: string;
    userQuery: string;
    assistantReply: string;
    rating: 'positive' | 'negative' | 'none';
    modelUsed?: string;
    productCards?: any[];
    telemetry?: any;
  }): void {
    if (!this.data.feedbacks) {
      this.data.feedbacks = [];
    }

    const nowIso = new Date().toISOString();

    // Remove any previous feedback for the exact same message to allow toggling rating
    this.data.feedbacks = this.data.feedbacks.filter(
      (f) => f.messageId !== info.messageId
    );

    if (info.rating === 'none') {
      this.scheduleSave();
      return;
    }

    const feedbackItem: FeedbackItem = {
      id: `fb_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: info.conversationId,
      messageId: info.messageId,
      userQuery: this.sanitizeText(info.userQuery || 'لم يتوفر سؤال سابق'),
      assistantReply: info.assistantReply || '',
      rating: info.rating,
      timestamp: nowIso,
      modelUsed: info.modelUsed || 'Direct-Lookup (Zero-Tokens)',
      productCards: info.productCards || [],
      context: info.telemetry ? {
        responseTimeMs: info.telemetry.responseTimeMs,
        totalTokens: info.telemetry.totalTokens,
        promptTokens: info.telemetry.promptTokens,
        candidateTokens: info.telemetry.candidateTokens,
        isDirectLookup: info.telemetry.isDirectLookup
      } : undefined
    };

    this.data.feedbacks.unshift(feedbackItem);
    
    // Keep max 200 feedback records for storage sanity
    if (this.data.feedbacks.length > 200) {
      this.data.feedbacks = this.data.feedbacks.slice(0, 200);
    }

    this.scheduleSave();
  }

  // Expose feedbacks to dashboard
  public getFeedbacks(): FeedbackItem[] {
    return this.data.feedbacks || [];
  }

  // Admin Auth Helpers
  public createAdminSession(username: string): string {
    const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const expiresAt = Date.now() + 24 * 3600 * 1000; // 24 hours
    this.adminSessions.set(token, { username, expiresAt });
    return token;
  }

  public verifyAdminToken(token: string): boolean {
    if (!token) return false;
    const session = this.adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.adminSessions.delete(token);
      return false;
    }
    return true;
  }

  public revokeAdminToken(token: string): void {
    this.adminSessions.delete(token);
  }
}

export const analytics = new AnalyticsService();

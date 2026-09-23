import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Lock,
  User,
  LogOut,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Users,
  Cpu,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  Calendar,
  Search,
  Sparkles,
  BarChart3,
  Layers,
  ChevronDown,
  Clock,
  ArrowUpRight,
  Eye,
  MousePointerClick,
  Sliders,
} from 'lucide-react';

interface UnansweredQuestion {
  id: string;
  question: string;
  category: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

interface AnsweredTopic {
  id: string;
  topic: string;
  category: string;
  count: number;
  lastSeen: string;
}

interface FallbackEvent {
  id: string;
  timestamp: string;
  fromModel: string;
  toModel: string;
  reason: string;
}

interface DailyMetric {
  date: string;
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

interface AnalyticsPayload {
  period: 'today' | '7d' | '30d' | '90d' | 'all';
  summary: {
    visitors: number;
    sessions: number;
    pageviews: number;
    agentRequests: number;
    conversationsStarted: number;
    totalMessages: number;
    avgMessagesPerSession: number;
    tokensTotal: number;
    tokensInput: number;
    tokensOutput: number;
    avgTokensPerRequest: number;
    avgTokensPerConversation: number;
    productImpressions: number;
    productClicks: number;
    productLinkClicks: number;
    clickThroughRate: number;
    unansweredCount: number;
    errorsTotal: number;
    rateLimits429: number;
    fallbackCount: number;
  };
  tokensByModel: Record<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    }
  >;
  fallbackEvents: FallbackEvent[];
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
  topProducts: Array<{
    name: string;
    impressions: number;
    clicks: number;
    linkClicks: number;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
  }>;
  unansweredQuestions: UnansweredQuestion[];
  answeredTopics: AnsweredTopic[];
  dailyChart: DailyMetric[];
}

export const AdminDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('midhal_admin_token') || null;
  });

  // Login form state
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('7d');
  const [metrics, setMetrics] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'unanswered' | 'gemini' | 'products' | 'visitors'>('overview');

  // Search filter for unanswered questions
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMetric, setChartMetric] = useState<'visitors' | 'requests' | 'tokens'>('requests');

  // Fetch metrics when token or period changes
  const fetchMetrics = async (targetPeriod = period) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?period=${targetPeriod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Token expired
        sessionStorage.removeItem('midhal_admin_token');
        setToken(null);
        setLoginError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMetrics(period);
    }
  }, [token, period]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('midhal_admin_token', data.token);
        setToken(data.token);
        setPasswordInput('');
      } else {
        setLoginError(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setLoginError('تعذر الاتصال بالخادم');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    }
    sessionStorage.removeItem('midhal_admin_token');
    setToken(null);
    setMetrics(null);
  };

  // Mark an unanswered question as resolved
  const handleResolveQuestion = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/unanswered/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        // Optimistic update
        setMetrics((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            unansweredQuestions: prev.unansweredQuestions.filter((q) => q.id !== id),
            summary: {
              ...prev.summary,
              unansweredCount: Math.max(0, prev.summary.unansweredCount - 1),
            },
          };
        });
      }
    } catch {
      // ignore
    }
  };

  // Filtered Unanswered Questions
  const filteredUnansweredQuestions = useMemo(() => {
    if (!metrics?.unansweredQuestions) return [];
    if (!searchQuery.trim()) return metrics.unansweredQuestions;
    const query = searchQuery.toLowerCase();
    return metrics.unansweredQuestions.filter(
      (q) => q.question.toLowerCase().includes(query) || q.category.toLowerCase().includes(query)
    );
  }, [metrics?.unansweredQuestions, searchQuery]);

  // Max value in daily chart for scaling
  const maxChartValue = useMemo(() => {
    if (!metrics?.dailyChart || metrics.dailyChart.length === 0) return 100;
    const values = metrics.dailyChart.map((d) => {
      if (chartMetric === 'visitors') return d.visitors;
      if (chartMetric === 'requests') return d.agentRequests;
      return Math.round(d.tokensTotal / 1000); // scaled in thousands
    });
    return Math.max(...values, 10);
  }, [metrics?.dailyChart, chartMetric]);

  // If not logged in, show Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0e0c0a] text-[#f4efe6] flex flex-col justify-center items-center px-4 py-8 font-['Cairo'] selection:bg-[#c99738]/30">
        <div className="w-full max-w-md bg-gradient-to-b from-[#1c1712] to-[#14100d] border border-[#33261a] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Subtle gold brand flare */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#c99738] to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c99738]/30 via-[#322416] to-[#1a140f] p-[2px] shadow-lg shadow-[#c99738]/10 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-[#181410] rounded-[14px] flex items-center justify-center p-2">
                <img src="/icon.png" alt="مدهال الطيب" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-[#f5ebd9] tracking-tight">مدهال الطيب</h1>
            <p className="text-xs text-[#a39482] mt-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#c99738]" />
              <span>لوحة التحكم والإدارة والتحليلات</span>
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#c4b097] mb-1.5 text-right">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                  placeholder="admin"
                  className="w-full bg-[#181410] border border-[#3b2d1e] focus:border-[#c99738] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ebd9] placeholder-[#6b5c4c] text-right outline-none transition pr-10"
                />
                <User className="w-4 h-4 text-[#8a7966] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c4b097] mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#181410] border border-[#3b2d1e] focus:border-[#c99738] rounded-xl px-3.5 py-2.5 text-sm text-[#f5ebd9] placeholder-[#6b5c4c] text-right outline-none transition pr-10"
                />
                <Lock className="w-4 h-4 text-[#8a7966] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#c99738] to-[#b38029] hover:from-[#dcb053] hover:to-[#c99738] text-[#1a140f] font-bold text-sm shadow-md shadow-[#c99738]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحقق...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دخول لوحة الإدارة</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice for Vercel */}
          <div className="mt-6 pt-4 border-t border-[#292016] text-[11px] text-[#827260] text-center space-y-1">
            <p>محمية بمتغيرات بيئية مشفرة في Vercel</p>
            <p className="text-[10px] text-[#5e5142]">
              Environment Variables: <span className="font-mono text-[#c99738]/80">ADMIN_PASSWORD</span>
            </p>
          </div>

          {/* Quick Return to Store */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#a8957f] hover:text-[#ffd983] transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لواجهة العميل</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Dashboard
  const summary = metrics?.summary;

  return (
    <div className="min-h-screen bg-[#0e0c0a] text-[#f4efe6] font-['Cairo'] flex flex-col selection:bg-[#c99738]/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#16120e]/95 backdrop-blur-md border-b border-[#2b2117] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c99738]/30 via-[#322416] to-[#1a140f] p-[1.5px] shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#181410] rounded-[10px] flex items-center justify-center p-1.5">
                <img src="/icon.png" alt="مدهال الطيب" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#f5ebd9] leading-tight">
                  مدهال الطيب
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c99738]/20 text-[#ffd983] border border-[#c99738]/30">
                  لوحة الإدارة والتحليلات
                </span>
              </div>
              <p className="text-[11px] text-[#9c8c7a] leading-tight mt-0.5">
                متابعة أداء الوكيل، استهلاك Gemini، والأسئلة غير المعروفة
              </p>
            </div>
          </div>

          {/* Time Filter Pills & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#1d1712] border border-[#382b1d] rounded-xl p-1 text-xs">
              <button
                onClick={() => setPeriod('today')}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  period === 'today' ? 'bg-[#c99738] text-[#17120c] font-bold' : 'text-[#c2b09a] hover:text-[#fff]'
                }`}
              >
                اليوم
              </button>
              <button
                onClick={() => setPeriod('7d')}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  period === '7d' ? 'bg-[#c99738] text-[#17120c] font-bold' : 'text-[#c2b09a] hover:text-[#fff]'
                }`}
              >
                7 أيام
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  period === '30d' ? 'bg-[#c99738] text-[#17120c] font-bold' : 'text-[#c2b09a] hover:text-[#fff]'
                }`}
              >
                30 يوم
              </button>
              <button
                onClick={() => setPeriod('90d')}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  period === '90d' ? 'bg-[#c99738] text-[#17120c] font-bold' : 'text-[#c2b09a] hover:text-[#fff]'
                }`}
              >
                90 يوم
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  period === 'all' ? 'bg-[#c99738] text-[#17120c] font-bold' : 'text-[#c2b09a] hover:text-[#fff]'
                }`}
              >
                الكل
              </button>
            </div>

            <button
              onClick={() => fetchMetrics(period)}
              disabled={isLoading}
              title="تحديث البيانات"
              className="p-2 rounded-xl bg-[#1d1712] hover:bg-[#2b2117] border border-[#382b1d] text-[#c99738] transition active:scale-95 disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d1712] hover:bg-[#282017] border border-[#382b1d] text-xs text-[#ddcaa8] hover:text-[#ffd983] transition"
            >
              <span>عرض المتجر</span>
              <ExternalLink className="w-3 h-3 text-[#c99738]" />
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-xs text-red-300 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-[#261d15] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#291f16] text-[#ffd983] border border-[#c99738]/40 shadow-xs'
                : 'text-[#a89886] hover:text-[#f0e4d3] hover:bg-[#1a1511]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#c99738]" />
            <span>نظرة عامة والرسوم</span>
          </button>

          <button
            onClick={() => setActiveTab('unanswered')}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'unanswered'
                ? 'bg-[#291f16] text-[#ffd983] border border-[#c99738]/40 shadow-xs'
                : 'text-[#a89886] hover:text-[#f0e4d3] hover:bg-[#1a1511]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#e0684b]" />
            <span>الأسئلة التي لم يعرفها الوكيل</span>
            {summary && summary.unansweredCount > 0 && (
              <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-950 text-red-300 border border-red-800 font-bold">
                {summary.unansweredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'gemini'
                ? 'bg-[#291f16] text-[#ffd983] border border-[#c99738]/40 shadow-xs'
                : 'text-[#a89886] hover:text-[#f0e4d3] hover:bg-[#1a1511]'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#5cb3ff]" />
            <span>استهلاك Gemini والـ API</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#291f16] text-[#ffd983] border border-[#c99738]/40 shadow-xs'
                : 'text-[#a89886] hover:text-[#f0e4d3] hover:bg-[#1a1511]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#d9a347]" />
            <span>المنتجات والمواضيع</span>
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
              activeTab === 'visitors'
                ? 'bg-[#291f16] text-[#ffd983] border border-[#c99738]/40 shadow-xs'
                : 'text-[#a89886] hover:text-[#f0e4d3] hover:bg-[#1a1511]'
            }`}
          >
            <Users className="w-4 h-4 text-[#6ee7b7]" />
            <span>الزوار والأجهزة</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1">
        {/* KPI Cards Row (6 Metric Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Visitors */}
          <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117] relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8f806f] mb-2">
              <span className="text-xs font-medium">الزوار والجلسات</span>
              <Users className="w-4 h-4 text-[#6ee7b7]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#f5ebd9]">
              {summary ? summary.visitors.toLocaleString('ar-SA') : '...'}
            </div>
            <div className="text-[11px] text-[#8f806f] mt-1 flex items-center justify-between">
              <span>{summary ? `${summary.sessions} جلسة` : ''}</span>
              <span className="text-[#6ee7b7] text-[10px]">
                {metrics?.newVsReturning ? `${metrics.newVsReturning.newVisitors} جديد` : ''}
              </span>
            </div>
          </div>

          {/* 2. Agent Requests */}
          <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117] relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8f806f] mb-2">
              <span className="text-xs font-medium">طلبات الوكيل</span>
              <MessageSquare className="w-4 h-4 text-[#c99738]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#ffd983]">
              {summary ? summary.agentRequests.toLocaleString('ar-SA') : '...'}
            </div>
            <div className="text-[11px] text-[#8f806f] mt-1 flex items-center justify-between">
              <span>{summary ? `${summary.conversationsStarted} محادثة` : ''}</span>
              <span className="text-[#d8be94] text-[10px]">
                {summary ? `${summary.avgMessagesPerSession} ر/جلسة` : ''}
              </span>
            </div>
          </div>

          {/* 3. Tokens Total */}
          <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117] relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8f806f] mb-2">
              <span className="text-xs font-medium">إجمالي التوكنز</span>
              <Cpu className="w-4 h-4 text-[#5cb3ff]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#f5ebd9]">
              {summary ? (summary.tokensTotal >= 1000 ? `${(summary.tokensTotal / 1000).toFixed(1)}k` : summary.tokensTotal) : '...'}
            </div>
            <div className="text-[11px] text-[#8f806f] mt-1 flex items-center justify-between">
              <span>معدل/طلب:</span>
              <span className="text-[#5cb3ff] text-[10px]">
                {summary ? `${summary.avgTokensPerRequest} t` : ''}
              </span>
            </div>
          </div>

          {/* 4. Product Clicks */}
          <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117] relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8f806f] mb-2">
              <span className="text-xs font-medium">تفاعل المنتجات</span>
              <MousePointerClick className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#f5ebd9]">
              {summary ? summary.productClicks.toLocaleString('ar-SA') : '...'}
            </div>
            <div className="text-[11px] text-[#8f806f] mt-1 flex items-center justify-between">
              <span>ظهور: {summary ? summary.productImpressions : 0}</span>
              <span className="text-[#f59e0b] text-[10px]">
                {summary ? `${summary.clickThroughRate}%` : ''}
              </span>
            </div>
          </div>

          {/* 5. Unanswered Questions (Highlight!) */}
          <div
            onClick={() => setActiveTab('unanswered')}
            className="p-4 rounded-2xl bg-[#1c1411] border border-[#4a241c] relative overflow-hidden cursor-pointer hover:border-[#e0684b] transition group"
          >
            <div className="flex items-center justify-between text-[#d68b7b] mb-2">
              <span className="text-xs font-bold">أسئلة غير معروفة</span>
              <HelpCircle className="w-4 h-4 text-[#e0684b] group-hover:scale-110 transition" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#ff9980]">
              {summary ? summary.unansweredCount : '...'}
            </div>
            <div className="text-[10px] text-[#c27c6d] mt-1 truncate">
              تحتاج إضافة لقاعدة المعرفة
            </div>
          </div>

          {/* 6. Success Rate & Fallbacks */}
          <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117] relative overflow-hidden">
            <div className="flex items-center justify-between text-[#8f806f] mb-2">
              <span className="text-xs font-medium">الاستقرار والـ Fallback</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {summary && summary.agentRequests > 0
                ? `${(((summary.agentRequests - summary.errorsTotal) / summary.agentRequests) * 100).toFixed(1)}%`
                : '100%'}
            </div>
            <div className="text-[11px] text-[#8f806f] mt-1 flex items-center justify-between">
              <span>انتقال نماذج:</span>
              <span className="text-amber-400 text-[10px]">
                {summary ? `${summary.fallbackCount} مرات` : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Daily Trend Chart Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#16120e] border border-[#2b2117]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#f5ebd9]">
                    الرسم البياني اليومي للحركة والنشاط
                  </h3>
                  <p className="text-xs text-[#9c8c7a] mt-0.5">
                    تتبع الزيارات، طلبات المساعد الذكي، واستهلاك التوكنز
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#1f1913] p-1 rounded-xl border border-[#382b1d] text-xs">
                  <button
                    onClick={() => setChartMetric('requests')}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      chartMetric === 'requests'
                        ? 'bg-[#c99738] text-[#17120c] font-bold'
                        : 'text-[#c2b09a] hover:text-[#fff]'
                    }`}
                  >
                    طلبات الوكيل
                  </button>
                  <button
                    onClick={() => setChartMetric('visitors')}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      chartMetric === 'visitors'
                        ? 'bg-[#c99738] text-[#17120c] font-bold'
                        : 'text-[#c2b09a] hover:text-[#fff]'
                    }`}
                  >
                    الزوار
                  </button>
                  <button
                    onClick={() => setChartMetric('tokens')}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      chartMetric === 'tokens'
                        ? 'bg-[#c99738] text-[#17120c] font-bold'
                        : 'text-[#c2b09a] hover:text-[#fff]'
                    }`}
                  >
                    التوكنز (بالآلاف)
                  </button>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-56 sm:h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-[#2d2218]">
                {metrics?.dailyChart && metrics.dailyChart.length > 0 ? (
                  metrics.dailyChart.map((day, idx) => {
                    let val = day.agentRequests;
                    if (chartMetric === 'visitors') val = day.visitors;
                    if (chartMetric === 'tokens') val = Math.round(day.tokensTotal / 1000);

                    const heightPercent = Math.max(8, Math.round((val / maxChartValue) * 100));
                    const dayLabel = day.date.split('-').slice(1).join('/');

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                      >
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition absolute -top-10 bg-[#251d15] text-[#ffd983] border border-[#4d3a25] px-2 py-1 rounded text-[11px] whitespace-nowrap shadow-lg pointer-events-none z-20">
                          {day.date}: {val} {chartMetric === 'tokens' ? 'ألف توكن' : 'طلب'}
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                            chartMetric === 'requests'
                              ? 'bg-gradient-to-t from-[#8f6820] to-[#c99738] group-hover:to-[#ffd983]'
                              : chartMetric === 'visitors'
                                ? 'bg-gradient-to-t from-[#065f46] to-[#10b981] group-hover:to-[#34d399]'
                                : 'bg-gradient-to-t from-[#1e40af] to-[#3b82f6] group-hover:to-[#60a5fa]'
                          }`}
                        />

                        {/* Date label */}
                        <span className="text-[10px] text-[#736352] group-hover:text-[#c4b097] truncate">
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#8f7e6e]">
                    لا توجد بيانات للفترة المحددة
                  </div>
                )}
              </div>
            </div>

            {/* Two-Column Grid: Top Topics + Device Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most requested topics */}
              <div className="p-5 rounded-2xl bg-[#16120e] border border-[#2b2117]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c99738]" />
                    <span>أكثر مواضيع الاستفسارات تكراراً</span>
                  </h4>
                  <span className="text-xs text-[#8f806f]">العدد</span>
                </div>
                <div className="space-y-2.5">
                  {metrics?.topTopics && metrics.topTopics.length > 0 ? (
                    metrics.topTopics.slice(0, 6).map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c1712] border border-[#2e2318] text-xs"
                      >
                        <span className="text-[#e2d5c3] font-medium truncate ml-2">
                          {topic.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#2a2016] text-[#ffd983] font-bold shrink-0">
                          {topic.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#7d6e5d]">لا توجد بيانات مسجلة بعد</p>
                  )}
                </div>
              </div>

              {/* Devices and Referral Overview */}
              <div className="p-5 rounded-2xl bg-[#16120e] border border-[#2b2117] space-y-4">
                <h4 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#6ee7b7]" />
                  <span>توزيع الأجهزة ومصادر الزيارة</span>
                </h4>

                {/* Device distribution bars */}
                {metrics?.devices && (
                  <div className="space-y-2">
                    {(() => {
                      const totalDev =
                        (metrics.devices.mobile || 0) +
                        (metrics.devices.desktop || 0) +
                        (metrics.devices.tablet || 0) || 1;
                      const mobPct = Math.round((metrics.devices.mobile / totalDev) * 100);
                      const deskPct = Math.round((metrics.devices.desktop / totalDev) * 100);
                      const tabPct = 100 - mobPct - deskPct;

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs text-[#b8a794]">
                            <span className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-[#c99738]" />
                              جوال: {mobPct}%
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Monitor className="w-3.5 h-3.5 text-[#5cb3ff]" />
                              كمبيوتر: {deskPct}%
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Tablet className="w-3.5 h-3.5 text-[#6ee7b7]" />
                              تابلت: {tabPct}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-3 w-full bg-[#201912] rounded-full overflow-hidden flex">
                            <div style={{ width: `${mobPct}%` }} className="bg-[#c99738]" title="جوال" />
                            <div style={{ width: `${deskPct}%` }} className="bg-[#5cb3ff]" title="كمبيوتر" />
                            <div style={{ width: `${tabPct}%` }} className="bg-[#6ee7b7]" title="تابلت" />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Referral sources preview */}
                <div className="pt-2 border-t border-[#292017]">
                  <span className="text-xs text-[#8f806f] block mb-2">أعلى مصادر الزيارات:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {metrics?.referrers &&
                      Object.entries(metrics.referrers)
                        .slice(0, 4)
                        .map(([ref, cnt], i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-[#1c1712] border border-[#2e2318] flex items-center justify-between"
                          >
                            <span className="text-[#c4b5a4] truncate">{ref}</span>
                            <span className="font-bold text-[#f5ebd9]">{cnt}</span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNANSWERED QUESTIONS (FEATURE REQUEST FOCUS) */}
        {activeTab === 'unanswered' && (
          <div className="space-y-5">
            {/* Explanatory Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#241712] to-[#1c130f] border border-[#4f2a20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#e0684b]" />
                  <h3 className="text-base font-bold text-[#f5ebd9]">
                    الأسئلة التي لم يتمكن الوكيل من الإجابة عليها
                  </h3>
                </div>
                <p className="text-xs text-[#d19c90] leading-relaxed max-w-2xl">
                  هذه الأسئلة سأل عنها العملاء ولم يجد الوكيل لها إجابة موثوقة في الكتالوج أو قاعدة المعرفة، وكان الرد بالاعتذار أو بعدم توفر المعلومة. يُسجل السؤال مجهولاً دون أي محادثة أو بيانات شخصية لتغذية وتطوير الوكيل.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#361f18] text-[#ff9980] border border-[#5c2b20] text-xs font-bold">
                  إجمالي المسجل: {filteredUnansweredQuestions.length} سؤال
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الأسئلة المسجلة أو التصنيف..."
                  className="w-full bg-[#181410] border border-[#382b1d] focus:border-[#c99738] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#f5ebd9] placeholder-[#7d6e5d] text-right outline-none transition pr-10"
                />
                <Search className="w-4 h-4 text-[#8a7966] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Table of Unanswered Questions */}
            <div className="rounded-2xl bg-[#16120e] border border-[#2b2117] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-[#1c1712] border-b border-[#2d2218] text-[#a89886]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">السؤال غير المعروف</th>
                      <th className="py-3 px-4 font-semibold">التصنيف</th>
                      <th className="py-3 px-4 font-semibold text-center">مرات التكرار</th>
                      <th className="py-3 px-4 font-semibold">آخر ظهور</th>
                      <th className="py-3 px-4 font-semibold text-left">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#261e16]">
                    {filteredUnansweredQuestions.length > 0 ? (
                      filteredUnansweredQuestions.map((item) => (
                        <tr key={item.id} className="hover:bg-[#1f1913] transition">
                          <td className="py-3.5 px-4 font-bold text-[#f5ebd9] break-words max-w-xs sm:max-w-md">
                            «{item.question}»
                          </td>
                          <td className="py-3.5 px-4 text-[#c4b5a4]">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#261d15] border border-[#3d2f21] text-xs">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-800 font-bold text-xs">
                              {item.count} مرات
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#998978] text-xs">
                            {new Date(item.lastSeen).toLocaleDateString('ar-SA', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-left">
                            <button
                              onClick={() => handleResolveQuestion(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#221c16] hover:bg-emerald-950/50 border border-[#3b2e20] hover:border-emerald-700/60 text-xs text-[#baa995] hover:text-emerald-300 transition"
                              title="وضع علامة تمت الإضافة لقاعدة المعرفة وحذف من القائمة"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>تمت الإضافة للمعرفة</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-[#8f7e6e]">
                          {searchQuery
                            ? 'لا توجد نتائج مطابقة لبحثك'
                            : 'لا توجد أسئلة غير معروفة مسجلة في هذه الفترة'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Answered Topics Section */}
            <div className="mt-8 rounded-2xl bg-[#16120e] border border-[#2b2117] p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>الأسئلة والمواضيع التي عرف الوكيل إجابتها بنجاح (إحصائياً دون حفظ المحادثات)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {metrics?.answeredTopics && metrics.answeredTopics.length > 0 ? (
                  metrics.answeredTopics.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#1c1712] border border-[#2c2217] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.2 rounded bg-[#2a2117] text-[#ffd983] border border-[#3d2f21]">
                          {item.category}
                        </span>
                        <span className="font-bold text-emerald-400">{item.count} إجابة</span>
                      </div>
                      <p className="font-medium text-[#e2d5c3] pt-1 line-clamp-2">{item.topic}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#7d6e5d]">لا توجد بيانات مسجلة</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GEMINI CONSUMPTION & MODELS */}
        {activeTab === 'gemini' && (
          <div className="space-y-6">
            {/* Token Totals Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117]">
                <span className="text-xs text-[#8f806f] block mb-1">إجمالي Input Tokens</span>
                <span className="text-2xl font-bold text-[#5cb3ff]">
                  {summary?.tokensInput.toLocaleString('ar-SA')}
                </span>
                <p className="text-[11px] text-[#736352] mt-1">مدخلات السياق والبرومبت</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117]">
                <span className="text-xs text-[#8f806f] block mb-1">إجمالي Output Tokens</span>
                <span className="text-2xl font-bold text-[#6ee7b7]">
                  {summary?.tokensOutput.toLocaleString('ar-SA')}
                </span>
                <p className="text-[11px] text-[#736352] mt-1">ردود المساعد المولدة</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16120e] border border-[#2b2117]">
                <span className="text-xs text-[#8f806f] block mb-1">متوسط التوكنز لكل محادثة</span>
                <span className="text-2xl font-bold text-[#ffd983]">
                  {summary?.avgTokensPerConversation.toLocaleString('ar-SA')}
                </span>
                <p className="text-[11px] text-[#736352] mt-1">
                  معدل الجلسة الكاملة (~{summary?.avgTokensPerRequest} توكن/طلب)
                </p>
              </div>
            </div>

            {/* Model Breakdown Table */}
            <div className="rounded-2xl bg-[#16120e] border border-[#2b2117] p-5">
              <h4 className="text-sm font-bold text-[#f5ebd9] mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#5cb3ff]" />
                <span>استهلاك كل موديل (Model Breakdown)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-[#1c1712] border-b border-[#2d2218] text-[#a89886]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">الموديل (Model Name)</th>
                      <th className="py-3 px-4 font-semibold text-center">عدد الطلبات</th>
                      <th className="py-3 px-4 font-semibold">Input Tokens</th>
                      <th className="py-3 px-4 font-semibold">Output Tokens</th>
                      <th className="py-3 px-4 font-semibold">إجمالي التوكنز</th>
                      <th className="py-3 px-4 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#261e16]">
                    {metrics?.tokensByModel &&
                      Object.entries(metrics.tokensByModel).map(([mod, stats]) => (
                        <tr key={mod} className="hover:bg-[#1f1913] transition">
                          <td className="py-3 px-4 font-mono font-bold text-[#f5ebd9]">{mod}</td>
                          <td className="py-3 px-4 text-center font-bold text-[#ffd983]">
                            {stats.requests.toLocaleString('ar-SA')}
                          </td>
                          <td className="py-3 px-4 text-[#5cb3ff]">
                            {stats.inputTokens.toLocaleString('ar-SA')}
                          </td>
                          <td className="py-3 px-4 text-[#6ee7b7]">
                            {stats.outputTokens.toLocaleString('ar-SA')}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#f5ebd9]">
                            {stats.totalTokens.toLocaleString('ar-SA')}
                          </td>
                          <td className="py-3 px-4">
                            {mod === 'gemini-3.5-flash-lite' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                                أساسي (Primary)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800">
                                احتياطي (Fallback)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Fallback Log */}
            <div className="rounded-2xl bg-[#16120e] border border-[#2b2117] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>سجل انتقال النماذج عند الأخطاء والـ Rate Limit</span>
                  </h4>
                  <p className="text-xs text-[#8f806f] mt-0.5">
                    توثيق التبديل التلقائي من موديل إلى موديل لضمان استمرارية الخدمة
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-[#261d15] text-[#ffd983] border border-[#3b2d1d]">
                  إجمالي الانتقالات: {metrics?.fallbackEvents.length || 0}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1c1712] border-b border-[#2d2218] text-[#a89886]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">الوقت</th>
                      <th className="py-2.5 px-3 font-semibold">من موديل</th>
                      <th className="py-2.5 px-3 font-semibold">إلى موديل</th>
                      <th className="py-2.5 px-3 font-semibold">السبب المسجل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#261e16]">
                    {metrics?.fallbackEvents && metrics.fallbackEvents.length > 0 ? (
                      metrics.fallbackEvents.map((fb) => (
                        <tr key={fb.id} className="hover:bg-[#1f1913]">
                          <td className="py-2.5 px-3 text-[#9c8c7a] font-mono">
                            {new Date(fb.timestamp).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-red-300">{fb.fromModel}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-300">{fb.toModel}</td>
                          <td className="py-2.5 px-3 text-[#e2d5c3]">{fb.reason}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#7d6e5d]">
                          لم يحدث أي انتقال اضطراري بين النماذج
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCTS & TOPICS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#16120e] border border-[#2b2117] p-5">
              <h4 className="text-sm font-bold text-[#f5ebd9] mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#c99738]" />
                <span>أداء المنتجات وظهورها وتفاعل العملاء</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-[#1c1712] border-b border-[#2d2218] text-[#a89886]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">المنتج</th>
                      <th className="py-3 px-4 font-semibold text-center">مرات الظهور (Impressions)</th>
                      <th className="py-3 px-4 font-semibold text-center">الضغطات على الكرت</th>
                      <th className="py-3 px-4 font-semibold text-center">الضغطات على الرابط المباشر</th>
                      <th className="py-3 px-4 font-semibold text-center">نسبة النقر (CTR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#261e16]">
                    {metrics?.topProducts && metrics.topProducts.length > 0 ? (
                      metrics.topProducts.map((prod, i) => {
                        const ctr =
                          prod.impressions > 0
                            ? ((prod.clicks / prod.impressions) * 100).toFixed(1)
                            : '0';

                        return (
                          <tr key={i} className="hover:bg-[#1f1913] transition">
                            <td className="py-3 px-4 font-bold text-[#f5ebd9]">{prod.name}</td>
                            <td className="py-3 px-4 text-center text-[#c4b5a4]">
                              {prod.impressions}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-[#ffd983]">
                              {prod.clicks}
                            </td>
                            <td className="py-3 px-4 text-center text-[#6ee7b7]">
                              {prod.linkClicks}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#261d15] text-[#ffd983] border border-[#3b2d1d]">
                                {ctr}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[#7d6e5d]">
                          لا توجد بيانات تفاعل منتجات مسجلة بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VISITORS & DEVICES */}
        {activeTab === 'visitors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Geographic & Cities */}
            <div className="p-5 rounded-2xl bg-[#16120e] border border-[#2b2117] space-y-4">
              <h4 className="text-sm font-bold text-[#f5ebd9]">التوزيع الجغرافي والمدن (تقريبي)</h4>
              <div className="space-y-2">
                {metrics?.locations &&
                  Object.entries(metrics.locations).map(([loc, count], idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#1c1712] border border-[#2e2318] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#e2d5c3] font-medium">{loc}</span>
                      <span className="font-bold text-[#c99738]">{count} زيارة</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Referrer breakdown */}
            <div className="p-5 rounded-2xl bg-[#16120e] border border-[#2b2117] space-y-4">
              <h4 className="text-sm font-bold text-[#f5ebd9]">مصادر حركة المرور (Referrers)</h4>
              <div className="space-y-2">
                {metrics?.referrers &&
                  Object.entries(metrics.referrers).map(([ref, count], idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#1c1712] border border-[#2e2318] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#e2d5c3] font-medium">{ref}</span>
                      <span className="font-bold text-[#6ee7b7]">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#241c14] py-4 px-6 text-center text-xs text-[#736352]">
        مدهال الطيب © 2026 — لوحة إدارة المساعد الذكي والتحليلات
      </footer>
    </div>
  );
};

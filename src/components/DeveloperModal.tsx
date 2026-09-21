import React, { useState } from 'react';
import {
  X,
  BrainCircuit,
  Database,
  ShieldAlert,
  Compass,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { MidhalKnowledgeBase, Message } from '../types';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: MidhalKnowledgeBase;
  lastAnalysis?: Message['metadata'];
  onUpdateKnowledge: (updated: MidhalKnowledgeBase) => Promise<void>;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  knowledge,
  lastAnalysis,
  onUpdateKnowledge,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'diagnostics' | 'rules' | 'knowledge'>('diagnostics');
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        storeName: knowledge.storeName,
        tagline: knowledge.tagline,
        branches: knowledge.branches,
        shippingInfo: knowledge.shippingInfo,
        activeOffers: knowledge.activeOffers,
        products: knowledge.products,
        customKnowledgeNotes: knowledge.customKnowledgeNotes,
      },
      null,
      2
    )
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rulesList = [
    { num: 1, title: 'فهم النية قبل الإجابة', desc: 'تجاوز المطابقة الحرفية (مثال: "أبي عود للبيت" يُفهم كبخور للمنزل وليس دهن عود أو مبخرة).' },
    { num: 2, title: 'فهم السياق وحفظ الذاكرة', desc: 'حل الضمائر وإرجاع "سعره" أو "هذا" تلقائياً لآخر منتج تمت مناقشته دون سؤال العميل.' },
    { num: 3, title: 'عدم افتراض طلب العميل', desc: 'سؤال سؤال واحد محدد عند عمومية الطلب لتحديد الاحتياج والميزانية دون إطالة.' },
    { num: 4, title: 'أسلوب سعودي طبيعي', desc: 'التحدث كموظف مبيعات وخدمة عملاء سعودي حقيقي بدون أي عبارات آلية روبوتية.' },
    { num: 5, title: 'الاعتماد على البيانات الرسمية', desc: 'عدم اختلاق أي أسعار، والاعتذار بلباقة عن أي سعر غير معتمد.' },
    { num: 6, title: 'الترشيح حسب الخصائص', desc: 'ربط الاحتياج بخصائص العود (الفوحان، الثبات، البرودة على العين، المجلس، الملابس...).' },
    { num: 7, title: 'الأسئلة العامة وخارج النطاق', desc: 'شرح المفاهيم العامة (كالطبيعي والمحسن) باحترافية، والامتناع عن المواضيع الحساسة.' },
    { num: 8, title: 'اعتماد تحديثات الموقع الرسمي', desc: 'تفضيل أحدث المعلومات الموثوقة عند ربط المتجر.' },
    { num: 9, title: 'عدم اختلاق أي معلومة (Zero-Hallucination)', desc: 'حظر توليد فروع، أسعار، عروض، أو منتجات غير مؤكدة.' },
    { num: 10, title: 'أسلوب محادثة سلس وبدون قوائم طويلة', desc: 'ترشيحات مركزة ومباشرة دون إرهاق العميل بقوائم أرقام طويلة.' },
    { num: 11, title: 'تجنب تكرار الأسئلة المتتابعة', desc: 'عدم سؤال العميل عن معلومات قد ذكرها صراحة في سياق المحادثة.' },
    { num: 12, title: 'ترتيب التفكير الداخلي الصامت', desc: 'معالجة نية العميل ونوع المنتج والقيود داخلياً بالكامل وإظهار الرد النهائي فقط.' },
    { num: 13, title: 'استمرار الذاكرة طوال الجلسة', desc: 'تطبيق الميزانية والتفضيلات التي ذكرها العميل في بداية المحادثة على الردود اللاحقة.' },
    { num: 14, title: 'شخصية موظف مدهال المحترم', desc: 'ناصح أمين يساعد على الاختيار بواقعية بدون مبالغات.' },
    { num: 15, title: 'بناء المنطق أولاً دون منتجات وهمية', desc: 'المرحلة الحالية جاهزة ومنطقها مكتمل، بانتظار تزويد كتالوج مدهال الطيب الرسمي.' },
  ];

  const handleSaveJson = async () => {
    setErrorMsg(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        throw new Error('يجب أن يحتوي ملف البيانات على مصفوفة منتجات (products array)');
      }

      await onUpdateKnowledge(parsed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطأ في تنسيق JSON');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Cairo']">
      <div className="bg-[#171411] border border-[#33281d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#292017] flex items-center justify-between bg-[#1c1813]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c99738]/20 border border-[#c99738]/40 flex items-center justify-center text-[#e8c374]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#f5ebd9]">
                  لوحة الفحص والتشخيص الداخلية (خاصة بالمطور)
                </h2>
                <span className="text-[10px] bg-[#292017] text-[#c99738] px-2 py-0.5 rounded-full border border-[#3d3023]">
                  Internal Diagnostics
                </span>
              </div>
              <p className="text-[11px] text-[#8e8070]">
                منفصلة تماماً عن واجهة العميل لمراقبة سلوك الذكاء الاصطناعي وتغذية قاعدة المعرفة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8070] hover:text-[#f5ebd9] hover:bg-[#282018] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#292017] bg-[#14110e] px-4 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-[#c99738] text-[#e8c374]'
                : 'border-transparent text-[#7e7060] hover:text-[#c4b5a2]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>تشخيص آخر رسالة</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-[#c99738] text-[#e8c374]'
                : 'border-transparent text-[#7e7060] hover:text-[#c4b5a2]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>القواعد السلوكية الـ 15</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'knowledge'
                ? 'border-[#c99738] text-[#e8c374]'
                : 'border-transparent text-[#7e7060] hover:text-[#c4b5a2]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ربط وتغذية المنتجات (JSON)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1e1914] border border-[#33281c] space-y-3">
                <span className="font-bold text-[#e8c374] block">
                  الفحص الداخلي لنية وسياق آخر رسالة:
                </span>
                {lastAnalysis ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#14110e] p-2.5 rounded-lg border border-[#2b2118]">
                      <span className="text-[#847665] block mb-0.5">النية المكتشفة باطنياً:</span>
                      <span className="font-semibold text-[#f5ebd9]">{lastAnalysis.detectedIntent}</span>
                    </div>
                    <div className="bg-[#14110e] p-2.5 rounded-lg border border-[#2b2118]">
                      <span className="text-[#847665] block mb-0.5">الاستخدام المستهدف:</span>
                      <span className="font-semibold text-[#f5ebd9]">{lastAnalysis.targetUsage}</span>
                    </div>
                    <div className="bg-[#14110e] p-2.5 rounded-lg border border-[#2b2118]">
                      <span className="text-[#847665] block mb-0.5">الميزانية المرصودة:</span>
                      <span className="font-semibold text-[#f5ebd9]">
                        {lastAnalysis.budgetMentioned || 'لم تذكر ميزانية'}
                      </span>
                    </div>
                    <div className="bg-[#14110e] p-2.5 rounded-lg border border-[#2b2118]">
                      <span className="text-[#847665] block mb-0.5">مرجع السياق والضمائر:</span>
                      <span className="font-semibold text-[#f5ebd9]">
                        {lastAnalysis.currentSubject || 'موضوع جديد'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#847665]">
                    لم يتم إرسال أي رسالة في الجلسة الحالية حتى الآن. عند تحدث العميل، ستظهر تحليلات المعالجة الباطنية هنا للمطور فقط.
                  </p>
                )}

                {lastAnalysis?.confidenceNote && (
                  <p className="text-[11px] text-[#a09485] pt-2 border-t border-[#2d2319]">
                    {lastAnalysis.confidenceNote}
                  </p>
                )}
              </div>

              <div className="p-3.5 bg-[#141a15] rounded-xl border border-[#213826] text-[#b8d4c0] text-xs">
                <strong className="text-emerald-300 block mb-1">حالة الالتزام بواجهة العميل:</strong>
                تم إخفاء كافة النصوص والمؤشرات الفنية والتحليلية عن شاشة العميل. تظهر فقط المحادثة الطبيعية ومؤشر النقاط البسيط عند الانتظار.
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-2.5">
              {rulesList.map((r) => (
                <div
                  key={r.num}
                  className="p-3 rounded-xl bg-[#1b1713] border border-[#2c2219] flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#c99738]/20 text-[#e8c374] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {r.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#f0e3cf] text-xs">{r.title}</h4>
                    <p className="text-[11px] text-[#9c8e7e] mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#f5ebd9]">محرر كتالوج مدهال الطيب (JSON)</h3>
                  <p className="text-[#8a7c6c] text-[11px]">
                    ألصق بيانات منتجاتكم الرسمية هنا عندما تكون جاهزة لحفظها في المساعد مباشرة.
                  </p>
                </div>
                <span className="text-[10px] text-[#c99738] bg-[#241c15] px-2 py-1 rounded border border-[#3b2c1f]">
                  المنتجات المسجلة حالياً: {knowledge.products.length}
                </span>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-[#331717] text-[#fca5a5] rounded-lg border border-[#522424]">
                  {errorMsg}
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 bg-[#152e1a] text-[#86efac] rounded-lg border border-[#23542b] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم حفظ وتحديث قاعدة المعرفة بنجاح.</span>
                </div>
              )}

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                dir="ltr"
                rows={13}
                className="w-full bg-[#110f0d] text-[#e6ded1] font-mono text-[11px] p-3 rounded-xl border border-[#33281d] focus:outline-none focus:border-[#c99738] resize-y"
                placeholder="ألصق كود JSON الخاص بمنتجات مدهال هنا..."
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSaveJson}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#c99738] hover:bg-[#dbaa46] disabled:opacity-50 text-[#14100b] font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                  <span>حفظ وتطبيق في المساعد</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#292017] bg-[#1c1813] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#261f18] hover:bg-[#332a21] text-[#cfc1ae] text-xs font-semibold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

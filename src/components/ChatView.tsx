import React, { useState, useRef, useEffect } from 'react';
import { Send, Flame, User, Copy, Check, CornerDownLeft, Sparkles, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types.ts';
import { ProductCard } from './ProductCard.tsx';

/**
 * مكون لعرض نصوص الرسائل مع تحويل الروابط ومصادر المتجر وتنسيقات الماركداون بدون عرض رموز النجوم
 */
const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)\]]+)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.substring(lastIdx, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [label](url)
      nodes.push(
        <a
          key={`link_${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md text-[#e8c374] hover:text-[#ffe4a0] bg-[#271f17] hover:bg-[#34291c] border border-[#493725] hover:border-[#c99738] transition font-medium text-xs align-baseline"
        >
          <span>{match[1]}</span>
          <ExternalLink className="w-3 h-3 inline-block text-[#c99738]" />
        </a>
      );
    } else if (match[3]) {
      // Standalone URL
      const displayUrl = decodeURIComponent(match[3]).replace(/^https?:\/\/(www\.)?medhaloud\.com/, '') || 'متجر مدهال الطيب';
      nodes.push(
        <a
          key={`raw_${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#e8c374] hover:text-[#ffe4a0] underline underline-offset-2 font-medium"
        >
          <span>{displayUrl}</span>
          <ExternalLink className="w-3 h-3 inline-block text-[#c99738]" />
        </a>
      );
    } else if (match[4]) {
      // Bold **text**
      nodes.push(
        <strong key={`bold_${match.index}`} className="font-bold text-[#f5ebd9]">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // Italic/Bold *text*
      nodes.push(
        <strong key={`em_${match.index}`} className="font-semibold text-[#f5ebd9]">
          {match[5]}
        </strong>
      );
    }

    lastIdx = pattern.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes;
};

const FormattedMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <span className="whitespace-pre-line">{content}</span>;
  }

  let cleaned = content.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

  const lines = cleaned.split('\n');
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers (### Header or ## Header or # Header)
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      renderedElements.push(
        <div key={`h_${idx}`} className="font-bold text-[#f5ebd9] text-xs sm:text-sm my-1.5 border-b border-[#33281c] pb-1 leading-snug break-words">
          {renderInlineMarkdown(headerText)}
        </div>
      );
      return;
    }

    // Bullet points (- Item or * Item)
    if (/^[-*]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      renderedElements.push(
        <div key={`bullet_${idx}`} className="flex items-start gap-1.5 my-1 pr-0.5">
          <span className="text-[#c99738] font-bold text-xs mt-0.5 shrink-0">•</span>
          <span className="flex-1 text-xs sm:text-sm leading-relaxed break-words">{renderInlineMarkdown(bulletText)}</span>
        </div>
      );
      return;
    }

    // Numbered list (1. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num_${idx}`} className="flex items-start gap-1.5 my-1 pr-0.5">
          <span className="text-[#c99738] font-semibold text-xs mt-0.5 shrink-0">{numMatch[1]}.</span>
          <span className="flex-1 text-xs sm:text-sm leading-relaxed break-words">{renderInlineMarkdown(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty line
    if (trimmed === '') {
      renderedElements.push(<div key={`br_${idx}`} className="h-1.5" />);
      return;
    }

    // Regular line
    renderedElements.push(
      <div key={`p_${idx}`} className="my-0.5 text-xs sm:text-sm leading-relaxed break-words">
        {renderInlineMarkdown(line)}
      </div>
    );
  });

  return <div className="space-y-0.5 text-right overflow-hidden">{renderedElements}</div>;
};

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 3 Exact required quick questions
  const quickQuestions = [
    'وش الفرق بين العود الطبيعي والمحسن؟',
    'كيف أختار العود المناسب لي؟',
    'وش سياسة الاسترجاع والاستبدال؟',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-3xl mx-auto w-full px-3 sm:px-4">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
        {/* Natural Customer Welcome Card when no messages */}
        {messages.length === 0 && (
          <div className="py-5 sm:py-7 px-4 sm:px-7 rounded-2xl bg-gradient-to-b from-[#1c1813] to-[#14110e] border border-[#30261c] my-2 sm:my-3 text-right shadow-lg shadow-black/20">
            <div className="flex items-center gap-3 sm:gap-3.5 mb-3 sm:mb-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#c99738]/30 via-[#322416] to-[#1a140f] p-[1.5px] shadow-md shadow-[#c99738]/10 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#181512] rounded-[10px] flex items-center justify-center p-1 overflow-hidden">
                  <img src="/icon.png" alt="شعار مدهال الطيب الرسمي" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-bold text-[#f5ebd9] leading-snug break-words">
                  مرحباً بك في مدهال الطيب
                </h2>
                <p className="text-[11px] sm:text-xs text-[#a39482] leading-normal mt-0.5">
                  خدمة العملاء واستشارات العود والبخور
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#d6c8b5] leading-relaxed mb-4 sm:mb-5 break-words">
              حيّاك الله، يسعدنا مساعدتك في اختيار أفضل أنواع العود والطيب المناسبة لاحتياجك ومناسباتك. تفضل بطرح أي استفسار أو طلب ترشيح.
            </p>

            {/* Natural Quick Inquiries */}
            <div className="border-t border-[#292119] pt-3.5">
              <span className="text-xs font-semibold text-[#c99738] block mb-2 sm:mb-2.5 leading-snug">
                استفسارات شائعة:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(question)}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#1e1914] hover:bg-[#282119] border border-[#33281d] hover:border-[#c99738]/40 text-right transition flex items-center justify-between group h-auto min-h-[42px]"
                  >
                    <span className="text-xs text-[#ecdcc8] group-hover:text-[#f7e7d2] font-medium leading-snug break-words">
                      "{question}"
                    </span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-[#6b5d4c] group-hover:text-[#c99738] shrink-0 mr-2 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user' || msg.role === 'customer';
            const isCopied = copiedId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 sm:gap-3 text-right ${isUser ? 'justify-start flex-row-reverse' : 'justify-start'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 overflow-hidden ${
                    isUser
                      ? 'bg-[#33281c] text-[#d4af37] border border-[#4d3c2a]'
                      : 'bg-[#181410] border border-[#3b2d1d] shadow-md shadow-black/40 p-0.5'
                  }`}
                >
                  {isUser ? (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <img src="/icon.png" alt="مدهال الطيب" className="w-full h-full object-contain" />
                  )}
                </div>

                {/* Bubble Content */}
                <div className={`space-y-1.5 ${isUser ? 'max-w-[88%] sm:max-w-[78%] items-end' : msg.productCards && msg.productCards.length > 0 ? 'w-full max-w-full sm:max-w-[92%] items-start' : 'max-w-[88%] sm:max-w-[78%] items-start'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-sm break-words overflow-hidden ${
                      isUser
                        ? 'bg-[#261f17] text-[#fbf6ee] rounded-tr-none border border-[#3b2f21]'
                        : 'bg-[#1a1612] text-[#ece2d4] rounded-tl-none border border-[#2b2219]'
                    }`}
                  >
                    <FormattedMessage content={msg.content} isUser={isUser} />
                  </div>

                  {/* Product Cards Grid (Up to 3 cards for recommendations, or list for search) */}
                  {!isUser && msg.productCards && msg.productCards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 pb-1 w-full">
                      {msg.productCards.map((product, pIdx) => (
                        <ProductCard key={`${msg.id}_card_${product.id || 'item'}_${pIdx}`} product={product} />
                      ))}
                    </div>
                  )}

                  {/* Interactive Suggestions (Max 3) directly under assistant message */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 pb-1">
                      {msg.suggestions.slice(0, 3).map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => onSendMessage(suggestion)}
                          disabled={isLoading}
                          className="px-2.5 py-1.5 rounded-xl bg-[#231d16] hover:bg-[#2d241a] active:scale-95 text-[#e5be6e] hover:text-[#ffd983] border border-[#3e3020] hover:border-[#c99738]/60 text-xs font-medium transition flex items-center gap-1.5 shadow-sm disabled:opacity-40 max-w-full text-right"
                        >
                          {suggestion.includes('قارن') && <SlidersHorizontal className="w-3 h-3 text-[#c99738] shrink-0" />}
                          <span className="leading-snug break-words">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Metadata and Copy for Assistant */}
                  {!isUser && (
                    <div className="flex items-center gap-2 px-1 text-[11px] text-[#7d7061]">
                      <span>{msg.timestamp}</span>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-[#d6c7b2] flex items-center gap-1 transition"
                        title="نسخ"
                      >
                        {isCopied ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> تم النسخ
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="w-3 h-3" /> نسخ
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Subtle, Non-Intrusive Typing Indicator (No background analysis explanation) */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 text-right items-center"
          >
            <div className="w-8 h-8 rounded-xl bg-[#181410] border border-[#3b2d1d] flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-md shadow-black/40">
              <img src="/icon.png" alt="مدهال الطيب" className="w-full h-full object-contain opacity-90" />
            </div>
            <div className="bg-[#1a1612] rounded-2xl rounded-tl-none px-4 py-2.5 border border-[#2b2219] flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c99738] animate-bounce [animation-duration:0.9s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#c99738] animate-bounce [animation-duration:0.9s] [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#c99738] animate-bounce [animation-duration:0.9s] [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips above input during active chat */}
      {messages.length > 0 && (
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {quickQuestions.slice(0, 4).map((question, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(question)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-[#1b1712] hover:bg-[#261f18] text-[#c9bcab] border border-[#33281c] text-[11px] whitespace-nowrap transition disabled:opacity-40"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Clean Chat Input Bar */}
      <div className="py-3 shrink-0 border-t border-[#241d16] bg-[#110f0d]">
        <form onSubmit={handleSend} className="relative flex items-end gap-2">
          <div className="relative flex-1 bg-[#1a1612] rounded-2xl border border-[#33291e] focus-within:border-[#c99738] transition shadow-inner">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="اكتب استفسارك هنا..."
              disabled={isLoading}
              className="w-full bg-transparent text-[#f5ebd9] placeholder-[#6e6151] text-xs sm:text-sm p-3.5 focus:outline-none resize-none max-h-32"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="h-11 w-11 rounded-2xl bg-[#c99738] hover:bg-[#dbaa46] disabled:opacity-30 disabled:hover:bg-[#c99738] text-[#14100b] flex items-center justify-center shrink-0 transition shadow-md shadow-[#c99738]/20"
            title="إرسال"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>

        {/* Store customer footer */}
        <div className="flex items-center justify-center text-[11px] text-[#5e5345] pt-2 px-1">
          <span>متجر مدهال الطيب • خدمة العملاء والمبيعات</span>
        </div>
      </div>
    </div>
  );
};

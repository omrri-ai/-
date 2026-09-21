import React from 'react';
import { Flame, Plus, MessageSquare, Menu } from 'lucide-react';
import { MidhalKnowledgeBase } from '../types';

interface HeaderProps {
  knowledge: MidhalKnowledgeBase;
  conversationsCount: number;
  activeConversationTitle?: string;
  onToggleSidebar: () => void;
  onNewConversation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  knowledge,
  conversationsCount,
  activeConversationTitle,
  onToggleSidebar,
  onNewConversation,
}) => {
  return (
    <header className="border-b border-[#241d16] bg-[#14120f]/95 backdrop-blur-md sticky top-0 z-30 px-3 py-2 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Boutique Brand & Customer Service Presence - Clickable Logo opens conversations */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Logo element that triggers the saved conversations drawer on mobile and desktop */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="group relative flex items-center gap-2.5 p-1 -m-1 rounded-xl hover:bg-[#1f1913] active:scale-[0.98] transition cursor-pointer text-right focus:outline-hidden focus:ring-1 focus:ring-[#c99738]/50"
            title="انقر لفتح سجل المحادثات السابقة"
            aria-label="شعار مدهال الطيب - فتح سجل المحادثات السابقة"
          >
            {/* Official Logo Container */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#c99738]/30 via-[#322416] to-[#1a140f] p-[1.5px] shadow-md shadow-black/40 flex items-center justify-center shrink-0 group-hover:border-[#c99738]/60 transition">
              <div className="w-full h-full bg-[#181410] rounded-[10px] flex items-center justify-center p-1 overflow-hidden">
                <img
                  src="/icon.png"
                  alt="شعار مدهال الطيب الرسمي"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Conversations Indicator Badge on the logo */}
              {conversationsCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c99738] text-[#120f0c] text-[10px] font-extrabold flex items-center justify-center shadow-md border border-[#14110e]">
                  {conversationsCount}
                </span>
              )}
            </div>

            <div className="min-w-0 text-right">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#f5ebd9] font-['Cairo'] truncate group-hover:text-[#ffd983] transition-colors">
                  {knowledge.storeName || 'مدهال الطيب'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  متصل لخدمتكم
                </span>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-[11px] sm:text-xs text-[#9d8d7b] truncate max-w-[170px] sm:max-w-[260px]">
                  {activeConversationTitle && activeConversationTitle !== 'محادثة جديدة'
                    ? activeConversationTitle
                    : (knowledge.tagline || 'خدمة العملاء واستشارات العود والبخور الفاخر')}
                </p>
                <span className="inline-block sm:hidden text-[9px] text-[#c99738]/80 bg-[#251d15] px-1.5 py-0.2 rounded text-nowrap">
                  المحادثات ▾
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Customer Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* New Chat Button */}
          <button
            onClick={onNewConversation}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-gradient-to-r from-[#2a2016] to-[#1f1710] hover:from-[#3a2c1d] hover:to-[#2c1f14] text-[#eddac2] hover:text-[#ffd983] border border-[#4d3a27] hover:border-[#c99738]/80 transition duration-150 shadow-xs font-medium active:scale-[0.98]"
            title="بدء محادثة جديدة"
          >
            <Plus className="w-3.5 h-3.5 text-[#c99738]" />
            <span className="text-xs font-semibold">محادثة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};

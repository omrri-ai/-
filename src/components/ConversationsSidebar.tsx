import React from 'react';
import { Plus, MessageSquare, Clock, Trash2, X, ChevronLeft, Sparkles } from 'lucide-react';
import { CustomerConversation } from '../types.ts';
import { formatArabicRelativeTime } from '../utils/conversationUtils.ts';

interface ConversationsSidebarProps {
  conversations: CustomerConversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  conversations,
  activeConversationId,
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-label="إغلاق قائمة المحادثات"
        />
      )}

      {/* Sidebar / Drawer Container */}
      <aside
        className={`fixed lg:static top-0 right-0 z-50 h-full w-72 sm:w-80 bg-[#14110e] border-l border-[#271f16] flex flex-col transition-transform duration-300 ease-in-out shrink-0 text-right ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#241c14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#201912] border border-[#3d2e1e] flex items-center justify-center overflow-hidden p-0.5">
              <img src="/icon.png" alt="شعار مدهال الطيب" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9]">مدهال الطيب</h2>
              <p className="text-[11px] text-[#8e7e6e]">سجل استشاراتك ومحادثاتك</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#231b14] text-[#a49381] hover:text-[#f0e4d2] lg:hidden transition"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: + New Conversation Button */}
        <div className="p-3.5">
          <button
            onClick={() => {
              onNewConversation();
              // On mobile, automatically close drawer so user sees the new clean chat
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#281f15] to-[#201810] hover:from-[#35281b] hover:to-[#2c2014] border border-[#523d26] hover:border-[#c99738] text-[#f5ebd9] hover:text-[#ffd983] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition duration-200 shadow-sm active:scale-[0.98] group"
          >
            <Plus className="w-4 h-4 text-[#c99738] group-hover:scale-110 transition-transform" />
            <span>محادثة جديدة</span>
          </button>
        </div>

        {/* Section Title & Count */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-medium text-[#7d6d5d]">
          <span>المحادثات السابقة</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#1e1711] border border-[#312519] text-[#b39e88] text-[10px]">
            {conversations.length}
          </span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5 scrollbar-thin scrollbar-thumb-[#2e2318] scrollbar-track-transparent">
          {conversations.length === 0 ? (
            <div className="py-12 px-4 text-center text-[#756656] space-y-2">
              <Sparkles className="w-8 h-8 text-[#c99738]/40 mx-auto" />
              <p className="text-xs">لا توجد محادثات سابقة بعد</p>
              <p className="text-[11px] text-[#635547]">ابدأ محادثتك الأولى مع مستشار مدهال الطيب الآن</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.conversationId === activeConversationId;
              const lastMessage = conv.messages && conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1]
                : null;
              const formattedTime = formatArabicRelativeTime(conv.updatedAt || conv.createdAt);

              return (
                <div
                  key={conv.conversationId}
                  onClick={() => {
                    onSelectConversation(conv.conversationId);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`group relative w-full p-3 rounded-xl cursor-pointer transition duration-200 border text-right flex flex-col gap-1.5 ${
                    isActive
                      ? 'bg-[#231b14] border-[#c99738]/60 shadow-md text-[#fbf6ee]'
                      : 'bg-[#181410]/70 hover:bg-[#1f1913] border-[#292017] hover:border-[#3f3122] text-[#d6c7b2]'
                  }`}
                >
                  {/* Title & Active indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs sm:text-sm font-semibold truncate flex-1 ${isActive ? 'text-[#ffdf95]' : 'text-[#eae0d2]'}`}>
                      {conv.title || 'محادثة جديدة'}
                    </span>

                    {/* Delete Action Button */}
                    {onDeleteConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('هل تريد حذف هذه المحادثة؟')) {
                            onDeleteConversation(conv.conversationId);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-950/60 hover:text-rose-300 text-[#7c6c5c] transition"
                        title="حذف المحادثة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Last Message Snippet (if available) */}
                  {lastMessage && (
                    <p className="text-[11px] text-[#8e7e6e] line-clamp-1 leading-snug">
                      {lastMessage.content}
                    </p>
                  )}

                  {/* Time and Message Counter */}
                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-[#786959]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-[#a89073]" />
                      <span>{formattedTime}</span>
                    </span>

                    <span className="text-[#695b4c]">
                      {conv.messages.length} {conv.messages.length === 1 ? 'رسالة' : 'رسائل'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-[#231b14] text-center bg-[#110e0c]">
          <div className="text-[11px] text-[#7d6e5f]">مدهال الطيب للعود الفاخر</div>
          <div className="text-[9px] text-[#5c4f41] mt-0.5">محادثاتك محفوظة بأمان لجلساتك القادمة</div>
        </div>
      </aside>
    </>
  );
};

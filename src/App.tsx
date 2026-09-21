import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ConversationsSidebar } from './components/ConversationsSidebar';
import { CustomerConversation, CustomerMessage, MidhalKnowledgeBase } from './types';
import { getCustomerId } from './utils/customer';
import { generateConversationTitle, pruneConversations, MAX_CONVERSATIONS } from './utils/conversationUtils';

export default function App() {
  const customerId = useMemo(() => getCustomerId(), []);

  // Conversations state initialized purely from local storage
  const [conversations, setConversations] = useState<CustomerConversation[]>(() => {
    try {
      const cached = localStorage.getItem(`midhal_customer_conversations_${customerId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read cached conversations from localStorage:', e);
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      const lastActive = localStorage.getItem(`midhal_active_conv_${customerId}`);
      if (lastActive) return lastActive;
    } catch {
      // fallback
    }
    return null;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [knowledge, setKnowledge] = useState<MidhalKnowledgeBase>({
    isConfigured: false,
    storeName: 'مدهال الطيب',
    tagline: 'لأصالة العود والطيب الفاخر',
    branches: [],
    shippingInfo: {
      availableCities: 'جميع مدن ومحافظات المملكة العربية السعودية',
      shippingCompanies: ['أرامكس', 'سمسا'],
      standardTime: '2 - 4 أيام عمل',
    },
    policies: {
      returns: 'الاسترجاع متاح وفق سياسة حماية المستهلك للمنتجات غير المستخدمة ووفق شروط العود والطيب.',
    },
    activeOffers: [],
    products: [],
    customKnowledgeNotes: '',
  });

  const createFreshConversation = useCallback((): CustomerConversation => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      conversationId: newId,
      customerId,
      title: 'محادثة جديدة',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  }, [customerId]);

  // Initial load effect: ensure at least one active conversation and enforce max 2 limit
  useEffect(() => {
    fetchKnowledge();

    setConversations((prev) => {
      if (prev.length === 0) {
        const initial = createFreshConversation();
        setActiveConversationId(initial.conversationId);
        return [initial];
      }

      // Ensure activeConversationId is valid
      if (!activeConversationId || !prev.some((c) => c.conversationId === activeConversationId)) {
        setActiveConversationId(prev[0].conversationId);
      }

      // Enforce max 2 conversations
      return pruneConversations(prev, activeConversationId || prev[0].conversationId);
    });
  }, [customerId]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(`midhal_customer_conversations_${customerId}`, JSON.stringify(conversations));
      } catch (e) {
        console.warn('Failed to save conversations to localStorage:', e);
      }
    }
  }, [conversations, customerId]);

  // Save active conversation id to localStorage
  useEffect(() => {
    if (activeConversationId) {
      try {
        localStorage.setItem(`midhal_active_conv_${customerId}`, activeConversationId);
      } catch (e) {
        console.warn('Failed to save active conversation id:', e);
      }
    }
  }, [activeConversationId, customerId]);

  const fetchKnowledge = async () => {
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setKnowledge(data);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge:', err);
    }
  };

  // Get active conversation object
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return conversations[0] || null;
    return conversations.find((c) => c.conversationId === activeConversationId) || conversations[0] || null;
  }, [conversations, activeConversationId]);

  // Messages of the currently active conversation
  const messages = useMemo(() => {
    return activeConversation?.messages || [];
  }, [activeConversation]);

  // Action: Create + New Conversation
  const handleNewConversation = () => {
    const newConv = createFreshConversation();
    setActiveConversationId(newConv.conversationId);
    setConversations((prev) => {
      const combined = [newConv, ...prev];
      return pruneConversations(combined, newConv.conversationId);
    });
  };

  // Action: Select conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  // Action: Delete conversation
  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.conversationId !== conversationId);
      if (updated.length === 0) {
        const fresh = createFreshConversation();
        setActiveConversationId(fresh.conversationId);
        return [fresh];
      }
      if (activeConversationId === conversationId) {
        setActiveConversationId(updated[0].conversationId);
      }
      return updated;
    });
  };

  // Action: Send Message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Ensure we have an active conversation
    let currentConv = activeConversation;
    if (!currentConv) {
      currentConv = createFreshConversation();
      setActiveConversationId(currentConv.conversationId);
      setConversations((prev) => pruneConversations([currentConv!, ...prev], currentConv!.conversationId));
    }

    const convId = currentConv.conversationId;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    const userMessage: CustomerMessage = {
      id: `usr_${Date.now()}`,
      conversationId: convId,
      role: 'customer',
      content: text,
      timestamp: timeFormatted,
    };

    const isFirstMessage = currentConv.messages.length === 0 || currentConv.title === 'محادثة جديدة';
    const computedTitle = isFirstMessage ? generateConversationTitle(text) : currentConv.title;

    const updatedMessages = [...currentConv.messages, userMessage];

    // Update conversation in state optimistically
    setConversations((prev) =>
      pruneConversations(
        prev.map((c) => {
          if (c.conversationId === convId) {
            return {
              ...c,
              title: computedTitle,
              updatedAt: now.toISOString(),
              messages: updatedMessages,
            };
          }
          return c;
        }),
        convId
      )
    );

    setIsLoading(true);

    try {
      let data: any = null;
      let lastFetchError: any = null;

      // Single retry for transient glitches
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              conversationHistory: updatedMessages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          });

          if (response.ok) {
            data = await response.json();
            break;
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastFetchError = new Error(errorData.error || 'فشل في جلب الرد');
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }
          }
        } catch (fetchErr: any) {
          lastFetchError = fetchErr;
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }
      }

      if (!data) {
        throw lastFetchError || new Error('تعذر إتمام الطلب');
      }

      const assistantMessage: CustomerMessage = {
        id: `ast_${Date.now()}`,
        conversationId: convId,
        role: 'assistant',
        content: data.reply,
        suggestions: Array.isArray(data.suggestions) && data.suggestions.length > 0 ? data.suggestions.slice(0, 3) : undefined,
        productCards: Array.isArray(data.productCards) && data.productCards.length > 0 ? data.productCards : undefined,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      setConversations((prev) =>
        pruneConversations(
          prev.map((c) => {
            if (c.conversationId === convId) {
              return {
                ...c,
                title: computedTitle,
                updatedAt: new Date().toISOString(),
                messages: finalMessages,
              };
            }
            return c;
          }),
          convId
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: CustomerMessage = {
        id: `err_${Date.now()}`,
        conversationId: convId,
        role: 'assistant',
        content:
          'المعذرة منك، واجهنا صعوبة مؤقتة في معالجة الرد. تفضل بتكرار استفسارك أو المحاولة بعد لحظات.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        pruneConversations(
          prev.map((c) => {
            if (c.conversationId === convId) {
              return {
                ...c,
                updatedAt: new Date().toISOString(),
                messages: [...updatedMessages, errorMessage],
              };
            }
            return c;
          }),
          convId
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#110f0d] text-[#f4efe6] flex flex-col font-['Cairo'] selection:bg-[#c99738]/30 selection:text-[#fff]">
      {/* Authentic Store Customer Header */}
      <Header
        knowledge={knowledge}
        conversationsCount={conversations.length}
        activeConversationTitle={activeConversation?.title}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNewConversation={handleNewConversation}
      />

      {/* Main Layout with Sidebar and Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Customer Conversations Sidebar / Drawer */}
        <ConversationsSidebar
          conversations={conversations}
          activeConversationId={activeConversation?.conversationId || null}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* Main Customer Service Chat View */}
        <main className="flex-1 flex flex-col items-center justify-between min-w-0 transition-all duration-300">
          <ChatView
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </main>
      </div>
    </div>
  );
}

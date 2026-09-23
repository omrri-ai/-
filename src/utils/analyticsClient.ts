// Anonymous, Zero-PII Client-Side Telemetry Helper for Midhal Al-Teeb

function getOrCreateVisitorId(): { visitorId: string; isNew: boolean } {
  try {
    let vid = localStorage.getItem('midhal_visitor_id');
    if (!vid) {
      vid = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('midhal_visitor_id', vid);
      return { visitorId: vid, isNew: true };
    }
    return { visitorId: vid, isNew: false };
  } catch {
    return { visitorId: 'anon_user', isNew: false };
  }
}

function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem('midhal_session_id');
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('midhal_session_id', sid);
    }
    return sid;
  } catch {
    return 'sess_temp';
  }
}

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function trackClientEvent(
  eventType: 'pageview' | 'conversation_start' | 'product_click' | 'product_link_click' | 'product_impression',
  metadata?: any
): void {
  try {
    const { visitorId, isNew } = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const device = getDeviceType();

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        visitorId,
        sessionId,
        isNew,
        device,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        path: typeof window !== 'undefined' ? window.location.pathname : '/',
        metadata,
      }),
      keepalive: true,
    }).catch(() => {
      // Fire-and-forget: silently catch without impacting customer UI
    });
  } catch {
    // Ignore any tracking errors
  }
}

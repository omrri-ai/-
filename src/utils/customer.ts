/**
 * Customer Identity Management
 * Provides a persistent, unique, and safe customerId for anonymous and guest sessions.
 */

const CUSTOMER_ID_KEY = 'midhal_customer_id';

export function getCustomerId(): string {
  try {
    let id = localStorage.getItem(CUSTOMER_ID_KEY);
    if (!id || !id.trim()) {
      // Generate a collision-resistant customer identifier
      const randomPart = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now().toString(36);
      id = `cust_${timestamp}_${randomPart}`;
      localStorage.setItem(CUSTOMER_ID_KEY, id);
    }
    return id;
  } catch {
    // In case localStorage is blocked in private browsing
    return `cust_guest_${Date.now()}`;
  }
}

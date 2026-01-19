// ✅ src/utils/pendingActions.js
// Guest actions (add to cart / wishlist) ko login/signup ke baad auto apply karne ke liye

const KEY = 'pendingActions_v1';

export function pushPendingAction(action) {
  try {
    const raw = sessionStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({ ...action, ts: Date.now() });
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.error('pushPendingAction failed', e);
  }
}

export function popAllPendingActions() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    sessionStorage.removeItem(KEY);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('popAllPendingActions failed', e);
    sessionStorage.removeItem(KEY);
    return [];
  }
}

export function hasPendingActions() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) && list.length > 0;
  } catch {
    return false;
  }
}

export function clearPendingActions() {
  sessionStorage.removeItem(KEY);
}

/* Offline spending comparison + Median/OneSignal alert bridge.
   The app remains fully local. When the Median native app is online, the
   current alert state is synced to OneSignal as user tags. OneSignal can
   use those tags to trigger native push Journeys.
*/
(function () {
  const DB_NAME = 'BudgetAppDB';
  const DB_VERSION = 1;
  const DB_STORE = 'appState';
  const ALERT_KEY = 'spending_alert_state';
  const CHECK_MS = 15000;

  function openAlertDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Alert database unavailable'));
    });
  }

  async function readAlertState() {
    try {
      const db = await openAlertDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const req = tx.objectStore(DB_STORE).get(ALERT_KEY);
        req.onsuccess = () => resolve(req.result || { sent: {}, current: null });
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      return { sent: {}, current: null };
    }
  }

  async function writeAlertState(value) {
    try {
      const db = await openAlertDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(value, ALERT_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch (_) {}
  }

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function monthTotal(expenses, year, month) {
    return expenses
      .filter(item => {
        const d = new Date(`${item.date}T00:00:00`);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  function calculate(expenses) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousDate = new Date(currentYear, currentMonth - 1, 1);
    const current = monthTotal(expenses, currentYear, currentMonth);
    const previous = monthTotal(expenses, previousDate.getFullYear(), previousDate.getMonth());

    if (previous <= 0) return { level: 'normal', percent: 0, current, previous, month: monthKey(now) };

    const percent = ((current - previous) / previous) * 100;
    const level = percent >= 15 ? 'high' : percent >= 5 ? 'warning' : 'normal';
    return { level, percent, current, previous, month: monthKey(now) };
  }

  function medianReady() {
    return typeof window !== 'undefined' && window.median && window.median.onesignal;
  }

  async function syncNativeAlert(result) {
    if (!medianReady() || !navigator.onLine) return false;
    try {
      // Native Median OneSignal integration. Tags sync when connectivity returns.
      await window.median.onesignal.tags.setTags({
        tags: {
          budget_spending_alert: result.level,
          budget_spending_percent: Number(result.percent.toFixed(1)).toString(),
          budget_spending_month: result.month
        }
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function checkSpendingAlert() {
    if (!window.data || !Array.isArray(window.data.expenses)) return;
    const result = calculate(window.data.expenses);
    const state = await readAlertState();
    const key = `${result.month}:${result.level}`;

    state.current = result;

    // Only create one alert for each threshold in a month.
    if (result.level !== 'normal' && !state.sent[key]) {
      state.sent[key] = { queuedAt: Date.now(), result };
    }

    // Always sync the current status when the native app reconnects.
    const synced = await syncNativeAlert(result);
    if (synced) {
      Object.keys(state.sent).forEach(k => {
        if (k.startsWith(`${result.month}:`)) state.sent[k].syncedAt = Date.now();
      });
    }

    await writeAlertState(state);
    window.dispatchEvent(new CustomEvent('budgetSpendingAlertUpdated', { detail: result }));
  }

  // Median push notifications are native. Keep foreground alerts enabled so
  // an arriving OneSignal notification is not silently suppressed in-app.
  function configureMedian() {
    if (!medianReady()) return;
    try { window.median.onesignal.enableForegroundNotifications(true); } catch (_) {}
  }

  window.budgetSpendingAlert = {
    check: checkSpendingAlert,
    calculate: () => calculate(Array.isArray(window.data?.expenses) ? window.data.expenses : []),
    getState: readAlertState
  };

  window.addEventListener('online', () => { configureMedian(); checkSpendingAlert(); });
  window.addEventListener('load', () => { configureMedian(); checkSpendingAlert(); });
  setInterval(checkSpendingAlert, CHECK_MS);
})();

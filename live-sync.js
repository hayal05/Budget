/* Live recalculation and UI synchronization.
   Keeps the app spreadsheet-like: every data mutation immediately rerenders
   the currently visible page without requiring a manual refresh. */
(() => {
  const originalSaveData = window.saveData;
  const originalShowPage = window.showPage;
  let currentPage = 'dashboard';
  let rendering = false;

  if (typeof originalShowPage === 'function') {
    window.showPage = function liveShowPage(name) {
      currentPage = name || 'dashboard';
      return originalShowPage.call(this, currentPage);
    };
  }

  if (typeof originalSaveData === 'function') {
    window.saveData = function liveSaveData(...args) {
      const result = originalSaveData.apply(this, args);
      window.dispatchEvent(new CustomEvent('budget:data-changed'));
      return result;
    };
  }

  function refreshVisiblePage() {
    if (rendering || typeof window.showPage !== 'function') return;
    rendering = true;
    try {
      window.showPage(currentPage);
    } finally {
      rendering = false;
    }
  }

  window.addEventListener('budget:data-changed', () => {
    requestAnimationFrame(refreshVisiblePage);
  });

  // Keep the visible UI synchronized when the same budget is changed in
  // another browser tab/window.
  window.addEventListener('storage', event => {
    if (event.key !== 'budget_data_v1') return;
    if (typeof window.loadData !== 'function') return;
    data = window.loadData();
    requestAnimationFrame(refreshVisiblePage);
  });
})();

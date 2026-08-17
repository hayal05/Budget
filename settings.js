// Settings and local data management.
// Loaded after app.js so it can extend the existing Settings page without changing core modules.

pages.settings.render = () => `
  <article class="card form-card">
    <h2>Preferences</h2>
    <form class="form-grid" id="settingsForm">
      <label>Currency
        <select name="currency">
          <option value="ETB" ${data.settings.currency === 'ETB' ? 'selected' : ''}>ETB — Ethiopian Birr</option>
          <option value="USD" ${data.settings.currency === 'USD' ? 'selected' : ''}>USD — US Dollar</option>
          <option value="EUR" ${data.settings.currency === 'EUR' ? 'selected' : ''}>EUR — Euro</option>
        </select>
      </label>
      <button class="primary-button" type="submit">Save settings</button>
    </form>
  </article>

  <article class="card form-card">
    <h2>Data</h2>
    <p class="muted">Your budget stays on this device. Export a backup before clearing or moving your data.</p>
    <div class="button-row">
      <button class="primary-button" type="button" id="exportData">Export backup</button>
      <button class="secondary-button" type="button" id="importDataButton">Import backup</button>
      <input id="importDataInput" type="file" accept="application/json" hidden>
      <button class="danger-button" type="button" id="resetData">Reset all data</button>
    </div>
  </article>
`;

function renderSettings() {
  showPage('settings');
}

pageContent.addEventListener('click', event => {
  if (event.target.id === 'exportData') {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (event.target.id === 'importDataButton') {
    document.getElementById('importDataInput')?.click();
  }

  if (event.target.id === 'resetData') {
    if (!confirm('Reset all income, expenses, budgets, and settings? This cannot be undone.')) return;
    data = { income: [], expenses: [], budgets: [], settings: { currency: 'ETB' } };
    saveData();
    renderSettings();
  }
});

pageContent.addEventListener('change', event => {
  if (event.target.id !== 'importDataInput' || !event.target.files?.[0]) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const incoming = parsed?.data ?? parsed;
      if (!incoming || !Array.isArray(incoming.income) || !Array.isArray(incoming.expenses) || !Array.isArray(incoming.budgets)) {
        throw new Error('Invalid backup');
      }
      data = {
        income: incoming.income,
        expenses: incoming.expenses,
        budgets: incoming.budgets,
        settings: { currency: incoming.settings?.currency || 'ETB' }
      };
      saveData();
      alert('Backup imported successfully.');
      renderSettings();
    } catch {
      alert('This backup file is not valid. No data was changed.');
    }
  };
  reader.readAsText(event.target.files[0]);
});

/* Live recalculation and synchronization.
   Every data mutation immediately refreshes the visible page, so the app
   behaves like a spreadsheet without requiring manual page refreshes. */
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

  window.addEventListener('storage', event => {
    if (event.key !== 'budget_data_v1' || typeof window.loadData !== 'function') return;
    data = window.loadData();
    requestAnimationFrame(refreshVisiblePage);
  });
})();

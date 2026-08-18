(() => {
  const KEY = 'budget_app_history';
  const getCurrent = () => document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';
  const read = () => {
    try { const value = JSON.parse(sessionStorage.getItem(KEY)); return Array.isArray(value) ? value : []; }
    catch { return []; }
  };
  const write = history => { try { sessionStorage.setItem(KEY, JSON.stringify(history)); } catch {} };

  let previousPage = getCurrent();

  document.addEventListener('click', event => {
    const button = event.target.closest('.nav-item[data-page]');
    if (!button) return;
    const nextPage = button.dataset.page;
    if (nextPage === previousPage) return;
    const history = read();
    history.push(previousPage);
    write(history.slice(-50));
    previousPage = nextPage;
  });

  window.addEventListener('popstate', event => {
    const history = read();
    if (!history.length) return;
    const page = history.pop();
    write(history);
    previousPage = page;
    if (typeof showPage === 'function') showPage(page);
  });

  // Android/browser Back triggers popstate while keeping the app on the same document.
  history.replaceState({ budgetApp: true }, '', window.location.href);
  history.pushState({ budgetApp: true }, '', window.location.href);

  window.addEventListener('popstate', () => {
    const history = read();
    if (history.length && typeof showPage === 'function') {
      const page = history.pop();
      write(history);
      previousPage = page;
      showPage(page);
      history.pushState({ budgetApp: true }, '', window.location.href);
    }
  });
})();

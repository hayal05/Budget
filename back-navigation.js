(() => {
  const currentPage = () => document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';

  // Keep one in-app history entry so Android/browser Back can move between pages.
  history.replaceState({ budgetApp: true, page: currentPage() }, '', location.href);
  history.pushState({ budgetApp: true, page: currentPage() }, '', location.href);

  document.addEventListener('click', event => {
    const button = event.target.closest('.nav-item[data-page]');
    if (!button) return;
    const nextPage = button.dataset.page;
    if (nextPage === currentPage()) return;
    history.pushState({ budgetApp: true, page: nextPage }, '', location.href);
  });

  window.addEventListener('popstate', event => {
    if (event.state?.budgetApp && typeof showPage === 'function') {
      showPage(event.state.page || 'dashboard');
      return;
    }
    // Prevent leaving the SPA when there is an earlier app page to return to.
    history.pushState({ budgetApp: true, page: currentPage() }, '', location.href);
  });
})();

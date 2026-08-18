(() => {
  function updateSavingsCard() {
    const stats = document.querySelector('.stats-grid');
    if (!stats) return;
    const cards = stats.querySelectorAll('.card');
    if (cards.length < 3) return;
    const card = cards[2];
    const label = card.querySelector('.stat-label');
    const value = card.querySelector('.stat-value');
    if (!label || !value) return;
    label.textContent = 'Savings';
    if (typeof data !== 'undefined' && typeof formatMoney === 'function') {
      const income = data.income.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const expenses = data.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      value.textContent = formatMoney(income - expenses);
    }
  }
  new MutationObserver(() => requestAnimationFrame(updateSavingsCard))
    .observe(document.getElementById('pageContent'), { childList: true, subtree: true });
  requestAnimationFrame(updateSavingsCard);
})();

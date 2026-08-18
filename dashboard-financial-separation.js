(() => {
  function totalsByType() {
    const income = data.income.reduce((s, x) => s + Number(x.amount || 0), 0);
    const expenses = data.expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
    const savings = data.income.reduce((s, x) => s + Number(x.savings || 0), 0);
    const available = income - expenses - savings;
    return { income, expenses, savings, available };
  }

  function refresh() {
    const stats = document.querySelector('.stats-grid');
    if (!stats || typeof data === 'undefined' || typeof formatMoney !== 'function') return;
    const cards = stats.querySelectorAll('.card');
    if (cards.length < 3) return;
    const t = totalsByType();

    // Restore a true Available Balance card as the third card.
    const balanceLabel = cards[2].querySelector('.stat-label');
    const balanceValue = cards[2].querySelector('.stat-value');
    if (balanceLabel) balanceLabel.textContent = 'Available Balance';
    if (balanceValue) balanceValue.textContent = formatMoney(t.available);

    // Add a separate Savings card only once.
    if (!stats.querySelector('[data-savings-card]')) {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.savingsCard = 'true';
      card.innerHTML = `<p class="stat-label">Savings</p><p class="stat-value">${formatMoney(t.savings)}</p>`;
      stats.appendChild(card);
    } else {
      const card = stats.querySelector('[data-savings-card]');
      const value = card.querySelector('.stat-value');
      if (value) value.textContent = formatMoney(t.savings);
    }
  }

  new MutationObserver(() => requestAnimationFrame(refresh)).observe(document.getElementById('pageContent'), { childList: true, subtree: true });
  requestAnimationFrame(refresh);
})();

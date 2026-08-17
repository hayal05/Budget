function dashboardMonthKey(date) {
  return String(date || '').slice(0, 7);
}

function dashboardLastMonths(count = 6) {
  const result = [];
  const now = new Date();
  now.setDate(1);
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString(undefined, { month: 'short' })
    });
  }
  return result;
}

function dashboardTotalsByMonth() {
  return dashboardLastMonths().map(month => ({
    ...month,
    income: data.income.filter(item => dashboardMonthKey(item.date) === month.key)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    expenses: data.expenses.filter(item => dashboardMonthKey(item.date) === month.key)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }));
}

function dashboardCategoryTotals(items) {
  const totals = {};
  items.forEach(item => {
    totals[item.category] = (totals[item.category] || 0) + Number(item.amount || 0);
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

function dashboardBars() {
  const months = dashboardTotalsByMonth();
  const max = Math.max(...months.flatMap(m => [m.income, m.expenses]), 1);
  return `<div class="bar-chart" aria-label="Income and expenses by month">${months.map(month => `
    <div class="bar-group"><div class="bar-pair">
      <span class="bar income-bar" style="height:${Math.max((month.income / max) * 170, month.income ? 4 : 0)}px" title="Income: ${formatMoney(month.income)}"></span>
      <span class="bar expense-bar" style="height:${Math.max((month.expenses / max) * 170, month.expenses ? 4 : 0)}px" title="Expenses: ${formatMoney(month.expenses)}"></span>
    </div><span class="chart-label">${month.label}</span></div>
  `).join('')}</div><div class="chart-legend"><span><i class="legend-income"></i>Income</span><span><i class="legend-expense"></i>Expenses</span></div>`;
}

function dashboardTrend() {
  const months = dashboardTotalsByMonth();
  const width = 600, height = 190, pad = 20;
  const max = Math.max(...months.flatMap(m => [m.income, m.expenses]), 1);
  const x = index => pad + index * ((width - pad * 2) / Math.max(months.length - 1, 1));
  const y = value => height - pad - (value / max) * (height - pad * 2);
  const line = key => months.map((month, i) => `${x(i)},${y(month[key])}`).join(' ');
  const points = key => months.map((month, i) => `<circle cx="${x(i)}" cy="${y(month[key])}" r="3" class="${key}-point"><title>${month.label}: ${formatMoney(month[key])}</title></circle>`).join('');
  return `<div class="line-chart-wrap"><svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Six month income and expense trend" preserveAspectRatio="none">
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="chart-axis" />
    <polyline points="${line('income')}" class="income-line" />
    <polyline points="${line('expenses')}" class="expense-line" />
    ${points('income')}${points('expenses')}
  </svg></div>`;
}

function dashboardAnalyticsCards() {
  const topExpenses = dashboardCategoryTotals(data.expenses).slice(0, 4);
  const topIncome = dashboardCategoryTotals(data.income).slice(0, 4);
  const maxExpense = topExpenses[0]?.[1] || 1;
  return `<div class="analytics-grid">
    <article class="card analytics-card"><h2>Major expenses</h2>${topExpenses.length ? `<div class="analytics-list">${topExpenses.map(([category, amount]) => `
      <div class="analytics-row"><div><strong>${escapeHtml(category)}</strong><div class="mini-track"><span style="width:${Math.min((amount / maxExpense) * 100, 100)}%"></span></div></div><strong>${formatMoney(amount)}</strong></div>
    `).join('')}</div>` : '<div class="empty">No expenses yet.</div>'}</article>
    <article class="card analytics-card"><h2>Major income sources</h2>${topIncome.length ? `<div class="analytics-list">${topIncome.map(([category, amount]) => `
      <div class="analytics-row"><strong>${escapeHtml(category)}</strong><strong class="positive">${formatMoney(amount)}</strong></div>
    `).join('')}</div>` : '<div class="empty">No income yet.</div>'}</article>
  </div>`;
}

function dashboardBudgetOverview() {
  if (!data.budgets.length) return '';
  const rows = data.budgets.slice(0, 5).map(budget => {
    const spent = data.expenses.filter(item => item.category === budget.category).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const amount = Number(budget.amount || 0);
    const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
    return `<div class="analytics-row"><div><strong>${escapeHtml(budget.category)}</strong><div class="mini-track"><span class="${spent > amount ? 'over' : ''}" style="width:${percent}%"></span></div></div><span>${formatMoney(spent)} / ${formatMoney(amount)}</span></div>`;
  }).join('');
  return `<article class="card budget-overview"><h2>Budget overview</h2>${rows}</article>`;
}

function enhanceDashboard() {
  const dashboard = document.querySelector('.dashboard-grid');
  if (!dashboard || dashboard.dataset.analyticsReady === 'true') return;
  dashboard.dataset.analyticsReady = 'true';
  const chartCard = dashboard.querySelector('.chart')?.closest('.card');
  if (chartCard) {
    chartCard.querySelector('.chart').outerHTML = `<div class="chart-panel">${dashboardBars()}</div><h3 class="subchart-title">Six-month trend</h3>${dashboardTrend()}`;
  }
  const content = document.getElementById('pageContent');
  if (content) content.insertAdjacentHTML('beforeend', dashboardAnalyticsCards() + dashboardBudgetOverview());
}

const dashboardObserver = new MutationObserver(() => {
  if (document.querySelector('[data-page="dashboard"].active')) requestAnimationFrame(enhanceDashboard);
});

dashboardObserver.observe(document.getElementById('pageContent'), { childList: true, subtree: true });
requestAnimationFrame(enhanceDashboard);

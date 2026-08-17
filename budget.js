function budgetProgress(budget) {
  const spent = data.expenses
    .filter(item => item.category === budget.category)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const amount = Number(budget.amount || 0);
  const remaining = amount - spent;
  const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  return { spent, remaining, percent };
}

function renderBudgetHistory() {
  if (!data.budgets.length) return '<div class="empty">No budgets set yet.</div>';

  return `<div class="transaction-list">${data.budgets.map(budget => {
    const { spent, remaining, percent } = budgetProgress(budget);
    const over = remaining < 0;
    return `
      <div class="transaction-row budget-row">
        <div class="budget-main">
          <strong>${escapeHtml(budget.category)}</strong>
          <span class="muted">Spent ${formatMoney(spent)} of ${formatMoney(budget.amount)}</span>
          <div class="progress-track" aria-label="${Math.round(percent)} percent spent">
            <div class="progress-fill ${over ? 'over' : ''}" style="width:${percent}%"></div>
          </div>
          <span class="muted ${over ? 'negative' : 'positive'}">
            ${over ? `${formatMoney(Math.abs(remaining))} over budget` : `${formatMoney(remaining)} remaining`}
          </span>
        </div>
        <div class="transaction-actions">
          <button class="text-button" type="button" data-edit-budget="${budget.id}">Edit</button>
          <button class="text-button danger" type="button" data-delete-budget="${budget.id}">Delete</button>
        </div>
      </div>`;
  }).join('')}</div>`;
}

pages.budget.render = () => `
  <article class="card form-card">
    <h2>Set a budget</h2>
    <form class="form-grid" id="budgetForm">
      <label>Category
        <select name="category" required>
          <option>Food</option><option>Transport</option><option>Housing</option><option>Utilities</option><option>Shopping</option><option>Health</option><option>Other</option>
        </select>
      </label>
      <label>Budget amount
        <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required>
      </label>
      <button class="primary-button" type="submit">Save budget</button>
    </form>
  </article>

  <article class="card list-card">
    <div class="section-heading">
      <div><h2>Your budgets</h2><p class="muted">${data.budgets.length} budget${data.budgets.length === 1 ? '' : 's'}</p></div>
    </div>
    ${renderBudgetHistory()}
  </article>
`;

pageContent.addEventListener('submit', event => {
  const form = event.target;
  if (form.id !== 'budgetForm') return;
  event.preventDefault();

  const values = Object.fromEntries(new FormData(form).entries());
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0 || !values.category) return;

  const existing = data.budgets.find(item => item.category === values.category);
  if (existing) {
    existing.amount = amount;
  } else {
    data.budgets.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      category: values.category,
      amount,
      createdAt: Date.now()
    });
  }

  saveData();
  showPage('budget');
});

pageContent.addEventListener('click', event => {
  const edit = event.target.closest('[data-edit-budget]');
  const remove = event.target.closest('[data-delete-budget]');

  if (remove) {
    const id = remove.dataset.deleteBudget;
    if (!confirm('Delete this budget?')) return;
    data.budgets = data.budgets.filter(item => item.id !== id);
    saveData();
    showPage('budget');
    return;
  }

  if (edit) {
    const item = data.budgets.find(entry => entry.id === edit.dataset.editBudget);
    if (!item) return;
    const amount = Number(prompt('Budget amount:', item.amount));
    if (!Number.isFinite(amount) || amount <= 0) return;
    item.amount = amount;
    saveData();
    showPage('budget');
  }
});

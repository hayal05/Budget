const pageContent = document.getElementById('pageContent');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');

const STORAGE_KEY = 'budget_data_v1';

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      income: Array.isArray(saved?.income) ? saved.income : [],
      expenses: Array.isArray(saved?.expenses) ? saved.expenses : [],
      budgets: Array.isArray(saved?.budgets) ? saved.budgets : [],
      settings: saved?.settings || { currency: 'ETB' }
    };
  } catch {
    return { income: [], expenses: [], budgets: [], settings: { currency: 'ETB' } };
  }
}

let data = loadData();

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatMoney(value) {
  return `${data.settings.currency || 'ETB'} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function totals() {
  const income = data.income.reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = data.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  return { income, expenses, balance: income - expenses };
}

function transactionList() {
  return [
    ...data.income.map(item => ({ ...item, type: 'income' })),
    ...data.expenses.map(item => ({ ...item, type: 'expense' }))
  ].sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
}

function renderRecentActivity(limit = 6) {
  const items = transactionList().slice(0, limit);
  if (!items.length) return '<div class="empty">No transactions yet.</div>';

  return `<div class="activity-list">${items.map(item => `
    <div class="activity-row">
      <div>
        <strong>${escapeHtml(item.category)}</strong>
        <span class="muted">${formatDate(item.date)}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</span>
      </div>
      <strong class="${item.type === 'income' ? 'positive' : 'negative'}">
        ${item.type === 'income' ? '+' : '-'}${formatMoney(item.amount)}
      </strong>
    </div>
  `).join('')}</div>`;
}

function renderIncomeHistory() {
  if (!data.income.length) return '<div class="empty">No income recorded yet.</div>';

  return `<div class="transaction-list">${[...data.income]
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))
    .map(item => `
      <div class="transaction-row">
        <div>
          <strong>${escapeHtml(item.category)}</strong>
          <span class="muted">${formatDate(item.date)}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</span>
        </div>
        <div class="transaction-actions">
          <strong class="positive">+${formatMoney(item.amount)}</strong>
          <button class="text-button" type="button" data-edit-income="${item.id}">Edit</button>
          <button class="text-button danger" type="button" data-delete-income="${item.id}">Delete</button>
        </div>
      </div>
    `).join('')}</div>`;
}

function renderExpenseHistory() {
  if (!data.expenses.length) return '<div class="empty">No expenses recorded yet.</div>';

  return `<div class="transaction-list">${[...data.expenses]
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))
    .map(item => `
      <div class="transaction-row">
        <div>
          <strong>${escapeHtml(item.category)}</strong>
          <span class="muted">${formatDate(item.date)}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</span>
        </div>
        <div class="transaction-actions">
          <strong class="negative">-${formatMoney(item.amount)}</strong>
          <button class="text-button" type="button" data-edit-expense="${item.id}">Edit</button>
          <button class="text-button danger" type="button" data-delete-expense="${item.id}">Delete</button>
        </div>
      </div>
    `).join('')}</div>`;
}

const pages = {
  dashboard: {
    title: 'Dashboard',
    render: () => {
      const { income, expenses, balance } = totals();
      return `
        <div class="stats-grid">
          <article class="card"><p class="stat-label">Total income</p><p class="stat-value">${formatMoney(income)}</p></article>
          <article class="card"><p class="stat-label">Total expenses</p><p class="stat-value">${formatMoney(expenses)}</p></article>
          <article class="card"><p class="stat-label">Balance</p><p class="stat-value">${formatMoney(balance)}</p></article>
        </div>
        <div class="dashboard-grid">
          <article class="card">
            <h2>Income vs. expenses</h2>
            <div class="chart" aria-label="Income and expense chart">
              <div class="chart-empty">${income || expenses ? 'Your chart will expand as transactions are added.' : 'Add income or expenses to see your trends.'}</div>
            </div>
          </article>
          <article class="card">
            <h2>Recent activity</h2>
            ${renderRecentActivity()}
          </article>
        </div>
      `;
    }
  },

  income: {
    title: 'Income',
    render: () => `
      <article class="card form-card">
        <h2>Add income</h2>
        <form class="form-grid" id="incomeForm">
          <label>Category
            <select name="category" required>
              <option>Salary</option><option>Business</option><option>Freelance</option><option>Investment</option><option>Other</option>
            </select>
          </label>
          <label>Amount
            <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required>
          </label>
          <label>Date
            <input name="date" type="date" value="${today()}" required>
          </label>
          <label>Note
            <input name="note" type="text" maxlength="120" placeholder="Optional">
          </label>
          <button class="primary-button" type="submit">Add income</button>
        </form>
      </article>

      <article class="card list-card">
        <div class="section-heading">
          <div><h2>Income history</h2><p class="muted">${data.income.length} record${data.income.length === 1 ? '' : 's'}</p></div>
        </div>
        ${renderIncomeHistory()}
      </article>
    `
  },

  expenses: {
    title: 'Expenses',
    render: () => `
      <article class="card form-card">
        <h2>Add expense</h2>
        <form class="form-grid" id="expenseForm">
          <label>Category
            <select name="category" required>
              <option>Food</option><option>Transport</option><option>Housing</option><option>Utilities</option><option>Shopping</option><option>Health</option><option>Other</option>
            </select>
          </label>
          <label>Amount
            <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required>
          </label>
          <label>Date
            <input name="date" type="date" value="${today()}" required>
          </label>
          <label>Note
            <input name="note" type="text" maxlength="120" placeholder="Optional">
          </label>
          <button class="primary-button" type="submit">Add expense</button>
        </form>
      </article>

      <article class="card list-card">
        <div class="section-heading">
          <div><h2>Expense history</h2><p class="muted">${data.expenses.length} record${data.expenses.length === 1 ? '' : 's'}</p></div>
        </div>
        ${renderExpenseHistory()}
      </article>
    `
  },

  budget: {
    title: 'Budget',
    render: () => `
      <article class="card form-card">
        <h2>Set a budget</h2>
        <form class="form-grid">
          <label>Category<select><option>Food</option><option>Transport</option><option>Housing</option><option>Other</option></select></label>
          <label>Budget amount<input type="number" min="0" step="0.01" placeholder="0.00"></label>
          <button class="primary-button" type="button">Save budget</button>
        </form>
      </article>
    `
  },

  settings: {
    title: 'Settings',
    render: () => `
      <article class="card form-card">
        <h2>Settings</h2>
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
    `
  }
};

function showPage(name) {
  const page = pages[name] || pages.dashboard;
  pageTitle.textContent = page.title;
  pageContent.innerHTML = page.render();
  document.querySelectorAll('.nav-item').forEach(button => {
    button.classList.toggle('active', button.dataset.page === name);
  });
  sidebar.classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => showPage(button.dataset.page));
});

document.getElementById('menuButton').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

pageContent.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form).entries());

  if (form.id === 'incomeForm' || form.id === 'expenseForm') {
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !values.date) return;

    const transaction = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      category: values.category,
      amount,
      date: values.date,
      note: values.note.trim(),
      createdAt: Date.now()
    };

    if (form.id === 'incomeForm') data.income.push(transaction);
    else data.expenses.push(transaction);

    saveData();
    showPage(form.id === 'incomeForm' ? 'income' : 'expenses');
    return;
  }

  if (form.id === 'settingsForm') {
    data.settings.currency = values.currency;
    saveData();
    showPage('settings');
  }
});

pageContent.addEventListener('click', event => {
  const editIncome = event.target.closest('[data-edit-income]');
  const deleteIncome = event.target.closest('[data-delete-income]');
  const editExpense = event.target.closest('[data-edit-expense]');
  const deleteExpense = event.target.closest('[data-delete-expense]');

  if (deleteIncome || deleteExpense) {
    const id = (deleteIncome || deleteExpense).dataset.deleteIncome || (deleteIncome || deleteExpense).dataset.deleteExpense;
    const isIncome = Boolean(deleteIncome);
    if (!confirm(`Delete this ${isIncome ? 'income' : 'expense'} record?`)) return;

    if (isIncome) data.income = data.income.filter(item => item.id !== id);
    else data.expenses = data.expenses.filter(item => item.id !== id);

    saveData();
    showPage(isIncome ? 'income' : 'expenses');
    return;
  }

  if (editIncome || editExpense) {
    const isIncome = Boolean(editIncome);
    const id = (editIncome || editExpense).dataset.editIncome || (editIncome || editExpense).dataset.editExpense;
    const collection = isIncome ? data.income : data.expenses;
    const item = collection.find(entry => entry.id === id);
    if (!item) return;

    const category = prompt(`${isIncome ? 'Income' : 'Expense'} category:`, item.category);
    if (category === null || !category.trim()) return;
    const amount = Number(prompt('Amount:', item.amount));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const date = prompt('Date (YYYY-MM-DD):', item.date);
    if (!date) return;
    const note = prompt('Note:', item.note || '');

    Object.assign(item, { category: category.trim(), amount, date, note: note ?? item.note });
    saveData();
    showPage(isIncome ? 'income' : 'expenses');
  }
});

showPage('dashboard');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

const pageContent = document.getElementById('pageContent');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');

const pages = {
  dashboard: {
    title: 'Dashboard',
    render: () => `
      <div class="stats-grid">
        <article class="card"><p class="stat-label">Total income</p><p class="stat-value">0.00</p></article>
        <article class="card"><p class="stat-label">Total expenses</p><p class="stat-value">0.00</p></article>
        <article class="card"><p class="stat-label">Balance</p><p class="stat-value">0.00</p></article>
      </div>
      <div class="dashboard-grid">
        <article class="card">
          <h2>Income vs. expenses</h2>
          <div class="chart" aria-label="Income and expense chart">
            ${[35, 65, 45, 80, 55, 70, 50, 90].map(height => `<span class="bar" style="height:${height}%"></span>`).join('')}
          </div>
          <p class="muted">Charts will use your saved transactions.</p>
        </article>
        <article class="card">
          <h2>Recent activity</h2>
          <div class="empty">No transactions yet.</div>
        </article>
      </div>
    `
  },
  income: {
    title: 'Income',
    render: () => `
      <article class="card form-card">
        <h2>Add income</h2>
        <form class="form-grid" id="incomeForm">
          <label>Category<select><option>Salary</option><option>Business</option><option>Other</option></select></label>
          <label>Amount<input type="number" min="0" step="0.01" placeholder="0.00" required></label>
          <label>Date<input type="date" required></label>
          <label>Note<input type="text" placeholder="Optional"></label>
          <button class="primary-button" type="submit">Add income</button>
        </form>
      </article>
    `
  },
  expenses: {
    title: 'Expenses',
    render: () => `
      <article class="card form-card">
        <h2>Add expense</h2>
        <form class="form-grid" id="expenseForm">
          <label>Category<select><option>Food</option><option>Transport</option><option>Housing</option><option>Other</option></select></label>
          <label>Amount<input type="number" min="0" step="0.01" placeholder="0.00" required></label>
          <label>Date<input type="date" required></label>
          <label>Note<input type="text" placeholder="Optional"></label>
          <button class="primary-button" type="submit">Add expense</button>
        </form>
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
        <div class="form-grid">
          <label>Currency<select><option>ETB — Ethiopian Birr</option><option>USD — US Dollar</option><option>EUR — Euro</option></select></label>
          <p class="muted">More settings will be added after the core budgeting features.</p>
        </div>
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
  alert('Local storage will be connected in the next phase.');
});

showPage('dashboard');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

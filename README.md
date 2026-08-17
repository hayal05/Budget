# Budget

A simple offline-first individual budgeting app.

## Features

- Dashboard with total income, expenses and balance
- Monthly income-vs-expense bar chart
- Six-month income and expense trend line
- Major expense categories and income sources
- Budget overview with spending progress and over-budget state
- Income records with add, edit and delete
- Expense records with add, edit and delete
- Category budgets with add, edit and delete
- Currency preference (ETB, USD and EUR)
- JSON export/import backup
- Local browser storage with no server or account required
- Responsive sidebar and mobile-friendly transaction lists
- Installable PWA foundation with service-worker caching

## Data and privacy

Financial data is stored locally in the browser. The app does not require an account or backend server. Export a JSON backup from Settings before clearing browser data or moving to another device.

## Offline behavior

After the application has been loaded once, the service worker caches the application files so the app can continue to open without an internet connection. Stored financial data remains available through browser local storage.

## Development status

Core functionality and responsive UI are implemented. The project is ready for browser/device acceptance testing and final deployment packaging.

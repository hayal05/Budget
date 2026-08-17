# Budget

A simple offline-first individual budgeting app.

## Current features

- Dashboard with income, expenses, balance, monthly bar chart and six-month trend
- Major expense categories and income sources
- Income records with add, edit and delete
- Expense records with add, edit and delete
- Category budgets with spending, remaining amount and progress
- Currency preference
- JSON export/import backup
- Full local data storage with no server or account required
- Responsive sidebar for desktop and mobile
- Installable PWA foundation

## Offline behavior

Financial data is stored locally on the device using browser storage. The service worker caches the application files so the app can continue to open without an internet connection after it has been loaded once.

## Development status

Core functionality is implemented. The next stage is final testing across browsers/devices and production packaging.

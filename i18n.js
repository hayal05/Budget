(() => {
  const translations = {
    'Dashboard':'ዳሽቦርድ','Income':'ገቢ','Expenses':'ወጪ','Budget':'በጀት','Settings':'ማስተካከያዎች',
    'Financial analytics':'የፋይናንስ ትንታኔ','Total income':'ጠቅላላ ገቢ','Total expenses':'ጠቅላላ ወጪ','Balance':'ቀሪ ሂሳብ',
    'Income vs. expenses':'ገቢ እና ወጪ','Recent activity':'የቅርብ ጊዜ እንቅስቃሴ',
    'Your chart will expand as transactions are added.':'ግብይቶች ሲጨመሩ ገበታው ይሰፋል።',
    'Add income':'ገቢ አክል','Income history':'የገቢ ታሪክ','Add expense':'ወጪ አክል','Expense history':'የወጪ ታሪክ',
    'Set a budget':'በጀት ያዘጋጁ','Budget amount':'የበጀት መጠን','Save budget':'በጀት አስቀምጥ',
    'Save settings':'ማስተካከያዎችን አስቀምጥ','Currency':'ምንዛሬ','Category':'ምድብ','Source':'ምንጭ','Amount':'መጠን','Date':'ቀን','Note':'ማስታወሻ',
    'Item':'ዕቃ','Unit price':'የአንድ ዋጋ','Quantity':'ብዛት','Total cost':'ጠቅላላ ወጪ','Save':'አስቀምጥ','Edit':'አርትዕ','Delete':'ሰርዝ','Actions':'ተግባራት',
    'Salary':'ደመወዝ','Business':'ንግድ','Freelance':'ፍሪላንስ','Investment':'ኢንቨስትመንት','Other':'ሌላ',
    'Food':'ምግብ','Transport':'መጓጓዣ','Housing':'መኖሪያ ቤት','Utilities':'የመገልገያ አገልግሎቶች','Shopping':'ግዢ','Health':'ጤና',
    'ETB — Ethiopian Birr':'ETB — የኢትዮጵያ ብር','USD — US Dollar':'USD — የአሜሪካ ዶላር','EUR — Euro':'EUR — ዩሮ',
    'No transactions yet.':'እስካሁን ምንም ግብይት የለም።','No income recorded yet.':'እስካሁን ገቢ አልተመዘገበም።','No expenses recorded yet.':'እስካሁን ወጪ አልተመዘገበም።',
    'records':'መዝገቦች','record':'መዝገብ','powered by NATRA Technology ©2026':'በ NATRA Technology የተጎለበተ ©2026'
  };
  const reverse = Object.fromEntries(Object.entries(translations).map(([en,am]) => [am,en]));
  let language = localStorage.getItem('budget_language') || 'en';
  let applying = false;

  function translate(root = document.body) {
    if (applying) return;
    applying = true;
    const map = language === 'am' ? translations : reverse;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.nodeValue.trim() || node.parentElement?.closest('#languageSwitch')) return;
      const trimmed = node.nodeValue.trim();
      if (map[trimmed]) node.nodeValue = node.nodeValue.replace(trimmed, map[trimmed]);
    });
    document.querySelectorAll('option').forEach(option => {
      const key = option.textContent.trim();
      if (map[key]) option.textContent = map[key];
    });
    const title = document.getElementById('pageTitle');
    if (title) document.title = language === 'am' ? 'በጀት' : 'Budget';
    applying = false;
  }

  function addSwitch() {
    if (document.getElementById('languageSwitch')) return;
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const button = document.createElement('button');
    button.id = 'languageSwitch';
    button.type = 'button';
    button.setAttribute('aria-label','Switch language');
    button.innerHTML = '<span>EN</span><i>│</i><span>አማ</span>';
    button.style.cssText = 'margin-left:auto;display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:#0b2a4a;color:#fff;padding:5px 9px;font:500 11px/1 Arial,sans-serif;cursor:pointer;white-space:nowrap;';
    button.addEventListener('click', () => {
      language = language === 'en' ? 'am' : 'en';
      localStorage.setItem('budget_language', language);
      translate();
      button.querySelectorAll('span').forEach((s,i) => s.style.opacity = (language === 'en' ? i === 0 : i === 1) ? '1' : '.5');
    });
    topbar.appendChild(button);
    button.querySelectorAll('span').forEach((s,i) => s.style.opacity = (language === 'en' ? i === 0 : i === 1) ? '1' : '.5');
  }

  function init() {
    addSwitch();
    translate();
    const observer = new MutationObserver(() => { addSwitch(); translate(); });
    observer.observe(document.body, { childList:true, subtree:true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

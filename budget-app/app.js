const STORAGE_KEY = "simple-budget-transactions";
const ACCOUNTS_KEY = "simple-budget-accounts";

const CATEGORIES = [
  "General", "Tithe", "Gifting", "Food", "Eating Out", "Housing",
  "Utilities", "Transportation", "Subscriptions", "Entertainment",
  "Health", "Insurance", "Personal Care", "Education", "Savings",
  "Salary", "Other",
];

const CATEGORY_RULES = [
  { category: "Tithe", keywords: ["tithe", "offering", "church"] },
  { category: "Gifting", keywords: ["gift", "donation", "charity"] },
  { category: "Food", keywords: ["grocery", "groceries", "market", "safeway", "walmart", "trader joe", "costco", "kroger", "vons", "ralphs", "whole foods", "aldi", "sprouts"] },
  { category: "Eating Out", keywords: ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "chipotle", "doordash", "uber eats", "ubereats", "grubhub", "pizza", "chick-fil-a", "in-n-out", "wendy", "subway"] },
  { category: "Housing", keywords: ["rent", "mortgage", "apartment", "landlord"] },
  { category: "Utilities", keywords: ["electric", "water dept", "gas company", "utility", "internet", "comcast", "xfinity", "verizon", "at&t", "t-mobile", "spectrum"] },
  { category: "Transportation", keywords: ["shell", "chevron", "exxon", "gas station", "uber", "lyft", "parking", "dmv", "car wash"] },
  { category: "Subscriptions", keywords: ["netflix", "spotify", "hulu", "disney+", "amazon prime", "subscription", "apple.com/bill", "icloud"] },
  { category: "Entertainment", keywords: ["movie", "theatre", "theater", "amc", "concert", "ticketmaster", "cinema"] },
  { category: "Health", keywords: ["pharmacy", "cvs", "walgreens", "doctor", "medical", "dental", "clinic", "hospital"] },
  { category: "Insurance", keywords: ["insurance", "geico", "progressive", "state farm"] },
  { category: "Personal Care", keywords: ["salon", "barber", "spa", "haircut"] },
  { category: "Education", keywords: ["tuition", "university", "college", "school"] },
  { category: "Savings", keywords: ["transfer to savings", "savings deposit"] },
  { category: "Salary", keywords: ["payroll", "direct dep", "salary", "paycheck"] },
];

function categorize(description) {
  const d = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => d.includes(k))) return rule.category;
  }
  return "Other";
}

const form = document.getElementById("txForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categorySelect = document.getElementById("category");
const filterCategory = document.getElementById("filterCategory");
const txList = document.getElementById("txList");
const emptyState = document.getElementById("emptyState");
const byCategoryCard = document.getElementById("byCategoryCard");
const byCategoryList = document.getElementById("byCategoryList");
const typeButtons = document.querySelectorAll(".type-toggle button");

const monthlyCard = document.getElementById("monthlyCard");
const monthlyList = document.getElementById("monthlyList");
const compareMonthA = document.getElementById("compareMonthA");
const compareMonthB = document.getElementById("compareMonthB");
const compareHeaderA = document.getElementById("compareHeaderA");
const compareHeaderB = document.getElementById("compareHeaderB");
const compareBody = document.getElementById("compareBody");

let monthlySummaries = {};

const csvFile = document.getElementById("csvFile");
const mappingSection = document.getElementById("mappingSection");
const mapDate = document.getElementById("mapDate");
const mapDesc = document.getElementById("mapDesc");
const mapAmount = document.getElementById("mapAmount");
const mapDebit = document.getElementById("mapDebit");
const mapCredit = document.getElementById("mapCredit");
const amountMode = document.getElementById("amountMode");
const singleAmountWrap = document.getElementById("singleAmountWrap");
const debitWrap = document.getElementById("debitWrap");
const creditWrap = document.getElementById("creditWrap");
const previewBtn = document.getElementById("previewBtn");
const previewSection = document.getElementById("previewSection");
const previewBody = document.getElementById("previewBody");
const previewCount = document.getElementById("previewCount");
const importBtn = document.getElementById("importBtn");

const checkingInput = document.getElementById("checkingBalance");
const savingsInput = document.getElementById("savingsBalance");
const accountsTotal = document.getElementById("accountsTotal");

let currentType = "income";
let transactions = loadTransactions();
let accounts = loadAccounts();
let csvHeaders = [];
let csvRows = [];
let previewRows = [];

dateInput.value = new Date().toISOString().slice(0, 10);
categorySelect.innerHTML = CATEGORIES.map((c) => `<option>${c}</option>`).join("");

typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    typeButtons.forEach((b) => b.classList.toggle("active", b === btn));
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) return;

  transactions.push({
    id: crypto.randomUUID(),
    type: currentType,
    description: descInput.value.trim() || "Untitled",
    amount,
    category: categorySelect.value,
    date: dateInput.value,
  });

  saveTransactions();
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  currentType = "income";
  typeButtons.forEach((b) => b.classList.toggle("active", b.dataset.type === "income"));
  render();
});

filterCategory.addEventListener("change", render);
compareMonthA.addEventListener("change", () => renderComparison());
compareMonthB.addEventListener("change", () => renderComparison());

txList.addEventListener("click", (e) => {
  const btn = e.target.closest(".tx-delete");
  if (!btn) return;
  const id = btn.dataset.id;
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  render();
});

csvFile.addEventListener("change", async () => {
  const file = csvFile.files[0];
  if (!file) return;
  const text = await file.text();
  const rows = parseCSV(text).filter((r) => r.some((cell) => cell.trim() !== ""));
  if (!rows.length) return;

  csvHeaders = rows[0];
  csvRows = rows.slice(1);

  const options = csvHeaders.map((h, i) => `<option value="${i}">${escapeHtml(h)}</option>`).join("");
  [mapDate, mapDesc, mapAmount, mapDebit, mapCredit].forEach((sel) => (sel.innerHTML = options));

  const guess = guessColumnIndices(csvHeaders);
  if (guess.date >= 0) mapDate.value = guess.date;
  if (guess.desc >= 0) mapDesc.value = guess.desc;
  if (guess.amount >= 0) mapAmount.value = guess.amount;
  if (guess.debit >= 0) mapDebit.value = guess.debit;
  if (guess.credit >= 0) mapCredit.value = guess.credit;
  amountMode.value = guess.debit >= 0 && guess.credit >= 0 ? "split" : "single";
  toggleAmountMode();

  mappingSection.style.display = "block";
  previewSection.style.display = "none";
});

amountMode.addEventListener("change", toggleAmountMode);

function toggleAmountMode() {
  const split = amountMode.value === "split";
  singleAmountWrap.style.display = split ? "none" : "block";
  debitWrap.style.display = split ? "block" : "none";
  creditWrap.style.display = split ? "block" : "none";
}

previewBtn.addEventListener("click", () => {
  const existingFingerprints = new Set(
    transactions.map((t) => `${t.date}|${t.description.toLowerCase()}|${t.amount.toFixed(2)}|${t.type}`)
  );

  const dateIdx = Number(mapDate.value);
  const descIdx = Number(mapDesc.value);
  const split = amountMode.value === "split";
  const amountIdx = Number(mapAmount.value);
  const debitIdx = Number(mapDebit.value);
  const creditIdx = Number(mapCredit.value);

  previewRows = csvRows.map((row) => {
    const rawDate = (row[dateIdx] || "").trim();
    const description = (row[descIdx] || "").trim() || "Untitled";
    const date = parseCSVDate(rawDate);

    let type, amount;
    if (split) {
      const debit = parseFloat((row[debitIdx] || "").replace(/[^0-9.-]/g, "")) || 0;
      const credit = parseFloat((row[creditIdx] || "").replace(/[^0-9.-]/g, "")) || 0;
      if (debit > 0) { type = "expense"; amount = Math.abs(debit); }
      else { type = "income"; amount = Math.abs(credit); }
    } else {
      const raw = parseFloat((row[amountIdx] || "").replace(/[^0-9.-]/g, "")) || 0;
      type = raw < 0 ? "expense" : "income";
      amount = Math.abs(raw);
    }

    const fingerprint = `${date}|${description.toLowerCase()}|${amount.toFixed(2)}|${type}`;
    return {
      date,
      description,
      amount,
      type,
      category: categorize(description),
      duplicate: existingFingerprints.has(fingerprint),
      include: !existingFingerprints.has(fingerprint) && amount > 0,
    };
  }).filter((r) => r.amount > 0);

  renderPreview();
  previewSection.style.display = "block";
});

function renderPreview() {
  previewCount.textContent = `${previewRows.filter((r) => r.include).length} of ${previewRows.length} selected`;
  previewBody.innerHTML = previewRows.map((r, i) => `
    <tr class="${r.duplicate ? "duplicate" : ""}">
      <td><input type="checkbox" data-idx="${i}" class="rowInclude" ${r.include ? "checked" : ""}></td>
      <td>${r.date ? formatDate(r.date) : "?"}</td>
      <td>${escapeHtml(r.description)}${r.duplicate ? '<span class="dup-tag">Possible duplicate</span>' : ""}</td>
      <td class="amt ${r.type}">${r.type === "expense" ? "-" : "+"}${formatCurrency(r.amount)}</td>
      <td>
        <select data-idx="${i}" class="rowCategory">
          ${CATEGORIES.map((c) => `<option ${c === r.category ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </td>
    </tr>
  `).join("");
}

previewBody.addEventListener("change", (e) => {
  const idx = Number(e.target.dataset.idx);
  if (e.target.classList.contains("rowInclude")) {
    previewRows[idx].include = e.target.checked;
    previewCount.textContent = `${previewRows.filter((r) => r.include).length} of ${previewRows.length} selected`;
  } else if (e.target.classList.contains("rowCategory")) {
    previewRows[idx].category = e.target.value;
  }
});

importBtn.addEventListener("click", () => {
  const toImport = previewRows.filter((r) => r.include && r.date);
  toImport.forEach((r) => {
    transactions.push({
      id: crypto.randomUUID(),
      type: r.type,
      description: r.description,
      amount: r.amount,
      category: r.category,
      date: r.date,
    });
  });
  saveTransactions();
  previewSection.style.display = "none";
  mappingSection.style.display = "none";
  csvFile.value = "";
  render();
});

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field); field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function guessColumnIndices(headers) {
  const lower = headers.map((h) => h.trim().toLowerCase());
  const find = (synonyms) => lower.findIndex((h) => synonyms.includes(h));
  return {
    date: find(["date", "transaction date", "posted date", "post date"]),
    desc: find(["description", "memo", "payee", "merchant", "details", "transaction description"]),
    amount: find(["amount", "transaction amount"]),
    debit: find(["debit", "withdrawal", "withdrawals", "debits"]),
    credit: find(["credit", "deposit", "deposits", "credits"]),
  };
}

function parseCSVDate(raw) {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const mdY = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdY) {
    let [, m, d, y] = mdY;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(raw);
  if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);
  return "";
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : { checking: null, savings: null };
  } catch {
    return { checking: null, savings: null };
  }
}

function saveAccounts() {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function renderAccounts() {
  checkingInput.value = accounts.checking ?? "";
  savingsInput.value = accounts.savings ?? "";
  const total = (accounts.checking || 0) + (accounts.savings || 0);
  accountsTotal.textContent = `Total: ${formatCurrency(total)}`;
}

checkingInput.addEventListener("change", () => {
  accounts.checking = checkingInput.value === "" ? null : parseFloat(checkingInput.value);
  saveAccounts();
  renderAccounts();
});

savingsInput.addEventListener("change", () => {
  accounts.savings = savingsInput.value === "" ? null : parseFloat(savingsInput.value);
  saveAccounts();
  renderAccounts();
});

function formatCurrency(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatDate(d) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

function render() {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  document.getElementById("totalIncome").textContent = formatCurrency(income);
  document.getElementById("totalExpense").textContent = formatCurrency(expense);
  const balanceEl = document.getElementById("totalBalance");
  balanceEl.textContent = formatCurrency(balance);
  balanceEl.style.color = balance >= 0 ? "var(--income)" : "var(--expense)";

  const categories = [...new Set(transactions.map((t) => t.category))].sort();
  const prevFilter = filterCategory.value;
  filterCategory.innerHTML = '<option value="">All categories</option>' +
    categories.map((c) => `<option value="${c}">${c}</option>`).join("");
  filterCategory.value = categories.includes(prevFilter) ? prevFilter : "";

  const filtered = filterCategory.value
    ? transactions.filter((t) => t.category === filterCategory.value)
    : transactions;
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  txList.innerHTML = sorted.map((t) => `
    <li class="tx">
      <div class="tx-left">
        <span class="tx-desc">${escapeHtml(t.description)}</span>
        <span class="tx-meta">${t.category} · ${formatDate(t.date)}</span>
      </div>
      <div class="tx-right">
        <span class="tx-amount ${t.type}">${t.type === "expense" ? "-" : "+"}${formatCurrency(t.amount)}</span>
        <button class="tx-delete" data-id="${t.id}" title="Delete">&times;</button>
      </div>
    </li>
  `).join("");

  emptyState.style.display = sorted.length ? "none" : "block";

  const expensesByCategory = {};
  transactions.filter((t) => t.type === "expense").forEach((t) => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });
  const catEntries = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  if (catEntries.length) {
    byCategoryCard.style.display = "block";
    byCategoryList.innerHTML = catEntries.map(([cat, amt]) => `
      <div class="cat-row"><span>${cat}</span><span>${formatCurrency(amt)}</span></div>
    `).join("");
  } else {
    byCategoryCard.style.display = "none";
  }

  renderMonthlyAnalytics();
}

function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : "";
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function buildMonthlySummaries() {
  const summaries = {};
  transactions.forEach((t) => {
    const key = monthKey(t.date);
    if (!key) return;
    if (!summaries[key]) summaries[key] = { income: 0, expense: 0, categories: {} };
    if (t.type === "income") {
      summaries[key].income += t.amount;
    } else {
      summaries[key].expense += t.amount;
      summaries[key].categories[t.category] = (summaries[key].categories[t.category] || 0) + t.amount;
    }
  });
  return summaries;
}

function renderMonthlyAnalytics() {
  monthlySummaries = buildMonthlySummaries();
  const keys = Object.keys(monthlySummaries).sort().reverse();

  if (!keys.length) {
    monthlyCard.style.display = "none";
    return;
  }
  monthlyCard.style.display = "block";

  const maxExpense = Math.max(...keys.map((k) => monthlySummaries[k].expense), 1);
  monthlyList.innerHTML = keys.map((k) => {
    const s = monthlySummaries[k];
    const net = s.income - s.expense;
    const barWidth = (s.expense / maxExpense) * 100;
    return `
      <div class="month-row">
        <div class="month-row-header">
          <span>${monthLabel(k)}</span>
          <span class="${net >= 0 ? "diff-down" : "diff-up"}">${net >= 0 ? "+" : "-"}${formatCurrency(Math.abs(net))}</span>
        </div>
        <div class="month-bar-track"><div class="month-bar-fill" style="width:${barWidth}%"></div></div>
        <div class="month-row-meta">
          <span>Income: ${formatCurrency(s.income)}</span>
          <span>Expenses: ${formatCurrency(s.expense)}</span>
        </div>
      </div>
    `;
  }).join("");

  const prevA = compareMonthA.value;
  const prevB = compareMonthB.value;
  const options = keys.map((k) => `<option value="${k}">${monthLabel(k)}</option>`).join("");
  compareMonthA.innerHTML = options;
  compareMonthB.innerHTML = options;
  compareMonthA.value = keys.includes(prevA) ? prevA : keys[0];
  compareMonthB.value = keys.includes(prevB) ? prevB : (keys[1] || keys[0]);

  renderComparison();
}

function renderComparison() {
  const a = compareMonthA.value;
  const b = compareMonthB.value;
  if (!a || !b) return;

  compareHeaderA.textContent = monthLabel(a);
  compareHeaderB.textContent = monthLabel(b);

  const sa = monthlySummaries[a] || { income: 0, expense: 0, categories: {} };
  const sb = monthlySummaries[b] || { income: 0, expense: 0, categories: {} };
  const categories = [...new Set([...Object.keys(sa.categories), ...Object.keys(sb.categories)])].sort();

  const diffCell = (va, vb) => {
    const diff = va - vb;
    if (Math.abs(diff) < 0.005) return `<span class="diff-flat">no change</span>`;
    const cls = diff > 0 ? "diff-up" : "diff-down";
    const sign = diff > 0 ? "+" : "-";
    return `<span class="${cls}">${sign}${formatCurrency(Math.abs(diff))}</span>`;
  };

  const rows = categories.map((cat) => {
    const va = sa.categories[cat] || 0;
    const vb = sb.categories[cat] || 0;
    return `
      <tr>
        <td>${escapeHtml(cat)}</td>
        <td>${formatCurrency(va)}</td>
        <td>${formatCurrency(vb)}</td>
        <td>${diffCell(va, vb)}</td>
      </tr>
    `;
  }).join("");

  const totalRow = `
    <tr style="font-weight:600;">
      <td>Total Expenses</td>
      <td>${formatCurrency(sa.expense)}</td>
      <td>${formatCurrency(sb.expense)}</td>
      <td>${diffCell(sa.expense, sb.expense)}</td>
    </tr>
  `;

  compareBody.innerHTML = rows + totalRow;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

render();
renderAccounts();

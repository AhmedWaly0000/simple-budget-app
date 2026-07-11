const STORAGE_KEY = "simple-budget-transactions";

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

let currentType = "income";
let transactions = loadTransactions();

dateInput.value = new Date().toISOString().slice(0, 10);

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

txList.addEventListener("click", (e) => {
  const btn = e.target.closest(".tx-delete");
  if (!btn) return;
  const id = btn.dataset.id;
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  render();
});

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
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

render();

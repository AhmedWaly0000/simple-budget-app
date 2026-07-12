const STORAGE_KEY = "momentum-habits";

const CATEGORY_LABEL = {
  faith: "Faith & Growth",
  body: "Body & Training",
  craft: "Craft & Ministry",
};

const form = document.getElementById("addForm");
const nameInput = document.getElementById("habitName");
const categorySelect = document.getElementById("habitCategory");
const cadenceSelect = document.getElementById("habitCadence");
const statusSelect = document.getElementById("habitStatus");
const cardGrid = document.getElementById("cardGrid");
const activeEmpty = document.getElementById("activeEmpty");
const benchScroll = document.getElementById("benchScroll");
const benchEmpty = document.getElementById("benchEmpty");
const doneNum = document.getElementById("doneNum");
const bestStreakNum = document.getElementById("bestStreakNum");
const avgRateNum = document.getElementById("avgRateNum");
const dateLabel = document.getElementById("dateLabel");

let habits = loadHabits();

dateLabel.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short", month: "short", day: "numeric",
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  habits.push({
    id: crypto.randomUUID(),
    name,
    category: categorySelect.value,
    cadence: cadenceSelect.value,
    status: statusSelect.value,
    createdAt: todayStr(),
    completions: [],
  });

  saveHabits();
  form.reset();
  render();
});

cardGrid.addEventListener("click", (e) => {
  const seg = e.target.closest(".segs button");
  const mark = e.target.closest(".mark-btn");
  const del = e.target.closest(".card-del");
  const card = e.target.closest(".card");
  if (!card) return;
  const habit = habits.find((h) => h.id === card.dataset.id);
  if (!habit) return;

  if (seg) {
    toggleCompletion(habit, seg.dataset.date);
    saveHabits();
    render();
  } else if (mark) {
    toggleCompletion(habit, todayStr());
    saveHabits();
    render();
  } else if (del) {
    habits = habits.filter((h) => h.id !== habit.id);
    saveHabits();
    render();
  }
});

benchScroll.addEventListener("click", (e) => {
  const play = e.target.closest(".play-btn");
  const del = e.target.closest(".bench-del");
  const card = e.target.closest(".bench-card");
  if (!card) return;
  const habit = habits.find((h) => h.id === card.dataset.id);
  if (!habit) return;

  if (play) {
    habit.status = "active";
    habit.createdAt = todayStr();
    saveHabits();
    render();
  } else if (del) {
    habits = habits.filter((h) => h.id !== habit.id);
    saveHabits();
    render();
  }
});

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayStr() {
  return toLocalDateStr(new Date());
}

function addDays(dateStr, delta) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toLocalDateStr(date);
}

function last7Days() {
  const today = todayStr();
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDays(today, -i));
  return days;
}

function weekStart(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
}

function toggleCompletion(habit, dateStr) {
  const idx = habit.completions.indexOf(dateStr);
  if (idx >= 0) habit.completions.splice(idx, 1);
  else habit.completions.push(dateStr);
}

function computeStreak(habit) {
  const done = new Set(habit.completions);
  const today = todayStr();

  if (habit.cadence === "weekly") {
    const weeksWithCompletion = new Set(habit.completions.map(weekStart));
    let cursor = weekStart(today);
    if (!weeksWithCompletion.has(cursor)) cursor = addDays(cursor, -7);
    let streak = 0;
    while (weeksWithCompletion.has(cursor)) {
      streak++;
      cursor = addDays(cursor, -7);
    }
    return streak;
  }

  let cursor = today;
  if (!done.has(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (done.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function computeCompletionRate(habit) {
  const today = todayStr();
  const daysSinceStart = Math.max(
    1,
    Math.round((new Date(today) - new Date(habit.createdAt)) / 86400000) + 1
  );

  if (habit.cadence === "weekly") {
    const weeksWithCompletion = new Set(habit.completions.map(weekStart));
    const totalWeeks = Math.max(1, Math.min(8, Math.ceil(daysSinceStart / 7)));
    let count = 0;
    let cursor = weekStart(today);
    for (let i = 0; i < totalWeeks; i++) {
      if (weeksWithCompletion.has(cursor)) count++;
      cursor = addDays(cursor, -7);
    }
    return Math.round((count / totalWeeks) * 100);
  }

  const totalDays = Math.max(1, Math.min(30, daysSinceStart));
  const done = new Set(habit.completions);
  let count = 0;
  let cursor = today;
  for (let i = 0; i < totalDays; i++) {
    if (done.has(cursor)) count++;
    cursor = addDays(cursor, -1);
  }
  return Math.round((count / totalDays) * 100);
}

function isDoneNow(habit) {
  const today = todayStr();
  if (habit.cadence === "weekly") {
    return new Set(habit.completions.map(weekStart)).has(weekStart(today));
  }
  return habit.completions.includes(today);
}

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  const active = habits.filter((h) => h.status === "active");
  const planned = habits.filter((h) => h.status === "planned");
  const days = last7Days();
  const today = todayStr();

  const doneToday = active.filter(isDoneNow).length;
  doneNum.textContent = `${doneToday}/${active.length}`;
  bestStreakNum.textContent = active.length ? Math.max(0, ...active.map(computeStreak)) : 0;
  avgRateNum.textContent = active.length
    ? Math.round(active.reduce((s, h) => s + computeCompletionRate(h), 0) / active.length) + "%"
    : "0%";

  cardGrid.innerHTML = active.map((h) => {
    const streak = computeStreak(h);
    const rate = computeCompletionRate(h);
    const done = isDoneNow(h);
    const windowLabel = h.cadence === "weekly" ? "wk" : "d";
    return `
      <div class="card ${done ? "done" : ""}" data-cat="${h.category}" data-id="${h.id}">
        <div class="card-top">
          <div>
            <div class="card-name-row">
              <span class="card-name">${escapeHtml(h.name)}</span>
              <button class="card-del" title="Remove">&times;</button>
            </div>
            <div class="card-cat">${CATEGORY_LABEL[h.category] || h.category}</div>
          </div>
          <div class="card-streak">
            <div class="num mono-num">${streak}</div>
            <div class="lbl">${h.cadence === "weekly" ? "week" : "day"} streak</div>
          </div>
        </div>
        <div class="segs">
          ${days.map((d) => `<button class="${h.completions.includes(d) ? "on" : ""} ${d === today ? "today" : ""}" data-date="${d}" title="${d}"></button>`).join("")}
        </div>
        <div class="card-foot">
          <span class="card-pct">${rate}% · ${h.cadence === "weekly" ? "8wk" : "30" + windowLabel}</span>
          <button class="mark-btn">${done ? "Marked" : "Mark Done"}</button>
        </div>
      </div>
    `;
  }).join("");
  activeEmpty.style.display = active.length ? "none" : "block";

  benchScroll.innerHTML = planned.map((h) => `
    <div class="bench-card" data-id="${h.id}">
      <div class="bench-name">${escapeHtml(h.name)}</div>
      <div class="bench-meta">${CATEGORY_LABEL[h.category] || h.category} · ${h.cadence === "weekly" ? "Weekly" : "Daily"} goal</div>
      <div class="bench-actions">
        <button class="play-btn">Put In Play</button>
        <button class="bench-del" title="Remove">&times;</button>
      </div>
    </div>
  `).join("");
  benchEmpty.style.display = planned.length ? "none" : "block";
}

render();

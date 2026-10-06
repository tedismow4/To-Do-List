let tasks = [];

// Load saved tasks (try/catch in case storage is blocked)
try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (e) {
  tasks = [];
}

// Give older saved tasks an id and a date field
tasks.forEach((t, i) => {
  if (!t.id) t.id = Date.now() + i;
  if (!t.date) t.date = "";
});

const list = document.getElementById("list");
const input = document.getElementById("newTask");
const dateInput = document.getElementById("newDate");
const count = document.getElementById("count");

function save() {
  try { localStorage.setItem("tasks", JSON.stringify(tasks)); } catch (e) {}
}

// Days from today until the due date (negative = overdue)
function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

// Pick the color class based on how close the deadline is
function urgencyClass(task) {
  if (task.done) return "done";
  if (!task.date) return "none";
  const days = daysUntil(task.date);
  if (days < 0) return "overdue";
  if (days <= 2) return "urgent";
  if (days <= 7) return "soon";
  return "later";
}

function dueLabel(task) {
  if (!task.date) return "";
  const days = daysUntil(task.date);
  if (days < -1) return "Overdue by " + Math.abs(days) + " days";
  if (days === -1) return "Overdue by 1 day";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return "Due in " + days + " days";
  const [y, m, d] = task.date.split("-").map(Number);
  return "Due " + new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
}

function render() {
  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = '<li class="empty">No tasks yet. Add one above.</li>';
  }

  // Unfinished first, then by date (soonest first), tasks with no date last
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  sorted.forEach(task => {
    const li = document.createElement("li");
    li.className = urgencyClass(task);

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = task.done;
    box.setAttribute("aria-label", "Mark done");
    box.onchange = () => { task.done = box.checked; save(); render(); };

    const body = document.createElement("div");
    body.className = "task-body";

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    body.appendChild(text);

    if (task.date) {
      const due = document.createElement("span");
      due.className = "task-due";
      due.textContent = dueLabel(task);
      body.appendChild(due);
    }

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete task");
    del.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      save();
      render();
    };

    li.append(box, body, del);
    list.appendChild(li);
  });

  const left = tasks.filter(t => !t.done).length;
  count.textContent = left + (left === 1 ? " task left" : " tasks left");
}

function addTask() {
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, date: dateInput.value, done: false });
  input.value = "";
  dateInput.value = "";
  save();
  render();
  input.focus();
}

document.getElementById("addBtn").onclick = addTask;
input.addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
document.getElementById("clearBtn").onclick = () => {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
};

render();
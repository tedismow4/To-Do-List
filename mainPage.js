let tasks = [];

    // Load saved tasks (wrapped in try/catch in case storage is blocked)
    try {
      tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
      tasks = [];
    }

    const list = document.getElementById("list");
    const input = document.getElementById("newTask");
    const count = document.getElementById("count");

    function save() {
      try { localStorage.setItem("tasks", JSON.stringify(tasks)); } catch (e) {}
    }

    function render() {
      list.innerHTML = "";

      if (tasks.length === 0) {
        list.innerHTML = '<li class="empty">No tasks yet. Add one above.</li>';
      }

      tasks.forEach((task, i) => {
        const li = document.createElement("li");
        if (task.done) li.classList.add("done");

        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = task.done;
        box.setAttribute("aria-label", "Mark done");
        box.onchange = () => { task.done = box.checked; save(); render(); };

        const text = document.createElement("span");
        text.textContent = task.text;

        const del = document.createElement("button");
        del.className = "delete";
        del.textContent = "×";
        del.setAttribute("aria-label", "Delete task");
        del.onclick = () => { tasks.splice(i, 1); save(); render(); };

        li.append(box, text, del);
        list.appendChild(li);
      });

      const left = tasks.filter(t => !t.done).length;
      count.textContent = left + (left === 1 ? " task left" : " tasks left");
    }

    function addTask() {
      const text = input.value.trim();
      if (!text) return;
      tasks.push({ text, done: false });
      input.value = "";
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
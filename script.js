(() => {
  "use strict";

  const STORAGE_KEY = "focuslist.tasks";
  const state = { tasks: loadTasks(), query: "", filter: "all" };
  const elements = {
    taskForm: document.querySelector("#taskForm"),
    taskTitle: document.querySelector("#taskTitle"),
    taskDate: document.querySelector("#taskDate"),
    taskPriority: document.querySelector("#taskPriority"),
    taskList: document.querySelector("#taskList"),
    taskCount: document.querySelector("#taskCount"),
    searchInput: document.querySelector("#searchInput"),
    filterSelect: document.querySelector("#filterSelect"),
    todayLabel: document.querySelector("#todayLabel"),
    progressBar: document.querySelector("#progressBar"),
    progressPercent: document.querySelector("#progressPercent"),
    progressSummary: document.querySelector("#progressSummary"),
    editDialog: document.querySelector("#editDialog"),
    editForm: document.querySelector("#editForm"),
    editTaskId: document.querySelector("#editTaskId"),
    editTaskTitle: document.querySelector("#editTaskTitle"),
    editTaskDate: document.querySelector("#editTaskDate"),
    editTaskPriority: document.querySelector("#editTaskPriority")
  };

  initialise();

  function initialise() {
    elements.todayLabel.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long", month: "short", day: "numeric"
    }).format(new Date());
    elements.taskForm.addEventListener("submit", handleCreateTask);
    elements.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      render();
    });
    elements.filterSelect.addEventListener("change", (event) => {
      state.filter = event.target.value;
      render();
    });
    elements.taskList.addEventListener("click", handleListClick);
    elements.taskList.addEventListener("change", handleListChange);
    elements.editForm.addEventListener("submit", handleEditSubmit);
    render();
  }

  function loadTasks() {
    try {
      const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(savedTasks) ? savedTasks : [];
    } catch (error) {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }

  function handleCreateTask(event) {
    event.preventDefault();
    const title = elements.taskTitle.value.trim();
    if (!title) return;

    state.tasks.unshift({
      id: createId(),
      title,
      dueDate: elements.taskDate.value,
      priority: elements.taskPriority.value,
      isCompleted: false,
      createdAt: Date.now()
    });
    saveTasks();
    elements.taskForm.reset();
    elements.taskPriority.value = "medium";
    render();
    elements.taskTitle.focus();
  }

  function handleListClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const taskId = button.closest("[data-task-id]").dataset.taskId;
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    if (button.dataset.action === "delete") {
      state.tasks = state.tasks.filter((item) => item.id !== taskId);
      saveTasks();
      render();
    }
    if (button.dataset.action === "edit") openEditDialog(task);
  }

  function handleListChange(event) {
    if (!event.target.matches(".task-check")) return;
    const task = state.tasks.find((item) => item.id === event.target.closest("[data-task-id]").dataset.taskId);
    if (!task) return;
    task.isCompleted = event.target.checked;
    saveTasks();
    render();
  }

  function openEditDialog(task) {
    elements.editTaskId.value = task.id;
    elements.editTaskTitle.value = task.title;
    elements.editTaskDate.value = task.dueDate || "";
    elements.editTaskPriority.value = task.priority;
    elements.editDialog.showModal();
    elements.editTaskTitle.focus();
  }

  function handleEditSubmit(event) {
    if (event.submitter?.value !== "default") return;
    event.preventDefault();
    const task = state.tasks.find((item) => item.id === elements.editTaskId.value);
    if (!task) return;
    task.title = elements.editTaskTitle.value.trim();
    task.dueDate = elements.editTaskDate.value;
    task.priority = elements.editTaskPriority.value;
    saveTasks();
    elements.editDialog.close();
    render();
  }

  function render() {
    const visibleTasks = getVisibleTasks();
    elements.taskList.innerHTML = visibleTasks.length
      ? visibleTasks.map(renderTask).join("")
      : renderEmptyState();
    updateStats();
  }

  function getVisibleTasks() {
    return state.tasks.filter((task) => {
      const matchesQuery = !state.query || task.title.toLowerCase().includes(state.query);
      const matchesFilter = state.filter === "all"
        || (state.filter === "active" && !task.isCompleted)
        || (state.filter === "completed" && task.isCompleted)
        || (state.filter === "high" && task.priority === "high");
      return matchesQuery && matchesFilter;
    });
  }

  function renderTask(task) {
    const dueDate = formatDueDate(task.dueDate);
    const overdueClass = !task.isCompleted && isOverdue(task.dueDate) ? "overdue" : "";
    const priorityLabel = task.priority || "medium";
    return `
      <article class="task-row" data-task-id="${escapeAttribute(task.id)}">
        <input class="task-check" type="checkbox" aria-label="Mark ${escapeAttribute(task.title)} as completed" ${task.isCompleted ? "checked" : ""}>
        <div class="task-main">
          <span class="task-title ${task.isCompleted ? "completed" : ""}">${escapeHtml(task.title)}</span>
          <span class="task-date ${overdueClass}">${dueDate}</span>
        </div>
        <div class="task-meta">
          <span class="priority-badge priority-${priorityLabel}">${priorityLabel}</span>
          <div class="task-actions">
            <button class="icon-button" type="button" data-action="edit" aria-label="Edit ${escapeAttribute(task.title)}">✎</button>
            <button class="icon-button delete-button" type="button" data-action="delete" aria-label="Delete ${escapeAttribute(task.title)}">×</button>
          </div>
        </div>
      </article>`;
  }

  function renderEmptyState() {
    const message = state.tasks.length ? "No tasks match this view." : "Your list is ready.";
    const detail = state.tasks.length ? "Try another search or filter." : "Add one small thing to get started.";
    return `<div class="empty-state"><div><strong>${message}</strong>${detail}</div></div>`;
  }

  function updateStats() {
    const completed = state.tasks.filter((task) => task.isCompleted).length;
    const total = state.tasks.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    elements.taskCount.textContent = total;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressBar.style.width = `${percent}%`;
    elements.progressSummary.textContent = total
      ? `${completed} of ${total} task${total === 1 ? "" : "s"} completed`
      : "No tasks yet";
  }

  function formatDueDate(dateValue) {
    if (!dateValue) return "No due date";
    const date = new Date(`${dateValue}T00:00:00`);
    return `Due ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}`;
  }

  function isOverdue(dateValue) {
    if (!dateValue) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${dateValue}T00:00:00`) < today;
  }

  function createId() {
    return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();

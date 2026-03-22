/* =========================
   DOM ELEMENTS
========================= */

// Récupérer les éléments
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const deadlineInput = document.getElementById("deadlineInput");

/* =========================
   APPLICATION STATE
========================= */

//Authentification state 
let authToken = localStorage.getItem("token");

//Application state (client-side): tasks list, active filter and sorting option
let currentTasks = [];
let activeFilter = "Toutes";
let currentSort = "date_desc";

/* =========================
   LOCAL STORAGE
========================= */

//Aide au stockage local
function saveTasksToLocalStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const data = localStorage.getItem("tasks");
  return data ? JSON.parse(data) : [];
}

/* =========================
   NOTIFICATIONS
========================= */

//Conteneur notifications
const notificationContainer = document.createElement("div");
notificationContainer.id = "notificationContainer";
document.body.insertBefore(notificationContainer, document.body.firstChild);

function showNotification(message, type = "success") {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.className = `notification ${type}`;
  notificationContainer.appendChild(notif);

  setTimeout(() => {
    notif.classList.add("fade-out");
    notif.addEventListener("transitionend", () => notif.remove());
  }, 2000);
}

/* =========================
   AUTHENTICATION
========================= */

//Fonction de connection
function login() {
  const username = prompt("Entrez votre nom :");

  if (!username) return;

  authToken = "mysecrettoken";
  localStorage.setItem("token", authToken);

  showNotification("Connecté avec succès", "success");
  loadTasks();
}

if (!authToken) {
  login();
}

/* =========================
   THEME (DARK MODE)
========================= */

//Dark Mode
const themeToggle = document.createElement("button");
themeToggle.id = "themeToggle";
themeToggle.textContent = "🌙";
document
  .getElementById("app")
  .insertBefore(themeToggle, document.getElementById("taskList"));

themeToggle.addEventListener("click", toggleTheme);

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  themeToggle.textContent = isDark ? "☀️" : "🌙";
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }
}

initTheme();

/* =========================
   FILTER UI
========================= */

//Boutons de filtre
const filterContainer = document.createElement("div");
filterContainer.className = "filter-container";
filterContainer.style.display = "flex";
filterContainer.style.alignItems = "center";
filterContainer.style.gap = "10px";

const filterLabel = document.createElement("label");
filterLabel.textContent = "Filtrer par:";
filterContainer.appendChild(filterLabel);

["Toutes", "En cours", "Terminées"].forEach((filter) => {
  const btn = document.createElement("button");
  btn.className = "filter-btn";
  btn.textContent = filter;
  btn.addEventListener("click", () => {
    activeFilter = filter;
    renderTasks(currentTasks);
  });
  filterContainer.appendChild(btn);
});

taskList.parentNode.insertBefore(filterContainer, taskList);

/* =========================
   SORTING UI
========================= */

//Sélecteur de tri
const sortSelect = document.createElement("select");

[
  { value: "date_desc", label: "Plus récentes" },
  { value: "date_asc", label: "Plus anciennes" },
  { value: "name_asc", label: "Nom A-Z" },
  { value: "name_desc", label: "Nom Z-A" },
  { value: "status", label: "Statut" },
  { value: "deadline_asc", label: "Deadline proche" },
  { value: "deadline_desc", label: "Deadline lointaine" },
  { value: "manual", label: "Ordre manuel" },
].forEach((option) => {
  const opt = document.createElement("option");
  opt.value = option.value;
  opt.textContent = option.label;
  sortSelect.appendChild(opt);
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  renderTasks(currentTasks);
});

const sortContainer = document.createElement("div");
sortContainer.style.display = "flex";
sortContainer.style.alignItems = "center";
sortContainer.style.gap = "10px";

const sortLabel = document.createElement("label");
sortLabel.textContent = "Trier par:";
sortContainer.appendChild(sortLabel);
sortContainer.appendChild(sortSelect);

taskList.parentNode.insertBefore(sortContainer, taskList);

/* =========================
   SORTING LOGIC
========================= */

function sortTasks(tasks) {
  const sorted = [...tasks];

  switch (currentSort) {
    case "date_desc":
      return sorted.sort((a, b) => b.id - a.id);

    case "date_asc":
      return sorted.sort((a, b) => a.id - b.id);

    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    case "status":
      return sorted.sort((a, b) => a.completed - b.completed);

    case "deadline_asc":
      return sorted.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });

    case "deadline_desc":
      return sorted.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline) - new Date(a.deadline);
      });

    default:
      return sorted;
  }
}

/* =========================
   UTILITIES
========================= */

//Fonction pour formater les dates
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/* =========================
   DRAG & DROP
========================= */

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll("li:not(.dragging)")];

  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function updateTaskOrder() {
  const ids = [...taskList.querySelectorAll("li")].map((li) =>
    Number(li.dataset.id),
  );

  currentTasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  saveTasksToLocalStorage(currentTasks);
}

//Drag sur la liste
taskList.addEventListener("dragover", (e) => {
  e.preventDefault();

  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(taskList, e.clientY);

  if (!dragging) return;

  if (afterElement == null) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
});

/* =========================
   RENDERING
========================= */

//Tâches de rendu avec prise en compte des filtres
function renderTasks(tasks) {
  taskList.innerHTML = "";
  let filtered = tasks;

  if (activeFilter === "En cours") {
    filtered = tasks.filter((task) => !task.completed);
  } else if (activeFilter === "Terminées") {
    filtered = tasks.filter((task) => task.completed);
  }
  if (currentSort !== "manual") {
    filtered = sortTasks(filtered);
  }
  filtered.forEach((task) => taskList.appendChild(addTaskToUI(task)));
}

/* =========================
   TASK CRUD
========================= */

//Fonction pour le rendu d'une seule tâche
function addTaskToUI(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.classList.add("fade-in"); //Animation fade-in

  li.draggable = true;
  li.addEventListener("dragstart", () => {
    li.classList.add("dragging");
  });
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    updateTaskOrder();
  });

  if (task.completed) {
    li.classList.add("task-completed");
  }

  const textSpan = document.createElement("span");
  textSpan.textContent = task.name;

  const statusSpan = document.createElement("span");
  statusSpan.className = task.completed ? "status-completed" : "status-pending";
  statusSpan.textContent = task.completed ? " ✓" : " ✗";

  const textContainer = document.createElement("div");
  textContainer.style.display = "flex";
  textContainer.style.alignItems = "center";
  textContainer.appendChild(textSpan);
  textContainer.appendChild(statusSpan);

  li.appendChild(textContainer);

  const meta = document.createElement("small");
  meta.textContent =
    `Ajoutée: ${formatDate(task.createdAt)}` +
    (task.deadline ? ` | Deadline: ${formatDate(task.deadline)}` : "");
  li.appendChild(meta);

  //Modifier une tâche
  textSpan.addEventListener("dblclick", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.name;
    textSpan.parentNode.replaceChild(input, textSpan);
    input.focus();

    let isSaving = false; // Flag pour éviter les sauvegardes multiples
    const saveEdit = () => {
      if (isSaving) return;
      isSaving = true;

      const newName = input.value.trim();

      if (!newName) {
        showNotification("Le nom de la tâche ne peut pas être vide", "error");
        renderTasks(currentTasks);
        isSaving = false;
        return;
      }

      fetch(`/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })
        .then((res) => res.json())
        .then((updated) => {
          const index = currentTasks.findIndex((t) => t.id === updated.id);
          currentTasks[index] = updated;
          renderTasks(currentTasks);
          showNotification("Tâche modifiée avec succès", "success");
        })
        .catch(() =>
          showNotification("Erreur de connexion au serveur", "error"),
        );
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveEdit();
      }
    });
    input.addEventListener("blur", saveEdit);
  });

  // Ajouter les boutons Terminer et Supprimer à chaque tâche
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "5px";

  //Terminer la tâche
  const completeBtn = document.createElement("button");
  completeBtn.className = task.completed
    ? "task-cancel-btn"
    : "task-complete-btn";
  completeBtn.textContent = task.completed ? "Annuler" : "Terminer";
  completeBtn.addEventListener("click", () => toggleTask(task.id));
  buttonContainer.appendChild(completeBtn);

  //Supprimer la tâche
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "task-delete-btn";
  deleteBtn.textContent = "Supprimer";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));
  buttonContainer.appendChild(deleteBtn);

  li.appendChild(buttonContainer);

  return li;
}

// Charger les tâches au démarrage
function loadTasks() {
  fetch("/tasks", {
    headers: { Authorization: authToken },
  })
    .then((res) => res.json())
    .then((tasks) => {
      currentTasks = tasks;
      saveTasksToLocalStorage(currentTasks);
      renderTasks(currentTasks);
    })
    .catch(() => {
      currentTasks = loadTasksFromLocalStorage();
      renderTasks(currentTasks);
      showNotification("Mode hors ligne", "error");
    });
}

// Ajouter une tâche
function handleAddTask() {
  const name = taskInput.value.trim();
  const deadline = deadlineInput.value || null;

  if (!name) {
    showNotification("Le nom de la tâche ne peut pas être vide", "error");
    return;
  }

  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, deadline }),
  })
    .then(async (response) => {
      const taskData = await response.json();
      
      if (!response.ok) {
        showNotification(data.error || "Échec de l'ajout de la tâche", "error");
        return;
      }
      currentTasks.push(taskData);
      saveTasksToLocalStorage(currentTasks);
      taskInput.value = "";
      deadlineInput.value = "";
      renderTasks(currentTasks);
      fetch("https://dummyjson.com/quotes/random")
        .then((res) => res.json())
        .then((data) => {
          showNotification(
            `Tâche ajoutée avec succès. "${data.quote}" - ${data.author}`,
            "success",
          );
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération de la citation :", err);
          showNotification("Tâche ajoutée avec succès", "success");
        });
    })
    .catch(() => {
      const offlineTask = {
        id: Date.now(),
        name,
        completed: false,
        createdAt: new Date().toISOString(),
        deadline,
      };
      currentTasks.push(offlineTask);
      saveTasksToLocalStorage(currentTasks);
      taskInput.value = "";
      deadlineInput.value = "";
      renderTasks(currentTasks);
      showNotification("Tâche ajoutée en mode hors ligne", "success");
    });
}

// Terminer une tâche
function toggleTask(id) {
  const task = currentTasks.find((task) => task.id === id);
  if (!task) return;

  fetch(`/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": authToken },
    body: JSON.stringify({ completed: !task.completed }),
  })
    .then((res) => res.json())
    .then((updated) => {
      const index = currentTasks.findIndex((task) => task.id === id);
      currentTasks[index] = updated;
      saveTasksToLocalStorage(currentTasks);
      renderTasks(currentTasks);
      showNotification(
        updated.completed ? "Tâche annulée" : "Tâche terminée",
        "success",
      );
    })
    .catch(() => showNotification("Erreur de connexion au serveur", "error"));
}

// Supprimer une tâche
function deleteTask(id) {
  fetch(`/tasks/${id}`, { method: "DELETE" })
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        showNotification(data.error || "Échec de la suppression", "error");
        return;
      }
      const li = document.querySelector(`li[data-id="${id}"]`);

      const removeTask = () => {
        currentTasks = currentTasks.filter((task) => task.id !== id);
        saveTasksToLocalStorage(currentTasks);
        renderTasks(currentTasks);
        showNotification("Tâche supprimée avec succès", "success");
      };

      if (li) {
        //Animation fade-out
        li.classList.add("fade-out");
        let handled = false;
        li.addEventListener("transitionend", () => {
          if (handled) return;
          handled = true;
          removeTask();
        });

        setTimeout(() => {
          if (handled) return;
          handled = true;
          removeTask();
        }, 350);
      } else {
        removeTask();
      }
    })
    .catch(() => showNotification("Erreur de connexion au serveur", "error"));
}

/* =========================
   EVENT LISTENERS
========================= */

// Ajouter l'événement de clic pour le bouton d'ajout
addTaskBtn.addEventListener("click", () => {
  handleAddTask();
});

// Ajouter l'événement de pression de touche pour l'entrée de tâche
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleAddTask();
  }
});

/* =========================
   INIT
========================= */

// Initialisation de l'application
loadTasks();

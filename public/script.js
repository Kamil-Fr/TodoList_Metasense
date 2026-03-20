// Récupérer les éléments
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

//Stockage de toutes les tâches dans la mémoire frontale
let currentTasks = [];
let activeFilter = "Toutes";

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

//Dark Mode
const themeToggle = document.createElement("button");
themeToggle.id = "themeToggle";
themeToggle.textContent = "🌙"; // domyślnie moon
document.body.insertBefore(themeToggle, document.body.firstChild);

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

//Boutons de filtre
const filterContainer = document.createElement("div");
["Toutes", "En cours", "Terminées"].forEach((filter) => {
  const btn = document.createElement("button");
  btn.textContent = filter;
  btn.addEventListener("click", () => {
    activeFilter = filter;
    renderTasks(currentTasks);
  });
  filterContainer.appendChild(btn);
});
taskList.parentNode.insertBefore(filterContainer, taskList);

//Fonction pour le rendu d'une seule tâche
function addTaskToUI(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const textSpan = document.createElement("span");
  textSpan.textContent = task.name + (task.completed ? " ✓" : " ✗"); // Affiche l'état de la tâche
  li.appendChild(textSpan);

  //Animation fade-in
  li.classList.add("fade-in");

  //Modifier une tâche
  textSpan.addEventListener("dblclick", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.name;
    li.replaceChild(input, textSpan);
    input.focus();

    let isSaving = false; // Flag pour éviter les sauvegardes multiples
    const saveEdit = () => {
      if (isSaving) return;
      isSaving = true;

      const newName = input.value.trim();

      if (!newName) {
        showNotification("Le nom de la tâche ne peut pas être vide", "error");
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
  //Terminer la tâche
  const completeBtn = document.createElement("button");
  completeBtn.textContent = task.completed ? "Annuler" : "Terminer";
  completeBtn.addEventListener("click", () => toggleTask(task.id));
  li.appendChild(completeBtn);

  //Supprimer la tâche
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Supprimer";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));
  li.appendChild(deleteBtn);

  return li;
}

//Tâches de rendu avec prise en compte des filtres
function renderTasks(tasks) {
  taskList.innerHTML = "";
  let filtered = tasks;

  if (activeFilter === "En cours") {
    filtered = tasks.filter((task) => !task.completed);
  } else if (activeFilter === "Terminées") {
    filtered = tasks.filter((task) => task.completed);
  }
  filtered.forEach((task) => taskList.appendChild(addTaskToUI(task)));
}

// Charger les tâches au démarrage
function loadTasks() {
  fetch("/tasks")
    .then((res) => res.json())
    .then((tasks) => {
      currentTasks = tasks;
      renderTasks(currentTasks);
    })
    .catch(() => showNotification("Échec du chargement des tâches", "error"));
}

// Ajouter une tâche
function handleAddTask() {
  const name = taskInput.value.trim();
  if (!name) {
    showNotification("Le nom de la tâche ne peut pas être vide", "error");
    return;
  }

  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        showNotification(data.error || "Échec de l'ajout de la tâche", "error");
        return;
      }
      currentTasks.push(data);
      taskInput.value = "";
      renderTasks(currentTasks);
    })
    .catch(() => showNotification("Erreur de connexion au serveur", "error"));
}

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

// Terminer une tâche
function toggleTask(id) {
  const task = currentTasks.find((task) => task.id === id);
  if (!task) return;

  fetch(`/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !task.completed }),
  })
    .then((res) => res.json())
    .then((updated) => {
      const index = currentTasks.findIndex((task) => task.id === id);
      currentTasks[index] = updated;
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

// Initialisation de l'application
loadTasks();

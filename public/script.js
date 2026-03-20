// Récupérer les éléments
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

//Stockage de toutes les tâches dans la mémoire frontale
let currentTasks = [];
let activeFilter = "Toutes";

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

  //
  textSpan.addEventListener('dblclick', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.name;
    li.replaceChild(input, textSpan);
    input.focus();

    let isSaving = false; // Flag pour éviter les sauvegardes multiples
    const saveEdit = () => {
      if (isSaving) return; 
      isSaving = true;

      const newName = input.value.trim();

      if (!newName) {
        alert("Le nom de la tâche ne peut pas être vide");
        isSaving = false;
        return;
      }

      fetch(`/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })
        .then(res => res.json())
        .then((updated) => {
          const index = currentTasks.findIndex((t) => t.id === updated.id);
          currentTasks[index] = updated;
          renderTasks(currentTasks);
        })
        .catch(() => alert("Erreur de connexion au serveur"));
    };
   
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      }
    });
     input.addEventListener('blur', saveEdit);
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
    .catch(() => alert("Échec du chargement des tâches"));
}

// Ajouter une tâche
function handleAddTask() {
  const name = taskInput.value.trim();
  if (!name) {
    alert("Le nom de la tâche ne peut pas être vide");
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
        alert(data.error || "Échec de l'ajout de la tâche");
        return;
      }
      currentTasks.push(data);
      taskInput.value = "";
      renderTasks(currentTasks);
    })
    .catch(() => alert("Erreur de connexion au serveur"));
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
    })
    .catch(() => alert("Erreur de connexion au serveur"));
}

// Supprimer une tâche
function deleteTask(id) {
  fetch(`/tasks/${id}`, { method: "DELETE" })
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Échec de la suppression");
        return;
      }
      currentTasks = currentTasks.filter((task) => task.id !== id);
      renderTasks(currentTasks);
    })
    .catch(() => alert("Erreur de connexion au serveur"));
}

// Initialisation de l'application
loadTasks();

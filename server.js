const express = require('express');
const app = express();
const port = 3000;

// Base de données simulée
let tasks = [
  { id: 1, name: "Exemple de tâche", completed: false }
];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes API

// GET /tasks - lister toutes les tâches
app.get('/tasks', (req, res) => res.json(tasks));

// POST /tasks - créer une nouvelle tâche avec validation
app.post('/tasks', (req, res) => {
  const { name = "" } = req.body;
  const trimmedName = name.trim();

  // Validation : le champ «name» doit exister et ne pas être vide
  if (!trimmedName) {
    return res.status(400).json({ error: "Le nom de la tâche est requis" });
  }

  const task = { id: Date.now(), name: trimmedName, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

// Démarrage du serveur
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));

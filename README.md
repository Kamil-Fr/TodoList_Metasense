# To-Do List MetaSense  
**Application web de gestion de tâches développée dans le cadre d’un test technique.** 

## 🚀 Fonctionnalités
- ✅ Ajouter, modifier et supprimer des tâches  
- 📅 Ajouter une deadline (optionnelle)  
- 🔍 Filtrer les tâches (Toutes / En cours / Terminées)  
- 🔄 Trier les tâches (date, nom, statut, deadline, ordre manuel)  
- 🌙 Mode sombre (dark mode)  
- 💾 Sauvegarde locale (mode hors ligne)  
- 🔔 Notifications utilisateur  
- 🖱️ Drag & Drop pour réorganiser les tâches 

## 🛠️ Technologies utilisées
- Frontend : HTML, CSS, JavaScript
- Backend : Node.js, Express
- Stockage : LocalStorage + API REST

## 🚀 Installation  
1. Cloner le dépôt :  
`git clone https://github.com/Kamil-Fr/TodoList_Metasense.git`

2. Se placer dans le dossier :  
`cd TodoList_Metasense`

3. Installer les dépendances :  
`npm install`

4. Démarrer le serveur :  
`npm start`

5. Ouvrir `public/index.html` dans un navigateur.  

## 🛠️ Structure du projet  
```
public/
├── index.html               # Interface utilisateur
├── styles/
│   ├── base.css
│   ├── tasks.css
│   ├── filters.css
│   ├── notifications.css
│   ├── theme.css
│   ├── draganddrop.css
│   └── deadline.css
├── assets/
│   └── bg_todolist.jpg
└── script.js                # Logique front-end (CRUD, filtres, tri, dark mode)
server.js                    # API Node.js/Express
package.json                 # Dépendances
NOTES.md                     # Documentation technique et justification des choix
```

## 🔗 API Endpoints  
| Méthode | URL          | Action                 |  
|---------|--------------|------------------------|  
| GET     | `/tasks`     | Lister les tâches      |  
| POST    | `/tasks`     | Ajouter une tâche      |  
| PUT     | `/tasks/:id` | Modifier une tâche     |  
| DELETE  | `/tasks/:id` | Supprimer une tâche    |  

 

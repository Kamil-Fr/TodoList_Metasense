# 📝 Notes techniques – To-Do List

## 🎯 Contexte du projet
Cette application a été réalisée dans le cadre d’un test technique.  
L’objectif était de développer une application de gestion de tâches complète avec une attention particulière portée à l’UX, à la clarté du code et aux choix techniques.

⏱️ **Temps de réalisation estimé** : ~12 heures

---

## 🏆 Fonctionnalités implémentées

### 1. Gestion des tâches
- Ajout, modification (double-clic), suppression et changement de statut
- Ajout d’une **deadline optionnelle**
- Affichage des dates au format `dd/mm/yyyy`
- Récupération des tâches depuis une API REST

---

### 2. Filtrage et tri
- Filtrage dynamique :
  - Toutes
  - En cours
  - Terminées

- Tri dynamique :
  - Date (asc / desc)
  - Nom (A-Z / Z-A)
  - Statut
  - Deadline (proche / lointaine)
  - Ordre manuel (drag & drop)

👉 Le filtrage et le tri sont combinables pour une meilleure expérience utilisateur.

---

### 3. Drag & Drop
- Réorganisation manuelle des tâches via drag & drop
- Sauvegarde automatique de l’ordre dans le `localStorage`

---

### 4. Notifications et feedback utilisateur
- Notifications pour chaque action :
  - ajout
  - modification
  - suppression
  - erreurs
- Animations CSS (`fade-in`, `fade-out`) pour améliorer la perception utilisateur

---

### 5. Mode hors ligne (fallback)
- En cas d’échec de l’API :
  - chargement depuis `localStorage`
  - ajout de tâches en local
- Permet une **résilience de l’application**

---

### 6. Dark Mode
- Toggle dynamique 🌙 / ☀️
- Persistance du thème via `localStorage`
- Amélioration du confort visuel

---

### 7. UI / UX
- Interface centrée et lisible
- Police manuscrite (*Pangolin*) pour un rendu plus humain
- Boutons clairs et cohérents
- Indications utilisateur (deadline, filtres, tri)
- Actions accessibles et visibles

---

## 🛠️ Choix techniques

### 1. JavaScript Vanilla (sans framework)
J’ai volontairement choisi d’utiliser **JavaScript pur** pour plusieurs raisons :

- Montrer une **maîtrise des fondamentaux** (DOM, événements, fetch, state)
- Éviter une complexité inutile pour une application de taille moyenne
- Garder un projet **léger et lisible**

👉 **Choix stratégique important :**  
L’entreprise utilise **Vue.js** et **Nuxt.js**, alors que je connais principalement **React**.  
J’ai donc choisi de ne pas utiliser React pour :
- éviter un biais vers un framework non utilisé en interne
- démontrer une base solide en JavaScript, facilitant l’apprentissage rapide de Vue/Nuxt

---

### 2. Pourquoi ne pas avoir découpé `script.js` ?

Le fichier `script.js` est volontairement **monolithique mais structuré** (sections logiques).

✔ Raisons :
- Application de taille **modérée (~400–600 lignes)**
- Découpage en modules aurait ajouté :
  - de la complexité (imports/exports)
  - du risque d’erreurs

✔ Approche choisie :
- Organisation claire avec sections :
  - state
  - UI
  - logique métier
  - événements

👉 Dans un projet plus large (**> 700–1000 lignes ou multi-pages**), j’aurais :
- séparé en modules :
  - `tasks.js`
  - `ui.js`
  - `api.js`
- ou utilisé une architecture composant 

---

### 3. Gestion de l’état (state management)
- `currentTasks`
- `activeFilter`
- `currentSort`

👉 Stockés côté client pour :
- rapidité
- simplicité
- éviter un state manager externe

---

### 4. API et communication
- Utilisation de `fetch`
- API REST simple (`GET`, `POST`, `PUT`, `DELETE`)
- Gestion des erreurs avec fallback local

---

### 5. LocalStorage
Utilisé pour :
- sauvegarder les tâches
- stocker le thème
- gérer le mode hors ligne

👉 Permet une meilleure **expérience utilisateur** sans dépendance réseau constante

---

### 6. Animations et UX
- CSS transitions (`fade-in`, `fade-out`)
- Feedback immédiat utilisateur
- Micro-interactions simples mais efficaces

---

## ⚖️ Compromis et améliorations possibles

### Améliorations possibles
- Passage à une architecture modulaire
- Ajout de tests
- Gestion d’authentification réelle 
- Persistance base de données (au lieu de mémoire serveur)
- Accessibilité (ARIA, navigation clavier)

---

## 📌 Conclusion

Cette application démontre :
- une bonne maîtrise du JavaScript natif
- une attention portée à l’UX
- une capacité à faire des choix techniques adaptés au contexte

👉 L’objectif n’était pas seulement de faire fonctionner l’application,  
mais de produire un code **cohérent, maintenable et évolutif**.
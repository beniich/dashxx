# Déploiement sur cPanel avec Node.js

Ce guide explique comment déployer le Monorepo Cloud Industrie sur un hébergement cPanel avec Node.js et Git.

## 1. Prérequis cPanel

✅ **Vous avez déjà :**
- Node.js activé sur cPanel
- Git installé

**Vérifications supplémentaires nécessaires :**
- Version Node.js ≥ 18.x
- Accès SSH (Terminal cPanel)
- PostgreSQL ou accès à Supabase distant
- Domaine configuré (ex: `app.cloud-industrie.com`)

## 2. Limitations cPanel vs Architecture Recommandée

### ⚠️ Contraintes cPanel
cPanel est conçu pour l'hébergement web traditionnel (PHP). Pour une architecture moderne (Monorepo + Hasura + Supabase), il y a des **limitations importantes** :

| Fonctionnalité | Recommandé | Possible sur cPanel ? |
|----------------|------------|----------------------|
| **Frontend (React Apps)** | Vite build statique | ✅ Oui (build + serveur statique) |
| **Backend API (Hasura)** | Docker / Cloud | ❌ Non (besoin Docker) |
| **Database (PostgreSQL)** | Supabase Cloud | ✅ Oui (PostgreSQL local ou Supabase distant) |
| **Edge Functions** | Supabase Cloud | ⚠️ Partiel (Node.js custom) |
| **Monorepo Turbo** | TurboRepo | ⚠️ Build local puis deploy |

### ✅ Solution Hybride Recommandée
- **Frontend Apps** : Build en statique → Déployer sur cPanel.
- **Backend (Hasura + Supabase)** : Utiliser **Supabase Cloud** (gratuit jusqu'à 500MB).
- **Edge Functions** : Supabase Cloud ou Vercel Serverless.

## 3. Workflow de Déploiement (Frontend uniquement sur cPanel)

### Étape 1 : Préparer le Build Local

```bash
# Sur votre machine locale
cd d:\git produit\crm

# Build toutes les applications
pnpm build

# Résultat : fichiers statiques dans apps/*/dist/
# - apps/crm-pro/dist/
# - apps/school-1cc/dist/
# - apps/admin-dashboard/dist/
```

### Étape 2 : Créer un Repo Git

```bash
# Initialiser Git si pas déjà fait
git init
git add .
git commit -m "Initial commit - Cloud Industrie Monorepo"

# Créer un repo sur GitHub/GitLab
git remote add origin https://github.com/votre-compte/cloud-industrie.git
git push -u origin main
```

### Étape 3 : cPanel - Cloner le Repo

1. **Git Version Control** (cPanel) :
   - Cliquez sur "Create" (nouveau repo).
   - Repository URL : `https://github.com/votre-compte/cloud-industrie.git`.
   - Clone Path : `/home/username/cloud-industrie`.
   - Clic "Create".

### Étape 4 : Setup Node.js App (par application)

Pour chaque app (ex: `crm-pro`) :

1. **Setup Node.js App** (cPanel) :
   - Node.js Version : 18.x ou 20.x.
   - Application Mode : Production.
   - Application Root : `cloud-industrie/apps/crm-pro`.
   - Application URL : `https://crm.cloud-industrie.com`.
   - Application Startup File : **Créer un `server.js`** (voir ci-dessous).

2. **Créer `server.js`** dans `apps/crm-pro/` :

```javascript
// apps/crm-pro/server.js
const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques du build Vite
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback : toutes les routes → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`CRM-Pro running on port \${PORT}\`));
```

3. **Installer Express** :
```bash
# Dans Terminal SSH cPanel
cd ~/cloud-industrie/apps/crm-pro
npm install express
```

4. **Variables d'environnement** :
   - Dans cPanel Node.js App : Ajouter `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.

### Étape 5 : Répéter pour Autres Apps

- `school-1cc` → `https://school.cloud-industrie.com`
- `admin-dashboard` → `https://admin.cloud-industrie.com`

Chacune avec son propre `server.js` et Node.js App setup.

## 4. Backend (Hasura + Supabase)

**Impossible de déployer Hasura directement sur cPanel** (nécessite Docker).

**Solution :**
1. Créer un projet **Supabase Cloud** (gratuit) : https://supabase.com
2. Obtenir `SUPABASE_URL` et `ANON_KEY`.
3. Déployer Hasura sur **Hasura Cloud** (gratuit) : https://hasura.io/cloud
4. Connecter Hasura à votre Supabase PostgreSQL (URL dans Supabase).

## 5. Workflow de Mise à Jour

```bash
# Local : faire des modifications
git add .
git commit -m "Update CRM feature"
git push origin main

# cPanel : Pull les changements
# Git Version Control → Clic "Pull or Deploy"

# Rebuild (si code change)
cd ~/cloud-industrie
pnpm build

# Redémarrer Node.js Apps via cPanel UI
```

## 6. Résumé : Est-ce Viable sur cPanel ?

| Cas d'Usage | Verdict |
|-------------|---------|
| **MVP / Demo** | ✅ Faisable (Frontend statique + Supabase Cloud) |
| **Production SaaS** | ❌ Non recommandé (manque scalabilité, pas de Hasura) |
| **10-50 Users** | ⚠️ OK temporairement |
| **100+ Users** | ❌ Migrer vers VPS/Cloud (Vercel, Railway, Render) |

**Recommandation finale :** Utilisez cPanel pour un **POC rapide**, mais planifiez une migration vers **Vercel** (Frontend) + **Supabase Cloud** (Backend) pour le lancement commercial.

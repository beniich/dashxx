# Cloud Industrie - Monorepo (Deployed)

## Architecture

Ce projet utilise **TurboRepo** avec **pnpm** pour gérer un Monorepo comprenant plusieurs applications et packages partagés.

### Structure

```
├── apps/
│   ├── crm-hub/          # Landing Page
│   ├── crm-pro/          # CRM SaaS
│   ├── school-1cc/       # ERP Éducation
│   └── admin-dashboard/  # Super Admin Dashboard
├── packages/
│   ├── ui/               # Composants UI partagés (Shadcn/Radix)
│   ├── utils/            # Fonctions utilitaires
│   └── config/           # Configurations ESLint, TS, Tailwind
```

### Documentation Technique

- **[CRM_ARCHITECTURE.md](CRM_ARCHITECTURE.md)** : Architecture complète du système
- **[SCHEMAS_AND_POLICIES.md](SCHEMAS_AND_POLICIES.md)** : Schémas DB et RLS Policies
- **[EDGE_FUNCTIONS_REFERENCE.md](EDGE_FUNCTIONS_REFERENCE.md)** : Edge Functions (Stripe webhook)

### Installation

```bash
# Installer pnpm (si nécessaire)
npm install -g pnpm

# Installer les dépendances
pnpm install

# Lancer tous les apps en mode dev
pnpm dev

# Lancer une app spécifique
pnpm dev --filter crm-pro
```

### Build

```bash
# Build toutes les apps
pnpm build

# Build une app spécifique
pnpm build --filter school-1cc
```

### Technologies

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS
- **Backend**: Hasura (GraphQL), Supabase (PostgreSQL + Auth)
- **Monorepo**: TurboRepo + pnpm

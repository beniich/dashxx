# Architecture Complète du CRM (Cloud Industrie)

Ce document détaille l'architecture cible pour l'écosystème CRM de Cloud Industrie, utilisant une approche **Monorepo** avec **Hasura** comme moteur GraphQL central sur une base **Supabase**.

## 1. Vue d'Ensemble (High-Level Architecture)

L'architecture repose sur un Monorepo géré par **TurboRepo** et **pnpm**. Le backend est une architecture composite puissante : **Supabase** fournit l'infrastructure de données (PostgreSQL) et l'authentification, tandis que **Hasura** agit comme la couche API unifiée (GraphQL Gateway), gérant les permissions fines et le temps réel.

```mermaid
graph TD
    subgraph "Monorepo (TurboRepo + pnpm)"
        subgraph "Apps Frontend"
            A[CRM-Hub<br/>Landing Page]
            B[CRM-Pro<br/>SaaS CRM]
            C[School-1cc<br/>ERP Éducation]
            D[Admin-Dashboard<br/>Super Admin]
        end
        
        subgraph "Packages"
            UI[ui - Shadcn/Tailwind]
            API[api - Hasura GraphQL Client<br/>(Apollo/Urql)]
            Hooks[hooks - useAuth, useTenant]
            Types[types - GraphQL Codegen]
            Utils[utils]
            Theme[theme]
        end
    end
    
    subgraph "Backend & Data Layer"
        Hasura[Hasura Engine<br/>GraphQL + Permissions + Realtime]
        
        subgraph "Supabase / PostgreSQL"
            DB[(PostgreSQL<br/>schema: crm | school | shared)]
            Auth[Supabase Auth<br/>JWT + MFA + OAuth]
            Storage[Supabase Storage]
        end
        
        EdgeCustom[Custom Edge Functions<br/>(Deno - cas rares)]
        Webhooks[Webhooks Externes<br/>Stripe, Resend, etc.]
    end
    
    A -->|Marketing| B
    B --> Hasura
    C --> Hasura
    D --> Hasura
    
    Hasura <--> DB
    Hasura -->|Event Triggers| EdgeCustom
    Hasura -->|Actions| EdgeCustom
    Webhooks --> EdgeCustom --> DB
    
    style Hasura fill:#4c1d95, color:#fff
    style DB fill:#e3f2fd
```

## 2. Stack Technologique (Technology Stack)

### Frontend (Apps & Packages)
*   **Monorepo Manager**: TurboRepo + pnpm.
*   **Framework**: React 18+ / Vite.
*   **Langage**: TypeScript.
*   **API Client**: Apollo Client ou Urql (pour GraphQL).
*   **Code Generation**: GraphQL Code Generator (pour typer automatiquement les requêtes/réponses).
*   **Styling**: Tailwind CSS + Shadcn UI (Package `ui`).
*   **State Management**: Zustand (Client state) + Apollo/Urql Cache (Server state).

### Backend (Composite)
*   **API Engine**: **Hasura** (GraphQL instantané, Permissions RBAC/ABAC, Subscriptions).
*   **Database**: **PostgreSQL** (Hébergé par Supabase).
    *   Schemas distincts : `crm`, `school`, `shared`, `auth`.
    *   **Détails Techniques**: Voir [SCHEMAS_AND_POLICIES.md](SCHEMAS_AND_POLICIES.md) pour les schémas SQL et les politiques RLS.
*   **Auth**: **Supabase Auth** (Gestion utilisateurs, JWT).
*   **Monitoring & Analytics**: **PostHog** (Voir [ANALYTICS_REFERENCE.md](ANALYTICS_REFERENCE.md)).
*   **Reporting**: **PowerBI Embedded** (Voir [POWERBI_INTEGRATION.md](POWERBI_INTEGRATION.md)).
*   **Storage**: Supabase Storage.
*   **Business Logic**:
    *   **Hasura Actions/Event Triggers**: Pour la logique asynchrone ou complexe.
    *   **Edge Functions** (Deno/Node): Exécutées par les triggers Hasura ou Webhooks externes.
    *   **Exemples**: Voir [EDGE_FUNCTIONS_REFERENCE.md](EDGE_FUNCTIONS_REFERENCE.md) pour les webhooks Stripe.

## 3. Structure du Projet (File Structure & Packages)

```
/
├── apps/
│   ├── crm-hub/          # Landing Page (Next.js ou Vite)
│   ├── crm-pro/          # App Client (Vite)
│   ├── school-1cc/       # App École (Vite)
│   └── admin-dashboard/  # App Super Admin (Vite)
├── packages/
│   ├── ui/               # Design System (Shadcn, Tailwind config)
│   ├── api/              # Client GraphQL pré-configuré (Apollo/Urql wrapper)
│   ├── hooks/            # Hooks transverses (useAuth, useTenant, usePermission)
│   ├── types/            # Types générés (GraphQL Codegen)
│   ├── utils/            # Hélpers JS/TS
│   └── config/           # Configs partagées (TSConfig, ESLint)
├── hasura/               # Métadonnées et Migrations Hasura
├── supabase/             # Migrations SQL Supabase (si besoin hors Hasura)
├── package.json
└── turbo.json
```

## 4. Stratégie de Données et Sécurité

### Schémas de Base de Données
Pour isoler proprement les domaines métier :
*   `shared`: Tables communes (ex: `organizations`, `subscriptions`, `plan_definitions`).
*   `crm`: Tables spécifiques CRM (ex: `leads`, `deals`, `contacts`).
*   `school`: Tables spécifiques École (ex: `students`, `courses`, `grades`).

### Authentification & Permissions
1.  **Auth (Supabase)**: L'utilisateur se logue, reçoit un JWT contenant son `role` et `organization_id`.
2.  **Permissions (Hasura)**:
    *   Hasura décode le JWT.
    *   Les permissions sont définies table par table (ex: `select` autorisé si `organization_id` du JWT == `organization_id` de la ligne).
    *   Pas de code backend à écrire pour le CRUD standard sécurisé.

### Logique Métier (Actions & Triggers)
*   Exemple : Création d'une facture.
    *   Frontend -> Mutation GraphQL `createInvoice(...)`.
    *   Hasura -> Insert en DB.
    *   Hasura Event Trigger `on_insert_invoice` -> Appelle Edge Function `generate-pdf`.
    *   Edge Function -> Génère PDF, stocke dans Supabase Storage, met à jour le lien dans la table `invoices`.

## 5. Prochaines Étapes

1.  **Configuration Monorepo**: Mettre en place TurboRepo et pnpm.
2.  **Setup Backend**:
    *   Init projet Supabase.
    *   Connecter Hasura à la DB Supabase.
    *   Configurer l'auth Supabase pour fonctionner avec Hasura (Custom Claims JWT).
3.  **Migration des Apps**: Adapter les apps existantes pour consommer l'API GraphQL via le package `api`.
4.  **Déploiement**: Voir [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md) pour déploiement initial ou [BUSINESS_PLAN.md](BUSINESS_PLAN.md) pour stratégie commerciale.

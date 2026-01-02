# Intégration PostHog Analytics (Cloud Industrie)

PostHog est la solution d'analytics choisie pour sa conformité GDPR, ses fonctionnalités tout-en-un (Analytics, Session Replay, Feature Flags) et son intégration native avec Supabase.

## 1. Pourquoi PostHog ?
- **Analytics Produit** : Funnels, retention, paths.
- **Group Analytics** : Tracking par "tenant" (Cabinet/École).
- **Feature Flags** : Déploiement progressif.
- **Session Replay** : Debugging visuel.
- **Supabase Friendly** : Intégration fluide.

## 2. Installation (Monorepo)

Ajouter les dépendances à la racine du workspace :
```bash
pnpm add posthog-js @posthog/react -w
```

## 3. Structure du Package `@cloud-industrie/analytics`

Créer un package partagé `packages/analytics/` :

```
packages/analytics/
├── package.json  # { "name": "@cloud-industrie/analytics" }
├── src/
│   ├── posthog.ts        # Client init
│   ├── PostHogProvider.tsx # React Provider wrapper
│   └── hooks/
│       └── useAnalytics.ts # Hook identification (User + Tenant)
└── index.ts
```

### Initialisation (`src/posthog.ts`)
```typescript
import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window === 'undefined') return;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only', // GDPR Friendly
    capture_pageview: false, // SPA handling manual
    capture_heatmaps: true,
    enable_heatmaps: true,
    autocapture: {
      capture_copied_text: false,
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug();
    },
  });
};

export default posthog;
```

### Provider (`src/PostHogProvider.tsx`)
```typescript
import { PostHogProvider } from '@posthog/react';
import posthog from './posthog';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

### Identification Hook (`src/hooks/useAnalytics.ts`)
```typescript
import posthog from '../posthog';
import { useEffect } from 'react';
import { useAuth } from '@cloud-industrie/auth';
import { useTenant } from '@cloud-industrie/tenant';

export const useIdentifyUser = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (user) {
      // Identifier l'utilisateur
      posthog.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name,
        role: user.app_metadata?.role,
      });

      // Identifier le Tenant (Group Analytics)
      if (currentTenant) {
        posthog.group('tenant', currentTenant.id, {
          name: currentTenant.name,
          type: currentTenant.type, // 'crm' | 'school'
          plan: currentTenant.plan,
        });
      }
    } else {
      posthog.reset();
    }
  }, [user, currentTenant]);
};
```

## 4. Intégration dans les Apps

Dans chaque point d'entrée (`main.tsx` ou `App.tsx`) :

```typescript
import { AnalyticsProvider, initPostHog } from '@cloud-industrie/analytics';

// 1. Init
initPostHog();

// 2. Wrap
ReactDOM.createRoot(root).render(
  <AnalyticsProvider>
    <App />
  </AnalyticsProvider>
);
```

Et utiliser `useIdentifyUser` dans le Layout principal authentifié.

## 5. Feature Flags (Exemple)

```typescript
import posthog from 'posthog-js';

// Vérifier un flag
const showNewFeature = posthog.isFeatureEnabled('new-crm-pipeline-ui');
```

## 6. Checklist de Déploiement
1. [ ] Créer compte PostHog Cloud.
2. [ ] Définir `VITE_POSTHOG_KEY` et `VITE_POSTHOG_HOST` dans `.env`.
3. [ ] Implémentez le package analytics.
4. [ ] Intégrer dans `CRM-Pro`, `School-1cc`, `Admin`.
5. [ ] Vérifier la remontée des événements et replays.

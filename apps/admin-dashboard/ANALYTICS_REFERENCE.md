# Analytics & Monitoring Reference (PostHog)

Ce document détaille l'intégration de PostHog pour l'analytique produit, avec un focus sur le multi-tenant (CRM & School).

## 1. Hook `useAnalytics`

Ce hook centralise l'identification et le tracking. À placer dans `packages/analytics`.

```typescript
// packages/analytics/src/hooks/useAnalytics.ts
import { useEffect } from 'react';
import posthog from 'posthog-js'; // Assurez-vous d'avoir posthog-js installé
import { useAuth } from '@cloud-industrie/hooks'; 
import { useTenant } from '@cloud-industrie/hooks'; 

interface CaptureProps {
  eventName: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  // Identification automatique user + group (tenant)
  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name || 'Anonyme',
        role: user.app_metadata?.role || 'user',
        created_at: user.created_at,
      });

      if (currentTenant) {
        posthog.group('tenant', currentTenant.id, {
          name: currentTenant.name,
          type: currentTenant.type, // 'crm' ou 'school'
          plan: currentTenant.plan, // 'starter', 'pro'
          country: currentTenant.country,
        });
      }
    } else {
      posthog.reset(); // Reset pour anonyme ou logout
    }
  }, [user, currentTenant]);

  // Fonction pour capturer événements custom
  const captureEvent = ({ eventName, properties }: CaptureProps) => {
    posthog.capture(eventName, {
      ...properties,
      // Ajouts automatiques pour contexte
      app: 'cloud-industrie', 
      vertical: currentTenant?.type || 'unknown',
    });
  };

  // Vérifier feature flag
  const isFeatureEnabled = (flagKey: string): boolean => {
    return posthog.isFeatureEnabled(flagKey) ?? false;
  };

  // Opt-out (pour GDPR/compliance)
  const optOut = () => posthog.opt_out_capturing();
  const optIn = () => posthog.opt_in_capturing();

  return {
    captureEvent,
    isFeatureEnabled,
    optOut,
    optIn,
  };
};
```

## 2. Dashboards Recommandés

### CRM Vertical (CRM-Pro)
*   **Funnel Onboarding**: `user_signed_up` -> `first_contact_created` -> `first_opportunity_added` -> `first_invoice_sent`.
*   **KPIs**: Retention Cohort (weekly), Usage Trends (contacts created), Session Replay (drop-offs).

### School Vertical (School-1cc)
*   **Funnel Cycle Académique**: `student_enrolled` -> `class_assigned` -> `first_grade_added` -> `bulletin_generated`.
*   **KPIs**: Teacher Engagement (retention), Grades Volume, Admin payments flow.

## 3. Configuration Self-Hosted (Docker)

Pour un déploiement on-premise RGPD compliant.

**docker-compose.yml**
```yaml
version: '3.8'
services:
  db:
    image: postgres:12
    restart: always
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: posthog
      POSTGRES_PASSWORD: secure-password
  redis:
    image: redis:6
    restart: always
  posthog:
    image: posthog/posthog:latest
    restart: always
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgres://postgres:secure-password@db:5432/posthog
      REDIS_URL: redis://redis:6379/
      SECRET_KEY: generated-secret-key
      SITE_URL: https://analytics.cloud-industrie.com
    depends_on: [db, redis]
volumes:
  postgres-data:
```

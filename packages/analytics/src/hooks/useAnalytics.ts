// packages/analytics/src/hooks/useAnalytics.ts
import { useEffect } from 'react';
import posthog from 'posthog-js'; // Assurez-vous d'avoir posthog-js installé
// import { useAuth } from '@cloud-industrie/hooks'; // TODO: Enable when hooks package is ready
// import { useTenant } from '@cloud-industrie/hooks'; // TODO: Enable when hooks package is ready

// Mock hooks until @cloud-industrie/hooks is implemented
const useAuth = () => ({ user: null as any });
const useTenant = () => ({ currentTenant: null as any });

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

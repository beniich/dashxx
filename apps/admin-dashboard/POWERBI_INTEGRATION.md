# Intégration PowerBI Embedded

Ce document guide l'intégration de rapports **PowerBI Embedded** dans l'application (principalement `Admin-Dashboard` ou `CRM-Pro`).

## 1. Architecture "App Owns Data"

Pour une application SaaS (Cloud Industrie), la méthode recommandée est **"App Owns Data"** (Embed for your customers). Les utilisateurs n'ont **pas** besoin de licence PowerBI Pro.

### Flux d'Authentification
1.  **Frontend (React)** demande un rapport.
2.  **Backend (Edge Function / Server)** :
    *   S'authentifie auprès de **Azure AD** via un **Service Principal** (ClientId + ClientSecret).
    *   Génère un **Embed Token** pour un rapport spécifique et un Workspace spécifique.
    *   Renvoie le Token + ReportID + EmbedURL au Frontend.
3.  **Frontend** utilise `powerbi-client-react` pour afficher l'iframe sécurisée.

## 2. Prérequis Azure & PowerBI

1.  **Azure AD** : Créer une "App Registration" (Service Principal).
    *   Récupérer `Application (client) ID` et `Directory (tenant) ID`.
    *   Créer un `Client Secret`.
2.  **PowerBI Service** :
    *   Créer un Workspace "Cloud Industrie".
    *   Ajouter le Service Principal comme **Admin** ou **Member** du Workspace.
    *   Publier le fichier `.pbix` dans ce Workspace.

## 3. Implémentation Frontend

Installer la librairie :
```bash
pnpm add powerbi-client-react powerbi-client
```

**Composant `PowerBIReport.tsx`** :

```tsx
import React from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

interface PowerBIReportProps {
  embedToken: string;
  embedUrl: string;
  reportId: string;
}

export const PowerBIReport: React.FC<PowerBIReportProps> = ({ embedToken, embedUrl, reportId }) => {
  return (
    <PowerBIEmbed
      embedConfig={{
        type: 'report',
        id: reportId,
        embedUrl: embedUrl,
        accessToken: embedToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: false }
          },
          background: models.BackgroundType.Transparent,
        }
      }}
      cssClassName="h-[600px] w-full"
      getEmbeddedComponent={(embeddedReport) => {
        window.report = embeddedReport;
      }}
    />
  );
};
```

## 4. Implémentation Backend (Génération Token)

Ceci doit se faire côté serveur (Edge Function Supabase ou Hasura Action) pour cacher le `Client Secret`.

**Exemple d'API (Pseudo-code Edge Function)** :

```typescript
// POST /api/powerbi/token
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  // 1. Get Azure AD Token
  const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const authBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://analysis.windows.net/powerbi/api/.default'
  });
  
  const adResponse = await fetch(authUrl, { method: 'POST', body: authBody });
  const { access_token } = await adResponse.json();

  // 2. Generate Embed Token from PowerBI API
  const pbiUrl = `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}/GenerateToken`;
  const pbiResponse = await fetch(pbiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessLevel: 'View' })
  });
  
  const embedData = await pbiResponse.json();
  
  return new Response(JSON.stringify(embedData), { headers: { 'Content-Type': 'application/json' } });
});
```

## 5. Sécurité (RLS dans PowerBI)

Pour isoler les données par client (ex: Ecole A ne voit pas Ecole B) :
1.  Dans PowerBI Desktop, définir un paramètre `TenantID`.
2.  Configurer **Row Level Security** sur la table principale (`[TenantID] = UserName()`).
3.  Lors de la génération du token côté serveur, passer l'identité :
    ```json
    {
      "accessLevel": "View",
      "identities": [
        {
          "username": "uuid-du-tenant-actuel",
          "roles": ["TenantRole"],
          "datasets": [ "dataset-id" ]
        }
      ]
    }
    ```

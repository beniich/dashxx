# Business Plan - Cloud Industrie CRM & School Platform

## 1. Résumé Exécutif

**Nom** : Cloud Industrie  
**Produits** : CRM Pro.cc (B2B SaaS) + School 1cc (Vertical Éducation) + Admin Dashboard  
**Modèle** : Multi-tenant SaaS avec pricing par siège + modules additionnels  
**Cible** : TPE/PME (CRM), Écoles privées 50-500 élèves (School)

### Proposition de Valeur
- **CRM Pro.cc** : Alternative simple à Salesforce/HubSpot pour PME francophones.
- **School 1cc** : ERP scolaire tout-en-un (inscription, notes, bulletins, paiements).
- **Différenciateur** : Prix accessibles, déploiement rapide, support francophone, PowerBI intégré.

## 2. Analyse de Marché

### Marché CRM B2B
- **Taille** : Marché CRM mondial = 50B$ (2024), croissance 12% annuel.
- **Cible** : PME francophones (France, Belgique, Afrique) = 2M entreprises.
- **Concurrents** : Salesforce (cher, complexe), HubSpot (anglophone), Zoho (indien).
- **Opportunité** : 85% des PME n'ont pas de CRM formalisé.

### Marché School ERP
- **Taille** : EdTech Afrique/France = 3B$ (2024), croissance 15% annuel.
- **Cible** : 15,000 écoles privées (France) + 50,000 (Afrique francophone).
- **Concurrents** : Pronote (France, vieillissant), Skolae (Afrique, basique).
- **Opportunité** : Besoin de modernisation post-COVID (digitalisation forcée).

## 3. Modèle de Revenus (SaaS Multi-Tenant)

### Pricing CRM Pro.cc

| Plan | Prix/mois | Utilisateurs | Fonctionnalités |
|------|-----------|--------------|-----------------|
| **Starter** | 29€ | 1-3 | Contacts, Deals, Factures |
| **Business** | 79€ | 4-10 | + Pipeline avancé, Automations |
| **Enterprise** | 199€ | Illimité | + PowerBI, Multi-langues, API |

**Add-ons** :
- PowerBI Reporting : +20€/mois
- Support Premium : +50€/mois
- Formation personnalisée : 500€ one-time

### Pricing School 1cc

| Plan | Prix/mois | Élèves | Fonctionnalités |
|------|-----------|--------|-----------------|
| **Basic** | 99€ | 50-200 | Notes, Bulletins, Parents |
| **Standard** | 249€ | 201-500 | + Emploi du temps, Paiements |
| **Premium** | 499€ | 500+ | + PowerBI, SMS, Multi-campus |

**Add-ons** :
- Module Cantine : +30€/mois
- SMS Parents : 0.05€/SMS
- Support dédié : +100€/mois

### Projections de Revenus (Année 1-3)

#### Année 1 (Lancement)
- CRM : 50 clients × 29€ = **1,450€/mois** (→ 17,400€/an)
- School : 10 écoles × 99€ = **990€/mois** (→ 11,880€/an)
- **Total Année 1** : ~30K€ ARR (Annual Recurring Revenue)

#### Année 2 (Croissance)
- CRM : 200 clients (mix plans) × 50€ avg = **10,000€/mois** (→ 120K€/an)
- School : 40 écoles × 150€ avg = **6,000€/mois** (→ 72K€/an)
- **Total Année 2** : ~200K€ ARR

#### Année 3 (Scale)
- CRM : 500 clients × 60€ avg = **30,000€/mois** (→ 360K€/an)
- School : 100 écoles × 200€ avg = **20,000€/mois** (→ 240K€/an)
- **Total Année 3** : ~600K€ ARR

## 4. Coûts Opérationnels (Année 1)

| Poste | Montant Annuel |
|-------|----------------|
| **Infrastructure (Supabase + Vercel)** | 2,400€ |
| **Nom de domaine + Email** | 200€ |
| **Marketing (Google Ads, SEO)** | 6,000€ |
| **Salaire Fondateur (si temps plein)** | 24,000€ |
| **Support (freelance)** | 3,600€ |
| **Divers (juridique, compta)** | 2,000€ |
| **TOTAL** | **38,200€** |

**Point mort (Break-even)** : 38,200€ / 12 = **3,200€/mois de revenus**.  
Avec un ARPU (Average Revenue Per User) de ~50€, il faut **65 clients actifs** pour le break-even.

## 5. Stratégie Go-to-Market

### Phase 1 : MVP & Early Adopters (Mois 0-6)
1. **Lancement Beta** : 10 clients gratuits (feedback intensif).
2. **Outbound** : LinkedIn + Email cold (50 contacts/jour).
3. **Content Marketing** : Blog SEO ("Meilleur CRM PME", "ERP école gratuit").
4. **Partenariats** : Associations de PME, réseaux d'écoles privées.

### Phase 2 : Acquisition Payante (Mois 7-12)
1. **Google Ads** : Mots-clés "CRM PME", "logiciel école" (budget 500€/mois).
2. **Webinars** : Démos gratuites bi-mensuelles.
3. **Affiliés** : Commission 20% récurrente (consultants CRM, EdTech).

### Phase 3 : Scale (Année 2+)
1. **Freemium** : Version gratuite limitée (booster SEO + feed de conversion).
2. **Vertical SaaS** : Versions spécialisées (écoles Montessori, cliniques dentaires).
3. **International** : Expansion Afrique francophone (via revendeurs locaux).

## 6. Équipe & Rôles

| Rôle | Année 1 | Année 2 |
|------|---------|---------|
| **Fondateur / Product** | Vous (full-time) | Vous + CTO |
| **Développeur Backend** | Freelance (10h/mois) | CDI junior |
| **Support Client** | Vous (part-time) | Freelance dédié |
| **Marketing** | Freelance SEO | Growth Hacker CDI |

## 7. Risques & Mitigation

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Concurrence (Salesforce, HubSpot)** | Élevé | Focus TPE/PME délaissées, prix 50% moins cher |
| **Churn élevé (clients partent)** | Élevé | Onboarding soigné, support réactif, contrats annuels avec -20% |
| **Complexité technique (Hasura)** | Moyen | Documentation solide, formation interne |
| **Régulation RGPD** | Moyen | Hébergement EU, RLS Policies strictes |

## 8. Plan de Financement

### Bootstrap (Recommandé Année 1)
- **Apport personnel** : 10,000€
- **Revenus récurrents** : Réinvestis
- **Pas de levée de fonds** (garder 100% equity)

### Levée Seed (Si Année 2 > 100K€ ARR)
- **Montant** : 100-200K€
- **Investisseurs** : Business Angels EdTech/SaaS
- **Dilution** : ~15-20%
- **Usage** : Hiring (dev + sales), Marketing agressif

## 9. Métriques Clés (KPIs)

| KPI | Objectif Année 1 | Objectif Année 2 |
|-----|------------------|------------------|
| **MRR (Monthly Recurring Revenue)** | 2,500€ | 15,000€ |
| **Clients Actifs** | 60 | 250 |
| **Churn Rate** | <10%/mois | <5%/mois |
| **CAC (Cost Acquisition Client)** | <200€ | <150€ |
| **LTV (Lifetime Value)** | >1,200€ | >2,000€ |

## 10. Prochaines Actions (Roadmap)

### Q1 2025
- [x] Finaliser architecture technique (Hasura + Supabase)
- [ ] Déployer MVP sur Vercel/Supabase Cloud
- [ ] 5 clients Beta (gratuit, feedback)

### Q2 2025
- [ ] Lancer plan Starter (CRM) + Basic (School)
- [ ] 30 clients payants (MRR = 1,500€)
- [ ] Campagne LinkedIn Ads (budget 1,000€)

### Q3-Q4 2025
- [ ] Atteindre break-even (65 clients)
- [ ] Lancer module PowerBI
- [ ] Recruter 1 dev backend junior

---

**Conclusion** : Cloud Industrie a un potentiel de **600K€ ARR en Année 3** avec une stratégie focalisée PME francophone. Le modèle cPanel est viable pour le POC, mais une migration vers une stack cloud est cruciale pour scaler.

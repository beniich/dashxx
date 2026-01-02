# Schémas de Base de Données & RLS Policies (PostgreSQL / Supabase)

Ce document fournit les références techniques pour la mise en place de la base de données multi-tenant et des politiques de sécurité.

## 1. Schéma de Base de Données (SQL)

Structure multi-schéma pour isoler `shared` (global), `crm` (métier) et `school` (éducation).

### Schema `shared` (Global)
```sql
CREATE SCHEMA IF NOT EXISTS shared;

-- Tenants (Clients/Écoles)
CREATE TABLE shared.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('crm', 'school')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rôles (RBAC)
CREATE TABLE shared.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,  -- ex: 'crm_user', 'school_teacher', 'super_admin'
  is_global BOOLEAN DEFAULT FALSE
);

-- Permissions (PBAC - Optionnel pour finesse)
CREATE TABLE shared.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL  -- ex: 'crm:contacts:read'
);

-- Liaison Utilisateurs <-> Tenants
CREATE TABLE shared.user_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES shared.tenants(id) ON DELETE CASCADE,
  role_id UUID REFERENCES shared.roles(id),
  UNIQUE(user_id, tenant_id)
);
```

### Schema `crm` (Vertical CRM)
```sql
CREATE SCHEMA IF NOT EXISTS crm;

-- Contacts
CREATE TABLE crm.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES shared.tenants(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_crm_contacts_tenant ON crm.contacts(tenant_id);

-- Opportunités
CREATE TABLE crm.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES shared.tenants(id),
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE SET NULL,
  stage TEXT,  -- prospect, qualified, closed
  amount DECIMAL
);
CREATE INDEX idx_crm_opportunities_tenant ON crm.opportunities(tenant_id);

-- Factures
CREATE TABLE crm.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES shared.tenants(id),
  opportunity_id UUID REFERENCES crm.opportunities(id),
  amount DECIMAL,
  status TEXT DEFAULT 'pending', -- pending, paid
  paid_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_crm_invoices_tenant ON crm.invoices(tenant_id);
```

### Schema `school` (Vertical Éducation)
```sql
CREATE SCHEMA IF NOT EXISTS school;

-- Étudiants
CREATE TABLE school.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES shared.tenants(id),
  first_name TEXT,
  last_name TEXT,
  birth_date DATE
);
CREATE INDEX idx_school_students_tenant ON school.students(tenant_id);

-- Classes
CREATE TABLE school.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES shared.tenants(id),
  name TEXT,
  teacher_id UUID
);

-- Notes
CREATE TABLE school.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES shared.tenants(id),
  student_id UUID REFERENCES school.students(id),
  class_id UUID REFERENCES school.classes(id),
  score DECIMAL,
  comments TEXT
);
```

## 2. Row Level Security (RLS) Policies

Ces politiques assurent que les utilisateurs ne voient que les données de leur propre tenant.

### Helper: Fonction pour récupérer le tenant_id courant
(Optimisation recommandée pour éviter les sous-requêtes répétitives)
```sql
CREATE OR REPLACE FUNCTION get_user_tenants()
RETURNS TABLE (tenant_id UUID) AS $$
  SELECT tenant_id FROM shared.user_tenants WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;
```

### Policies CRM (Exemples)

**Activer RLS**
```sql
ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;
```

**SELECT (Lecture)**
```sql
CREATE POLICY "Tenant isolation for CRM contacts read"
ON crm.contacts FOR SELECT
USING (
  tenant_id IN (SELECT tenant_id FROM shared.user_tenants WHERE user_id = auth.uid())
  OR 
  (auth.jwt() ->> 'role' = 'super_admin') -- Bypass Super Admin
);
```

**INSERT (Création)**
```sql
CREATE POLICY "Tenant isolation for CRM contacts insert"
ON crm.contacts FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM shared.user_tenants WHERE user_id = auth.uid())
);
```

### Policies Spécifiques (Role-Based)
**UPDATE (Professeurs ou Admins seulement pour les notes)**
```sql
CREATE POLICY "Teacher update grades"
ON school.grades FOR UPDATE
USING (
  auth.uid() IN (
      SELECT user_id FROM shared.user_tenants 
      WHERE tenant_id = school.grades.tenant_id 
      AND role_id IN (SELECT id FROM shared.roles WHERE name IN ('school_admin', 'school_teacher'))
  )
);
```

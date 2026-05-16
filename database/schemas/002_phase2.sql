-- ============================================================
-- SynapseCRM AI — Phase 2 Migration
-- Evolves schema from Phase 1 → Phase 2 CRM core
-- ============================================================

-- Idempotent: safe to re-run
BEGIN;

-- ------------------------------------------------------------
-- 1. ORGANIZATIONS — add missing columns
-- ------------------------------------------------------------
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS size text;

-- ------------------------------------------------------------
-- 2. MEMBERSHIPS — standardize roles
-- ------------------------------------------------------------
-- Existing role column is text, no schema change needed.
-- Valid roles: owner, admin, manager, sales, viewer

-- ------------------------------------------------------------
-- 3. LEADS — full Phase 2 schema
-- ------------------------------------------------------------
-- Rename columns to canonical names
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='contact_name') THEN
        ALTER TABLE leads RENAME COLUMN contact_name TO name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='company_name') THEN
        ALTER TABLE leads RENAME COLUMN company_name TO company;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='score') THEN
        ALTER TABLE leads RENAME COLUMN score TO lead_score;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='stage') THEN
        ALTER TABLE leads RENAME COLUMN stage TO status;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='assigned_user_id') THEN
        ALTER TABLE leads RENAME COLUMN assigned_user_id TO owner_id;
    END IF;
END $$;

-- Add new columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text;

-- Soft delete columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_by text;

-- ------------------------------------------------------------
-- 4. ACTIVITIES — add title, rename user column
-- ------------------------------------------------------------
ALTER TABLE activities ADD COLUMN IF NOT EXISTS title text;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='created_by_user_id') THEN
        ALTER TABLE activities RENAME COLUMN created_by_user_id TO user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='activity_type') THEN
        ALTER TABLE activities RENAME COLUMN activity_type TO type;
    END IF;
END $$;

-- Soft delete
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deleted_by text;

-- ------------------------------------------------------------
-- 5. CONVERSATIONS — add summary, soft delete
-- ------------------------------------------------------------
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary text;

-- Soft delete
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_by text;

-- ------------------------------------------------------------
-- 6. CONVERSATION MESSAGES — new table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type text NOT NULL DEFAULT 'user',
    content text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 7. AUDIT LOGS — new table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    before_state jsonb,
    after_state jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 8. INDEXES
-- ------------------------------------------------------------

-- Conversation messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id
    ON conversation_messages(conversation_id);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id
    ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at DESC);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON leads(deleted_at) WHERE deleted_at IS NULL;

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);

-- Full-text search indexes (GIN with weighted vectors)
-- Leads search
CREATE INDEX IF NOT EXISTS idx_leads_fts ON leads USING gin(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(email, '') || ' ' || coalesce(notes, ''))
);

-- Conversations search
CREATE INDEX IF NOT EXISTS idx_conversations_fts ON conversations USING gin(
    to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(summary, ''))
);

-- ------------------------------------------------------------
-- 9. HELPER FUNCTION for RLS
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_org_ids(user_uuid text)
RETURNS SETOF uuid AS $$
    SELECT organization_id FROM memberships WHERE user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 10. AUTO-UPDATE TIMESTAMPS TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['organizations', 'leads', 'workflows', 'reminders', 'outreach_campaigns', 'documents'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_updated_at ON %I;
            CREATE TRIGGER trigger_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END $$;

COMMIT;

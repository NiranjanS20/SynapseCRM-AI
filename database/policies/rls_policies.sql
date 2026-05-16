-- ============================================================
-- SynapseCRM AI — Row Level Security Policies
-- Every table enforces organization-level isolation
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Enable RLS on all tables
-- ------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- ORGANIZATIONS
-- Users can see orgs they belong to
-- ------------------------------------------------------------
DROP POLICY IF EXISTS org_select ON organizations;
CREATE POLICY org_select ON organizations FOR SELECT USING (
    id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS org_update ON organizations;
CREATE POLICY org_update ON organizations FOR UPDATE USING (
    id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()::text AND role IN ('owner', 'admin')
    )
);

-- ------------------------------------------------------------
-- MEMBERSHIPS
-- Users can see memberships within their orgs
-- ------------------------------------------------------------
DROP POLICY IF EXISTS membership_select ON memberships;
CREATE POLICY membership_select ON memberships FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS membership_insert ON memberships;
CREATE POLICY membership_insert ON memberships FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()::text AND role IN ('owner', 'admin')
    )
);

DROP POLICY IF EXISTS membership_update ON memberships;
CREATE POLICY membership_update ON memberships FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()::text AND role IN ('owner', 'admin')
    )
);

DROP POLICY IF EXISTS membership_delete ON memberships;
CREATE POLICY membership_delete ON memberships FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()::text AND role = 'owner'
    )
);

-- ------------------------------------------------------------
-- LEADS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS leads_select ON leads;
CREATE POLICY leads_select ON leads FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS leads_insert ON leads;
CREATE POLICY leads_insert ON leads FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS leads_update ON leads;
CREATE POLICY leads_update ON leads FOR UPDATE USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS leads_delete ON leads;
CREATE POLICY leads_delete ON leads FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()::text AND role IN ('owner', 'admin', 'manager')
    )
);

-- ------------------------------------------------------------
-- ACTIVITIES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS activities_select ON activities;
CREATE POLICY activities_select ON activities FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS activities_insert ON activities;
CREATE POLICY activities_insert ON activities FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

-- ------------------------------------------------------------
-- CONVERSATIONS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS conversations_select ON conversations;
CREATE POLICY conversations_select ON conversations FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS conversations_insert ON conversations;
CREATE POLICY conversations_insert ON conversations FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS conversations_update ON conversations;
CREATE POLICY conversations_update ON conversations FOR UPDATE USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

-- ------------------------------------------------------------
-- CONVERSATION MESSAGES
-- Access via parent conversation's org
-- ------------------------------------------------------------
DROP POLICY IF EXISTS messages_select ON conversation_messages;
CREATE POLICY messages_select ON conversation_messages FOR SELECT USING (
    conversation_id IN (
        SELECT id FROM conversations
        WHERE organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
    )
);

DROP POLICY IF EXISTS messages_insert ON conversation_messages;
CREATE POLICY messages_insert ON conversation_messages FOR INSERT WITH CHECK (
    conversation_id IN (
        SELECT id FROM conversations
        WHERE organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
    )
);

-- ------------------------------------------------------------
-- AUDIT LOGS
-- Read-only for org members
-- ------------------------------------------------------------
DROP POLICY IF EXISTS audit_select ON audit_logs;
CREATE POLICY audit_select ON audit_logs FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

-- Insert is done by service role (backend), not by users directly
DROP POLICY IF EXISTS audit_insert ON audit_logs;
CREATE POLICY audit_insert ON audit_logs FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

-- ------------------------------------------------------------
-- WORKFLOWS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS workflows_select ON workflows;
CREATE POLICY workflows_select ON workflows FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS workflows_insert ON workflows;
CREATE POLICY workflows_insert ON workflows FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

-- ------------------------------------------------------------
-- ANALYTICS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS analytics_select ON analytics;
CREATE POLICY analytics_select ON analytics FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

-- ------------------------------------------------------------
-- REMINDERS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS reminders_select ON reminders;
CREATE POLICY reminders_select ON reminders FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

DROP POLICY IF EXISTS reminders_insert ON reminders;
CREATE POLICY reminders_insert ON reminders FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids(auth.uid()::text))
);

COMMIT;

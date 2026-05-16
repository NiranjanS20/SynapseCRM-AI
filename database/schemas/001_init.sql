create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    plan text not null default 'free',
    settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists users (
    id text primary key,
    email text not null unique,
    full_name text,
    avatar_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists memberships (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    user_id text not null references users(id) on delete cascade,
    role text not null default 'member',
    status text not null default 'active',
    created_at timestamptz not null default now(),
    unique (organization_id, user_id)
);

create table if not exists leads (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    assigned_user_id text references users(id) on delete set null,
    company_name text not null,
    contact_name text,
    email text,
    score integer not null default 0,
    stage text not null default 'new',
    source text not null default 'manual',
    enriched_data jsonb not null default '{}'::jsonb,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists conversations (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    lead_id uuid not null references leads(id) on delete cascade,
    channel text not null default 'email',
    direction text not null default 'inbound',
    subject text,
    message text not null,
    sender_email text,
    embedding_id text,
    intent_tags jsonb not null default '[]'::jsonb,
    sentiment_score numeric,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists activities (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    lead_id uuid not null references leads(id) on delete cascade,
    activity_type text not null,
    description text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_by_user_id text references users(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists workflows (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    lead_id uuid references leads(id) on delete set null,
    workflow_type text not null default 'lead_processing',
    status text not null default 'pending',
    state jsonb not null default '{}'::jsonb,
    error_message text,
    retry_count integer not null default 0,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists reminders (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    lead_id uuid not null references leads(id) on delete cascade,
    workflow_id uuid references workflows(id) on delete set null,
    reminder_type text not null,
    due_at timestamptz not null,
    status text not null default 'pending',
    message text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists analytics (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    event_type text not null,
    metric_name text,
    metric_value integer,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists agent_logs (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    workflow_id uuid references workflows(id) on delete set null,
    agent_name text not null,
    status text not null,
    input_data jsonb not null default '{}'::jsonb,
    output_data jsonb not null default '{}'::jsonb,
    error_message text,
    provider text,
    latency_ms integer,
    tokens_used integer,
    created_at timestamptz not null default now()
);

create table if not exists outreach_campaigns (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    name text not null,
    status text not null default 'draft',
    channel text not null default 'email',
    message_template text,
    target_segment text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    lead_id uuid references leads(id) on delete set null,
    title text not null,
    source_type text not null default 'document',
    source_uri text,
    content text,
    checksum text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists embeddings (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    document_id uuid references documents(id) on delete cascade,
    lead_id uuid references leads(id) on delete cascade,
    conversation_id uuid references conversations(id) on delete cascade,
    chunk_index integer not null default 0,
    chunk_text text not null,
    embedding vector(384) not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_leads_organization_id on leads(organization_id);
create index if not exists idx_workflows_organization_id on workflows(organization_id);
create index if not exists idx_conversations_organization_id on conversations(organization_id);
create index if not exists idx_embeddings_organization_id on embeddings(organization_id);
create index if not exists idx_embeddings_vector on embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

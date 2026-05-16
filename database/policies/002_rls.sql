alter table organizations enable row level security;
alter table users enable row level security;
alter table memberships enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table activities enable row level security;
alter table workflows enable row level security;
alter table reminders enable row level security;
alter table analytics enable row level security;
alter table agent_logs enable row level security;
alter table outreach_campaigns enable row level security;
alter table documents enable row level security;
alter table embeddings enable row level security;

create or replace function public.current_user_id() returns text language sql stable as $$
  select nullif(auth.uid()::text, '');
$$;

create or replace function public.current_organization_ids() returns setof uuid language sql stable as $$
  select organization_id from memberships where user_id = public.current_user_id();
$$;

create or replace function public.is_org_member(target_org uuid) returns boolean language sql stable as $$
  select exists (
    select 1 from memberships m
    where m.organization_id = target_org
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  );
$$;

create policy "organizations_select_member" on organizations for select using (id in (select * from public.current_organization_ids()));
create policy "users_select_self" on users for select using (id = public.current_user_id());
create policy "memberships_select_org" on memberships for select using (public.is_org_member(organization_id));
create policy "memberships_manage_org_admin" on memberships for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "leads_org_isolation" on leads for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "conversations_org_isolation" on conversations for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "activities_org_isolation" on activities for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "workflows_org_isolation" on workflows for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "reminders_org_isolation" on reminders for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "analytics_org_isolation" on analytics for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "agent_logs_org_isolation" on agent_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "outreach_campaigns_org_isolation" on outreach_campaigns for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "documents_org_isolation" on documents for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "embeddings_org_isolation" on embeddings for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

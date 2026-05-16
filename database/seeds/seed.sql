insert into organizations (id, name, slug, plan)
values ('00000000-0000-0000-0000-000000000001', 'Synapse Demo', 'synapse-demo', 'pro')
on conflict (slug) do nothing;

insert into users (id, email, full_name)
values ('00000000-0000-0000-0000-000000000001', 'founder@synapsecrm.ai', 'Demo Founder')
on conflict (id) do nothing;

insert into memberships (organization_id, user_id, role)
values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner')
on conflict do nothing;

insert into leads (organization_id, company_name, contact_name, email, score, stage, source, metadata)
values
  ('00000000-0000-0000-0000-000000000001', 'Northstar Labs', 'Ava Chen', 'ava@northstarlabs.com', 82, 'qualified', 'inbound', '{"industry":"SaaS","notes":"demo request"}'),
  ('00000000-0000-0000-0000-000000000001', 'Vertex Commerce', 'Jordan Lee', 'jordan@vertexcommerce.com', 67, 'researching', 'web', '{"industry":"commerce"}')
on conflict do nothing;

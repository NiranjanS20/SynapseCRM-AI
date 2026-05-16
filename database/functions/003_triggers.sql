create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_orgs_updated_at before update on organizations for each row execute function public.touch_updated_at();
create trigger trg_users_updated_at before update on users for each row execute function public.touch_updated_at();
create trigger trg_leads_updated_at before update on leads for each row execute function public.touch_updated_at();
create trigger trg_workflows_updated_at before update on workflows for each row execute function public.touch_updated_at();
create trigger trg_reminders_updated_at before update on reminders for each row execute function public.touch_updated_at();
create trigger trg_outreach_updated_at before update on outreach_campaigns for each row execute function public.touch_updated_at();
create trigger trg_documents_updated_at before update on documents for each row execute function public.touch_updated_at();

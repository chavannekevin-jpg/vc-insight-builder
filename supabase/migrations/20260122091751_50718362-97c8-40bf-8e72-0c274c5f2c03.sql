-- Investor-uploaded deck snapshots (not founder-owned companies)
create table if not exists public.investor_deck_companies (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null,
  name text not null,
  stage text not null,
  description text null,
  category text null,
  memo_json jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investor_deck_companies enable row level security;

-- Investors manage their own uploaded deck companies
create policy "Investors can view their deck companies"
on public.investor_deck_companies
for select
using (investor_id = auth.uid());

create policy "Investors can create their deck companies"
on public.investor_deck_companies
for insert
with check (investor_id = auth.uid());

create policy "Investors can update their deck companies"
on public.investor_deck_companies
for update
using (investor_id = auth.uid());

create policy "Investors can delete their deck companies"
on public.investor_deck_companies
for delete
using (investor_id = auth.uid());

create policy "Admins can manage deck companies"
on public.investor_deck_companies
for all
using (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger support if not already present in project
-- (Function public.update_updated_at_column already exists)
create trigger update_investor_deck_companies_updated_at
before update on public.investor_deck_companies
for each row
execute function public.update_updated_at_column();

-- Extend investor_dealflow to support either founder companies OR uploaded deck companies
alter table public.investor_dealflow
  add column if not exists deck_company_id uuid null;

alter table public.investor_dealflow
  add constraint investor_dealflow_deck_company_fk
  foreign key (deck_company_id)
  references public.investor_deck_companies(id)
  on delete cascade;

-- Allow NULL company_id for deck uploads
alter table public.investor_dealflow
  alter column company_id drop not null;

-- Ensure exactly one target is set
alter table public.investor_dealflow
  add constraint investor_dealflow_target_check
  check (
    (company_id is not null and deck_company_id is null)
    or (company_id is null and deck_company_id is not null)
  );

-- Helpful index for joins
create index if not exists idx_investor_dealflow_deck_company_id
  on public.investor_dealflow(deck_company_id);

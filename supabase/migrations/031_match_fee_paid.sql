-- The matchmaker (or the administrator) confirms that the matchmaking fee was received after an
-- engagement closed through the site. Until then the candidates cannot delete their accounts.
alter table public.matches
  add column if not exists fee_paid_at timestamptz,
  add column if not exists fee_paid_by uuid references public.matchmakers(id) on delete set null;

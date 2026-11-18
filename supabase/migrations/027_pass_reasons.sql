-- When a candidate answers "not now" to a proposal they must say why. The reason lets the smart
-- assistant adjust the next proposals, and it stays private (only the server reads this table).
alter table public.match_interests add column if not exists reason text;
alter table public.match_interests add column if not exists reason_note text;

-- Matchmaking fee, set by the matchmaker before a match opens and sent to both candidates.
-- fee_sent_at is set when the amount is sent; each side confirms that they saw it.
alter table public.matches
  add column if not exists fee_amount         integer check (fee_amount is null or (fee_amount >= 1000 and fee_amount <= 50000)),
  add column if not exists fee_sent_at        timestamptz,
  add column if not exists fee_female_ack_at  timestamptz,
  add column if not exists fee_male_ack_at    timestamptz;

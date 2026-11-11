-- New match stage between "meeting_2" and "closing": more meetings. "closing" is shown as the engagement (vort).
alter type public.match_stage add value if not exists 'more_meetings' before 'closing';

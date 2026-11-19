-- A made-up engagement announcement to see the home page section. Remove it with
--   delete from public.engagements where source = 'demo';
insert into public.engagements
  (groom_name, groom_father, groom_community, groom_city, bride_name, bride_father, bride_community, bride_city, engaged_on, status, source)
select 'יוסף כהן', 'משה', 'גור', 'ירושלים', 'רחל לוי', 'דוד', 'ליטאי', 'בני ברק', current_date, 'published', 'demo'
where not exists (select 1 from public.engagements where source = 'demo');

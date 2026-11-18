-- Demo women for trying out proposals. Not a migration: run by hand, and remove with
--   delete from public.profiles where id::text like '33333333-0000-0000-0000-%';
insert into public.profiles (
  id, gender, first_name, last_name, age, city, community, occupation, style, partner_style,
  traits, relationship_values, brings, about_me, about_partner, matchmaker_status
) values
 ('33333333-0000-0000-0000-000000000001','female','נעמי','אברמוביץ',21,'בני ברק','ליטאית','מורה','shmura','shmura',
  array['calm','deep','shy'], array['family','homey','depth'], array['stability','homey','communication'],
  'דמו: לומדת בסמינר, אוהבת ספרים ובישול.', 'מחפשת בן ישיבה ירא שמים, רגוע ואחראי.', 'green'),
 ('33333333-0000-0000-0000-000000000002','female','שירה','גולדשטיין',24,'ירושלים','ספרדית','גננת','open_ish','open_ish',
  array['happy','social','communicative'], array['family','emotional','depth'], array['stability','homey','communication'],
  'דמו: עובדת בגן, אוהבת טיולים ואנשים.', 'מחפשת בן זוג חם עם חוש הומור ויציבות.', 'green'),
 ('33333333-0000-0000-0000-000000000003','female','תהילה','רוזנברג',27,'בית שמש','חסידית','מעצבת גרפית','open_ish','open',
  array['flowing','proactive','deep'], array['aspirations','family','depth'], array['stability','communication'],
  'דמו: מעצבת בעבודה מהבית, אוהבת יצירה ומוזיקה.', 'מחפשת בן זוג בעל שאיפות, שפתוח לשיחה.', 'green'),
 ('33333333-0000-0000-0000-000000000004','female','אסתר','מזרחי',23,'אשדוד','ספרדית','מזכירה רפואית','open','open',
  array['happy','social','proactive'], array['family','emotional','lightness'], array['stability','homey'],
  'דמו: משפחתית ושמחה, אוהבת אירוח.', 'מחפשת בחור עם לב טוב ואופטימיות.', 'green'),
 ('33333333-0000-0000-0000-000000000005','female','רבקה','פרידמן',29,'חיפה','דתית לאומית','עובדת סוציאלית','modern','modern',
  array['serious','deep','communicative'], array['spiritual','depth','worldview'], array['stability','communication'],
  'דמו: עובדת בתחום הטיפול, אוהבת לימוד וקריאה.', 'מחפשת בן זוג רציני עם עומק והשקפה דומה.', 'green'),
 ('33333333-0000-0000-0000-000000000006','female','מרים','קליין',22,'מודיעין עילית','חסידית','מורה לחינוך מיוחד','shmura','shmura',
  array['calm','shy','serious'], array['family','homey'], array['stability','homey'],
  'דמו: מורה צעירה, אוהבת ילדים ובית חם.', 'מחפשת בן ישיבה יושב ולומד.', 'green'),
 ('33333333-0000-0000-0000-000000000007','female','יעל','שפירא',26,'נתניה','כללית','מתכנתת','very_modern','modern',
  array['proactive','flowing','social'], array['aspirations','lightness','worldview'], array['communication','stability'],
  'דמו: עובדת בהייטק, אוהבת ספורט וטיולים.', 'מחפשת בן זוג פתוח עם שאיפות.', 'green'),
 ('33333333-0000-0000-0000-000000000008','female','חנה','לוי',25,'רחובות','ספרדית','מהנדסת תעשייה','open_ish','open_ish',
  array['calm','communicative','happy'], array['family','emotional','aspirations'], array['stability','communication','homey'],
  'דמו: מהנדסת בתעשייה, אוהבת לימוד וטבע.', 'מחפשת בן זוג יציב, חם ושאפתן.', 'green')
on conflict (id) do nothing;

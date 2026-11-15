-- Which date a place suits (first / second / third), plus the first batch of parks, promenades and
-- hotel lobbies. Descriptions only state what public sources say; the "suits" tags are a suggestion
-- the administrator can change from the date spots page. Restaurants and cafes are not included yet.
alter table public.date_spots add column if not exists suitable_dates text[] not null default '{}';

with v(name, city, region, category, vibe, address, kosher, dates) as (
  values
  ('Waldorf Astoria ירושלים', 'ירושלים', 'jerusalem', 'hotel_lobby',
   'לובי מלון יוקרתי במרכז העיר. לפי פרסומים בתקשורת, מקום קבוע לפגישות שידוכים בערבים. יש במלון מסעדות כשרות.',
   'גרשון אגרון 26-28, ירושלים', true, array['first','second']),
  ('מלון מצודת דוד', 'ירושלים', 'jerusalem', 'hotel_lobby',
   'לובי מרווח עם בר לובי ומרפסת מול העיר העתיקה. מוזכר בתקשורת כמקום מוכר לפגישות ראשונות של שידוכים, ואפשר לשבת בלובי בלי להזמין.',
   'המלך דוד 7, ירושלים', null, array['first','second']),
  ('מלון המלך דוד', 'ירושלים', 'jerusalem', 'hotel_lobby',
   'מלון היסטורי ומוכר בלב ירושלים. הוזכר בתקשורת כמקום לפגישות היכרות של שידוכים.',
   'המלך דוד 23, ירושלים', null, array['first','second']),
  ('מלון אוריינט (ישרוטל)', 'ירושלים', 'jerusalem', 'hotel_lobby',
   'מלון בוטיק במושבה הגרמנית, ברחוב עמק רפאים. הוזכר בתקשורת כמקום שבו התקיים דייט שידוכים בלובי נוח.',
   'עמק רפאים 3, ירושלים', null, array['first','second']),
  ('מלון כינורות', 'טבריה', 'kinneret', 'hotel_lobby',
   'מלון בטבריה שמופיע ברשתות ההזמנות כמלון כשר למהדרין. מומלץ לוודא מול המלון את הכשרות ואת אפשרויות הישיבה בלובי.',
   null, true, array['first','second']),
  ('מלון קינג כורש', 'נתניה', 'sharon', 'hotel_lobby',
   'מלון בנתניה שמופיע כמלון כשר למהדרין. מומלץ לוודא מול המלון את הכשרות ואת אפשרויות הישיבה בלובי.',
   null, true, array['first','second']),
  ('פארק סאכר', 'ירושלים', 'jerusalem', 'park',
   'הפארק הציבורי הגדול בירושלים, בין נחלאות, רחביה וגבעת רם. שבילי הליכה, מדשאות וספסלים. מתאים להליכה ארוכה ושיחה.',
   null, null, array['second','third']),
  ('טיילת ארמון הנציב', 'ירושלים', 'jerusalem', 'park',
   'טיילת עם תצפית רחבה על ירושלים. הוזכרה בפורומים של שידוכים כמקום נעים להליכה ולשיחה.',
   null, null, array['first','second']),
  ('תצפית רמת רחל', 'ירושלים', 'jerusalem', 'park',
   'תצפית שקטה בדרום ירושלים. הוזכרה בפורומים של שידוכים כמקום להליכה ולשיחה.',
   null, null, array['first','second']),
  ('משכנות שאננים וימין משה', 'ירושלים', 'jerusalem', 'quiet',
   'שכונה היסטורית שקטה מול העיר העתיקה, נעימה להליכה. הוזכרה בפורומים של שידוכים כמקום לדייט בירושלים.',
   null, null, array['first','second']),
  ('גן הפעמון', 'ירושלים', 'jerusalem', 'park',
   'גן ציבורי גדול במרכז ירושלים, עם מדשאות ושבילים. מתאים להליכה ושיחה בנחת.',
   null, null, array['second','third']),
  ('פארק הירקון', 'תל אביב-יפו ורמת גן', 'gush_dan', 'park',
   'הפארק הגדול של גוש דן, עם אגם, נחל ושדות. גדול דיו כדי לבחור פינה שקטה.',
   null, null, array['second','third']),
  ('הפארק הלאומי רמת גן', 'רמת גן', 'gush_dan', 'park',
   'פארק גדול עם מסלולי הליכה. הכניסה חופשית.',
   null, null, array['second','third']),
  ('טיילת לואי', 'חיפה', 'haifa', 'park',
   'טיילת בכרמל עם תצפית על מפרץ חיפה. מקום שקט להליכה ושיחה.',
   null, null, array['first','second']),
  ('טיילת טבריה', 'טבריה', 'kinneret', 'park',
   'טיילת לאורך הכנרת, מתאימה להליכה ושיחה.',
   null, null, array['first','second']),
  ('פארק רעננה', 'רעננה', 'sharon', 'park',
   'פארק עירוני גדול עם אגם ושבילי הליכה.',
   null, null, array['second','third']),
  ('פארק נחל באר שבע', 'באר שבע', 'negev', 'park',
   'פארק גדול לאורך נחל באר שבע, עם שבילי הליכה.',
   null, null, array['second','third'])
)
insert into public.date_spots (name, city, region, category, vibe, address, kosher, suitable_dates, google_maps_url, is_published)
select v.name, v.city, v.region::spot_region, v.category::spot_category, v.vibe, v.address, v.kosher, v.dates,
       'https://www.google.com/maps/search/?api=1&query=' || replace(v.name || ' ' || v.city, ' ', '+'), true
from v
where not exists (select 1 from public.date_spots d where d.name = v.name and d.city = v.city);

select count(*) as spots, count(*) filter (where is_published) as published from public.date_spots;

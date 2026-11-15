-- More well-known parks, promenades and hotel lobbies around the country (not only for the Haredi
-- sector). Descriptions are short and only state widely known facts; the administrator can edit
-- everything from the date spots page. Restaurants and cafes are not included yet.
with v(name, city, region, category, vibe, kosher, dates) as (
  values
  -- Jerusalem parks and quiet places
  ('גן העצמאות', 'ירושלים', 'jerusalem', 'park', 'פארק ציבורי במרכז ירושלים, עם מדשאות ושבילי הליכה.', null, array['second','third']),
  ('גן הוורדים ע"ש ווהל', 'ירושלים', 'jerusalem', 'quiet', 'גן עם שיחי ורדים מול הכנסת ובית המשפט העליון. מתאים להליכה קצרה ושיחה.', null, array['first','second']),
  ('פארק המסילה', 'ירושלים', 'jerusalem', 'park', 'שביל הליכה לאורך מסילת הרכבת הישנה בדרום ירושלים.', null, array['second','third']),
  ('פארק טדי', 'ירושלים', 'jerusalem', 'park', 'פארק מול הר ציון והעיר העתיקה, ידוע במזרקה המוסיקלית.', null, array['first','second']),
  -- Gush Dan, Sharon, center
  ('גן העצמאות', 'תל אביב-יפו', 'gush_dan', 'park', 'פארק ציבורי על הצוק מעל חוף הים בצפון תל אביב.', null, array['second','third']),
  ('טיילת תל אביב-יפו', 'תל אביב-יפו', 'gush_dan', 'quiet', 'טיילת ארוכה לאורך חוף הים, מתאימה להליכה ושיחה.', null, array['first','second']),
  ('פארק מקורות הירקון', 'ראש העין', 'sharon', 'park', 'פארק במקורות נחל הירקון, עם שבילי הליכה וגשרים.', null, array['second','third']),
  ('הפארק הלאומי אפק', 'ראש העין', 'sharon', 'park', 'גן לאומי ליד ראש העין, עם מצודה עתיקה ושטחי דשא.', null, array['second','third']),
  ('פארק מאיר', 'כפר סבא', 'sharon', 'park', 'פארק עירוני גדול עם שבילי הליכה.', null, array['second','third']),
  ('פארק אנבה', 'מודיעין-מכבים-רעות', 'shfela', 'park', 'פארק עירוני במודיעין.', null, array['second','third']),
  -- Haifa, north, south
  ('גני הבהאים', 'חיפה', 'haifa', 'park', 'גנים מדורגים על הר הכרמל. הכניסה לחלקים מסוימים בסיור מודרך.', null, array['first','second']),
  ('גן האם', 'חיפה', 'haifa', 'park', 'פארק עירוני במרכז הכרמל בחיפה.', null, array['second','third']),
  ('הפארק הלאומי אשקלון', 'אשקלון', 'lachish', 'park', 'גן לאומי על חוף הים, עם שרידי עיר עתיקה.', null, array['second','third']),
  ('שמורת הבניאס', 'קצרין והגולן', 'golan', 'park', 'שמורת טבע עם נחל, מפל ושבילי הליכה בצפון הגולן.', null, array['second','third']),
  ('שמורת תל דן', 'קריית שמונה והגליל העליון', 'upper_galilee', 'park', 'שמורת טבע עם נחלים ושבילי הליכה בגליל העליון.', null, array['second','third']),
  -- Hotel lobbies
  ('מלון ענבל', 'ירושלים', 'jerusalem', 'hotel_lobby', 'מלון מוכר במרכז ירושלים. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון ממילא', 'ירושלים', 'jerusalem', 'hotel_lobby', 'מלון בוטיק במתחם ממילא. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון קראון פלאזה ירושלים', 'ירושלים', 'jerusalem', 'hotel_lobby', 'מלון עם לובי ציבורי. מומלץ לוודא מראש את אפשרויות הישיבה והכשרות.', null, array['first','second']),
  ('מלון לאונרדו פלאזה ירושלים', 'ירושלים', 'jerusalem', 'hotel_lobby', 'מלון עם לובי ציבורי. מומלץ לוודא מראש את אפשרויות הישיבה והכשרות.', null, array['first','second']),
  ('מלון פרימה קינגס', 'ירושלים', 'jerusalem', 'hotel_lobby', 'מופיע ברשימה של מלונות כשרים למהדרין בישראל. מומלץ לוודא מראש את אפשרויות הישיבה בלובי.', true, array['first','second']),
  ('מלון רמדה ירושלים', 'ירושלים', 'jerusalem', 'hotel_lobby', 'מופיע ברשימה של מלונות כשרים למהדרין בישראל. מומלץ לוודא מראש את אפשרויות הישיבה בלובי.', true, array['first','second']),
  ('מלון דן תל אביב', 'תל אביב-יפו', 'gush_dan', 'hotel_lobby', 'מלון ליד הטיילת, כולל מסעדות כשרות. מומלץ לוודא מראש את אפשרויות הישיבה בלובי.', null, array['first','second']),
  ('מלון הילטון תל אביב', 'תל אביב-יפו', 'gush_dan', 'hotel_lobby', 'מלון על שפת הים ליד גן העצמאות. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון לאונרדו סיטי טאוור', 'רמת גן', 'gush_dan', 'hotel_lobby', 'מלון עם לובי ציבורי. מומלץ לוודא מראש את אפשרויות הישיבה והכשרות.', null, array['first','second']),
  ('מלון דן אכדיה', 'הרצליה', 'sharon', 'hotel_lobby', 'מלון על שפת הים. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון סיזנס', 'נתניה', 'sharon', 'hotel_lobby', 'מלון על חוף הים בנתניה. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון דן כרמל', 'חיפה', 'haifa', 'hotel_lobby', 'מלון על הכרמל. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון לאונרדו פלאזה חיפה', 'חיפה', 'haifa', 'hotel_lobby', 'מלון עם לובי ציבורי. מומלץ לוודא מראש את אפשרויות הישיבה והכשרות.', null, array['first','second']),
  ('מלון נוף כנרת', 'טבריה', 'kinneret', 'hotel_lobby', 'מלון בטבריה. מומלץ לוודא מראש את אפשרויות הישיבה בלובי ואת הכשרות.', null, array['first','second']),
  ('מלון פרימה גליל', 'טבריה', 'kinneret', 'hotel_lobby', 'מלון בטבריה עם מסעדה כשרה בהשגחת הרבנות. מומלץ לוודא מראש את אפשרויות הישיבה בלובי.', null, array['first','second'])
)
insert into public.date_spots (name, city, region, category, vibe, kosher, suitable_dates, google_maps_url, is_published)
select v.name, v.city, v.region::spot_region, v.category::spot_category, v.vibe, v.kosher, v.dates,
       'https://www.google.com/maps/search/?api=1&query=' || replace(v.name || ' ' || v.city, ' ', '+'), true
from v
where not exists (select 1 from public.date_spots d where d.name = v.name and d.city = v.city);

select count(*) as spots, count(*) filter (where is_published) as published from public.date_spots;

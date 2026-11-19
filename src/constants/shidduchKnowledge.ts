// The smart assistant's prepared answers about dating and shidduchim. They were gathered from the
// articles linked in each entry and rewritten in short, general words; the sources are shown with
// every answer so the person can read more. Halachic questions are always sent to a rabbi.

export interface KnowledgeSource { title: string; url: string }

export interface KnowledgeEntry {
  id: string
  title: string
  /** Words a person might use when asking about this. A match on a longer word counts more. */
  keywords: string[]
  answer: string
  sources: KnowledgeSource[]
  /** Add the "ask your rabbi" line. */
  rabbi?: boolean
}

export const RABBI_NOTE = 'זו הכוונה כללית ולא פסק הלכה. לשאלה הלכתית ספציפית כדאי לפנות לרב.'

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'first-date-where',
    title: 'איפה וכמה זמן בפגישה ראשונה',
    keywords: ['פגישה ראשונה', 'דייט ראשון', 'איפה נפגשים', 'מקום לפגישה', 'כמה זמן', 'קפה', 'לאן הולכים'],
    answer:
      'הפגישה הראשונה מתאימה למקום נוח לשיחה, ציבורי או חצי ציבורי: מסעדה או בית קפה, לובי של מלון או פארק. אפשר לקבוע על כוס קפה או קינוח לשעתיים בערך. כדאי להגיע בלי ציפיות גדולות, ופשוט להכיר אדם נחמד ולראות מה משותף.',
    sources: [
      { title: 'The Shidduch: How Jewish Dating Works (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/3716771/jewish/The-Shidduch-How-Jews-Date.htm' },
      { title: 'Dating Advice, ABCs of Dating (Aish)', url: 'https://aish.com/48916147/' },
    ],
  },
  {
    id: 'first-date-topics',
    title: 'על מה לדבר בפגישה ראשונה',
    keywords: ['על מה לדבר', 'מה לדבר', 'נושאי שיחה', 'שיחה', 'לשאול', 'שאלות לפגישה', 'מה לשאול', 'להתחיל שיחה'],
    answer:
      'בפגישות הראשונות כדאי להישאר בנושאים קלים וטכניים: עיסוק, לימודים, תחביבים, משפחה וילדות. אפשר לפתוח בשאלה כללית ופתוחה ואז לשאול מה הצד השני חושב ולהקשיב באמת. לא כדאי להציף ברגשות עמוקים, בסיפורי קושי מהעבר, בלשון הרע או בהתרברבות. כדאי לחשוב מראש על כמה נושאים, ולזכור שאין רשימה מחייבת: מתאימים את השיחה לשניכם.',
    sources: [
      { title: 'שידוכים וחיפוש זוגיות (הידברות)', url: 'https://www.hidabroot.org/article/229162' },
      { title: 'טיפים לפגישה ראשונה (כיכר השבת)', url: 'https://www.kikar.co.il/matchmaking/first-date-dating-tips' },
      { title: 'גמ"ח נושאים לפגישות (ב"ח)', url: 'https://www.bhol.co.il/news/196550' },
    ],
  },
  {
    id: 'silence',
    title: 'שתיקה מביכה',
    keywords: ['שתיקה', 'מביך', 'נגמר לי הנושא', 'אין על מה לדבר', 'נתקע'],
    answer:
      'שתיקה בפגישה ראשונה היא טבעית. אפשר לומר בחיוך משהו על כך שזו פגישה ראשונה וההתרגשות בשיאה. אם אין לך מה לומר על שאלה, מותר לומר "לא חשבתי על זה". כדאי לוודא שגם הצד השני מדבר, ושהשיחה לא נשארת של צד אחד.',
    sources: [
      { title: 'טיפים לפגישה ראשונה (כיכר השבת)', url: 'https://www.kikar.co.il/matchmaking/first-date-dating-tips' },
      { title: 'שידוכים וחיפוש זוגיות (הידברות)', url: 'https://www.hidabroot.org/article/229604' },
    ],
  },
  {
    id: 'nerves',
    title: 'התרגשות ומתח לפני פגישה',
    keywords: ['מתח', 'התרגשות', 'לחץ', 'מתרגש', 'מתרגשת', 'מפחד', 'חרדה', 'לפני הפגישה', 'להירגע'],
    answer:
      'מתח לפני פגישה הוא נורמלי, והוא יכול לקלקל את האווירה אם לא מתייחסים אליו. כדאי להגיע בזמן נוח, בלי למהר, לאכול ולשתות ולישון לפני, ולחשוב על הנקודות הטובות שבך. אפשר גם להתפלל לפני הפגישה. חשוב לזכור שהפגישה הראשונה היא רק התחלה: חוסר התלהבות בה לא אומר בהכרח שהשידוך לא מתאים, והתרגשות גבוהה יכולה לבלבל.',
    sources: [
      { title: 'שידוכים וחיפוש זוגיות (הידברות)', url: 'https://www.hidabroot.org/article/229604' },
      { title: 'שידוכים וחיפוש זוגיות (הידברות)', url: 'https://www.hidabroot.org/article/228718' },
      { title: 'טיפים לפגישה ראשונה (כיכר השבת)', url: 'https://www.kikar.co.il/matchmaking/first-date-dating-tips' },
    ],
  },
  {
    id: 'deep-topics',
    title: 'נושאים עמוקים יותר בפגישות הבאות',
    keywords: ['ערכים', 'ילדים', 'חינוך', 'כסף', 'לימוד תורה', 'קהילה', 'חיים משותפים', 'פגישה שנייה', 'פגישה שלישית', 'לעומק', 'בית יהודי'],
    answer:
      'ככל שמתקדמים אפשר לשוחח על ערכים וחיים משותפים: איך נראה בית יהודי אצלכם, מקום לימוד התורה, איזו קהילה רוצים, כמה ילדים ואיך מחנכים אותם, יחס לכסף, חובות והוצאות, זמן משפחה מול פרנסה, ותפקיד המשפחה והחברים. גם נושאים שחשוב לדעת עליהם, כמו בריאות, תלויות או קשיים, ראוי להעלות בעדינות ובזמן המתאים, ובייעוץ עם השדכן/ית.',
    sources: [
      { title: 'Practical Dating Advice (Chabad.org)', url: 'https://www.chabad.org/therebbe/letters/default_cdo/aid/1956873/jewish/Practical-Dating-Advice.htm' },
      { title: 'Six Conversations About Marriage (OU)', url: 'https://www.ou.org/life/relationships/marriage/six-conversations-about-marriage-guide-moshe-hauer/' },
      { title: 'The Shidduch: How Jewish Dating Works (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/3716771/jewish/The-Shidduch-How-Jews-Date.htm' },
    ],
  },
  {
    id: 'how-many-dates',
    title: 'כמה פגישות צריך',
    keywords: ['כמה פגישות', 'כמה דייטים', 'מתי להחליט', 'מתי לדעת', 'להמשיך', 'פגישה נוספת', 'לא בטוח', 'לא בטוחה', 'כמה זמן להיפגש'],
    answer:
      'אין מספר קבוע, והמקורות חלוקים. יש שמתאימים להם כמה פגישות ויש שנפגשים תריסר פעמים ויותר. עצה מוכרת היא לתת הזדמנות של לפחות כמה פגישות אמיתיות ומכוונות, ולהמשיך כל עוד אין "לא" ברור. מצד שני, יש הרואים בפגישות רבות מדי לחץ מיותר. מה שחשוב הוא שהתשובה תבוא מהיכרות אמיתית ולא ממספר, ושאם התשובה ברורה לא צריך להמשיך רק כדי להמשיך.',
    sources: [
      { title: '13 Facts About Shidduch Dating (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/5522524/jewish/13-Facts-About-Shidduch-Dating.htm' },
      { title: "Date 'Em Til You Hate 'Em (Aish)", url: 'https://aish.com/date-em-til-you-hate-em/' },
      { title: 'The Rebbe on Dating (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/4083745/jewish/The-Rebbe-on-Dating.htm' },
      { title: 'The Right Match? (OU)', url: 'https://www.ou.org/life/relationships/dating/the-right-match-filling-the-gaps-in-the-shidduch-process-lisa-twerski/' },
    ],
  },
  {
    id: 'red-flags',
    title: 'סימנים שכדאי לשים לב אליהם',
    keywords: ['דגל אדום', 'דגלים אדומים', 'סימני אזהרה', 'מידות', 'כעס', 'יחס לאחרים', 'חשש', 'משהו לא נראה לי', 'התנהגות'],
    answer:
      'כדאי לשים לב לרמזים לחוסר נעימות: כעס או מזג רע, זלזול, חוסר כנות או אמינות, קמצנות, התנשאות או חוסר התחשבות ברגשות ובצרכים של אחרים. קל להתעלם מזה מרוב רצון להתחתן, ולהגיד "זה לא באמת הוא/היא" או "זה ישתנה אחרי החתונה", וזו טעות נפוצה. גם רמת דתיות לא תמיד מעידה על מידות. מומלץ להתייעץ עם השדכן/ית ועם אדם קרוב ומנוסה.',
    sources: [
      { title: 'The Right Match? (OU)', url: 'https://www.ou.org/life/relationships/dating/the-right-match-filling-the-gaps-in-the-shidduch-process-lisa-twerski/' },
      { title: 'Pay Attention to These 5 Relationship Red Flags (Chabad.org)', url: 'https://www.chabad.org/theJewishWoman/article_cdo/aid/5999267/jewish/Pay-Attention-to-These-5-Relationship-Red-Flags.htm' },
      { title: 'I Am Dating, What to Look for in a Future Spouse (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/1684497/jewish/I-Am-Dating-What-to-Look-for-in-a-Future-Spouse.htm' },
    ],
  },
  {
    id: 'mind-heart',
    title: 'שכל מול רגש',
    keywords: ['רגש', 'שכל', 'ליבי', 'מרגיש', 'מרגישה', 'התאהבות', 'ניצוץ', 'כימיה', 'מתאים על הנייר'],
    answer:
      'בשידוכים בדרך כלל מתחילים מהשכל ואז בודקים שגם הלב מתחבר: קודם צריך שזה יהיה הגיוני ומתאים בערכים, ואז צריך שזה ירגיש נכון. רגשות חזקים יכולים לטשטש שיפוט ולגרום להתעלם מבעיות, ולכן לא כדאי להחליט רק מהתרגשות, וגם לא לפסול רק בגלל שהרגש לא התפרץ בפגישה הראשונה.',
    sources: [
      { title: 'The Shidduch: How Jewish Dating Works (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/3716771/jewish/The-Shidduch-How-Jews-Date.htm' },
      { title: '6 Strategies for Successful Dating (Chabad.org)', url: 'https://www.chabad.org/theJewishWoman/article_cdo/aid/4041738/jewish/6-Strategies-for-Successful-Dating.htm' },
    ],
  },
  {
    id: 'inquiries',
    title: 'בירורים לפני שידוך',
    keywords: ['בירורים', 'לברר', 'מבררים', 'ממליצים', 'מקורות לבירור', 'להתקשר ולשאול', 'חקירה'],
    answer:
      'בירורים הם חלק מהתהליך, אבל חשוב לעשות אותם נכון. הדברים המהותיים כדאי לברר, והשאר כדאי להשאיר להיכרות אישית. לפי ההלכה מותר לברר רק מה שמותר גם לספר, ורצוי להסביר למי שנשאל שמדובר בבירור לשידוך ולא לערוך חקירה סמויה. נשאלים מתקשים לומר דבר שלילי, ולכן שימו לב גם למה שלא נאמר, וכדאי לשמוע כמה אנשים. נושאים אישיים רגישים כמו פרטים רפואיים משפחתיים הם שאלות שמוטב לא לשאול סתם.',
    sources: [
      { title: 'מה מבררים לפני שידוך (כיפה, שאל את הרב)', url: 'https://www.kipa.co.il/שאל-את-הרב/%d7%9e%d7%94-%d7%9e%d7%91%d7%a8%d7%a8%d7%99%d7%9d-%d7%9c%d7%a4%d7%a0%d7%99-%d7%a9%d7%99%d7%93%d7%95%d7%9a/' },
      { title: 'המדריך: איך מבררים על המשודכת (כיכר השבת)', url: 'https://www.kikar.co.il/matchmaking/120342' },
      { title: 'Inquiries or Inquisitions (OU)', url: 'https://www.ou.org/life/relationships/52073/' },
    ],
    rabbi: true,
  },
  {
    id: 'say-no',
    title: 'איך לסרב בצורה מכובדת',
    keywords: ['איך לסרב', 'לסרב', 'סירוב', 'להגיד לא', 'לדחות', 'לא מתאים לי', 'איך לומר לא', 'לסיים', 'אני לא רוצה להמשיך', 'לא מעוניין', 'לא מעוניינת'],
    answer:
      'מומלץ להיות ישיר וחם בו זמנית: להודות על ההזדמנות, לומר "לא" ברור, ולסיים במשפט אדיב. אין צורך בהסברים ארוכים, ומשפט פשוט כמו "לא הרגשתי חיבור" או "אני לא חושב/ת שאנחנו מתאימים" הוא לגיטימי. תשובה מעורפלת משאירה פתח ומתישה את שני הצדדים. בשידוכים התשובה עוברת דרך השדכן/ית, ושווה לתת לו/ה סיבה כללית ועניינית שתעזור גם להצעות הבאות. כדאי לזכור שמולכם אדם אמיתי.',
    sources: [
      { title: 'How to Politely Decline a Date (Bumble, מקור כללי ולא חרדי)', url: 'https://bumble.com/the-buzz/how-to-politely-decline-a-date' },
      { title: 'How to Reject Someone Nicely (Marriage.com, מקור כללי ולא חרדי)', url: 'https://www.marriage.com/advice/relationship/how-to-reject-someone-nicely/' },
    ],
  },
  {
    id: 'where-venues',
    title: 'סוגי מקומות מתאימים לדייט',
    keywords: ['מקום לדייט', 'איפה לצאת', 'מקומות', 'מסעדה', 'פארק', 'לובי', 'בית מלון', 'קניון', 'באוטו', 'ברכב'],
    answer:
      'מקומות ציבוריים או חצי ציבוריים מתאימים בדרך כלל: מסעדה או בית קפה שקטים, לובי של מלון או פארק. כדאי להימנע מקניון עמוס, שקשה לשוחח בו, ומפגישה ראשונה בתוך רכב, שרבים אינם רוצים בה. אפשר גם לבחור מקום שבו לא סביר לפגוש מכרים. לפי העיר שלכם אפשר לראות מקומות מוצעים באתר.',
    sources: [
      { title: 'The Shidduch: How Jewish Dating Works (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/3716771/jewish/The-Shidduch-How-Jews-Date.htm' },
      { title: 'כתבה בכיפה על דייטים', url: 'https://www.kipa.co.il/יחסים/זוגיות/1200768-0/?amp=1' },
    ],
  },
  {
    id: 'halacha-dating',
    title: 'שאלות הלכה בדייט',
    keywords: ['ייחוד', 'שמירת נגיעה', 'שומר נגיעה', 'הלכה', 'מותר', 'אסור', 'נגיעה', 'צניעות', 'לגעת'],
    answer:
      'בנושאי ייחוד ושמירת נגיעה יש הלכות וגם מנהגים שונים בין קהילות, ואין לי סמכות לפסוק. באופן כללי מקובל להיפגש במקום ציבורי ולא בחדר סגור או מקום מבודד. ההנחיה המעשית: לברר מראש עם הרב שלכם מה נהוג אצלכם, ולהעלות את הנושא בעדינות עם הצד השני לפני או בתחילת הפגישות.',
    sources: [
      { title: 'שאל את הרב (כיפה)', url: 'https://www.kipa.co.il/שאל-את-הרב/1183943-1/' },
      { title: 'איפה הבושה על ייחוד ושמירת נגיעה (כיפה)', url: 'https://www.kipa.co.il/שאל-את-הרב/%d7%90%d7%99%d7%a4%d7%94-%d7%94%d7%91%d7%95%d7%a9%d7%94-%d7%a2%d7%9c-%d7%99%d7%99%d7%97%d7%95%d7%93-%d7%95%d7%a9%d7%9e%d7%99%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a2%d7%94/' },
    ],
    rabbi: true,
  },
  {
    id: 'engagement-pace',
    title: 'קצב עד אירוסין',
    keywords: ['אירוסין', 'ווארט', 'להתארס', 'כמה מהר', 'חתונה', 'לוקח זמן', 'ללחוץ', 'מהר מדי'],
    answer:
      'בעולם החרדי נהוג שההיכרות מתקדמת בקצב מהיר יחסית, כי הפגישות מכוונות ומתחילות מהשכל ומהתאמה בערכים. ובכל זאת אין לחץ לקבוע זמן: חשוב שההחלטה תבוא מהיכרות אמיתית ושקט פנימי. כדאי להתייעץ בדרך עם השדכן/ית, עם הורים או עם מישהו מנוסה שמכיר אתכם.',
    sources: [
      { title: 'How Do Religious Jews Get Engaged so Soon? (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/3881292/jewish/How-Do-Religious-Jews-Get-Engaged-so-Soon.htm' },
      { title: '13 Facts About Shidduch Dating (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/5522524/jewish/13-Facts-About-Shidduch-Dating.htm' },
    ],
  },
  {
    id: 'shadchan-feedback',
    title: 'עבודה עם השדכן/ית',
    keywords: ['שדכן', 'שדכנית', 'משוב', 'פידבק', 'לספר לשדכן', 'מה לומר לשדכן', 'תשובה לשדכן', 'עדכון לשדכנית'],
    answer:
      'שדכן/ית עוזר/ת הרבה יותר כשהתשובות ברורות ומהירות, וכשהמשוב על כל פגישה ענייני. כדאי לשתף מה עבד ומה לא ולהסביר מה חשוב לכם באמת, כדי שההצעות הבאות יהיו מדויקות. אם משהו לא נעים או מדאיג בפגישה, שדכן/ית הוא הכתובת הנכונה להתייעצות. כך הוא/היא גם יכול/ה לשמש גשר ולהבהיר דברים בעדינות.',
    sources: [
      { title: 'What Matchmakers Are Really Saying (Aish)', url: 'https://aish.com/what-matchmakers-are-really-saying/' },
      { title: 'Guy Confessions: What I Want to Tell the Shadchan (Aish)', url: 'https://aish.com/guy-confessions-what-i-want-to-tell-the-shadchan/' },
    ],
  },
  {
    id: 'what-to-look-for',
    title: 'במה לחפש בבן או בת זוג',
    keywords: ['במה לחפש', 'מה חשוב', 'מה לחפש', 'קריטריונים', 'רשימה', 'דרישות', 'הקריטריונים שלי', 'בן זוג מתאים', 'בת זוג מתאימה'],
    answer:
      'מקובל להבדיל בין מה שבאמת חשוב לכם, כמו ערכים, מידות והשקפה, לבין העדפות שאפשר להתגמש בהן. רשימה ארוכה מדי של דרישות עלולה לפסול אנשים טובים. כדאי לברר לעצמכם קודם מה בסיסי ומה בונוס, ולשאול את עצמכם אם אפשר לבנות בית עם האדם הזה.',
    sources: [
      { title: 'I Am Dating, What to Look for in a Future Spouse (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/1684497/jewish/I-Am-Dating-What-to-Look-for-in-a-Future-Spouse.htm' },
      { title: 'The Right Match? (OU)', url: 'https://www.ou.org/life/relationships/dating/the-right-match-filling-the-gaps-in-the-shidduch-process-lisa-twerski/' },
      { title: 'Chapter Twelve: Whom to Decide Upon (Chabad.org)', url: 'https://www.chabad.org/library/article_cdo/aid/2301557/jewish/Chapter-Twelve-Whom-to-Decide-Upon-Whom-Not-to-Decide-Upon.htm' },
    ],
  },
]

/** Questions the assistant can answer, shown as suggestions. */
export const TOPIC_CHIPS = [
  'על מה לדבר בפגישה ראשונה?',
  'איפה כדאי לצאת לדייט?',
  'כמה פגישות צריך?',
  'איך לסרב בצורה מכובדת?',
]

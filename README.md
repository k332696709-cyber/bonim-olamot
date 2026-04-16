# בונים עולמות – Bonim Olamot

## התקנה

### דרישות מקדימות
**יש להתקין [Node.js](https://nodejs.org/) (גרסה 18 ומעלה)**

### הפעלה
```bash
cd "bonim-olamot"
npm install
npm run dev
```

הפרויקט יעלה בכתובת: **http://localhost:3000**

---

## עמודים
| URL | תיאור |
|-----|--------|
| `/he` | דף הבית (עברית) |
| `/en` | דף הבית (אנגלית) |
| `/he/register/female` | טופס הרשמה מיועדת |
| `/he/matchmaker/profiles/1` | תצוגת שדכן |

---

## מבנה הפרויקט
```
src/
├── app/[locale]/          # דפי Next.js (App Router)
├── components/
│   ├── ui/                # רכיבי UI בסיסיים
│   ├── forms/             # טופס הרשמה ו-sections
│   ├── profile/           # תצוגת שדכן
│   └── layout/            # Header, Logo, LanguageSwitcher
├── constants/             # formOptions, mockProfiles
├── lib/                   # validations (Zod), PDF export, utils
├── types/                 # TypeScript types
└── i18n/messages/         # he.json, en.json
```

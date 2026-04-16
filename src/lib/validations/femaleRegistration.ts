import { z } from 'zod'

const TraitEnum = z.enum(['calm','happy','serious','flowing','deep','social','proactive','shy','communicative'])
const RelValueEnum = z.enum(['stability','emotional','aspirations','family','depth','lightness','spiritual','worldview'])
const BringsEnum = z.enum(['stability','emotional','depth','responsibility','homey','commitment','lightness','communication','reliability'])

export const femaleRegistrationSchema = z.object({
  firstName:       z.string().min(2, 'שם פרטי חייב להכיל לפחות 2 תווים'),
  lastName:        z.string().min(2, 'שם משפחה חייב להכיל לפחות 2 תווים'),
  age:             z.coerce.number().int().min(18, 'גיל מינימלי: 18').max(120),
  hebrewBirthday:  z.string().min(3, 'נא להזין תאריך לידה עברי'),
  status:          z.string().min(1, 'יש לבחור מצב משפחתי'),
  community:       z.string().min(1, 'נא להזין קהילה'),
  occupation:      z.string().min(1, 'נא להזין עיסוק'),
  city:            z.string().min(1, 'נא להזין עיר'),
  phone:           z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין (לדוג׳: 0501234567)'),
  email:           z.string().email('כתובת דוא"ל לא תקינה'),
  photos:          z.array(z.string()).default([]),

  style:           z.enum(['shmura','open_ish','open','modern','very_modern'],   { errorMap: () => ({ message: 'יש לבחור סגנון' }) }),
  partnerStyle:    z.enum(['shmur','open_ish','open','modern','very_modern'],     { errorMap: () => ({ message: 'יש לבחור סגנון מבוקש' }) }),
  preferredStream: z.string().default(''),

  traits:          TraitEnum.array().min(2,'יש לבחור לפחות 2 תכונות').max(3,'ניתן לבחור עד 3 תכונות'),
  relationshipValues: RelValueEnum.array().min(2,'יש לבחור לפחות 2').max(3,'ניתן לבחור עד 3'),
  brings:          BringsEnum.array().min(2,'יש לבחור לפחות 2').max(3,'ניתן לבחור עד 3'),
  doesntSuit:      z.string().default(''),
  flexibility:     z.enum(['preferred','important','very_important','not_important'], { errorMap: () => ({ message: 'יש לבחור' }) }),

  clothing:        z.enum(['very_simple','simple','classic','stylish','respectable','modern','very_modern'], { errorMap: () => ({ message: 'יש לבחור סגנון לבוש' }) }),
  headcovering:    z.enum(['wig_no_cut','wig_with_cut','wig_only','wig_plus_cover','kerchief_only','no_preference'], { errorMap: () => ({ message: 'יש לבחור כיסוי ראש' }) }),
  partnerClothing: z.enum(['only_bw','bw_elegant','colorful_weekday','very_modern'], { errorMap: () => ({ message: 'יש לבחור' }) }),
  phoneType:       z.enum(['kosher','filtered','smartphone','work_smartphone'], { errorMap: () => ({ message: 'יש לבחור סוג טלפון' }) }),

  aboutMe:         z.string().default(''),
  aboutPartner:    z.string().default(''),
})

export type FemaleRegistrationData = z.infer<typeof femaleRegistrationSchema>

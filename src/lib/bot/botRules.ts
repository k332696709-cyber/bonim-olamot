export type BotAction = 'form_male' | 'form_female' | 'form_matchmaker' | 'contact' | null

export interface BotReply {
  reply: string
  action: BotAction
}

export const BOT_ACTIONS: BotAction[] = ['form_male', 'form_female', 'form_matchmaker', 'contact', null]

/** Facts the bot may state. Taken from the site's own About page; nothing else is promised. */
export const BOT_FACTS_HE = `בונים עולמות הוא ארגון שידוכים מקצועי לקהילה החרדית בישראל.
תהליך: 1) הרשמה ויצירת פרופיל באמצעות שאלון מפורט. 2) שדכן/ית מוסמך/ת סוקר/ת את הפרופיל ומתאים/ה מועמדים. 3) הצעת שידוך מוצגת לשני הצדדים בדיסקרטיות ובכבוד, וכל הכרעה היא בידי המועמד/ת. 4) ליווי עד לסיום.
פרטיות: פרטי המועמדים מוגנים, ומידע אישי לא מועבר לשום גורם ללא הסכמה מפורשת.
הרשמה: יש טופס נפרד למיועדים (בחורים) ולמיועדות (בחורות), וגם הרשמה לשדכנים/ות.
אין מידע על מחירים. לשאלות נוספות אפשר ליצור קשר דרך עמוד "צור קשר".`

export const BOT_FACTS_EN = `Bonim Olamot is a professional matchmaking organization serving the Haredi community in Israel.
Process: 1) Register and create a profile via a detailed questionnaire. 2) A certified matchmaker reviews the profile and finds compatible candidates. 3) A proposal is presented to both sides with discretion and respect, and every decision belongs to the candidate. 4) Support until a successful conclusion.
Privacy: candidate details are protected and personal information is never shared without explicit consent.
Registration: separate forms for men and for women, plus matchmaker registration.
There is no pricing information. For anything else, use the "Contact" page.`

const has = (t: string, words: string[]) => words.some((w) => t.includes(w))

/**
 * Rule-based answers. Used when no AI key is configured, and as the safety net
 * if the AI call fails. Always returns something useful.
 */
export function ruleReply(text: string, he: boolean): BotReply {
  const t = text.toLowerCase().trim()

  const female = has(t, ['מיועדת', 'בחורה', 'אישה', 'אשה', 'נערה', 'female', 'woman', 'girl', "i'm a woman", 'i am a woman'])
  const male = has(t, ['מיועד', 'בחור', 'גבר', 'male', ' man', 'boy', "i'm a man", 'i am a man'])
  const maleOnly = male && !female && !t.includes('מיועדת')

  if (has(t, ['שדכן', 'שדכנית', 'matchmaker']) && has(t, ['הצטרף', 'להצטרף', 'הרשמ', 'אני', 'join', 'register', 'am a'])) {
    return {
      action: 'form_matchmaker',
      reply: he
        ? 'כיף שאת/ה רוצה להצטרף לרשת השדכנים! הנה הטופס להרשמת שדכנים.'
        : 'Great that you want to join our matchmaker network! Here is the matchmaker registration form.',
    }
  }

  if (female && !maleOnly) {
    return {
      action: 'form_female',
      reply: he
        ? 'מעולה! הנה טופס ההרשמה למיועדות. זה שאלון הכרות מפורט, וכדאי להקדיש לו כמה דקות. אחרי השליחה נחזור אלייך בהקדם.'
        : 'Wonderful! Here is the registration form for women. It is a detailed questionnaire, so set aside a few minutes. We will get back to you soon after you submit.',
    }
  }
  if (maleOnly) {
    return {
      action: 'form_male',
      reply: he
        ? 'מעולה! הנה טופס ההרשמה למיועדים. זה שאלון הכרות מפורט, וכדאי להקדיש לו כמה דקות. אחרי השליחה נחזור אליך בהקדם.'
        : 'Wonderful! Here is the registration form for men. It is a detailed questionnaire, so set aside a few minutes. We will get back to you soon after you submit.',
    }
  }

  if (has(t, ['הרשמה', 'להירשם', 'טופס', 'שאלון', 'register', 'sign up', 'form', 'join'])) {
    return {
      action: null,
      reply: he
        ? 'בשמחה! יש טופס נפרד למיועדים ולמיועדות. מי מחפש/ת שידוך, מיועד או מיועדת?'
        : 'Happy to! There is a separate form for men and for women. Which one should I send you?',
    }
  }

  if (has(t, ['פרטיות', 'דיסקרט', 'סודיות', 'מידע אישי', 'privacy', 'discret', 'confidential'])) {
    return {
      action: null,
      reply: he
        ? 'הדיסקרטיות היא ערך יסוד אצלנו. פרטי המועמדים מוגנים, ומידע אישי לא מועבר לשום גורם ללא הסכמה מפורשת.'
        : 'Discretion is a core value for us. Candidate details are protected and personal information is never shared without explicit consent.',
    }
  }

  if (has(t, ['איך זה עובד', 'איך עובד', 'תהליך', 'שלבים', 'how does', 'how it works', 'process', 'steps'])) {
    return {
      action: null,
      reply: he
        ? 'התהליך בארבעה שלבים: 1) הרשמה ויצירת פרופיל. 2) שדכן/ית מוסמך/ת סוקר/ת את הפרופיל ומתאים/ה מועמדים. 3) הצעה מוצגת לשני הצדדים בדיסקרטיות, וההכרעה תמיד בידך. 4) ליווי עד לסיום. רוצה שאשלח לך את טופס ההרשמה?'
        : 'Four steps: 1) Register and create a profile. 2) A certified matchmaker reviews it and finds compatible candidates. 3) A proposal is presented to both sides discreetly, and the decision is always yours. 4) Support until the end. Shall I send you the registration form?',
    }
  }

  if (has(t, ['מחיר', 'עלות', 'עולה', 'כמה עולה', 'תשלום', 'חינם', 'price', 'cost', 'how much', 'fee', 'free'])) {
    return {
      action: 'contact',
      reply: he
        ? 'אין לי כאן מידע על עלויות. את השאלה הזו כדאי לברר ישירות עם הצוות דרך עמוד צור קשר.'
        : 'I don’t have pricing information here. It’s best to ask the team directly via the Contact page.',
    }
  }

  if (has(t, ['שדכן', 'שדכנית', 'matchmaker'])) {
    return {
      action: null,
      reply: he
        ? 'שדכנים ושדכניות מוסמכים סוקרים כל פרופיל ומתאימים מועמדים בראייה מקצועית. אם את/ה שדכן/ית ורוצה להצטרף, כתוב/י לי “אני שדכנית” ואשלח את הטופס.'
        : 'Certified matchmakers review every profile and match candidates with professional insight. If you are a matchmaker and want to join, tell me “I’m a matchmaker” and I’ll send the form.',
    }
  }

  if (has(t, ['צור קשר', 'טלפון', 'וואטסאפ', 'מייל', 'לדבר', 'נציג', 'contact', 'phone', 'whatsapp', 'email', 'talk to', 'human'])) {
    return {
      action: 'contact',
      reply: he
        ? 'בשמחה. אפשר ליצור איתנו קשר בוואטסאפ, בטלפון או במייל דרך עמוד צור קשר.'
        : 'Of course. You can reach us by WhatsApp, phone or email via the Contact page.',
    }
  }

  if (has(t, ['שלום', 'היי', 'בוקר טוב', 'ערב טוב']) || /\b(hello|hi|hey|shalom)\b/.test(t)) {
    return {
      action: null,
      reply: he
        ? 'שלום! אני העוזר/ת של בונים עולמות. אפשר לשאול אותי על התהליך והפרטיות, ואני יכול/ה לשלוח לך את טופס ההרשמה. מי מחפש/ת שידוך?'
        : 'Hello! I’m the Bonim Olamot assistant. Ask me about the process and privacy, and I can send you the registration form. Who is looking for a match?',
    }
  }

  return {
    action: null,
    reply: he
      ? 'לא בטוח/ה שהבנתי. אפשר לשאול אותי איך התהליך עובד, על פרטיות, או לבחור הרשמה למיועד או למיועדת.'
      : 'I’m not sure I got that. You can ask how the process works, about privacy, or choose registration for men or women.',
  }
}

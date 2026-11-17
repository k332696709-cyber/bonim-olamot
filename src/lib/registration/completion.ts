import { isFieldVisible, questionnairePages, type RegistrationForm } from '@/constants/registrationForms'

export interface StepProgress {
  title: string
  done: number
  total: number
}

export interface QuestionnaireProgress {
  percent: number
  done: number
  total: number
  steps: StepProgress[]
}

/**
 * How much of the questionnaire is filled in. Only the required questions that apply count (a
 * question that depends on another answer counts only when it is shown). At 100% the profile is shown to
 * matchmakers.
 */
export function questionnaireProgress(form: RegistrationForm, answers: Record<string, string>): QuestionnaireProgress {
  const steps = questionnairePages(form).map((pg) => {
    const counted = pg.fields.filter((f) => f.required && f.type !== 'file' && isFieldVisible(f, answers))
    const done = counted.filter((f) => (answers[f.id] ?? '').trim() !== '').length
    return { title: pg.title ?? '', done, total: counted.length }
  })
  const total = steps.reduce((n, s) => n + s.total, 0)
  const done = steps.reduce((n, s) => n + s.done, 0)
  return { percent: total === 0 ? 100 : Math.floor((done / total) * 100), done, total, steps }
}

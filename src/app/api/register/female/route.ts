import { NextRequest } from 'next/server'
import { FEMALE_FORM } from '@/constants/registrationForms'
import { handleRegistration } from '@/lib/registration/handler'

export const runtime = 'nodejs'

export const POST = (req: NextRequest) => handleRegistration(req, FEMALE_FORM)

import { z } from 'zod'

const toTrimmedString = (value) => {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

export const leadFormSchema = z.object({
  full_name: z.preprocess(
    toTrimmedString,
    z
      .string()
      .trim()
      .min(1, 'El nombre completo es obligatorio.')
      .min(2, 'Ingresa tu nombre completo.')
      .max(120, 'El nombre es demasiado largo.'),
  ),
  email: z.preprocess(
    toTrimmedString,
    z
      .string()
      .trim()
      .min(1, 'El correo es obligatorio.')
      .toLowerCase()
      .email('Ingresa un correo electrónico válido.')
      .max(254, 'El correo es demasiado largo.'),
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(7, 'Ingresa un teléfono válido.')
      .max(30, 'El teléfono es demasiado largo.')
      .optional(),
  ),
  company: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(2, 'Ingresa el nombre de la empresa.')
      .max(120, 'El nombre de la empresa es demasiado largo.')
      .optional(),
  ),
  source: z.preprocess(
    toTrimmedString,
    z.string().trim().min(1, 'Selecciona el origen/fuente.'),
  ),
  privacy_consent: z.boolean().refine((value) => value === true, {
    message: 'Debes aceptar la política de privacidad para continuar.',
  }),
})

export function validateLeadForm(values) {
  return leadFormSchema.safeParse(values)
}


import { z } from 'zod'

const _trimmedRequired = (max: number) =>
  z.string().trim().min(1, 'Required').max(max, `At most ${max} characters`)

/** `^-?\d+(\.\d+)?$` — decimal string preserving precision, optional minus. */
const _decimalString = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/, 'Must be a decimal number')

const _optionalDecimal = z.union([_decimalString, z.literal('')]).optional()

export const personalAddressSchema = z.object({
  id: z.string(),
  name: z.string(),
  addressLine: z.string(),
  city: z.string(),
  district: z.string(),
  state: z.string(),
  country: z.string(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  isPrimary: z.boolean().optional(),
})
export type PersonalAddress = z.infer<typeof personalAddressSchema>

export const personalAddressListSchema = z
  .array(personalAddressSchema)
  .catch(() => [])
export type PersonalAddressList = z.infer<typeof personalAddressListSchema>

export const shopAddressListSchema = personalAddressListSchema
export type ShopAddressList = z.infer<typeof shopAddressListSchema>

export const addressFormSchema = z.object({
  name: _trimmedRequired(64),
  addressLine: _trimmedRequired(200),
  city: _trimmedRequired(64),
  district: _trimmedRequired(64),
  state: _trimmedRequired(64),
  country: _trimmedRequired(64),
  latitude: _optionalDecimal,
  longitude: _optionalDecimal,
  isPrimary: z.boolean(),
})
export type AddressFormInput = z.infer<typeof addressFormSchema>

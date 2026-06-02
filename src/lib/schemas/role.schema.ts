import { z } from 'zod'

const _permissionObjectSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().nullable().optional(),
  })
  .transform((value) => value.name)

const _permissionEntrySchema = z.union([z.string(), _permissionObjectSchema])

export const myRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  permissions: z.array(_permissionEntrySchema).default([]),
})

export type MyRole = z.infer<typeof myRoleSchema>

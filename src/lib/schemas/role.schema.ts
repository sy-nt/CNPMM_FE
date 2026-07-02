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

export const roleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isSystemRole: z.boolean().optional(),
})
export type RoleSummary = z.infer<typeof roleSummarySchema>

export const systemPermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
})
export type SystemPermission = z.infer<typeof systemPermissionSchema>

export const roleDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isSystemRole: z.boolean().optional(),
  permissions: z.array(systemPermissionSchema).default([]),
})
export type RoleDetail = z.infer<typeof roleDetailSchema>

export const roleListResponseSchema = z
  .object({
    items: z.array(roleSummarySchema),
    currentPage: z.number().int().nonnegative().catch(1),
    limit: z.number().int().positive().catch(0),
    total: z.number().int().nonnegative().catch(0),
    totalPage: z.number().int().nonnegative().catch(0),
  })
  .catch(() => ({
    items: [],
    currentPage: 1,
    limit: 0,
    total: 0,
    totalPage: 0,
  }))
export type RoleListResponse = z.infer<typeof roleListResponseSchema>

export const systemPermissionListSchema = z
  .array(systemPermissionSchema)
  .catch(() => [])
export type SystemPermissionList = z.infer<typeof systemPermissionListSchema>

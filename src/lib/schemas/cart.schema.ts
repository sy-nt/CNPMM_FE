import { z } from 'zod'

const _optionalString = z.string().nullable().optional()

export const cartItemSkuSelectionSchema = z.object({
  attributeId: _optionalString,
  attributeValueId: _optionalString,
  attributeName: _optionalString,
  attributeValue: _optionalString,
})
export type CartItemSkuSelection = z.infer<typeof cartItemSkuSelectionSchema>

export const cartItemSkuShopSchema = z.object({
  id: z.string(),
  name: _optionalString,
  slug: _optionalString,
  status: _optionalString,
})
export type CartItemSkuShop = z.infer<typeof cartItemSkuShopSchema>

export const cartItemSkuSchema = z.object({
  id: z.string(),
  spuId: _optionalString,
  skuCode: _optionalString,
  name: _optionalString,
  price: _optionalString,
  imageKey: _optionalString,
  isActive: z.boolean().optional(),
  availableQuantity: z.number().int().nonnegative().catch(0).optional(),
  quantity: z.number().int().nonnegative().catch(0).optional(),
  shop: cartItemSkuShopSchema.nullable().optional(),
  selections: z.array(cartItemSkuSelectionSchema).default([]).optional(),
})
export type CartItemSku = z.infer<typeof cartItemSkuSchema>

export const cartItemProductSchema = z.object({
  id: z.string(),
  name: _optionalString,
  slug: _optionalString,
  mainImageKey: _optionalString,
  price: _optionalString,
  shopId: _optionalString,
  isActive: z.boolean().optional(),
})
export type CartItemProduct = z.infer<typeof cartItemProductSchema>

export const cartItemSchema = z.object({
  id: z.string().optional(),
  skuId: z.string(),
  quantity: z.number().int().nonnegative().catch(0),
  price: _optionalString,
  subtotal: _optionalString,
  shopId: _optionalString,
  shopName: _optionalString,
  isAvailable: z.boolean().optional(),
  sku: cartItemSkuSchema.nullable().optional(),
  product: cartItemProductSchema.nullable().optional(),
})
export type CartItem = z.infer<typeof cartItemSchema>

const _cartObjectSchema = z.object({
  id: z.string().optional(),
  items: z.array(cartItemSchema).default([]),
  totalItems: z.number().int().nonnegative().catch(0).optional(),
  subtotal: _optionalString,
})

export type Cart = {
  id?: string
  items: ReadonlyArray<z.infer<typeof cartItemSchema>>
  totalItems?: number
  subtotal?: string | null
}

const _emptyCart: Cart = { items: [] }

export const cartSchema: z.ZodType<Cart> = z
  .union([
    z.array(cartItemSchema).transform<Cart>((items) => ({ items })),
    _cartObjectSchema.transform<Cart>((value) => ({
      id: value.id,
      items: value.items,
      totalItems: value.totalItems,
      subtotal: value.subtotal ?? null,
    })),
  ])
  .catch(() => _emptyCart)

export const IMAGE_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'] as const

export type ImageExtension = (typeof IMAGE_ALLOWED_EXTENSIONS)[number]

export const IMAGE_ACCEPT = 'image/jpeg,image/png,.jpg,.jpeg,.png'

export const USER_AVATAR_IMAGE_PREFIX = 'user-avatar' as const

export const USER_AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024

/** @deprecated Use IMAGE_ALLOWED_EXTENSIONS */
export const USER_AVATAR_ALLOWED_EXTENSIONS = IMAGE_ALLOWED_EXTENSIONS

/** @deprecated Use ImageExtension */
export type UserAvatarExtension = ImageExtension

export const USER_AVATAR_ACCEPT = IMAGE_ACCEPT

export const SHOP_LOGO_IMAGE_PREFIX = 'shop-logo' as const

export const SHOP_LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024

export const SHOP_LOGO_ACCEPT = IMAGE_ACCEPT

export const PRODUCT_IMAGE_PREFIX = 'product-image' as const

export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024

export const PRODUCT_IMAGE_ACCEPT = IMAGE_ACCEPT

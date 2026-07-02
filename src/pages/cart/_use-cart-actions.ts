import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '#/lib/api/client'
import { cartMutations } from '#/lib/query/cart'
import type { CartLineView } from '#/pages/cart/_cart-line'

export type CartPendingAction = 'update' | 'remove' | null

type UseCartActionsResult = {
  pendingSkuId: string | null
  pendingAction: CartPendingAction
  isClearing: boolean
  onQuantityChange: (skuId: string, nextQuantity: number) => void
  onRemove: (skuId: string) => void
  onClear: () => void
}

export function useCartActions(
  accessToken: string,
  lines: ReadonlyArray<CartLineView>,
): UseCartActionsResult {
  const queryClient = useQueryClient()
  const mutations = cartMutations(accessToken, queryClient)
  const updateQuantity = useMutation(mutations.updateQuantity)
  const removeItem = useMutation(mutations.removeItem)
  const clearCartMutation = useMutation(mutations.clear)

  const pendingSkuId = updateQuantity.isPending
    ? updateQuantity.variables.skuId
    : removeItem.isPending
      ? removeItem.variables
      : null
  const pendingAction: CartPendingAction = updateQuantity.isPending
    ? 'update'
    : removeItem.isPending
      ? 'remove'
      : null

  const handleQuantityChange = async (
    skuId: string,
    nextQuantity: number,
  ): Promise<void> => {
    if (pendingSkuId !== null) return

    const line = lines.find((entry) => entry.skuId === skuId)
    if (!line) return
    if (nextQuantity === line.quantity) return
    if (nextQuantity <= 0) {
      await handleRemove(skuId)
      return
    }

    try {
      await updateQuantity.mutateAsync({
        skuId,
        input: { quantity: nextQuantity },
      })
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not update the cart item.'))
    }
  }

  const handleRemove = async (skuId: string): Promise<void> => {
    if (pendingSkuId !== null) return

    try {
      await removeItem.mutateAsync(skuId)
      toast.success('Item removed from your cart.')
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not remove the cart item.'))
    }
  }

  const handleClear = async (): Promise<void> => {
    if (clearCartMutation.isPending) return

    try {
      await clearCartMutation.mutateAsync(undefined)
      toast.success('Cart cleared.')
    } catch (error) {
      toast.error(_humaniseError(error, 'Could not clear the cart.'))
    }
  }

  return {
    pendingSkuId,
    pendingAction,
    isClearing: clearCartMutation.isPending,
    onQuantityChange: (skuId, nextQuantity) => {
      void handleQuantityChange(skuId, nextQuantity)
    },
    onRemove: (skuId) => {
      void handleRemove(skuId)
    },
    onClear: () => {
      void handleClear()
    },
  }
}

function _humaniseError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback
  }
  return fallback
}

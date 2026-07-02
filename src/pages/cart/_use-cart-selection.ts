import { useEffect, useMemo, useRef, useState } from 'react'

import type { CartLineView } from '#/pages/cart/_cart-line'
import type { CartShopGroup } from '#/pages/cart/_cart-shop-group'

type UseCartSelectionResult = {
  selectedSkuIds: ReadonlySet<string>
  selectedLines: ReadonlyArray<CartLineView>
  toggleLine: (skuId: string, selected: boolean) => void
  toggleShop: (shopId: string, selected: boolean) => void
}

export function useCartSelection(
  lines: ReadonlyArray<CartLineView>,
  shopGroups: ReadonlyArray<CartShopGroup>,
): UseCartSelectionResult {
  const [selectedSkuIds, setSelectedSkuIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const selectionInitialisedRef = useRef(false)

  useEffect(() => {
    if (selectionInitialisedRef.current) return
    if (lines.length === 0) return

    const next = new Set<string>()
    for (const line of lines) {
      if (!line.isInactive) next.add(line.skuId)
    }
    setSelectedSkuIds(next)
    selectionInitialisedRef.current = true
  }, [lines])

  const selectedLines = useMemo(() => {
    if (selectedSkuIds.size === 0) return []
    return lines.filter((line) => selectedSkuIds.has(line.skuId))
  }, [lines, selectedSkuIds])

  const toggleLine = (skuId: string, selected: boolean): void => {
    setSelectedSkuIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(skuId)
      else next.delete(skuId)
      return next
    })
  }

  const toggleShop = (shopId: string, selected: boolean): void => {
    const group = shopGroups.find((entry) => entry.shopId === shopId)
    if (!group) return

    setSelectedSkuIds((prev) => {
      const next = new Set(prev)
      for (const line of group.lines) {
        if (line.isInactive) continue
        if (selected) next.add(line.skuId)
        else next.delete(line.skuId)
      }
      return next
    })
  }

  return { selectedSkuIds, selectedLines, toggleLine, toggleShop }
}

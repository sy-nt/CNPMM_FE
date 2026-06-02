import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ProductCard } from '#/components/product/product-card'
import { Button } from '#/components/ui/button'
import type { ProductSummary } from '#/lib/schemas/product.schema'
import { cn } from '#/lib/utils'

const SLIDER_AUTOPLAY_INTERVAL_MS = 3500
const SLIDER_CARD_FALLBACK_WIDTH_PX = 200
const SLIDER_CARD_GAP_PX = 12

type ProductSliderProps = {
  items: ReadonlyArray<ProductSummary>
}

export function ProductSlider({ items }: ProductSliderProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  const scrollByCard = useCallback((direction: 1 | -1): void => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const firstChild = scroller.firstElementChild as HTMLElement | null
    const cardWidth = firstChild?.offsetWidth ?? SLIDER_CARD_FALLBACK_WIDTH_PX
    scroller.scrollBy({
      left: direction * (cardWidth + SLIDER_CARD_GAP_PX),
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    if (isInteracting) return
    if (items.length <= 1) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const id = window.setInterval(() => {
      const scroller = scrollerRef.current
      if (!scroller) return
      const reachedEnd =
        scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1
      if (reachedEnd) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }
      scrollByCard(1)
    }, SLIDER_AUTOPLAY_INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [isInteracting, items.length, scrollByCard])

  return (
    <section
      aria-label="Featured products"
      aria-roledescription="carousel"
      className="relative -mx-1 px-1"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
    >
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-semibold text-foreground">
          Featured for you
        </h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Scroll featured left"
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Scroll featured right"
            onClick={() => scrollByCard(1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <ul
        ref={scrollerRef}
        className={cn(
          'flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {items.map((product) => (
          <li key={product.id} className="w-44 shrink-0 snap-start sm:w-52">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '#/components/ui/carousel'
import type { CarouselApi } from '#/components/ui/carousel'
import {
  PLATFORM_DISCOUNT_SLIDER_AUTOPLAY_INTERVAL_MS,
  PLATFORM_DISCOUNT_SLIDER_ITEMS_PER_SLIDE,
} from '#/lib/api/discount.constants'
import type { PlatformDiscount } from '#/lib/schemas/discount.schema'
import { PlatformDiscountCard } from '#/pages/home/platform-discount-card'
import { cn } from '#/lib/utils'

type PlatformDiscountSliderProps = {
  discounts: ReadonlyArray<PlatformDiscount>
  claimedDiscountIds: ReadonlySet<string>
}

export function PlatformDiscountSlider({
  discounts,
  claimedDiscountIds,
}: PlatformDiscountSliderProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)

  const slides = useMemo(
    () => _chunkDiscounts(discounts, PLATFORM_DISCOUNT_SLIDER_ITEMS_PER_SLIDE),
    [discounts],
  )

  const showControls = slides.length > 1

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return
    setActiveIndex(carouselApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!api) return

    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api, onSelect])

  useEffect(() => {
    if (!api) return
    if (isInteracting) return
    if (!showControls) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const id = window.setInterval(() => {
      api.scrollNext()
    }, PLATFORM_DISCOUNT_SLIDER_AUTOPLAY_INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [api, isInteracting, showControls])

  if (slides.length === 0) return null

  return (
    <div
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
    >
      <Carousel
        className="px-10"
        opts={{ align: 'start', loop: showControls }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-3">
          {slides.map((slideItems, slideIndex) => (
            <CarouselItem key={_slideKey(slideItems, slideIndex)} className="pl-3">
              <DiscountSlide
                slideItems={slideItems}
                claimedDiscountIds={claimedDiscountIds}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {showControls ? (
          <>
            <CarouselPrevious
              aria-label="Previous discount slide"
              className="bg-background/95 shadow-sm backdrop-blur-sm"
            />
            <CarouselNext
              aria-label="Next discount slide"
              className="bg-background/95 shadow-sm backdrop-blur-sm"
            />
          </>
        ) : null}
      </Carousel>

      {showControls ? (
        <div
          aria-label="Discount slide pagination"
          className="flex justify-center gap-1.5 pt-3"
          role="tablist"
        >
          {slides.map((slideItems, slideIndex) => (
            <button
              key={_slideKey(slideItems, slideIndex)}
              type="button"
              role="tab"
              aria-label={`Go to discount slide ${slideIndex + 1}`}
              aria-selected={slideIndex === activeIndex}
              className={cn(
                'size-2 rounded-full transition-colors',
                slideIndex === activeIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
              )}
              onClick={() => api?.scrollTo(slideIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

type DiscountSlideProps = {
  slideItems: ReadonlyArray<PlatformDiscount>
  claimedDiscountIds: ReadonlySet<string>
}

function DiscountSlide({
  slideItems,
  claimedDiscountIds,
}: DiscountSlideProps): ReactNode {
  return (
    <ul className="grid auto-rows-fr grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slideItems.map((discount) => (
        <li key={discount.id} className="h-full min-h-0">
          <PlatformDiscountCard
            discount={discount}
            isClaimed={claimedDiscountIds.has(discount.id)}
          />
        </li>
      ))}
    </ul>
  )
}

function _chunkDiscounts(
  items: ReadonlyArray<PlatformDiscount>,
  size: number,
): PlatformDiscount[][] {
  if (size < 1) return []
  const chunks: PlatformDiscount[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

function _slideKey(
  slideItems: ReadonlyArray<PlatformDiscount>,
  slideIndex: number,
): string {
  return slideItems.map((item) => item.id).join('-') || String(slideIndex)
}

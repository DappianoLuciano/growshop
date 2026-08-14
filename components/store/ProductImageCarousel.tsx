'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImage {
  url: string
  alt: string | null
}

interface ProductImageCarouselProps {
  images: ProductImage[]
  productName: string
  compact?: boolean
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export default function ProductImageCarousel({
  images,
  productName,
  compact = false,
  currentIndex: externalIndex,
  onIndexChange
}: ProductImageCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0)

  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex

  const updateIndex = (indexOrUpdater: number | ((prev: number) => number)) => {
    if (onIndexChange) {
      const newIndex = typeof indexOrUpdater === 'function'
        ? indexOrUpdater(currentIndex)
        : indexOrUpdater
      onIndexChange(newIndex)
    } else {
      setInternalIndex(indexOrUpdater as any)
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs bg-gray-800">
        Sin imagen
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <Image
        src={images[0].url}
        alt={images[0].alt || productName}
        fill
        className="object-cover"
      />
    )
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateIndex(index)
  }

  return (
    <div className="relative w-full h-full group">
      {/* Imagen actual */}
      <Image
        src={images[currentIndex].url}
        alt={images[currentIndex].alt || productName}
        fill
        className="object-cover"
      />

      {/* Controles de navegación */}
      {!compact && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots para modo compacto */}
      {compact && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-green-500 w-4'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

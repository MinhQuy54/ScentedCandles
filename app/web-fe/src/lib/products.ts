import type { Product, ProductImage } from '../api/types'

export function formatPrice(price: string | number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(price))
}

export function getSortedImages(images?: ProductImage[]): ProductImage[] {
  if (!images || images.length === 0) return []
  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function primaryImage(product: Product) {
  const images = getSortedImages(product.images)
  const img = images.find((i) => i.isPrimary) ?? images[0]
  return img?.url ?? 'https://placehold.co/600x600?text=AuraScent'
}

export function secondaryImage(product: Product): string | null {
  const images = getSortedImages(product.images)
  if (images.length <= 1) return null
  const primary = images.find((i) => i.isPrimary) ?? images[0]
  const secondary = images.find((i) => i !== primary) ?? images[1]
  return secondary?.url ?? null
}

export function discountPercent(product: Product): number | null {
  const price = Number(product.price)
  const compare = Number(product.compareAtPrice)
  if (!compare || compare <= price) return null
  return Math.round(((compare - price) / compare) * 100)
}
import type { Product } from '../api/types'

export function formatPrice(price: string | number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(price))
}

export function primaryImage(product: Product) {
  const img =
    product.images?.find((i) => i.isPrimary) ?? product.images?.[0]
  return img?.url ?? 'https://placehold.co/600x600?text=AuraScent'
}

export function secondaryImage(product: Product): string | null {
  if (!product.images || product.images.length <= 1) return null
  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0]
  const secondary = product.images.find((i) => i !== primary) ?? product.images[1]
  return secondary?.url ?? null
}

export function discountPercent(product: Product): number | null {
  const price = Number(product.price)
  const compare = Number(product.compareAtPrice)
  if (!compare || compare <= price) return null
  return Math.round(((compare - price) / compare) * 100)
}
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct } from '../api/products'
import type { Product } from '../api/types'
import { formatPrice, primaryImage } from '../lib/products'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setError(null)
        const res = await fetchProduct(id)
        setProduct(res.data)
      } catch {
        setError('Không tìm thấy sản phẩm')
        setProduct(null)
      }
    }

    void load()
  }, [id])

  if (error) return <p>{error}</p>
  if (!product) return <p>Đang tải...</p>

  return (
    <article>
      <Link to="/">← Catalog</Link>
      <img src={primaryImage(product)} alt={product.name} />
      <h1>{product.name}</h1>
      <p>{formatPrice(product.price)}</p>
      <p>{product.rawDescription}</p>
    </article>
  )
}
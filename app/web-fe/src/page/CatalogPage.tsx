import { useEffect, useState } from 'react'
import type { Product } from '../api/types'
import { fetchProducts } from '../api/products'
import { ProductCard } from '../components/ProductCard'

export function CatalogPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetchProducts({ page: 1 })
        setItems(res.data.data)
      } catch {
        setError('LOAD_PRODUCT_FAILED')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  if (loading) return <p className="container py-5">Loading....</p>

  if (error) return <p className="container py-5">{error}</p>

  if (items.length === 0) {
    return <p className="container py-5">There are no products yet</p>
  }

  return (
    <section className="container py-5">
      <h3 className="mb-4 text-center">Nến Thơm</h3>
      <div className="row g-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {/* <h3 className="mb-4 text-center">Tự hào là đối tác sản xuất quà tặng cho các doanh nghiệp</h3> */}
    </section>
  )
}

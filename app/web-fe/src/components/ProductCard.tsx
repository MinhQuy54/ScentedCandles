import { Link } from 'react-router-dom'
import type { Product } from '../api/types'
import { discountPercent, formatPrice, primaryImage } from '../lib/products'

export function ProductCard({ product }: { product: Product }) {
  const percent = discountPercent(product)
  const onSale = percent !== null

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-12">
      <Link
        to={`/products/${product.id}`}
        className="text-decoration-none text-dark"
      >
        <div
          className="card product-card p-4 h-100 border-0"
          style={{ borderRadius: '24px', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body d-flex flex-column align-items-center text-center">
            {onSale && (
              <span className="badge bg-danger mb-2">-{percent}%</span>
            )}
            <div
              style={{ height: '300px', width: '100%' }}
              className="d-flex align-items-center justify-content-center "
            >
              <img
                src={primaryImage(product)}
                className="img-fluid"
                style={{
                  maxWidth: '250px',
                  maxHeight: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                }}
                alt={product.name}
              />
            </div>
            {product.shortDescription && (
              <p className="text-muted small mb-3"> {product.name} - {product.shortDescription}</p>
            )}
            <p className="card-text fw-semibold" style={{ fontSize: '1.1rem' }}>
              {formatPrice(product.price)}
            </p>
            {onSale && product.compareAtPrice && (
              <p className="text-muted small">
                <s>{formatPrice(product.compareAtPrice)}</s>
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

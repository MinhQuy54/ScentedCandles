import { Link } from 'react-router-dom'
import type { Product } from '../api/types'
import { discountPercent, formatPrice, primaryImage, secondaryImage } from '../lib/products'

export function ProductCard({ product }: { product: Product }) {
  const percent = discountPercent(product)
  const onSale = percent !== null
  const primaryImg = primaryImage(product)
  const secondaryImg = secondaryImage(product)

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-12">
      <Link
        to={`/products/${product.id}`}
        className="text-decoration-none text-dark"
      >
        <div
          className="card product-card p-3 h-100 border-0"
          style={{ borderRadius: '0px', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body p-2 d-flex flex-column align-items-center text-center">
            {onSale && (
              <span className="badge bg-danger mb-2">-{percent}%</span>
            )}
            <div
              className="product-image-wrap position-relative d-flex align-items-center justify-content-center overflow-hidden mb-3"
            >
              <img
                src={primaryImg}
                className={`img-fluid product-img product-img-primary ${secondaryImg ? 'has-hover' : ''}`}
                alt={product.name}
              />
              {secondaryImg && (
                <img
                  src={secondaryImg}
                  className="img-fluid product-img product-img-secondary"
                  alt={`${product.name} - 2`}
                />
              )}
            </div>
            {product.shortDescription && (
              <p className="text-muted small mb-3"> {product.name}</p>
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

import { Link } from 'react-router-dom'
import { useClickOutsideClose } from './useClickOutsideClose'
import { useCart } from '../../context/CartContext'
import { formatPrice, getImageUrl } from '../../lib/products'

type NavCartProps = {
  open: boolean
  onToggle: () => void
  onClose: () => void
  count?: number
}

export function NavCart({ open, onToggle, onClose, count = 0 }: NavCartProps) {
  const rootRef = useClickOutsideClose(open, onClose)
  const { items, totalPrice, removeFromCart } = useCart()
  const displayCount = count > 99 ? '99+' : String(count)

  return (
    <div className="nav-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className="nav-icon cart-icon border-0 bg-transparent p-0"
        aria-label="Giỏ hàng"
        aria-expanded={open}
        onClick={onToggle}
      >
        <i className="bi bi-bag" aria-hidden />
        <span className="cart-number">
          <span className="cart-number-black">{displayCount}</span>
          <span className="cart-number-red">{displayCount}</span>
        </span>
      </button>

      <div
        className={`nav-popover nav-popover--cart${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="nav-popover-title">GIỎ HÀNG</div>

        {items.length === 0 ? (
          <p className="nav-cart-empty">Giỏ hàng của bạn đang trống</p>
        ) : (
          <div className="nav-cart-body" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item.productId} className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                <img
                  src={getImageUrl(item.product.primaryImage)}
                  alt={item.product.name}
                  style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1 overflow-hidden" style={{ fontSize: '13px' }}>
                  <div className="text-truncate fw-medium text-dark">{item.product.name}</div>
                  <div className="text-muted">
                    {item.quantity} x <span className="text-danger fw-semibold">{formatPrice(item.product.price)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none fs-5"
                  onClick={() => removeFromCart(item.productId)}
                >
                  &times;
                </button>
              </div>
            ))}
            <div className="d-flex justify-content-between my-2 fw-bold small">
              <span>Tổng cộng:</span>
              <span className="text-danger">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        <div className="nav-cart-actions mt-3">
          <Link
            to="/cart"
            className="nav-cart-btn nav-cart-btn--outline"
            onClick={onClose}
          >
            Xem giỏ hàng
          </Link>
          <Link
            to="/checkout"
            className="nav-cart-btn nav-cart-btn--primary"
            onClick={onClose}
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  )
}

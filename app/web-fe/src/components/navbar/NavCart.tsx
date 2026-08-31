import { Link } from 'react-router-dom'
import { useClickOutsideClose } from './useClickOutsideClose'

type NavCartProps = {
  open: boolean
  onToggle: () => void
  onClose: () => void
  count?: number
}

export function NavCart({ open, onToggle, onClose, count = 0 }: NavCartProps) {
  const rootRef = useClickOutsideClose(open, onClose)
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

        {count === 0 ? (
          <p className="nav-cart-empty">Giỏ hàng của bạn đang trống</p>
        ) : (
          <p className="nav-cart-empty">
            Bạn có {count} sản phẩm trong giỏ
          </p>
        )}

        <div className="nav-cart-actions">
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

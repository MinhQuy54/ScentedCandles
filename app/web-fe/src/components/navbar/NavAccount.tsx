import { Link } from 'react-router-dom'
import { useClickOutsideClose } from './useClickOutsideClose'

type NavAccountProps = {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function NavAccount({ open, onToggle, onClose }: NavAccountProps) {
  const rootRef = useClickOutsideClose(open, onClose)

  return (
    <div className="nav-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className="nav-icon border-0 bg-transparent p-0"
        aria-label="Tài khoản"
        aria-expanded={open}
        onClick={onToggle}
      >
        <i className="bi bi-person-circle" aria-hidden />
      </button>

      <div
        className={`nav-popover nav-popover--account${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="nav-popover-title">TÀI KHOẢN</div>
        <ul className="list-unstyled nav-popover-menu mb-0">
          <li>
            <Link to="/login" onClick={onClose}>
              Đăng nhập
            </Link>
          </li>
          <li>
            <Link to="/register" onClick={onClose}>
              Đăng ký
            </Link>
          </li>
          <li>
            <Link to="/account" onClick={onClose}>
              Tài khoản của tôi
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import { notification } from 'antd'
import { useAuth } from '../context/AuthContext'

export function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  function handleLogout() {
    logout()
    notification.success({
      message: 'Đã đăng xuất',
      description: 'Hẹn gặp lại bạn tại AuraScent!',
      placement: 'topRight',
      duration: 3,
    })
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span>Tài khoản</span>
        </div>
      </div>

      <div className="container py-5">
        <div className="account-card">
          <h1 className="auth-heading">Tài khoản của tôi</h1>
          <p className="auth-lead">Xin chào, {user.fullName}</p>

          <dl className="account-dl">
            <div className="account-dl-row">
              <dt>Họ tên</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div className="account-dl-row">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="account-dl-row">
              <dt>Vai trò</dt>
              <dd>{user.role ?? 'CUSTOMER'}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="btn auth-submit w-100"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

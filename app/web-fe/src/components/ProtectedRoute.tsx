import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { notification } from 'antd'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      notification.warning({
        key: 'auth-login-required',
        message: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập tài khoản để tiếp tục.',
        placement: 'topRight',
        duration: 4,
      })
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        Đang tải…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

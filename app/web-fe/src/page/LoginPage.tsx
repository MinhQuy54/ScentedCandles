import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { notification } from 'antd'
import { login, saveAuthTokens } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { PasswordInput } from '../components/PasswordInput'

type LocationState = {
  email?: string
  from?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const state = location.state as LocationState | null
  const prefillEmail = state?.email ?? ''

  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await login(email.trim(), password)
      saveAuthTokens(res.data.accessToken, res.data.refreshToken)
      setUser(res.data.user)
      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Chào mừng bạn đến với AuraScent!',
        placement: 'topRight',
        duration: 3,
      })
      navigate(state?.from ?? '/')
    } catch {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: 'Hãy kiểm tra lại thông tin đăng nhập.',
        placement: 'topRight',
        duration: 3,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span>Đăng nhập</span>
        </div>
      </div>

      <div className="container py-5">
        <div className="auth-card">
          <h1 className="auth-heading">Đăng nhập</h1>
          <p className="auth-lead">Chào mừng bạn quay lại AuraScent.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label auth-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control auth-input"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="login-password" className="form-label auth-label">
                Mật khẩu
              </label>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                required
                disabled={loading}
              />
            </div>

            <div className="auth-forgot mb-4">
              <Link to="/forgot-password" className="auth-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="btn auth-submit w-100"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-footer-text mt-4 mb-0">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-link">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

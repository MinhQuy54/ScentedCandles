import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { notification } from 'antd'
import { forgotPassword } from '../api/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      notification.success({
        message: 'Yêu cầu đã gửi',
        description: 'Nếu email tồn tại, hướng dẫn đã được gửi.',
        placement: 'topRight',
        duration: 3,
      })
    } catch {
      notification.error({
        message: 'Gửi yêu cầu thất bại',
        description: 'Vui lòng thử lại sau.',
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
          <Link to="/login">Đăng nhập</Link>
          <span className="mx-1">/</span>
          <span>Quên mật khẩu</span>
        </div>
      </div>

      <div className="container py-5">
        <div className="auth-card">
          <h1 className="auth-heading">Quên mật khẩu</h1>
          <p className="auth-lead">
            Nhập email đã đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="forgot-email" className="form-label auth-label">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-control auth-input"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn auth-submit w-100"
              disabled={loading}
            >
              {loading ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </button>
          </form>

          <p className="auth-footer-text mt-4 mb-0">
            <Link to="/login" className="auth-link">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

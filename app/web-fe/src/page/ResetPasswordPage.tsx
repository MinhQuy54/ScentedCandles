import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { notification } from 'antd'
import { resetPassword } from '../api/auth'
import { PasswordInput } from '../components/PasswordInput'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      notification.error({
        message: 'Đặt lại mật khẩu thất bại',
        description: 'Mật khẩu xác nhận không khớp.',
        placement: 'topRight',
        duration: 3,
      })
      return
    }

    if (newPassword.length < 8) {
      notification.error({
        message: 'Đặt lại mật khẩu thất bại',
        description: 'Mật khẩu tối thiểu 8 ký tự.',
        placement: 'topRight',
        duration: 3,
      })
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      })
      notification.success({
        message: 'Đặt lại mật khẩu thành công',
        description: 'Vui lòng đăng nhập với mật khẩu mới.',
        placement: 'topRight',
        duration: 3,
      })
      navigate('/login')
    } catch {
      notification.error({
        message: 'Đặt lại mật khẩu thất bại',
        description: 'Link không hợp lệ hoặc đã hết hạn.',
        placement: 'topRight',
        duration: 3,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="container py-5">
          <div className="auth-card">
            <h1 className="auth-heading">Link không hợp lệ</h1>
            <p className="auth-lead">
              Liên kết đặt lại mật khẩu thiếu hoặc không đúng. Vui lòng yêu cầu
              link mới.
            </p>
            <Link to="/forgot-password" className="auth-link">
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <Link to="/login">Đăng nhập</Link>
          <span className="mx-1">/</span>
          <span>Đặt lại mật khẩu</span>
        </div>
      </div>

      <div className="container py-5">
        <div className="auth-card">
          <h1 className="auth-heading">Đặt lại mật khẩu</h1>
          <p className="auth-lead">Nhập mật khẩu mới cho tài khoản của bạn.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label
                htmlFor="reset-password"
                className="form-label auth-label"
              >
                Mật khẩu mới
              </label>
              <PasswordInput
                id="reset-password"
                autoComplete="new-password"
                value={newPassword}
                onChange={setNewPassword}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="reset-confirm"
                className="form-label auth-label"
              >
                Xác nhận mật khẩu
              </label>
              <PasswordInput
                id="reset-confirm"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn auth-submit w-100"
              disabled={loading}
            >
              {loading ? 'Đang cập nhật…' : 'Đặt lại mật khẩu'}
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

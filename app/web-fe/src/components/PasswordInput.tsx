import { useState } from 'react'

type PasswordInputProps = {
  id: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  disabled?: boolean
  required?: boolean
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  disabled,
  required,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="form-control auth-input"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      />
      <button
        type="button"
        className="auth-password-toggle"
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        tabIndex={-1}
      >
        <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden />
      </button>
    </div>
  )
}

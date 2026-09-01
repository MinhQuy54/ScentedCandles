import { notification } from "antd";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { PasswordInput } from "../components/PasswordInput";

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      notification.error({
        message: "Đăng ký thất bại",
        description: "Mật khẩu xác nhận không khớp.",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (password.length < 8) {
      notification.error({
        message: "Đăng ký thất bại",
        description: "Mật khẩu tối thiểu 8 ký tự.",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        confirmPassword,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      notification.success({
        message: "Đăng ký thành công",
        description: "Vui lòng đăng nhập để tiếp tục.",
        placement: "topRight",
        duration: 3,
      });
      navigate("/login", { state: { email: email.trim() } });
    } catch {
      notification.error({
        message: "Đăng ký thất bại",
        description: "Email có thể đã tồn tại hoặc thông tin chưa hợp lệ.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span>Đăng ký</span>
        </div>
      </div>

      <div className="container py-5">
        <div className="auth-card">
          <h1 className="auth-heading">Đăng ký</h1>
          <p className="auth-lead">Chào mừng bạn đến với AuraScent.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label
                htmlFor="register-fullName"
                className="form-label auth-label"
              >
                Họ tên
              </label>
              <input
                id="register-fullName"
                type="text"
                className="form-control auth-input"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="register-email" className="form-label auth-label">
                Email
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-phone" className="form-label auth-label">
                Số điện thoại
              </label>
              <input
                id="register-phone"
                type="tel"
                className="form-control auth-input"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="register-password"
                className="form-label auth-label"
              >
                Mật khẩu
              </label>
              <PasswordInput
                id="register-password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="register-confirm"
                className="form-label auth-label"
              >
                Xác nhận mật khẩu
              </label>
              <PasswordInput
                id="register-confirm"
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
              {loading ? "Đang đăng ký…" : "Đăng ký"}
            </button>
          </form>

          <p className="auth-footer-text mt-4 mb-0">
            Đã có tài khoản?{" "}
            <Link to="/login" className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

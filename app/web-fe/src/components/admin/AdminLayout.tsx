import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { notification } from "antd";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo2 from "../../assets/logo2.png";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/admin/products",
    label: "Sản phẩm",
    icon: "bi-box-seam",
  },
  {
    to: "/admin/categories",
    label: "Danh mục",
    icon: "bi-tags",
  },
  {
    to: "/admin/orders",
    label: "Đơn hàng",
    icon: "bi-bag-check",
  },
  {
    to: "/admin/inventory",
    label: "Tồn kho",
    icon: "bi-boxes"
  },
  {
    to: "/admin/images",
    label: "Ảnh sản phẩm",
    icon: "bi-images"
  },
  {
    to: "/admin/users",
    label: "Nguòi dùng",
    icon: "bi-people"
  },

] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    notification.success({
      message: "Đã đăng xuất",
      placement: "topRight",
      duration: 3,
    });
    navigate("/");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  // Get user initials for avatar
  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "AD";

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-layout-backdrop"
          aria-label="Đóng menu"
          onClick={closeSidebar}
        />
      )}

      <aside className={`admin-layout-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-layout-brand">
          <Link to="/admin/products" onClick={closeSidebar} className="d-flex align-items-center gap-2 text-decoration-none">
            <img src={logo2} alt="AuraScent Admin" />
          </Link>
          <span className="admin-layout-brand-badge">ADMIN</span>
        </div>

        <nav className="admin-layout-nav">
          <p className="admin-layout-nav-title">Hệ thống Quản lý</p>
          <ul className="list-unstyled mb-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to} className="mb-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `admin-layout-nav-link${isActive ? " is-active" : ""}`
                  }
                  onClick={closeSidebar}
                >
                  <i className={`bi ${item.icon}`} aria-hidden />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-layout-sidebar-footer">
          <Link
            to="/"
            className="admin-layout-nav-link"
            onClick={closeSidebar}
          >
            <i className="bi bi-shop" aria-hidden />
            <span>Về trang bán hàng</span>
          </Link>
        </div>
      </aside>

      <div className="admin-layout-main">
        <header className="admin-layout-topbar">
          <button
            type="button"
            className="admin-layout-menu-btn d-lg-none"
            aria-label="Mở menu"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list" aria-hidden />
          </button>

          <div className="d-none d-md-flex align-items-center gap-2">
            <i className="bi bi-shield-lock text-warning fs-5"></i>
            <span className="admin-topbar-title">Bảng quản trị AuraScent</span>
          </div>

          <div className="admin-layout-topbar-spacer" />

          <div className="d-flex align-items-center gap-3">
            <div className="admin-user-avatar">{initials}</div>
            <div className="admin-layout-topbar-user">
              <span className="admin-layout-user-name">{user?.fullName || "Admin"}</span>
              <span className="admin-layout-user-role">QUẢN TRỊ VIÊN</span>
            </div>

            <button
              type="button"
              className="admin-btn-logout ms-2"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


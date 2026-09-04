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

      <aside
        className={`admin-layout-sidebar${sidebarOpen ? " is-open" : ""}`}
      >
        <div className="admin-layout-brand">
          <Link to="/admin/products" onClick={closeSidebar}>
            <img src={logo2} alt="AuraScent Admin" />
          </Link>
          <span className="admin-layout-brand-badge">Admin</span>
        </div>

        <nav className="admin-layout-nav">
          <p className="admin-layout-nav-title">Quản lý</p>
          <ul className="list-unstyled mb-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `admin-layout-nav-link${isActive ? " is-active" : ""}`
                  }
                  onClick={closeSidebar}
                >
                  <i className={`bi ${item.icon}`} aria-hidden />
                  {item.label}
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
            Về cửa hàng
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

          <div className="admin-layout-topbar-spacer" />

          <div className="admin-layout-topbar-user">
            <span className="admin-layout-user-name">{user?.fullName}</span>
            <span className="admin-layout-user-role">ADMIN</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary admin-layout-logout-btn"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </header>

        <div className="admin-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import logo2 from "../assets/logo2.png";
import { NavSearch } from "./navbar/NavSearch";
import { NavAccount } from "./navbar/NavAccount";
import { NavCart } from "./navbar/NavCart";
import { fetchCategories } from "../api/categories";
import type { ProductCategory } from "../api/types";
import { useCart } from "../context/CartContext";

type Panel = "search" | "account" | "cart" | null;

export function Navbar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const [panel, setPanel] = useState<Panel>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const lastScrollY = useRef(0);

  const {
    totalItems,
    isCartOpen,
    closeCart,
    toggleCart,
  } = useCart();

  const activeCategoryId = searchParams.get("categoryId");
  const isHome = pathname === "/";

  const close = useCallback(() => {
    setPanel(null);
    closeCart();
  }, [closeCart]);

  const togglePanel = (next: "search" | "account") => {
    closeCart();
    setPanel((cur) => (cur === next ? null : next));
  };

  const handleToggleCart = () => {
    setPanel(null);
    toggleCart();
  };

  // Load categories
  useEffect(() => {
    void fetchCategories()
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Hide header when scrolling down
  // Show header when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Luôn hiện header khi ở gần đầu trang
      if (currentScrollY <= 10) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scroll xuống -> ẩn
      if (currentScrollY > lastScrollY.current) {
        setIsHeaderVisible(false);
      }

      // Scroll lên -> hiện
      else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`site-header ${isHeaderVisible
        ? "site-header-visible"
        : "site-header-hidden"
        }`}
    >
      {/* Promotion bar */}
      <div
        className="text-white text-center py-1 small"
        style={{
          background: "#a8383a",
          fontSize: "14px",
        }}
      >
        Miễn phí vận chuyển với đơn hàng trên 990.000đ
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom site-navbar">
        <div className="container align-items-center">
          {/* Logo */}
          <Link
            className="navbar-brand d-flex align-items-center"
            to="/"
            onClick={close}
          >
            <img
              src={logo2}
              alt="AuraScent"
            />
          </Link>

          {/* Navigation */}
          <div className="d-none d-lg-flex align-self-stretch align-items-stretch gap-4 mx-auto">
            {/* Tất cả */}
            <Link
              to="/"
              className={`nav-link${isHome && !activeCategoryId
                ? " active"
                : ""
                }`}
              onClick={close}
            >
              Tất cả
            </Link>

            {/* Categories */}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/?categoryId=${cat.id}`}
                className={`nav-link${activeCategoryId === cat.id
                  ? " active"
                  : ""
                  }`}
                onClick={close}
              >
                {cat.name}
              </Link>
            ))}

            {/* About */}
            <Link
              to="/about"
              className={`nav-link${pathname === "/about"
                ? " active"
                : ""
                }`}
              onClick={close}
            >
              Giới thiệu
            </Link>
          </div>

          {/* Right actions */}
          <div className="d-flex gap-3 align-items-center">
            <NavSearch
              open={panel === "search"}
              onToggle={() => togglePanel("search")}
              onClose={close}
            />

            <NavAccount
              open={panel === "account"}
              onToggle={() => togglePanel("account")}
              onClose={close}
            />

            <NavCart
              open={isCartOpen}
              onToggle={handleToggleCart}
              onClose={closeCart}
              count={totalItems}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo2 from "../assets/logo2.png";
import { NavSearch } from "./navbar/NavSearch";
import { NavAccount } from "./navbar/NavAccount";
import { NavCart } from "./navbar/NavCart";
import { fetchCategories } from "../api/categories";
import type { ProductCategory } from "../api/types";

type Panel = "search" | "account" | "cart" | null;

export function Navbar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [panel, setPanel] = useState<Panel>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const activeCategoryId = searchParams.get("categoryId");
  const isHome = pathname === "/";

  const close = useCallback(() => setPanel(null), []);
  const toggle = (next: Panel) => {
    setPanel((cur) => (cur === next ? null : next));
  };

  useEffect(() => {
    void fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <div
        className="text-white text-center py-1 small"
        style={{ background: "#a8383a", fontSize: "14px" }}
      >
        Miễn phí vận chuyển với đơn hàng trên 990.000đ
      </div>
      <nav className="navbar navbar-expand-lg bg-white border-bottom site-navbar">
        <div className="container align-items-center">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo2} alt="AuraScent" />
          </Link>
          <div className="d-none d-lg-flex align-self-stretch align-items-stretch gap-4 mx-auto">
            <Link
              to="/"
              className={`nav-link${isHome && !activeCategoryId ? " active" : ""}`}
              onClick={close}
            >
              Tất cả
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/?categoryId=${cat.id}`}
                className={`nav-link${activeCategoryId === cat.id ? " active" : ""}`}
                onClick={close}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/about"
              className={`nav-link${pathname === "/about" ? " active" : ""}`}
              onClick={close}
            >
              Giới thiệu
            </Link>
          </div>
          <div className="d-flex gap-3 align-items-center">
            <NavSearch
              open={panel === "search"}
              onToggle={() => toggle("search")}
              onClose={close}
            />
            <NavAccount
              open={panel === "account"}
              onToggle={() => toggle("account")}
              onClose={close}
            />
            <NavCart
              open={panel === "cart"}
              onToggle={() => toggle("cart")}
              onClose={close}
              count={0}
            />
          </div>
        </div>
      </nav>
    </>
  );
}

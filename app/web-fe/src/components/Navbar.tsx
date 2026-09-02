import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo2 from "../assets/logo2.png";
import { NavSearch } from "./navbar/NavSearch";
import { NavAccount } from "./navbar/NavAccount";
import { NavCart } from "./navbar/NavCart";

const navLinks = [
  { to: "/", label: "Nến thơm" },
  { to: "/", label: "Tinh dầu" },
  { to: "/", label: "Set quà" },
  { to: "/", label: "Set quà 2 nến" },
  { to: "/", label: 'Phiên bản "mini"' },
  { to: "/", label: "Phụ kiện" },
  { to: "/about", label: "Giới thiệu" },
];

type Panel = "search" | "account" | "cart" | null;

export function Navbar() {
  const { pathname } = useLocation(); // lấy url hiện tại
  const [panel, setPanel] = useState<Panel>(null); // trạng thái của panel

  const close = useCallback(() => setPanel(null), []);
  const toggle = (next: Panel) => {
    setPanel((cur) => (cur === next ? null : next));
  };

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
            {navLinks.map((item) => (
              <Link
                key={item.label}
                className={`nav-link${pathname === item.to && item.to !== "/" ? " active" : ""}`}
                to={item.to}
                onClick={close}
              >
                {item.label}
              </Link>
            ))}
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

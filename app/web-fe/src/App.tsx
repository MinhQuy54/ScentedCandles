import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import logo2 from './assets/logo2.png'
import { CatalogPage } from './page/CatalogPage'
import { ProductPage } from './page/ProductPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="text-white text-center py-1 small" style={{ background: '#a8383a', fontSize: '14px' }}>
        Miễn phí vận chuyển với đơn hàng trên 990.000đ
      </div>
      <nav className="navbar navbar-expand-lg bg-white border-bottom site-navbar">
        <div className="container align-items-center">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo2} alt="AuraScent" />
          </Link>
          <div className="d-none d-lg-flex align-self-stretch align-items-stretch gap-4 mx-auto">
            <Link className="nav-link" to="/">Nến thơm</Link>
            <Link className="nav-link" to="/">Tinh dầu</Link>
            <Link className="nav-link" to="/">Set quà</Link>
            <Link className="nav-link" to="/">Set quà 2  nến</Link>
            <Link className="nav-link" to="/">Set quà 3 nến </Link>
            <Link className="nav-link" to="/">Phiên bản "mini"</Link>
            <Link className="nav-link" to="/">Phụ kiện</Link>
            <Link className="nav-link" to="/">Giới thiệu</Link>
          </div>
          <div className="d-flex gap-3 align-items-center">
            <span>0</span>
          </div>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { PublicLayout } from "./components/PublicLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { CatalogPage } from "./page/CatalogPage";
import { ProductPage } from "./page/ProductPage";
import { AboutPage } from "./page/AboutPage";
import { LoginPage } from "./page/LoginPage";
import { AccountPage } from "./page/AccountPage";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { RegisterPage } from "./page/RegisterPage";
import { ForgotPasswordPage } from "./page/ForgotPasswordPage";
import { ResetPasswordPage } from "./page/ResetPasswordPage";
import { CartPage } from "./page/CartPage";
import { CheckoutPage } from "./page/CheckoutPage";
import { OrdersPage } from "./page/OrdersPage";
import { AdminProductsPage } from "./page/admin/AdminProductsPage";
import { AdminProductFormPage } from "./page/admin/AdminProductFormPage";
import { AdminCategoriesPage } from "./page/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "./page/admin/AdminOrdersPage";
import { AdminInventoryPage } from "./page/admin/AdminInventoryPage";
import { AdminProductImagesPage } from "./page/admin/AdminProductImagesPage";
import { AdminUsersPage } from "./page/admin/AdminUserPage";
import { ReturnPolicyPage } from "./page/ReturnPolicyPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { ContactPage } from "./page/ContactPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/return-policy" element={<ReturnPolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="images" element={<AdminProductImagesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

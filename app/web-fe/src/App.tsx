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
import { RegisterPage } from "./page/RegisterPage";
import { ForgotPasswordPage } from "./page/ForgotPasswordPage";
import { ResetPasswordPage } from "./page/ResetPasswordPage";
import { AdminProductsPage } from "./page/admin/AdminProductsPage";
import { AdminProductFormPage } from "./page/admin/AdminProductFormPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/about" element={<AboutPage />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

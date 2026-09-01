import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CatalogPage } from "./page/CatalogPage";
import { ProductPage } from "./page/ProductPage";
import { AboutPage } from "./page/AboutPage";
import { LoginPage } from "./page/LoginPage";
import { AccountPage } from "./page/AccountPage";
import { AuthProvider } from "./context/AuthContext";
import { RegisterPage } from "./page/RegisterPage";
import { ForgotPasswordPage } from "./page/ForgotPasswordPage";
import { ResetPasswordPage } from "./page/ResetPasswordPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
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
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

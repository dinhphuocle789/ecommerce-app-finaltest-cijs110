import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShops from './pages/admin/AdminShops';
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopRegister from './pages/shop/ShopRegister';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Shop />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/shop/register" element={<ShopRegister />} />
                <Route
                  path="/cart"
                  element={<ProtectedRoute><Cart /></ProtectedRoute>}
                />
                <Route
                  path="/shop/dashboard"
                  element={<ProtectedRoute shopOnly><ShopDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/admin/products"
                  element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>}
                />
                <Route
                  path="/admin/users"
                  element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>}
                />
                <Route
                  path="/admin/shops"
                  element={<ProtectedRoute adminOnly><AdminShops /></ProtectedRoute>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
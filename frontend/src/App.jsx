import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import MedicineDetail from './pages/public/MedicineDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Customer Pages
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

// Admin Pages
import MedicineList from './pages/admin/MedicineList';
import MedicineForm from './pages/admin/MedicineForm';
import AllOrders from './pages/admin/AllOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Catalog & Auth Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/medicines/:id" element={<MedicineDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/medicines"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <MedicineList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/medicines/new"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <MedicineForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/medicines/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <MedicineForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AllOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import FavoritesPage from './pages/FavoritesPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCategoryProducts from './pages/admin/AdminCategoryProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminChat from './pages/admin/AdminChat'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminClients from './pages/admin/AdminClients'

export default function App() {
  const fetchUser = useUserStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/categories/:categoryId/products" element={<AdminCategoryProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/clients" element={<AdminClients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

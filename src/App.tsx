
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import CategoriesPage from './pages/admin/CategoriesPage'
import MenuItemsPage from './pages/admin/MenuItemsPage'
import PublicMenuPage from './pages/public/PublicMenuPage'
import QRCodePage from './pages/admin/QRCodePage'
import SettingsPage from './pages/admin/SettingsPage'


import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'

import { Toaster } from 'sonner'

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        This module is coming soon.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />

        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/menu/:slug" element={<PublicMenuPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route
                path="dashboard"
                element={<DashboardPage />}
              />

             <Route path="categories" element={<CategoriesPage />} />

             <Route path="menu-items" element={<MenuItemsPage />} />
             <Route path="qr-code" element={<QRCodePage />} />
             <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

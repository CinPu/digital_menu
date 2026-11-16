
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/layout/AdminSidebar'
import AdminHeader from '../components/layout/AdminHeader'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

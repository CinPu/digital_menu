
import { LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

export default function AdminHeader() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch {
      toast.error('Unable to logout')
    }
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
      <div>
        <h2 className="font-semibold text-slate-900">
          Admin Panel
        </h2>
        <p className="text-xs text-slate-400">
          Manage your restaurant
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle size={22} className="text-slate-500" />
          <span className="max-w-40 truncate text-sm text-slate-600">
            {user?.email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

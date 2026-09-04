import { useState } from 'react'
import { Menu, LogOut, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.fullName || user?.username || user?.email || 'Account'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-100 focus-ring"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initial}
          </div>
          <span className="hidden text-sm font-medium text-ink-700 sm:block">{displayName}</span>
          <ChevronDown size={15} className="text-ink-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-ink-100 bg-white py-1.5 shadow-lg">
              <div className="border-b border-ink-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-ink-800">{displayName}</p>
                {user?.email && <p className="truncate text-xs text-ink-400">{user.email}</p>}
              </div>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-600 hover:bg-ink-50"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} /> Profile
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

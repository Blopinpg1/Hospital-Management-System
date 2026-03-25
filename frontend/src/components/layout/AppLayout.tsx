import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, BedDouble, FlaskConical,
  Receipt, Package, Stethoscope, Building2, LogOut, ChevronRight,
  Cross, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import ToastContainer from '@/components/shared/ToastContainer';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admissions', label: 'Admissions', icon: BedDouble },
  { to: '/clinical', label: 'Clinical', icon: FlaskConical },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/departments', label: 'Departments', icon: Building2 },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FF]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-on-surface/20 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative z-40 inset-y-0 left-0 flex flex-col bg-[#F0F4F8] w-60 shrink-0 transition-transform duration-300',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#C0C8BB]/20">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#006B58,#00A68A)'}}>
            <Cross className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-sans font-semibold text-sm text-[#1A2332]">Himalaya</p>
            <p className="text-xs text-[#4A5568]">PlusCare HMS</p>
          </div>
          <button className="ml-auto lg:hidden text-[#4A5568]" onClick={() => setMobileOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'nav-item group',
                isActive && 'nav-item-active'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-[#C0C8BB]/20">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-[#006B58]/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[#006B58]">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1A2332] truncate">{user?.email}</p>
              <p className="text-xs text-[#4A5568] capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#4A5568] hover:text-[#BA1A1A] transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#F0F4F8] border-b border-[#C0C8BB]/20 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-[#4A5568]">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-sans font-semibold text-sm text-[#1A2332]">Himalaya HMS</span>
        </div>

        <div className="p-5 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}

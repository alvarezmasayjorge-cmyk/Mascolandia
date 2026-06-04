import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, Calendar, DollarSign, Settings, LogOut, Menu, X } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
};

function SidebarContent({ user, navItems, onClose, onLogout }) {
  return (
    <>
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <img src="/logo.webp" alt="Mascolandia" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-display font-bold text-brand-600 leading-tight">Mascolandia</h1>
            <p className="text-[10px] text-ink-300 uppercase tracking-wider">Consultorio Veterinario</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium relative ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-500 hover:bg-surface-sunken hover:text-ink-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-600 rounded-r-full" />}
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 font-semibold uppercase">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left text-ink-500 hover:bg-danger-50 hover:text-danger-500 rounded-lg transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/pacientes', icon: Users, label: 'Pacientes' },
    { to: '/inventario', icon: Package, label: 'Inventario' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/caja', icon: DollarSign, label: 'Caja' });
    navItems.push({ to: '/configuracion', icon: Settings, label: 'Configuracion' });
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-surface font-sans">

      {/* Sidebar desktop — siempre visible en md+ */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col justify-between print:hidden flex-shrink-0">
        <SidebarContent
          user={user}
          navItems={navItems}
          onClose={closeSidebar}
          onLogout={handleLogout}
        />
      </div>

      {/* Drawer móvil — overlay + panel deslizante */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col justify-between z-50 transition-transform duration-300 md:hidden print:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={closeSidebar}
            className="p-2 text-ink-500 hover:bg-surface-sunken rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent
          user={user}
          navItems={navItems}
          onClose={closeSidebar}
          onLogout={handleLogout}
        />
      </div>

      {/* Columna derecha: topbar móvil + contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar móvil */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 print:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-ink-500 hover:bg-surface-sunken rounded-lg"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="Mascolandia" className="h-7 w-7 object-contain" />
            <span className="text-base font-display font-bold text-brand-600">Mascolandia</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto bg-surface p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

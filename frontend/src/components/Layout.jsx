import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, Calendar, DollarSign, Settings, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pacientes', icon: Users, label: 'Pacientes' },
    { to: '/inventario', icon: Package, label: 'Inventario' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/caja', icon: DollarSign, label: 'Caja' });
    navItems.push({ to: '/configuracion', icon: Settings, label: 'Configuración' });
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center justify-center border-b border-gray-100">
            {/* Logo placeholder - The actual logo is in ../../images/Mascolandia.webp */}
            <h1 className="text-2xl font-bold text-primary">Mascolandia</h1>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-primary-light hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <Outlet />
      </div>
    </div>
  );
}

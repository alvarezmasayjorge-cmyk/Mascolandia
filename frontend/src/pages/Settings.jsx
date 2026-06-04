import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, X, UserCheck, UserX, Shield } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user: currentUser } = useAuth();
  const [clinicData, setClinicData] = useState({ name: '', address: '', phone: '', email: '' });
  const [users, setUsers] = useState([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'ASISTENTE' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    api.get('/settings').then(res => {
      const data = res.data.data;
      setClinicData({ name: data.name || '', address: data.address || '', phone: data.phone || '', email: data.email || '' });
    }).catch(() => {});
    api.get('/users').then(res => setUsers(res.data.data || [])).catch(() => {});
  }, []);

  const handleSaveClinic = async () => {
    try {
      await api.put('/settings', clinicData);
      toast.success('Datos actualizados');
    } catch { toast.error('Error al guardar'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newUser);
      const created = res.data.data;
      toast.success(`Usuario creado. Contrasenia temporal: ${created.tempPassword}`, { duration: 15000 });
      setShowNewUser(false);
      setNewUser({ name: '', email: '', role: 'ASISTENTE' });
      api.get('/users').then(res => setUsers(res.data.data || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await api.put(`/users/${userId}/toggle-active`);
      toast.success('Estado actualizado');
      api.get('/users').then(res => setUsers(res.data.data || []));
    } catch { toast.error('Error'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', passwordForm);
      toast.success('Contrasenia actualizada');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar contrasenia');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-display font-bold text-ink-900">Configuracion</h1>

      {/* Datos de la clinica */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Datos de la clinica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-700 mb-1 font-medium">Nombre</label>
            <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={clinicData.name} onChange={e => setClinicData({...clinicData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1 font-medium">Telefono</label>
            <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={clinicData.phone} onChange={e => setClinicData({...clinicData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1 font-medium">Email</label>
            <input type="email" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={clinicData.email} onChange={e => setClinicData({...clinicData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1 font-medium">Direccion</label>
            <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={clinicData.address} onChange={e => setClinicData({...clinicData, address: e.target.value})} />
          </div>
        </div>
        <button onClick={handleSaveClinic} className="bg-brand-600 text-white px-5 py-2.5 rounded-lg hover:bg-brand-700 font-medium transition-colors">Guardar datos</button>
      </div>

      {/* Gestion de usuarios */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Gestion de usuarios</h2>
          <button onClick={() => setShowNewUser(!showNewUser)} className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1">
            <Plus size={16} /> Nuevo usuario
          </button>
        </div>

        {showNewUser && (
          <form onSubmit={handleCreateUser} className="bg-surface-sunken p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input required type="text" placeholder="Nombre" className="border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <select className="border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="ASISTENTE">Asistente</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Crear usuario</button>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {users.map(u => (
            <div key={u.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.isActive ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-ink-300'}`}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-medium ${u.isActive ? 'text-ink-900' : 'text-ink-300 line-through'}`}>{u.name}</p>
                  <p className="text-xs text-ink-300">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${u.role === 'ADMIN' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-ink-500'}`}>
                  {u.role}
                </span>
                {u.id !== currentUser?.id && (
                  <button onClick={() => handleToggleActive(u.id)} className={`p-1.5 rounded transition-colors ${u.isActive ? 'text-danger-500 hover:bg-danger-50' : 'text-success-500 hover:bg-success-50'}`}
                    title={u.isActive ? 'Desactivar' : 'Activar'}>
                    {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cambio de contrasenia */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider flex items-center gap-2"><Shield size={16} /> Cambiar contrasenia</h2>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-700 mb-1 font-medium">Contrasenia actual</label>
            <input required type="password" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-ink-700 mb-1 font-medium">Nueva contrasenia</label>
            <input required type="password" minLength={6} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
          </div>
          <div>
            <button type="submit" className="bg-brand-600 text-white px-5 py-2.5 rounded-lg hover:bg-brand-700 font-medium transition-colors">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

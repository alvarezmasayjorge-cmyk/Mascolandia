import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, Package, AlertTriangle, Activity, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data.data));
    api.get('/dashboard/alerts').then((res) => setAlerts(res.data.data));
  }, []);

  if (!data) return (
    <div className="flex justify-center items-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const totalAlerts = alerts ? (alerts.expired?.length || 0) + (alerts.outOfStock?.length || 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-ink-500 mt-1">{format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}</p>
      </div>

      {/* Alerta critica si hay productos vencidos o sin stock */}
      {totalAlerts > 0 && (
        <div className="bg-danger-50 border border-red-200 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-danger-500 shrink-0" size={20} />
          <span className="text-sm text-red-800 font-medium">
            Hay {totalAlerts} producto{totalAlerts > 1 ? 's' : ''} que requiere{totalAlerts === 1 ? '' : 'n'} atención inmediata (vencido{totalAlerts > 1 ? 's' : ''} o sin stock).
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-sm text-ink-500 font-medium">Citas hoy</p>
            <p className="text-2xl font-bold text-ink-900">{data.appointmentsToday?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-warn-50 text-amber-600 rounded-lg">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-sm text-ink-500 font-medium">Stock bajo</p>
            <p className="text-2xl font-bold text-ink-900">{alerts?.lowStock?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-danger-50 text-danger-500 rounded-lg">
            <Package size={22} />
          </div>
          <div>
            <p className="text-sm text-ink-500 font-medium">Por vencer (30d)</p>
            <p className="text-2xl font-bold text-ink-900">{alerts?.expiring?.length || 0}</p>
          </div>
        </div>

        {data.cashFlow && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-success-50 text-success-500 rounded-lg">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-ink-500 font-medium">Ingresos del mes</p>
              <p className="text-2xl font-bold text-ink-900">Bs. {data.cashFlow.income.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ultimas consultas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-display font-bold text-ink-900 mb-4">Ultimas consultas</h2>
          <div className="space-y-3">
            {data.recentConsultations?.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 hover:bg-surface-sunken rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-ink-900">{c.patient?.name} <span className="text-xs text-ink-500">({c.patient?.species})</span></p>
                  <p className="text-sm text-ink-500">{c.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-brand-600">#{c.number}</p>
                  <p className="text-xs text-ink-300">{format(new Date(c.date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            ))}
            {(!data.recentConsultations || data.recentConsultations.length === 0) && (
              <p className="text-ink-500 text-sm text-center py-4">No hay consultas recientes.</p>
            )}
          </div>
        </div>

        {/* Alertas de inventario */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-display font-bold text-ink-900 mb-4">Alertas de inventario</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts?.expired?.map(item => (
              <div key={`exp-${item.id}`} className="flex items-center gap-3 p-3 bg-danger-50 text-red-800 rounded-lg text-sm">
                <Package size={16} className="shrink-0" />
                <span><strong>{item.name}</strong> — Vencido ({format(new Date(item.expiryDate), 'dd/MM/yyyy')})</span>
              </div>
            ))}
            {alerts?.outOfStock?.map(item => (
              <div key={`oos-${item.id}`} className="flex items-center gap-3 p-3 bg-danger-50 text-red-800 rounded-lg text-sm">
                <AlertTriangle size={16} className="shrink-0" />
                <span><strong>{item.name}</strong> — Sin stock</span>
              </div>
            ))}
            {alerts?.lowStock?.map(item => (
              <div key={`ls-${item.id}`} className="flex items-center gap-3 p-3 bg-warn-50 text-amber-800 rounded-lg text-sm">
                <AlertTriangle size={16} className="shrink-0" />
                <span><strong>{item.name}</strong> — Stock bajo ({item.stock} {item.unit})</span>
              </div>
            ))}
            {alerts?.expiring?.map(item => (
              <div key={`exg-${item.id}`} className="flex items-center gap-3 p-3 bg-warn-50 text-amber-800 rounded-lg text-sm">
                <Package size={16} className="shrink-0" />
                <span><strong>{item.name}</strong> — Vence el {format(new Date(item.expiryDate), 'dd/MM/yyyy')}</span>
              </div>
            ))}
            {alerts && !alerts.expired?.length && !alerts.outOfStock?.length && !alerts.lowStock?.length && !alerts.expiring?.length && (
              <p className="text-success-500 text-sm font-medium flex items-center gap-2 py-4 justify-center">
                <Activity size={16} /> Todo en orden.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

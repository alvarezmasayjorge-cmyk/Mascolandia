import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Package, AlertTriangle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500">{format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Citas Hoy</p>
            <p className="text-2xl font-bold text-gray-800">{data.appointmentsToday.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Stock Bajo</p>
            <p className="text-2xl font-bold text-gray-800">{data.lowStockItems.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Por Vencer (30d)</p>
            <p className="text-2xl font-bold text-gray-800">{data.expiringItems.length}</p>
          </div>
        </div>

        {data.cashFlow && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-800">${data.cashFlow.income.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Últimas Consultas</h2>
          <div className="space-y-4">
            {data.recentConsultations.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{c.patient.name} <span className="text-xs text-gray-500">({c.patient.species})</span></p>
                  <p className="text-sm text-gray-500">{c.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">#{c.number}</p>
                  <p className="text-xs text-gray-400">{format(new Date(c.date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            ))}
            {data.recentConsultations.length === 0 && <p className="text-gray-500 text-sm">No hay consultas recientes.</p>}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Alertas de Inventario</h2>
          <div className="space-y-3">
            {data.lowStockItems.slice(0,5).map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-orange-50 text-orange-800 rounded-lg border border-orange-100">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">{item.name} tiene stock bajo ({item.stock} {item.unit})</span>
              </div>
            ))}
            {data.expiringItems.slice(0,5).map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-red-50 text-red-800 rounded-lg border border-red-100">
                <Package size={16} />
                <span className="text-sm font-medium">{item.name} vence el {format(new Date(item.expiryDate), 'dd/MM/yyyy')}</span>
              </div>
            ))}
            {(data.lowStockItems.length === 0 && data.expiringItems.length === 0) && (
              <p className="text-green-600 text-sm font-medium flex items-center"><Activity size={16} className="mr-2"/> Todo en orden.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

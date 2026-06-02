import React, { useState, useEffect } from 'react';
import { Search, ArrowDown, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';

export default function CashFlow() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/cashflow').then(res => setTransactions(res.data)).catch(console.error);
  }, []);

  const income = transactions.filter(t => t.type === 'INGRESO').reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'EGRESO').reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const filteredTxs = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Flujo de Caja</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Ingresos</p>
          <p className="text-3xl font-bold text-green-600">${income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Egresos</p>
          <p className="text-3xl font-bold text-red-600">${expense.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm text-center border ${balance >= 0 ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <p className="text-sm font-medium mb-1">Balance</p>
          <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar transacciones..."
          className="w-full outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium w-16">Tipo</th>
              <th className="p-4 font-medium">Fecha</th>
              <th className="p-4 font-medium">Descripción</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map(tx => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  {tx.type === 'INGRESO' ? (
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg inline-flex"><ArrowUp size={16} /></div>
                  ) : (
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg inline-flex"><ArrowDown size={16} /></div>
                  )}
                </td>
                <td className="p-4 text-gray-600">{format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</td>
                <td className="p-4 text-gray-800 font-medium">{tx.description}</td>
                <td className="p-4 text-gray-500">{tx.category}</td>
                <td className={`p-4 text-right font-bold ${tx.type === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'INGRESO' ? '+' : '-'}${tx.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredTxs.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay transacciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

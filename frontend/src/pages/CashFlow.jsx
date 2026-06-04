import React, { useState, useEffect } from 'react';
import { Search, ArrowDown, ArrowUp, Plus, X, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '../api/axios';

const EMPTY_FORM = { type: 'INGRESO', category: 'Consulta', description: '', amount: '' };

export default function CashFlow() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/cashflow');
      setTransactions(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const income = transactions.filter(t => t.type === 'INGRESO').reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'EGRESO').reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const filteredTxs = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditTx(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditTx(tx);
    setFormData({
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: String(tx.amount),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTx(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, amount: parseFloat(formData.amount) };
    try {
      if (editTx) {
        await api.put(`/cashflow/${editTx.id}`, payload);
        toast.success('Transacción actualizada');
      } else {
        await api.post('/cashflow', payload);
        toast.success('Transacción registrada');
      }
      closeModal();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (tx) => {
    if (!window.confirm(`¿Eliminar la transacción "${tx.description}" por Bs. ${tx.amount.toLocaleString()}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/cashflow/${tx.id}`);
      toast.success('Transacción eliminada');
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-display font-bold text-ink-900">Flujo de caja</h1>
        <button onClick={openNew} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium w-full sm:w-auto">
          <Plus size={20} /> <span>Nueva transaccion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-medium text-ink-500 mb-1">Total ingresos</p>
          <p className="text-3xl font-bold text-green-600">Bs. {income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-medium text-ink-500 mb-1">Total egresos</p>
          <p className="text-3xl font-bold text-danger-500">Bs. {expense.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-xl shadow-sm text-center border ${balance >= 0 ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-danger-50 border-red-200 text-red-700'}`}>
          <p className="text-sm font-medium mb-1">Balance</p>
          <p className="text-3xl font-bold">Bs. {balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-ink-300" size={20} />
        <input type="text" placeholder="Buscar transacciones..." className="w-full outline-none text-ink-700 placeholder:text-ink-300" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-surface-sunken border-b border-gray-100 text-ink-500 text-sm">
              <th className="p-3 md:p-4 font-medium w-16">Tipo</th>
              <th className="p-3 md:p-4 font-medium">Fecha</th>
              <th className="p-3 md:p-4 font-medium">Descripcion</th>
              <th className="p-3 md:p-4 font-medium">Categoria</th>
              <th className="p-3 md:p-4 font-medium text-right">Monto</th>
              <th className="p-3 md:p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map(tx => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-surface-sunken transition-colors">
                <td className="p-3 md:p-4">
                  {tx.type === 'INGRESO' ? (
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg inline-flex"><ArrowUp size={16} /></div>
                  ) : (
                    <div className="bg-red-100 text-danger-500 p-2 rounded-lg inline-flex"><ArrowDown size={16} /></div>
                  )}
                </td>
                <td className="p-3 md:p-4 text-ink-500">{format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</td>
                <td className="p-3 md:p-4 text-ink-900 font-medium">{tx.description}</td>
                <td className="p-3 md:p-4 text-ink-500">{tx.category}</td>
                <td className={`p-3 md:p-4 text-right font-bold ${tx.type === 'INGRESO' ? 'text-green-600' : 'text-danger-500'}`}>
                  {tx.type === 'INGRESO' ? '+' : '-'}Bs. {tx.amount.toLocaleString()}
                </td>
                <td className="p-3 md:p-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(tx)} className="text-ink-400 hover:text-brand-600 transition-colors" title="Editar transacción">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(tx)} className="text-ink-400 hover:text-danger-500 transition-colors" title="Eliminar transacción">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTxs.length === 0 && (
              <tr><td colSpan="6" className="p-12 text-center">
                <DollarSign size={40} className="text-brand-300 mx-auto mb-3" />
                <p className="text-ink-500 font-medium">No hay transacciones registradas</p>
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal nueva / editar transaccion */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-display font-bold text-ink-900">{editTx ? 'Editar transacción' : 'Nueva transaccion'}</h2>
              <button onClick={closeModal} className="text-ink-500 hover:bg-surface-sunken p-2 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Tipo</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Categoria</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Consulta">Consulta</option>
                  <option value="Vacunacion">Vacunacion</option>
                  <option value="Cirugia">Cirugia</option>
                  <option value="Medicamentos">Medicamentos</option>
                  <option value="Compra">Compra</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Salarios">Salarios</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Descripcion</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Monto (Bs.)</label>
                <input required type="number" step="0.01" min="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900 text-xl font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2.5 text-ink-500 hover:bg-surface-sunken rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">{editTx ? 'Guardar cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

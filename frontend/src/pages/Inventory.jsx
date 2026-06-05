import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Package, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', category: 'Medicamento', stock: '', unit: 'Unidad', expiryDate: '', costPrice: '', sellingPrice: '', supplier: '', notes: '' };

export default function Inventory() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [movementModal, setMovementModal] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [movementData, setMovementData] = useState({ type: 'ENTRADA', quantity: '', registerExpense: true, cost: '' });

  const fetchItems = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      stock: parseFloat(formData.stock) || 0,
      costPrice: parseFloat(formData.costPrice) || null,
      sellingPrice: parseFloat(formData.sellingPrice) || null,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
    };
    try {
      if (editItem) {
        await api.put(`/inventory/${editItem.id}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post('/inventory', payload);
        toast.success('Producto registrado');
      }
      setIsModalOpen(false);
      setEditItem(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar producto');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.name}" del inventario? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/inventory/${item.id}`);
      toast.success('Producto eliminado');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      stock: String(item.stock),
      unit: item.unit,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      costPrice: item.costPrice != null ? String(item.costPrice) : '',
      sellingPrice: item.sellingPrice != null ? String(item.sellingPrice) : '',
      supplier: item.supplier || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/inventory/${movementModal.id}/movements`, {
        type: movementData.type,
        quantity: parseFloat(movementData.quantity),
        registerExpense: movementData.registerExpense,
        cost: parseFloat(movementData.cost) || 0,
      });
      setMovementModal(null);
      toast.success(movementData.type === 'ENTRADA' ? 'Entrada registrada' : 'Salida registrada');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar movimiento');
    }
  };

  const getStatusColor = (item) => {
    const daysToExpiry = item.expiryDate ? differenceInDays(new Date(item.expiryDate), new Date()) : 999;
    if (item.stock === 0 || daysToExpiry < 0) return 'bg-danger-50 text-red-800 border-red-200';
    if (item.stock <= 5 || daysToExpiry <= 30) return 'bg-warn-50 text-amber-800 border-amber-200';
    return 'bg-success-50 text-green-800 border-green-200';
  };

  const getStatusText = (item) => {
    const daysToExpiry = item.expiryDate ? differenceInDays(new Date(item.expiryDate), new Date()) : 999;
    if (item.stock === 0) return 'Sin stock';
    if (daysToExpiry < 0) return 'Vencido';
    if (daysToExpiry <= 15) return 'Vence pronto';
    if (item.stock <= 5) return 'Stock bajo';
    if (daysToExpiry <= 30) return 'Vence < 30d';
    return 'OK';
  };

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'all') return matchSearch;
    if (filterStatus === 'alert') return matchSearch && getStatusText(i) !== 'OK';
    return matchSearch;
  });

  const itemForm = (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-ink-700 mb-1 font-medium">Nombre</label>
          <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1 font-medium">Categoria</label>
          <select className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="Medicamento">Medicamento</option>
            <option value="Vacuna">Vacuna</option>
            <option value="Insumo">Insumo medico</option>
            <option value="Accesorio">Accesorio/Alimento</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1 font-medium">Unidad</label>
          <input required type="text" placeholder="Ej: Unidad, Frasco, ml" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1 font-medium">{editItem ? 'Stock actual' : 'Stock inicial'}</label>
          <input required type="number" step="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
          {editItem && <p className="text-xs text-ink-400 mt-1">Para corregir el stock directamente edita este valor.</p>}
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1 font-medium">Vencimiento</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1 font-medium">Costo por unidad (Bs.)</label>
          <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
          <p className="text-xs text-ink-400 mt-1">Precio de compra por cada {formData.unit || 'unidad'}</p>
        </div>
        <div>
          <label className="block text-sm text-ink-700 mb-1 font-medium">Precio de venta por unidad (Bs.)</label>
          <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
          <p className="text-xs text-ink-400 mt-1">Precio de venta por cada {formData.unit || 'unidad'}</p>
        </div>
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={() => { setIsModalOpen(false); setEditItem(null); }} className="px-4 py-2.5 text-ink-500 hover:bg-surface-sunken rounded-lg font-medium">Cancelar</button>
        <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">{editItem ? 'Guardar cambios' : 'Guardar'}</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-display font-bold text-ink-900">Inventario</h1>
        <button onClick={() => { setFormData(EMPTY_FORM); setEditItem(null); setIsModalOpen(true); }}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium w-full sm:w-auto">
          <Plus size={20} /> <span>Nuevo producto</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Search className="text-ink-300" size={20} />
          <input type="text" placeholder="Buscar por nombre o categoria..." className="w-full outline-none text-ink-700 placeholder:text-ink-300" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-ink-700 outline-none sm:w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Todos</option>
          <option value="alert">Con alertas</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-surface-sunken border-b border-gray-100 text-ink-500 text-sm">
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Vencimiento</th>
                <th className="p-4 font-medium">Precio venta</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-surface-sunken transition-colors">
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(item)}`}>{getStatusText(item)}</span>
                  </td>
                  <td className="p-4 text-ink-900 font-medium">{item.name}</td>
                  <td className="p-4 text-ink-500">{item.category}</td>
                  <td className="p-4 font-medium text-ink-900">{item.stock} <span className="text-ink-300 font-normal">{item.unit}</span></td>
                  <td className="p-4 text-ink-500">{item.expiryDate ? format(new Date(item.expiryDate), 'dd/MM/yyyy') : '-'}</td>
                  <td className="p-4 text-ink-900">{item.sellingPrice ? `Bs. ${item.sellingPrice}` : '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setMovementData({ type: 'ENTRADA', quantity: '', registerExpense: true, cost: '' }); setMovementModal(item); }}
                        className="text-success-500 hover:text-green-700 transition-colors" title="Registrar entrada">
                        <ArrowUpCircle size={18} />
                      </button>
                      <button onClick={() => { setMovementData({ type: 'SALIDA', quantity: '', registerExpense: false, cost: '' }); setMovementModal(item); }}
                        className="text-danger-500 hover:text-red-700 transition-colors" title="Registrar salida">
                        <ArrowDownCircle size={18} />
                      </button>
                      <button onClick={() => openEdit(item)}
                        className="text-ink-400 hover:text-brand-600 transition-colors" title="Editar producto">
                        <Pencil size={16} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(item)}
                          className="text-ink-400 hover:text-danger-500 transition-colors" title="Eliminar producto">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan="7" className="p-12 text-center">
                  <Package size={40} className="text-brand-300 mx-auto mb-3" />
                  <p className="text-ink-500 font-medium">No se encontraron productos</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo / editar producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-display font-bold text-ink-900">{editItem ? `Editar: ${editItem.name}` : 'Nuevo producto'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditItem(null); }} className="text-ink-500 hover:bg-surface-sunken p-2 rounded-lg"><X size={20} /></button>
            </div>
            {itemForm}
          </div>
        </div>
      )}

      {/* Modal movimiento */}
      {movementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-display font-bold text-ink-900">
                {movementData.type === 'ENTRADA' ? 'Registrar entrada' : 'Registrar salida'}: {movementModal.name}
              </h2>
              <button onClick={() => setMovementModal(null)} className="text-ink-500 hover:bg-surface-sunken p-2 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleMovement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Cantidad ({movementModal.unit})</label>
                <input required type="number" step="0.1" min="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900"
                  value={movementData.quantity} onChange={e => setMovementData({...movementData, quantity: e.target.value})} />
                <p className="text-xs text-ink-400 mt-1">Stock actual: {movementModal.stock} {movementModal.unit}</p>
              </div>
              {movementData.type === 'ENTRADA' && (
                <>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="registerExpense" checked={movementData.registerExpense}
                      onChange={e => setMovementData({...movementData, registerExpense: e.target.checked})}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                    <label htmlFor="registerExpense" className="text-sm text-ink-700">Generar gasto en caja automaticamente</label>
                  </div>
                  {movementData.registerExpense && (
                    <div>
                      <label className="block text-sm text-ink-700 mb-1 font-medium">Costo total de la compra (Bs.)</label>
                      <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900"
                        value={movementData.cost} onChange={e => setMovementData({...movementData, cost: e.target.value})} />
                      <p className="text-xs text-ink-400 mt-1">Monto total pagado por esta compra (no por unidad)</p>
                    </div>
                  )}
                </>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setMovementModal(null)} className="px-4 py-2.5 text-ink-500 hover:bg-surface-sunken rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

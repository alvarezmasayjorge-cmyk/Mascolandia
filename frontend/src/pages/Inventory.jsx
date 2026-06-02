import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import api from '../api/axios';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Medicamento', stock: '', unit: 'Unidad', 
    expiryDate: '', costPrice: '', sellingPrice: '', supplier: '', notes: ''
  });

  const fetchItems = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', {
        ...formData,
        stock: parseFloat(formData.stock) || 0,
        costPrice: parseFloat(formData.costPrice) || null,
        sellingPrice: parseFloat(formData.sellingPrice) || null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null
      });
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      alert('Error al guardar producto');
    }
  };

  const getStatusColor = (item) => {
    const daysToExpiry = item.expiryDate ? differenceInDays(new Date(item.expiryDate), new Date()) : 999;
    if (item.stock === 0 || daysToExpiry < 15) return 'bg-red-100 text-red-800 border-red-200';
    if (item.stock <= 5 || daysToExpiry <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (item) => {
    const daysToExpiry = item.expiryDate ? differenceInDays(new Date(item.expiryDate), new Date()) : 999;
    if (item.stock === 0) return 'Sin Stock';
    if (daysToExpiry < 0) return 'Vencido';
    if (daysToExpiry < 15) return 'Vence pronto';
    if (item.stock <= 5) return 'Stock Bajo';
    if (daysToExpiry <= 30) return 'Vence en < 30d';
    return 'OK';
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <button
          onClick={() => {
            setFormData({
              name: '', category: 'Medicamento', stock: '', unit: 'Unidad', 
              expiryDate: '', costPrice: '', sellingPrice: '', supplier: '', notes: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o categoría..."
          className="w-full outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Vencimiento</th>
                <th className="p-4 font-medium">Precio Venta</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item)}`}>
                      {getStatusText(item)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-800 font-medium">{item.name}</td>
                  <td className="p-4 text-gray-500">{item.category}</td>
                  <td className="p-4 font-medium text-gray-800">{item.stock} <span className="text-gray-400 font-normal">{item.unit}</span></td>
                  <td className="p-4 text-gray-600">{item.expiryDate ? format(new Date(item.expiryDate), 'dd/MM/yyyy') : '-'}</td>
                  <td className="p-4 text-gray-800">${item.sellingPrice || '-'}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No se encontraron productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Producto</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                  <input required type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Categoría</label>
                  <select className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Vacuna">Vacuna</option>
                    <option value="Insumo">Insumo Médico</option>
                    <option value="Accesorio">Accesorio/Alimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Unidad</label>
                  <input required type="text" placeholder="Ej: Unidad, Frasco, ml" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Stock Inicial</label>
                  <input required type="number" step="0.1" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fecha de Vencimiento</label>
                  <input type="date" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Costo ($)</label>
                  <input type="number" step="0.01" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Precio Venta ($)</label>
                  <input type="number" step="0.01" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

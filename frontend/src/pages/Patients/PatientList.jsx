import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import api from '../../api/axios';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '', species: 'CANINO', breed: '', age: '', weight: '', gender: 'MACHO', color: '',
    ownerName: '', ownerAddress: '', ownerPhone: ''
  });

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients', { params: { search } });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', {
        ...newPatient,
        weight: parseFloat(newPatient.weight) || null
      });
      setIsModalOpen(false);
      fetchPatients();
    } catch (err) {
      alert('Error al crear paciente');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, dueño o nº de ficha..."
          className="w-full outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Nº Ficha</th>
              <th className="p-4 font-medium">Paciente</th>
              <th className="p-4 font-medium">Especie</th>
              <th className="p-4 font-medium">Propietario</th>
              <th className="p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-primary">#{p.recordNumber}</td>
                <td className="p-4 text-gray-800 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{p.species}</td>
                <td className="p-4 text-gray-800">{p.ownerName}</td>
                <td className="p-4">
                  <Link to={`/pacientes/${p.id}`} className="text-primary hover:text-primary-dark font-medium text-sm">
                    Ver Ficha
                  </Link>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No se encontraron pacientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Paciente</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Datos del Propietario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre Completo</label>
                    <input required type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.ownerName} onChange={e => setNewPatient({...newPatient, ownerName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
                    <input required type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.ownerPhone} onChange={e => setNewPatient({...newPatient, ownerPhone: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Domicilio</label>
                    <input required type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.ownerAddress} onChange={e => setNewPatient({...newPatient, ownerAddress: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Datos del Animal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre</label>
                    <input required type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Especie</label>
                    <select className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.species} onChange={e => setNewPatient({...newPatient, species: e.target.value})}>
                      <option value="CANINO">Canino</option>
                      <option value="FELINO">Felino</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Raza</label>
                    <input type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.breed} onChange={e => setNewPatient({...newPatient, breed: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Edad</label>
                    <input type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" placeholder="Ej: 2 años, 3 meses" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.weight} onChange={e => setNewPatient({...newPatient, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Sexo</label>
                    <select className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                      <option value="MACHO">Macho</option>
                      <option value="HEMBRA">Hembra</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Color</label>
                    <input type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={newPatient.color} onChange={e => setNewPatient({...newPatient, color: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Guardar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

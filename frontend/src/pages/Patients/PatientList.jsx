import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
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
      setPatients(res.data.data);
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
      setNewPatient({
        name: '', species: 'CANINO', breed: '', age: '', weight: '', gender: 'MACHO', color: '',
        ownerName: '', ownerAddress: '', ownerPhone: ''
      });
      toast.success('Paciente registrado correctamente');
      fetchPatients();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear paciente';
      toast.error(msg);
    }
  };

  const speciesBadge = (species) => {
    const colors = {
      CANINO: 'bg-blue-50 text-blue-700 border-blue-200',
      FELINO: 'bg-orange-50 text-orange-700 border-orange-200',
      OTRO: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[species] || colors.OTRO;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-display font-bold text-ink-900">Pacientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Nuevo paciente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-ink-300" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, propietario o nro de ficha..."
          className="w-full outline-none text-ink-700 placeholder:text-ink-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-surface-sunken border-b border-gray-100 text-ink-500 text-sm">
              <th className="p-4 font-medium">Nro ficha</th>
              <th className="p-4 font-medium">Paciente</th>
              <th className="p-4 font-medium">Especie</th>
              <th className="p-4 font-medium">Propietario</th>
              <th className="p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-surface-sunken transition-colors">
                <td className="p-4 font-medium text-brand-600">#{p.recordNumber}</td>
                <td className="p-4 text-ink-900 font-medium">{p.name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${speciesBadge(p.species)}`}>
                    {p.species}
                  </span>
                </td>
                <td className="p-4 text-ink-700">{p.ownerName}</td>
                <td className="p-4">
                  <Link to={`/pacientes/${p.id}`} className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <PawPrint size={40} className="text-brand-300" />
                    <p className="text-ink-500 font-medium">No se encontraron pacientes</p>
                    <p className="text-ink-300 text-sm">Registra el primero con el boton de arriba</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Nuevo Paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-display font-bold text-ink-900">Nuevo paciente</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-500 hover:bg-surface-sunken p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-ink-500 uppercase tracking-wider mb-4">Datos del propietario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Nombre completo</label>
                    <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.ownerName} onChange={e => setNewPatient({...newPatient, ownerName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Telefono</label>
                    <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.ownerPhone} onChange={e => setNewPatient({...newPatient, ownerPhone: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Domicilio</label>
                    <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.ownerAddress} onChange={e => setNewPatient({...newPatient, ownerAddress: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-ink-500 uppercase tracking-wider mb-4">Datos del animal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Nombre de la mascota</label>
                    <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Especie</label>
                    <select className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.species} onChange={e => setNewPatient({...newPatient, species: e.target.value})}>
                      <option value="CANINO">Canino</option>
                      <option value="FELINO">Felino</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Raza</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.breed} onChange={e => setNewPatient({...newPatient, breed: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Edad</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" placeholder="Ej: 2 anios, 3 meses" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Peso (kg)</label>
                    <input type="number" step="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.weight} onChange={e => setNewPatient({...newPatient, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Sexo</label>
                    <select className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                      <option value="MACHO">Macho</option>
                      <option value="HEMBRA">Hembra</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-ink-700 mb-1 font-medium">Color</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={newPatient.color} onChange={e => setNewPatient({...newPatient, color: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-ink-500 hover:bg-surface-sunken rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium transition-colors">Guardar paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

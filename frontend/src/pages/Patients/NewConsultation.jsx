import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api/axios';

export default function NewConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [inventory, setInventory] = useState([]);
  
  const [formData, setFormData] = useState({
    reason: '',
    prevDiseases: '',
    prevInterventions: '',
    generalState: 'Bueno',
    mucosa: '',
    appetite: 'Normal',
    hydration: 'Normal',
    temperature: '',
    respirationType: 'Normal',
    respRate: '',
    heartRate: '',
    digestiveSystem: '',
    genitourinarySystem: '',
    requestedExams: '',
    diagnosis: '',
    prognosis: '',
    treatment: '',
    cost: ''
  });

  const [itemsUsed, setItemsUsed] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}`).then(res => setPatient(res.data));
    api.get('/inventory').then(res => setInventory(res.data.filter(i => i.stock > 0)));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = (e) => {
    const itemId = parseInt(e.target.value);
    if (!itemId) return;
    const item = inventory.find(i => i.id === itemId);
    if (item && !itemsUsed.find(i => i.id === itemId)) {
      setItemsUsed([...itemsUsed, { ...item, quantity: 1 }]);
    }
    e.target.value = "";
  };

  const handleItemQuantityChange = (id, quantity) => {
    setItemsUsed(itemsUsed.map(i => i.id === id ? { ...i, quantity: parseFloat(quantity) } : i));
  };

  const handleRemoveItem = (id) => {
    setItemsUsed(itemsUsed.filter(i => i.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consultations', {
        patientId: parseInt(id),
        ...formData,
        temperature: parseFloat(formData.temperature) || null,
        respRate: parseInt(formData.respRate) || null,
        heartRate: parseInt(formData.heartRate) || null,
        itemsUsed
      });
      navigate(`/pacientes/${id}`);
    } catch (err) {
      alert('Error al guardar consulta');
    }
  };

  if (!patient) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Consulta</h1>
          <p className="text-gray-500">Paciente: {patient.name} ({patient.species})</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Motivo e Historia */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Motivo e Historia</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta</label>
              <textarea required name="reason" rows="2" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.reason} onChange={handleChange}></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades previas</label>
                <input type="text" name="prevDiseases" placeholder="Sí/No + cuáles" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.prevDiseases} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervenciones previas</label>
                <input type="text" name="prevInterventions" placeholder="Sí/No + tipo" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.prevInterventions} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Examen Clínico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Examen Clínico</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado General</label>
              <select name="generalState" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.generalState} onChange={handleChange}>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apetito</label>
              <select name="appetite" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.appetite} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Disminuido">Disminuido</option>
                <option value="Anoréxico">Anoréxico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hidratación</label>
              <select name="hydration" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.hydration} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Dest. Leve">Dest. Leve</option>
                <option value="Dest. Moderada">Dest. Moderada</option>
                <option value="Dest. Grave">Dest. Grave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
              <input type="number" step="0.1" name="temperature" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.temperature} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia Cardíaca (FC)</label>
              <input type="number" name="heartRate" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.heartRate} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia Respiratoria (FR)</label>
              <input type="number" name="respRate" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.respRate} onChange={handleChange} />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mucosa</label>
              <input type="text" name="mucosa" placeholder="Rosada, Pálida, Congestionada..." className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.mucosa} onChange={handleChange} />
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ap. Digestivo</label>
                <textarea name="digestiveSystem" rows="2" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.digestiveSystem} onChange={handleChange}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ap. Genitourinario</label>
                <textarea name="genitourinarySystem" rows="2" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.genitourinarySystem} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Exámenes Solicitados</label>
              <input type="text" name="requestedExams" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.requestedExams} onChange={handleChange} />
            </div>

          </div>
        </div>

        {/* Conclusiones */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-primary mb-4 border-b pb-2">Conclusiones y Tratamiento</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <textarea name="diagnosis" rows="2" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.diagnosis} onChange={handleChange}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pronóstico</label>
                <textarea name="prognosis" rows="2" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.prognosis} onChange={handleChange}></textarea>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento Indicado</label>
              <textarea name="treatment" rows="3" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.treatment} onChange={handleChange}></textarea>
            </div>

            {/* Medicamentos Usados */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medicamentos Usados en Consulta (Descuenta de inventario)</label>
              <select className="w-full md:w-1/2 border rounded-lg p-2 outline-none focus:border-primary mb-3" onChange={handleAddItem} defaultValue="">
                <option value="" disabled>-- Seleccionar medicamento --</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name} (Disp: {item.stock} {item.unit})</option>
                ))}
              </select>

              {itemsUsed.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {itemsUsed.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          min="0.1" 
                          step="0.1" 
                          max={item.stock}
                          value={item.quantity} 
                          onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                          className="w-20 border rounded p-1 text-sm outline-none"
                        />
                        <span className="text-sm text-gray-500">{item.unit}</span>
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 text-sm hover:underline ml-2">Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Costo de consulta */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Total de la Consulta ($) <span className="text-xs text-gray-400 font-normal">(Ingresa directo a Caja)</span></label>
              <input type="number" name="cost" className="w-full md:w-1/3 border rounded-lg p-2 outline-none focus:border-primary text-xl font-bold text-gray-800" value={formData.cost} onChange={handleChange} />
            </div>

          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
          <button type="submit" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold flex items-center space-x-2 transition-colors">
            <Save size={20} />
            <span>Guardar Consulta</span>
          </button>
        </div>

      </form>
    </div>
  );
}

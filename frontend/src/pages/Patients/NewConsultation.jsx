import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

export default function NewConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reason: '', prevDiseases: '', prevInterventions: '',
    generalState: 'Bueno', mucosa: '', appetite: 'Normal', hydration: 'Normal',
    temperature: '', respirationType: 'Normal', respRate: '', heartRate: '',
    digestiveSystem: '', genitourinarySystem: '', requestedExams: '',
    diagnosis: '', prognosis: '', treatment: '', cost: ''
  });

  const [itemsUsed, setItemsUsed] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}`).then(res => setPatient(res.data.data));
    api.get('/inventory').then(res => setInventory((res.data.data || []).filter(i => i.stock > 0)));
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
    e.target.value = '';
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    setItemsUsed(itemsUsed.map(i => i.id === itemId ? { ...i, quantity: parseFloat(quantity) } : i));
  };

  const handleRemoveItem = (itemId) => {
    setItemsUsed(itemsUsed.filter(i => i.id !== itemId));
  };

  const totalMedicamentos = itemsUsed.reduce((acc, i) => acc + (i.sellingPrice || 0) * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/consultations', {
        patientId: parseInt(id),
        ...formData,
        temperature: parseFloat(formData.temperature) || null,
        respRate: parseInt(formData.respRate) || null,
        heartRate: parseInt(formData.heartRate) || null,
        cost: parseFloat(formData.cost) || 0,
        itemsUsed: itemsUsed.map(i => ({ id: i.id, quantity: i.quantity })),
      });
      toast.success('Consulta registrada correctamente');
      navigate(`/pacientes/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar consulta';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-ink-500 hover:text-ink-900">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Nueva consulta</h1>
          <p className="text-ink-500">Paciente: {patient.name} ({patient.species})</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Motivo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">1. Motivo e historia</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Motivo de consulta</label>
              <textarea required name="reason" rows="2" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-ink-900" value={formData.reason} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Enfermedades previas</label>
                <input type="text" name="prevDiseases" placeholder="Si/No + cuales" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.prevDiseases} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Intervenciones previas</label>
                <input type="text" name="prevInterventions" placeholder="Si/No + tipo" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.prevInterventions} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Examen clinico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">2. Examen clinico</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Estado general</label>
              <select name="generalState" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.generalState} onChange={handleChange}>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Apetito</label>
              <select name="appetite" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.appetite} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Disminuido">Disminuido</option>
                <option value="Anorexico">Anorexico</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Hidratacion</label>
              <select name="hydration" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.hydration} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Dest. Leve">Dest. Leve</option>
                <option value="Dest. Moderada">Dest. Moderada</option>
                <option value="Dest. Grave">Dest. Grave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Temperatura (°C)</label>
              <input type="number" step="0.1" name="temperature" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.temperature} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">FC (lat/min)</label>
              <input type="number" name="heartRate" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.heartRate} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">FR (resp/min)</label>
              <input type="number" name="respRate" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.respRate} onChange={handleChange} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-ink-700 mb-1">Mucosa</label>
              <input type="text" name="mucosa" placeholder="Rosada, Palida, Congestionada..." className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.mucosa} onChange={handleChange} />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Ap. digestivo</label>
                <textarea name="digestiveSystem" rows="2" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.digestiveSystem} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Ap. genitourinario</label>
                <textarea name="genitourinarySystem" rows="2" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.genitourinarySystem} onChange={handleChange} />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-ink-700 mb-1">Examenes solicitados</label>
              <input type="text" name="requestedExams" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.requestedExams} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Conclusiones */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">3. Diagnostico y tratamiento</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Diagnostico</label>
                <textarea name="diagnosis" rows="2" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.diagnosis} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Pronostico</label>
                <textarea name="prognosis" rows="2" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.prognosis} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Tratamiento indicado</label>
              <textarea name="treatment" rows="3" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.treatment} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Medicamentos + Cobro */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">4. Medicamentos y cobro</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Medicamentos usados (descuenta de inventario)</label>
              <select className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" onChange={handleAddItem} defaultValue="">
                <option value="" disabled>-- Seleccionar medicamento --</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name} (Disp: {item.stock} {item.unit})</option>
                ))}
              </select>
            </div>

            {itemsUsed.length > 0 && (
              <div className="bg-surface-sunken rounded-lg p-4 space-y-2">
                {itemsUsed.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0.1" step="0.1" max={item.stock}
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                        className="w-20 border border-gray-200 rounded p-1.5 text-sm outline-none text-ink-900"
                      />
                      <span className="text-sm text-ink-500">{item.unit}</span>
                      {item.sellingPrice && <span className="text-sm text-ink-300">(${(item.sellingPrice * item.quantity).toFixed(0)})</span>}
                      <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-danger-500 text-sm hover:underline ml-2">Quitar</button>
                    </div>
                  </div>
                ))}
                {totalMedicamentos > 0 && (
                  <div className="text-right pt-2 border-t border-gray-200 text-sm text-ink-500">
                    Subtotal medicamentos: <strong className="text-ink-900">${totalMedicamentos.toFixed(0)}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Costo total de la consulta ($) <span className="text-xs text-ink-300 font-normal">(Ingresa a caja)</span>
              </label>
              <input type="number" name="cost" className="w-full sm:w-1/3 border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-xl font-bold text-ink-900" value={formData.cost} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 text-ink-500 hover:bg-surface-sunken rounded-lg font-medium transition-colors text-center">Cancelar</button>
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
            <Save size={20} />
            <span>{submitting ? 'Guardando...' : 'Guardar consulta'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

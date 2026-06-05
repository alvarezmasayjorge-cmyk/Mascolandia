import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Plus, Activity, Syringe, Calendar as CalendarIcon, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PrintConsultationCard from './PrintConsultationCard';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('historia');
  const [expandedConsultation, setExpandedConsultation] = useState(null);
  const [newEvolution, setNewEvolution] = useState('');
  const [printConsultation, setPrintConsultation] = useState(null);
  const [showVaccForm, setShowVaccForm] = useState(false);
  const [showDewormForm, setShowDewormForm] = useState(false);
  const [vaccForm, setVaccForm] = useState({ type: '', date: '' });
  const [dewormDate, setDewormDate] = useState('');

  const fetchPatient = () => {
    api.get(`/patients/${id}`).then(res => setPatient(res.data.data)).catch(() => toast.error('Error cargando paciente'));
  };

  useEffect(() => { fetchPatient(); }, [id]);

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/patients/${id}/vaccinations`, vaccForm);
      toast.success('Vacuna registrada');
      setShowVaccForm(false);
      setVaccForm({ type: '', date: '' });
      fetchPatient();
    } catch { toast.error('Error registrando vacuna'); }
  };

  const handleAddDeworming = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/patients/${id}/dewormings`, { date: dewormDate });
      toast.success('Desparasitacion registrada');
      setShowDewormForm(false);
      setDewormDate('');
      fetchPatient();
    } catch { toast.error('Error registrando desparasitacion'); }
  };

  const handleAddEvolution = async (consultationId) => {
    if (!newEvolution.trim()) return;
    try {
      await api.post(`/consultations/${consultationId}/evolutions`, { text: newEvolution });
      toast.success('Evolucion agregada');
      setNewEvolution('');
      fetchPatient();
    } catch { toast.error('Error agregando evolucion'); }
  };

  const handlePrintConsultation = (consultation) => {
    setPrintConsultation(consultation);
    setTimeout(() => {
      window.print();
      setPrintConsultation(null);
    }, 350);
  };

  if (!patient) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;

  const tabs = [
    { key: 'historia', label: 'Historia clinica' },
    { key: 'vacunas', label: `Vacunas (${patient.vaccinations?.length || 0})` },
    { key: 'desparasitaciones', label: `Desparasitaciones (${patient.dewormings?.length || 0})` },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Área de impresión de ficha — solo visible al imprimir */}
      {printConsultation && (
        <div className="hidden print:block print-area">
          <PrintConsultationCard patient={patient} consultation={printConsultation} />
        </div>
      )}

      {/* Contenido normal — se oculta al imprimir una ficha específica */}
    <div className={`space-y-6 ${printConsultation ? 'print:hidden print-hide' : 'print:max-w-full'}`}>
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="text-ink-500 hover:text-ink-900 flex items-center gap-2">
          <ArrowLeft size={20} /> <span>Volver</span>
        </button>
        <Link to={`/pacientes/${id}/nueva-consulta`} className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm sm:text-base">
          <Plus size={18} /> <span>Nueva consulta</span>
        </Link>
      </div>

      {/* Print header */}
      <div className="hidden print:flex items-center gap-4 mb-6 border-b pb-4">
        <h1 className="text-3xl font-display font-bold text-brand-600">Mascolandia</h1>
        <div className="text-sm text-ink-500">Ficha Clinica Veterinaria</div>
      </div>

      {/* Patient header card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-display font-bold text-xl">
              {patient.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-ink-900">{patient.name}</h1>
              <p className="text-ink-500">{patient.species} {patient.breed ? `— ${patient.breed}` : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink-500">Nro ficha</p>
            <p className="text-xl font-bold text-brand-600">#{patient.recordNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold text-ink-300 uppercase tracking-wider mb-3">Propietario</h3>
            <div className="bg-surface-sunken p-4 rounded-lg print:bg-transparent print:p-0 space-y-1.5">
              <p><span className="text-ink-500 text-sm">Nombre:</span> <span className="font-medium text-ink-900">{patient.ownerName}</span></p>
              <p><span className="text-ink-500 text-sm">Telefono:</span> <span className="font-medium text-ink-900">{patient.ownerPhone}</span></p>
              <p><span className="text-ink-500 text-sm">Domicilio:</span> <span className="font-medium text-ink-900">{patient.ownerAddress}</span></p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-ink-300 uppercase tracking-wider mb-3">Datos del animal</h3>
            <div className="bg-surface-sunken p-4 rounded-lg grid grid-cols-2 gap-2 print:bg-transparent print:p-0">
              <p><span className="text-ink-500 text-sm">Edad:</span> <span className="font-medium text-ink-900">{patient.age || '-'}</span></p>
              <p><span className="text-ink-500 text-sm">Peso:</span> <span className="font-medium text-ink-900">{patient.weight ? `${patient.weight} kg` : '-'}</span></p>
              <p><span className="text-ink-500 text-sm">Sexo:</span> <span className="font-medium text-ink-900">{patient.gender || '-'}</span></p>
              <p><span className="text-ink-500 text-sm">Color:</span> <span className="font-medium text-ink-900">{patient.color || '-'}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-sunken p-1 rounded-lg print:hidden overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 py-2.5 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'bg-white text-brand-600 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Historia clinica */}
      {activeTab === 'historia' && (
        <div>
          {patient.consultations?.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
              <Activity size={40} className="text-brand-300 mx-auto mb-3" />
              <p className="text-ink-500 font-medium">Sin consultas registradas</p>
              <p className="text-ink-300 text-sm mt-1">Crea la primera consulta para este paciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patient.consultations.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:break-inside-avoid">
                  <div
                    className="p-4 md:p-5 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start cursor-pointer hover:bg-surface-sunken transition-colors"
                    onClick={() => setExpandedConsultation(expandedConsultation === c.id ? null : c.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-brand-600">Consulta #{c.number}</h3>
                      <p className="text-sm text-ink-500 flex items-center gap-1 mt-1 flex-wrap">
                        <CalendarIcon size={14} /> {format(new Date(c.date), 'dd/MM/yyyy HH:mm')}
                        {c.vet && <span className="ml-2">— Dr. {c.vet.name}</span>}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-shrink-0">
                      <div>
                        <p className="text-xs text-ink-500">Motivo</p>
                        <p className="font-medium text-ink-900 text-sm">{c.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePrintConsultation(c); }}
                          className="print:hidden flex items-center gap-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          title="Imprimir ficha"
                        >
                          <Printer size={14} /> <span className="hidden sm:inline">Imprimir ficha</span>
                        </button>
                        {expandedConsultation === c.id ? <ChevronUp size={18} className="text-ink-300" /> : <ChevronDown size={18} className="text-ink-300" />}
                      </div>
                    </div>
                  </div>

                  {expandedConsultation === c.id && (
                    <div className="border-t border-gray-100 p-5 print:block">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                          <h4 className="font-bold text-ink-700 mb-2">Examen clinico</h4>
                          <ul className="space-y-1 text-ink-500">
                            <li>Estado: <span className="font-medium text-ink-900">{c.generalState || '-'}</span></li>
                            <li>Temp: <span className="font-medium text-ink-900">{c.temperature ? `${c.temperature}°C` : '-'}</span></li>
                            <li>Apetito: <span className="font-medium text-ink-900">{c.appetite || '-'}</span></li>
                            <li>FC: <span className="font-medium text-ink-900">{c.heartRate || '-'}</span> | FR: <span className="font-medium text-ink-900">{c.respRate || '-'}</span></li>
                            <li>Hidratacion: <span className="font-medium text-ink-900">{c.hydration || '-'}</span></li>
                            <li>Mucosa: <span className="font-medium text-ink-900">{c.mucosa || '-'}</span></li>
                          </ul>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="font-bold text-ink-700 mb-2">Conclusiones</h4>
                          <div className="space-y-2 text-ink-500">
                            <p><strong className="text-ink-700">Diagnostico:</strong> {c.diagnosis || '-'}</p>
                            <p><strong className="text-ink-700">Tratamiento:</strong> {c.treatment || '-'}</p>
                            <p><strong className="text-ink-700">Pronostico:</strong> {c.prognosis || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Evoluciones */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <h4 className="font-bold text-ink-700 mb-3 text-sm">Evoluciones</h4>
                        {c.evolutions?.length > 0 ? (
                          <div className="space-y-3 mb-4">
                            {c.evolutions.map(ev => (
                              <div key={ev.id} className="bg-surface-sunken p-3 rounded-lg text-sm">
                                <div className="flex justify-between text-ink-300 text-xs mb-1">
                                  <span>{ev.user?.name || 'Desconocido'}</span>
                                  <span>{format(new Date(ev.date), 'dd/MM/yyyy HH:mm')}</span>
                                </div>
                                <p className="text-ink-700">{ev.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-ink-300 text-sm mb-3">Sin evoluciones registradas.</p>
                        )}
                        <div className="flex gap-2 print:hidden">
                          <input
                            type="text"
                            placeholder="Agregar evolucion..."
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
                            value={expandedConsultation === c.id ? newEvolution : ''}
                            onChange={(e) => setNewEvolution(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEvolution(c.id)}
                          />
                          <button
                            onClick={() => handleAddEvolution(c.id)}
                            className="bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Vacunas */}
      {activeTab === 'vacunas' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-ink-900 flex items-center gap-2"><Syringe size={20} /> Vacunas</h2>
            <button onClick={() => setShowVaccForm(!showVaccForm)} className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1">
              <Plus size={16} /> Agregar
            </button>
          </div>
          {showVaccForm && (
            <form onSubmit={handleAddVaccination} className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-surface-sunken rounded-lg">
              <input required type="text" placeholder="Tipo (ej: Parvovirus, Rabia)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" value={vaccForm.type} onChange={e => setVaccForm({...vaccForm, type: e.target.value})} />
              <input required type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" value={vaccForm.date} onChange={e => setVaccForm({...vaccForm, date: e.target.value})} />
              <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Guardar</button>
            </form>
          )}
          {patient.vaccinations?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {patient.vaccinations.map(v => (
                <div key={v.id} className="py-3 flex justify-between">
                  <span className="font-medium text-ink-900">{v.type}</span>
                  <span className="text-ink-500 text-sm">{format(new Date(v.date), 'dd/MM/yyyy')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-300 text-sm text-center py-4">Sin vacunas registradas.</p>
          )}
        </div>
      )}

      {/* Tab: Desparasitaciones */}
      {activeTab === 'desparasitaciones' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-ink-900">Desparasitaciones</h2>
            <button onClick={() => setShowDewormForm(!showDewormForm)} className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1">
              <Plus size={16} /> Agregar
            </button>
          </div>
          {showDewormForm && (
            <form onSubmit={handleAddDeworming} className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-surface-sunken rounded-lg">
              <input required type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" value={dewormDate} onChange={e => setDewormDate(e.target.value)} />
              <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Guardar</button>
            </form>
          )}
          {patient.dewormings?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {patient.dewormings.map(d => (
                <div key={d.id} className="py-3">
                  <span className="text-ink-500 text-sm">{format(new Date(d.date), 'dd/MM/yyyy')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-300 text-sm text-center py-4">Sin desparasitaciones registradas.</p>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

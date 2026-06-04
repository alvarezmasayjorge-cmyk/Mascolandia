import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { X, Calendar, Clock, User, PawPrint, Phone, MapPin, FileText, ChevronDown, HelpCircle, List, CalendarDays, CalendarRange, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '../api/axios';

const STATUSES = [
  { value: 'PENDIENTE',   label: 'Pendiente',    bg: '#B89AE5', text: '#2E1065', dot: '#9F7FD9',  hint: 'Cita agendada, aún sin confirmar' },
  { value: 'CONFIRMADA',  label: 'Confirmada',   bg: '#5B21B6', text: '#FFFFFF', dot: '#5B21B6',  hint: 'El dueño confirmó que asistirá' },
  { value: 'ASISTIO',     label: 'Asistió',      bg: '#84A98C', text: '#1A2E1D', dot: '#84A98C',  hint: 'El paciente llegó a la clínica pero la consulta aún no fue registrada en el sistema' },
  { value: 'COMPLETADA',  label: 'Completada',   bg: '#3D8B5F', text: '#FFFFFF', dot: '#3D8B5F',  hint: 'La consulta fue atendida y registrada completamente en el sistema' },
  { value: 'NO_ASISTIO',  label: 'No asistió',   bg: '#FECACA', text: '#991B1B', dot: '#DC2626',  hint: 'El paciente no se presentó a la cita' },
  { value: 'REAGENDADA',  label: 'Reagendada',   bg: '#FDE68A', text: '#78350F', dot: '#F59E0B',  hint: 'La cita fue movida a otra fecha' },
  { value: 'CANCELADA',   label: 'Cancelada',    bg: '#E5E1EB', text: '#6B6585', dot: '#A8A2BD',  hint: 'La cita fue cancelada' },
];

const MOBILE_VIEWS = [
  { value: 'listWeek',      label: 'Lista',   icon: List },
  { value: 'timeGridDay',   label: 'Día',     icon: CalendarDays },
  { value: 'timeGridWeek',  label: 'Semana',  icon: CalendarRange },
  { value: 'dayGridMonth',  label: 'Mes',     icon: LayoutGrid },
];

function getStatus(value) {
  return STATUSES.find(s => s.value === value) || STATUSES[0];
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

export default function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({ patientId: '', date: '', time: '', reason: '' });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState('listWeek');
  const calendarRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setCurrentView(isMobile ? 'listWeek' : 'timeGridWeek');
  }, [isMobile]);

  const changeView = (view) => {
    setCurrentView(view);
    const cal = calendarRef.current?.getApi();
    if (cal) cal.changeView(view);
  };

  const goToday = () => {
    const cal = calendarRef.current?.getApi();
    if (cal) cal.today();
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const events = (res.data.data || []).map(a => {
        const s = getStatus(a.status);
        return {
          id: String(a.id),
          title: `${a.patient?.name || 'Cita'} — ${a.reason || ''}`,
          start: new Date(a.date).toISOString(),
          backgroundColor: s.bg,
          textColor: s.text,
          borderColor: 'transparent',
          extendedProps: { ...a },
        };
      });
      setAppointments(events);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAppointments();
    api.get('/patients').then(res => setPatients(res.data.data || []));
  }, []);

  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr.split('T')[0];
    const timeStr = arg.dateStr.includes('T') ? arg.dateStr.split('T')[1].substring(0, 5) : '09:00';
    setFormData({ patientId: '', date: dateStr, time: timeStr, reason: '' });
    setSelectedPatient(null);
    setIsCreateOpen(true);
  };

  const handleEventClick = (info) => {
    const appt = info.event.extendedProps;
    setSelectedAppointment(appt);
    setStatusDropdownOpen(false);
    setIsDetailOpen(true);
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    setFormData({ ...formData, patientId });
    const patient = patients.find(p => p.id === parseInt(patientId));
    setSelectedPatient(patient || null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}:00`);
      await api.post('/appointments', {
        patientId: parseInt(formData.patientId) || null,
        date: dateTime.toISOString(),
        reason: formData.reason,
        status: 'PENDIENTE',
      });
      setIsCreateOpen(false);
      toast.success('Cita agendada');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al agendar cita');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedAppointment) return;
    try {
      await api.put(`/appointments/${selectedAppointment.id}`, { status: newStatus });
      toast.success(`Estado actualizado: ${getStatus(newStatus).label}`);
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      setStatusDropdownOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const fmtDate = (d) => { try { return format(new Date(d), "EEEE d 'de' MMMM, yyyy", { locale: es }); } catch { return ''; } };
  const fmtTime = (d) => { try { return format(new Date(d), 'HH:mm'); } catch { return ''; } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-display font-bold text-ink-900">Agenda de citas</h1>
        <button onClick={() => {
          setFormData({ patientId: '', date: new Date().toISOString().split('T')[0], time: '09:00', reason: '' });
          setSelectedPatient(null);
          setIsCreateOpen(true);
        }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
          <Calendar size={18} /> Agendar cita
        </button>
      </div>

      {/* Leyenda de estados */}
      <div className="flex flex-wrap items-center gap-3">
        {STATUSES.map(s => (
          <div key={s.value} className="flex items-center gap-1.5 text-xs text-ink-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.dot }} />
            {s.label}
          </div>
        ))}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
          aria-label="Ver descripción de los estados"
        >
          <HelpCircle size={14} /> ¿Qué significa cada estado?
        </button>
      </div>

      {/* Selector de vista — visible solo en móvil */}
      <div className="md:hidden space-y-2">
        <div className="grid grid-cols-4 gap-1 bg-surface-sunken p-1 rounded-lg">
          {MOBILE_VIEWS.map(v => {
            const Icon = v.icon;
            const active = currentView === v.value;
            return (
              <button
                key={v.value}
                onClick={() => changeView(v.value)}
                className={`flex flex-col items-center gap-1 py-2 rounded-md text-xs font-medium transition-colors ${
                  active ? 'bg-white text-brand-600 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <Icon size={16} />
                {v.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={goToday}
          className="w-full py-2 rounded-lg border border-gray-200 text-sm text-ink-700 font-medium hover:bg-surface-sunken"
        >
          Ir a hoy
        </button>
      </div>

      <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
          headerToolbar={isMobile ? {
            left: 'prev',
            center: 'title',
            right: 'next'
          } : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          datesSet={(arg) => {
            if (arg.view?.type && arg.view.type !== currentView) {
              setCurrentView(arg.view.type);
            }
          }}
          events={appointments}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            const appt = info.event.extendedProps;
            const st = getStatus(appt.status);
            info.el.title = `${appt.patient?.name || 'Cita'} — ${appt.reason || ''}\n${st.label} · ${fmtTime(appt.date)} hrs`;
            info.el.style.borderLeft = `3px solid ${st.dot}`;
          }}
          height={isMobile ? '65vh' : '75vh'}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
          locale="es"
          buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista' }}
          noEventsText="No hay citas en este rango"
          eventDisplay="block"
          eventBorderColor="transparent"
        />
      </div>

      {/* ══════ Modal: Ayuda de estados ══════ */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsHelpOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-display font-bold text-ink-900">Estados de las citas</h2>
              <button onClick={() => setIsHelpOpen(false)} className="text-ink-500 hover:bg-surface-sunken p-2 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {STATUSES.map(s => (
                <div key={s.value} className="flex gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: s.dot }} />
                  <div>
                    <p className="font-semibold text-sm text-ink-900">{s.label}</p>
                    <p className="text-sm text-ink-500 mt-0.5">{s.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ Modal: Crear cita ══════ */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsCreateOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-ink-900">Agendar cita</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-ink-500 hover:bg-surface-sunken p-2 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Paciente</label>
                <select required className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.patientId} onChange={handlePatientChange}>
                  <option value="" disabled>Seleccione paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.ownerName})</option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div className="bg-surface-sunken p-3 rounded-lg text-sm space-y-1">
                  <p className="text-ink-500">Propietario: <span className="text-ink-900 font-medium">{selectedPatient.ownerName}</span></p>
                  <p className="text-ink-500">Especie: <span className="text-ink-900 font-medium">{selectedPatient.species}</span></p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink-700 mb-1 font-medium">Fecha</label>
                  <input required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-ink-700 mb-1 font-medium">Hora</label>
                  <input required type="time" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-ink-700 mb-1 font-medium">Motivo</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-brand-500 text-ink-900" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2.5 text-ink-500 hover:bg-surface-sunken rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ Modal: Detalle de cita ══════ */}
      {isDetailOpen && selectedAppointment && (() => {
        const appt = selectedAppointment;
        const st = getStatus(appt.status);
        const pat = appt.patient;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsDetailOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Header con color del estado */}
              <div className="rounded-t-2xl px-6 py-5 flex justify-between items-start gap-3" style={{ backgroundColor: st.bg + '22' }}>
                <div className="min-w-0">
                  <h2 className="text-xl font-display font-bold text-ink-900 truncate">{pat?.name || 'Cita'}</h2>
                  <p className="text-sm text-ink-500 mt-0.5 break-words">{appt.reason}</p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="text-ink-500 hover:bg-white/60 p-2 rounded-lg flex-shrink-0"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">

                {/* Estado con dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-ink-300 uppercase tracking-wider mb-2">Estado</label>
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-brand-300 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.dot }} />
                    <span className="font-medium text-sm text-ink-900">{st.label}</span>
                    <ChevronDown size={14} className="text-ink-400" />
                  </button>

                  {statusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[180px]">
                      {STATUSES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => handleStatusChange(s.value)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-sunken transition-colors text-left ${
                            s.value === appt.status ? 'bg-brand-50 font-semibold' : ''
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fecha y hora */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-ink-900 capitalize">{fmtDate(appt.date)}</p>
                    <p className="text-ink-500">{fmtTime(appt.date)} hrs</p>
                  </div>
                </div>

                {/* Info del paciente */}
                {pat && (
                  <div className="bg-surface-sunken rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                        <PawPrint size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-ink-900 truncate">{pat.name}</p>
                        <p className="text-xs text-ink-500 truncate">{pat.species}{pat.breed ? ` — ${pat.breed}` : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {pat.age && (
                        <p className="text-ink-500">Edad: <span className="font-medium text-ink-700">{pat.age}</span></p>
                      )}
                      {pat.weight && (
                        <p className="text-ink-500">Peso: <span className="font-medium text-ink-700">{pat.weight} kg</span></p>
                      )}
                      {pat.gender && (
                        <p className="text-ink-500">Sexo: <span className="font-medium text-ink-700">{pat.gender}</span></p>
                      )}
                      {pat.color && (
                        <p className="text-ink-500">Color: <span className="font-medium text-ink-700">{pat.color}</span></p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-ink-400 flex-shrink-0" />
                        <span className="text-ink-700 font-medium break-words">{pat.ownerName}</span>
                      </div>
                      {pat.ownerPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-ink-400 flex-shrink-0" />
                          <span className="text-ink-500 break-words">{pat.ownerPhone}</span>
                        </div>
                      )}
                      {pat.ownerAddress && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin size={14} className="text-ink-400 flex-shrink-0 mt-0.5" />
                          <span className="text-ink-500 break-words">{pat.ownerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Veterinario */}
                {appt.vet && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-sunken flex items-center justify-center text-ink-500 flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-ink-400">Veterinario</p>
                      <p className="font-medium text-ink-900">Dr. {appt.vet.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

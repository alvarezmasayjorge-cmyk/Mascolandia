import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios';
import { X } from 'lucide-react';

export default function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', date: '', time: '', reason: '' });
  const calendarRef = useRef(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const events = res.data.map(a => ({
        id: a.id,
        title: `${a.patient?.name || 'Cita'} - ${a.reason}`,
        start: new Date(a.date).toISOString(), // Assume date is saved with time properly, but let's handle it
        extendedProps: { ...a }
      }));
      setAppointments(events);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    api.get('/patients').then(res => setPatients(res.data));
  }, []);

  const handleDateClick = (arg) => {
    // Extract date and time if clicked on timegrid
    const dateStr = arg.dateStr.split('T')[0];
    const timeStr = arg.dateStr.includes('T') ? arg.dateStr.split('T')[1].substring(0,5) : '09:00';
    
    setFormData({ patientId: '', date: dateStr, time: timeStr, reason: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}:00`);
      await api.post('/appointments', {
        patientId: parseInt(formData.patientId) || null,
        date: dateTime.toISOString(),
        reason: formData.reason,
        status: 'PENDIENTE'
      });
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err) {
      alert('Error al agendar cita');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Agenda de Citas</h1>
        <button
          onClick={() => {
            setFormData({ patientId: '', date: new Date().toISOString().split('T')[0], time: '09:00', reason: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Agendar Cita
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={appointments}
          dateClick={handleDateClick}
          height="75vh"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          eventColor="#6B21A8"
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Agendar Cita</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Paciente</label>
                <select required className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
                  <option value="" disabled>Seleccione paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.ownerName})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fecha</label>
                  <input required type="date" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Hora</label>
                  <input required type="time" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Motivo</label>
                <input required type="text" className="w-full border rounded-lg p-2 outline-none focus:border-primary" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
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

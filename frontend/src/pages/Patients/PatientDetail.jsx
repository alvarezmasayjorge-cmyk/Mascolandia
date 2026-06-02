import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Plus, Activity, Syringe, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`).then(res => setPatient(res.data)).catch(err => console.error(err));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!patient) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:max-w-full">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 flex items-center space-x-2">
          <ArrowLeft size={20} /> <span>Volver</span>
        </button>
        <div className="flex space-x-3">
          <button onClick={handlePrint} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2">
            <Printer size={20} /> <span>Imprimir Ficha</span>
          </button>
          <Link to={`/pacientes/${id}/nueva-consulta`} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus size={20} /> <span>Nueva Consulta</span>
          </Link>
        </div>
      </div>

      {/* Print Header Logo */}
      <div className="hidden print:flex items-center space-x-4 mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-primary">Mascolandia</h1>
        <div className="text-sm text-gray-500">Ficha Clínica Veterinaria</div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
            <p className="text-gray-500">{patient.species} {patient.breed ? `- ${patient.breed}` : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Nº Ficha</p>
            <p className="text-xl font-bold text-primary">#{patient.recordNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
          {/* Propietario */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del Propietario</h3>
            <div className="bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
              <p className="mb-1"><span className="text-gray-500 text-sm">Nombre:</span> <span className="font-medium text-gray-800">{patient.ownerName}</span></p>
              <p className="mb-1"><span className="text-gray-500 text-sm">Teléfono:</span> <span className="font-medium text-gray-800">{patient.ownerPhone}</span></p>
              <p className="mb-1"><span className="text-gray-500 text-sm">Domicilio:</span> <span className="font-medium text-gray-800">{patient.ownerAddress}</span></p>
            </div>
          </div>

          {/* Animal */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Datos del Animal</h3>
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-2 print:bg-transparent print:p-0">
              <p><span className="text-gray-500 text-sm">Edad:</span> <span className="font-medium text-gray-800">{patient.age || '-'}</span></p>
              <p><span className="text-gray-500 text-sm">Peso:</span> <span className="font-medium text-gray-800">{patient.weight ? `${patient.weight} kg` : '-'}</span></p>
              <p><span className="text-gray-500 text-sm">Sexo:</span> <span className="font-medium text-gray-800">{patient.gender || '-'}</span></p>
              <p><span className="text-gray-500 text-sm">Color:</span> <span className="font-medium text-gray-800">{patient.color || '-'}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Consultas */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Activity className="mr-2" /> Historial de Consultas</h2>
        {patient.consultations.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            Aún no hay consultas registradas para este paciente.
          </div>
        ) : (
          <div className="space-y-4">
            {patient.consultations.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:break-inside-avoid print:shadow-none print:border-gray-300">
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-primary">Consulta #{c.number}</h3>
                    <p className="text-sm text-gray-500 flex items-center"><CalendarIcon size={14} className="mr-1" /> {format(new Date(c.date), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Motivo</p>
                    <p className="font-medium text-gray-800">{c.reason}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Examen Clínico</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>Estado: <span className="font-medium">{c.generalState || '-'}</span></li>
                      <li>Temp: <span className="font-medium">{c.temperature ? `${c.temperature}°C` : '-'}</span></li>
                      <li>Apetito: <span className="font-medium">{c.appetite || '-'}</span></li>
                      <li>FC: <span className="font-medium">{c.heartRate || '-'}</span> | FR: <span className="font-medium">{c.respRate || '-'}</span></li>
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-700 mb-2">Conclusiones</h4>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Diagnóstico:</strong> {c.diagnosis || '-'}</p>
                      <p><strong>Tratamiento:</strong> {c.treatment || '-'}</p>
                      <p><strong>Pronóstico:</strong> {c.prognosis || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

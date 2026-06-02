import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientList from './Patients/PatientList';
import PatientDetail from './Patients/PatientDetail';
import NewConsultation from './Patients/NewConsultation';

export default function Patients() {
  return (
    <Routes>
      <Route index element={<PatientList />} />
      <Route path=":id" element={<PatientDetail />} />
      <Route path=":id/nueva-consulta" element={<NewConsultation />} />
    </Routes>
  );
}

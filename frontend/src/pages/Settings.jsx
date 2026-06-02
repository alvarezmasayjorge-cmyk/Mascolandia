import React from 'react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-primary border-b pb-2">Datos de la Clínica</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nombre</label>
            <input type="text" className="w-full border rounded-lg p-2" defaultValue="Veterinaria Mascolandia" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
            <input type="text" className="w-full border rounded-lg p-2" defaultValue="555-0123" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Dirección</label>
            <input type="text" className="w-full border rounded-lg p-2" defaultValue="Calle Principal 123" />
          </div>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg">Guardar Datos</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-primary border-b pb-2">Gestión de Usuarios</h2>
        <p className="text-sm text-gray-500">Para crear nuevos asistentes o administradores, se debe habilitar el endpoint de registro en el backend.</p>
        <p className="text-sm text-gray-500">Por ahora, usa la cuenta por defecto: admin@mascolandia.com</p>
      </div>
    </div>
  );
}

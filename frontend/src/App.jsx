import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Inventory from './pages/Inventory';
import CalendarView from './pages/CalendarView';
import CashFlow from './pages/CashFlow';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pacientes/*" element={<Patients />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="agenda" element={<CalendarView />} />
            <Route path="caja" element={<ProtectedRoute requireAdmin><CashFlow /></ProtectedRoute>} />
            <Route path="configuracion" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          },
        }}
        richColors
      />
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import RutasProtegidas from './components/RutasProtegidas';
import Inspectores from './pages/Inspectores';
import NumPartes from './pages/NumPartes';
import Plataformas from './pages/Plataformas';
import Defectos from './pages/Defectos';
import Proveedores from './pages/Proveedores';
import Retrabajos from './pages/Retrabajos';
import Turnos from './pages/Turnos';
import Cargos from './pages/Cargos';
import ReporteForm from './pages/ReporteForm';
import Incumplimientohoras from './pages/IncumplimientoHoras';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <RutasProtegidas>
              <Dashboard />
            </RutasProtegidas>
          } />
          <Route path="/usuarios" element={
            <RutasProtegidas rolesPermitidos={['Administrador']}>
              <Usuarios />
            </RutasProtegidas>
          } />
          <Route path="/inspectores" element={
            <RutasProtegidas>
              <Inspectores />
            </RutasProtegidas>
          } />
          <Route path="/num-partes" element={
            <RutasProtegidas>
              <NumPartes />
            </RutasProtegidas>
          } />
          <Route path="/plataformas" element={
            <RutasProtegidas>
              <Plataformas />
            </RutasProtegidas>
          } />
          <Route path="/defectos" element={
            <RutasProtegidas>
              <Defectos />
            </RutasProtegidas>
          } />
          <Route path="/proveedores" element={
            <RutasProtegidas>
              <Proveedores />
            </RutasProtegidas>
          } />
          <Route path="/retrabajos" element={
            <RutasProtegidas>
              <Retrabajos />
            </RutasProtegidas>
          } />
          <Route path="/turnos" element={
            <RutasProtegidas>
              <Turnos />
            </RutasProtegidas>
          } />
          <Route path="/cargos" element={
            <RutasProtegidas>
              <Cargos />
            </RutasProtegidas>
          } />
          <Route path="/incumplimientohoras" element={
            <RutasProtegidas>
              <Incumplimientohoras />
            </RutasProtegidas>
          } />
          <Route path="/reporteform" element={
            <RutasProtegidas>
              <ReporteForm />
            </RutasProtegidas>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

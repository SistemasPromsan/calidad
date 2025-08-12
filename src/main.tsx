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
import TestConexion from './pages/TestConexion';
import Supervisores from './pages/Supervisores';
import ReportesList from './pages/ReportesList';
import ReporteDetalle from './pages/ReporteDetalle';
import ReporteEditar from './pages/ReporteEditar';

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
            <RutasProtegidas rolesPermitidos={['administrador']}>
              <Usuarios />
            </RutasProtegidas>
          } />
          <Route path="/inspectores" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Inspectores />
            </RutasProtegidas>
          } />
          <Route path="/num-partes" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <NumPartes />
            </RutasProtegidas>
          } />
          <Route path="/plataformas" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Plataformas />
            </RutasProtegidas>
          } />
          <Route path="/defectos" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Defectos />
            </RutasProtegidas>
          } />
          <Route path="/proveedores" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Proveedores />
            </RutasProtegidas>
          } />
          <Route path="/retrabajos" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Retrabajos />
            </RutasProtegidas>
          } />
          <Route path="/turnos" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Turnos />
            </RutasProtegidas>
          } />
          <Route path="/cargos" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Cargos />
            </RutasProtegidas>
          } />
          <Route path="/incumplimientohoras" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Incumplimientohoras />
            </RutasProtegidas>
          } />
          <Route path="/reporteform" element={
            <RutasProtegidas>
              <ReporteForm />
            </RutasProtegidas>
          } />
          <Route path="/supervisores" element={
            <RutasProtegidas rolesPermitidos={['administrador', 'capturista']}>
              <Supervisores />
            </RutasProtegidas>
          } />
          <Route path="/reportes-list" element={
            <RutasProtegidas>
              <ReportesList />
            </RutasProtegidas>
          } />
          <Route path="/reporte/:id" element={
            <RutasProtegidas>
              <ReporteDetalle />
            </RutasProtegidas>
          } />
          <Route path="/reporte-editar" element={
            <RutasProtegidas>
              <ReporteEditar />
            </RutasProtegidas>
          } />

          <Route path="/test-conexion" element={<TestConexion />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

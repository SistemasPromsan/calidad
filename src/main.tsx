import React from 'react';
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
            <RutasProtegidas>
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

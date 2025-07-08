import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import RutasProtegidas from './components/RutasProtegidas';
import Inspectores from './pages/Inspectores';

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

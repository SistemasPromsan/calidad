import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LayoutPrivado.css';

export default function LayoutPrivado({ children }: { children: ReactNode }) {
    const { logout, usuario } = useAuth();

    // Normaliza rol
    const rolTexto = (usuario?.rol ?? '').trim().toLowerCase();
    const idRol = (usuario?.id_rol ?? '').toString();

    const isAdmin = rolTexto.includes('admin') || idRol === '1';
    const isSupervisor = rolTexto.includes('super') || idRol === '2';
    const isCapturista = rolTexto.includes('captur') || idRol === '3';

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <h2 className="logo">Calidad App</h2>
                <nav>
                    {/* Comunes (Supervisor, Capturista, Admin) */}
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/reporteform">Reportes</Link>
                    <Link to="/reportes-list">Reportes List</Link>

                    {/* ----- Admin ONLY ----- */}
                    {isAdmin && (
                        <Link to="/usuarios">Usuarios</Link>
                    )}

                    {/* ----- Admin o Capturista (todo lo que el supervisor no ve) ----- */}
                    {(isAdmin || isCapturista) && (
                        <>
                            <Link to="/inspectores">Inspectores</Link>
                            <Link to="/num-partes">Números de Partes</Link>
                            <Link to="/plataformas">Plataformas</Link>
                            <Link to="/defectos">Defectos</Link>
                            <Link to="/proveedores">Proveedores</Link>
                            <Link to="/retrabajos">Retrabajos</Link>
                            <Link to="/turnos">Turnos</Link>
                            <Link to="/cargos">Cargos</Link>
                            <Link to="/incumplimientohoras">Incumplimientos Horas</Link>
                            <Link to="/supervisores">Supervisores</Link>
                            {/* <Link to="/reporte-editar">Editar Reporte</Link> */}

                        </>
                    )}
                </nav>

                <button onClick={logout} className="logout">Cerrar sesión</button>
            </aside>

            <main className="main-content">{children}</main>
        </div>
    );
}

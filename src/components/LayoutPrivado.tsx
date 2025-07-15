import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LayoutPrivado.css';

export default function LayoutPrivado({ children }: { children: ReactNode }) {
    const { logout, usuario } = useAuth();

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <h2 className="logo">Calidad App</h2>
                <nav>
                    <Link to="/dashboard">Dashboard</Link>

                    {/* Solo mostrar para administradores */}
                    {usuario?.rol.toLowerCase() === 'administrador' && (
                        <Link to="/usuarios">Usuarios</Link>
                    )}

                    <Link to="/inspectores">Inspectores</Link>
                    <Link to="/num-partes">Números de Partes</Link>
                    <Link to="/plataformas">Plataformas</Link>
                    <Link to="/defectos">Defectos</Link>
                    <Link to="/proveedores">Proveedores</Link>
                    <Link to="/retrabajos">Retrabajos</Link>
                    <Link to="/turnos">Turnos</Link>
                    <Link to="/cargos">Cargos</Link>
                    <Link to="/incumplimientohoras">Incumplimientos Horas</Link>
                    <Link to="/reporteform">Reportes</Link>
                </nav>
                <button onClick={logout} className="logout">Cerrar sesión</button>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

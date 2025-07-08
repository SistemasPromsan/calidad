import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LayoutPrivado.css'; // estilo que puedes personalizar

export default function LayoutPrivado({ children }: { children: ReactNode }) {
    const { logout } = useAuth();

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <h2 className="logo">Calidad App</h2>
                <nav>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/usuarios">Usuarios</Link>
                    <Link to="/inspectores">Inspectores</Link>
                    <Link to="#">Reportes</Link>
                </nav>
                <button onClick={logout} className="logout">Cerrar sesión</button>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

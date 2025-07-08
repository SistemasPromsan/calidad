import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutasProtegidas({ children }: { children: React.ReactNode }) {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <p>Cargando sesión...</p>; // puedes poner un loader aquí si quieres
    }

    return usuario ? children : <Navigate to="/" replace />;
}

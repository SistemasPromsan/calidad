import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
    children: React.ReactNode;
    rolesPermitidos?: string[]; // Ejemplo: ['administrador']
};

export default function RutasProtegidas({ children, rolesPermitidos }: Props) {
    const { usuario, cargando } = useAuth();

    if (cargando) return <p>Cargando sesión...</p>;

    if (!usuario) return <Navigate to="/" replace />;

    // Validar por rol (normalizando a minúsculas)
    if (
        rolesPermitidos &&
        !rolesPermitidos.map((r) => r.toLowerCase()).includes(usuario.rol.toLowerCase())
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

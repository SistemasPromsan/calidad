import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
    children: React.ReactNode;
    rolesPermitidos?: string[]; // Ej. ['Administrador']
};

// Ajusta este mapeo a tus IDs reales
const ROLE_BY_ID: Record<string, 'administrador' | 'supervisor' | 'capturista'> = {
    '1': 'administrador',
    '2': 'supervisor',
    '3': 'capturista',
};

// Rutas permitidas para supervisor
const ALLOW_SUPERVISOR: (RegExp | string)[] = [
    /^\/dashboard$/,                 // /dashboard
    /^\/reporteform$/,               // /reporteform (crear)
    /^\/reportes\-list(?:\/.*)?$/,   // /reportes-list (+ subrutas futuras)
];

function matchesAny(path: string, patterns: (RegExp | string)[]) {
    return patterns.some((p) => (typeof p === 'string' ? p === path : p.test(path)));
}

function canonicalRole(user: { rol?: string; id_rol?: string | number }) {
    const id = (user?.id_rol ?? '').toString().trim();
    if (id && ROLE_BY_ID[id]) return ROLE_BY_ID[id];

    const text = (user?.rol ?? '').trim().toLowerCase();
    if (/admin/.test(text)) return 'administrador';
    if (/super/.test(text)) return 'supervisor';
    if (/captur/.test(text)) return 'capturista';
    return text || 'supervisor'; // fallback conservador
}

export default function RutasProtegidas({ children, rolesPermitidos }: Props) {
    const { usuario, cargando } = useAuth();
    const { pathname } = useLocation();

    if (cargando) return <p>Cargando sesión...</p>;
    if (!usuario) return <Navigate to="/" replace />;

    const rol = canonicalRole(usuario);

    // 1) El administrador debe ver TODO siempre
    if (rol === 'administrador') {
        return <>{children}</>;
    }

    // 2) Regla fuerte para supervisores: solo allowlist
    if (rol === 'supervisor' && !matchesAny(pathname, ALLOW_SUPERVISOR)) {
        return <Navigate to="/dashboard" replace />;
    }

    // 3) Regla por roles explícitos en la ruta (ej. solo admin)
    if (
        rolesPermitidos &&
        !rolesPermitidos.map((r) => r.toLowerCase()).includes(rol)
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

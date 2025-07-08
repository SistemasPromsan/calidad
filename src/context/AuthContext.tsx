import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Tipo de datos del usuario
type Usuario = {
    id: number;
    nombre: string;
    username: string;
    email: string;
    rol: string;
};

// Tipo de datos del contexto
type AuthContextType = {
    usuario: Usuario | null;
    login: (userData: Usuario) => void;
    logout: () => void;
    cargando: boolean;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('usuario');
        console.log('Cargando desde localStorage...');

        if (stored) {
            const user = JSON.parse(stored);
            //console.log('Usuario encontrado:', user);
            setUsuario(user);

            const intervalo = setInterval(async () => {
                try {
                    const res = await axios.post('http://localhost/calidad/calidad-backend/api/verificar_estado.php', {
                        id: user.id,
                    });
                    console.log('Estado recibido:', res.data.estado);
                    if (res.data.estado === 'inactivo') {
                        alert('Tu cuenta fue desactivada.');
                        logout();
                    }
                } catch (err) {
                    console.error('Error al verificar estado:', err);
                }
            }, 10000);

            setCargando(false); // ← MUY IMPORTANTE: no olvides esta línea
            return () => clearInterval(intervalo);
        } else {
            console.log('No se encontró usuario en localStorage');
            setCargando(false);
        }
    }, []);



    // Función para iniciar sesión
    const login = (userData: Usuario) => {
        setUsuario(userData);
        localStorage.setItem('usuario', JSON.stringify(userData));
        navigate('/dashboard');
    };

    // Función para cerrar sesión
    const logout = () => {
        setUsuario(null);
        localStorage.removeItem('usuario');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para consumir el contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return context;
}

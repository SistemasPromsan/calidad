import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import.meta.env.VITE_API_URL


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/login.php`, {
                username,
                password
            }, {
                withCredentials: false
            });

            if (res.data.success) {
                login(res.data.usuario); // guardar usuario en contexto y redirigir
            } else {
                setMensaje(res.data.error);
            }
        } catch (err) {
            setMensaje('Error al conectar con el servidor');
            console.error(err);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={styles.title}>Iniciar Sesión</h2>

                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    required
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>Ingresar</button>

                {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
            </form>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#f1f5f9',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px 40px',
        borderRadius: 12,
        boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 350,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 15
    },
    title: {
        marginBottom: 10,
        textAlign: 'center' as const
    },
    input: {
        padding: 10,
        borderRadius: 6,
        border: '1px solid #ccc',
        fontSize: 16
    },
    button: {
        padding: 10,
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    mensaje: {
        color: 'red',
        marginTop: 5,
        textAlign: 'center' as const
    }
};

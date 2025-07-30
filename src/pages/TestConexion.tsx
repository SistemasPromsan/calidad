import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../config';

export default function TestConexion() {
    const [estado, setEstado] = useState('Probando conexión...');

    useEffect(() => {
        axios.get(API + 'usuarios.php')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setEstado('✅ Conexión exitosa con el backend');
                } else {
                    setEstado('⚠️ Conexión realizada, pero respuesta inesperada');
                }
            })
            .catch(err => {
                console.error('Error de conexión:', err);
                setEstado('❌ Error al conectar con el backend');
            });
    }, []);

    return (
        <div style={{ padding: 20, fontSize: 18 }}>
            <p><strong>Estado de conexión:</strong></p>
            <p>{estado}</p>
        </div>
    );
}

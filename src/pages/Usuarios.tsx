import { useEffect, useState } from 'react';
import axios from 'axios';
import UsuarioForm from '../components/UsuarioForm';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const cargarUsuarios = async () => {
        try {
            const res = await axios.get('http://localhost/calidad/calidad-backend/api/usuarios.php');
            if (Array.isArray(res.data)) {
                setUsuarios(res.data);
            } else {
                console.error('Respuesta inválida:', res.data);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const desactivarUsuario = async (id: number) => {
        if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
        try {
            const res = await axios.post('http://localhost/calidad/calidad-backend/api/desactivar_usuario.php', { id });
            if (res.data.success) cargarUsuarios();
        } catch (err) {
            console.error(err);
        }
    };

    const activarUsuario = async (id: number) => {
        try {
            await axios.post('http://localhost/calidad/calidad-backend/api/activar_usuario.php', { id });
            alert('Usuario activado');
            cargarUsuarios();
        } catch (error) {
            console.error(error);
            alert('Error al activar el usuario');
        }
    };


    const abrirFormulario = (usuario: any = null) => {
        setUsuarioSeleccionado(usuario);
        setMostrarFormulario(true);
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Usuarios registrados</h2>
            <button onClick={() => abrirFormulario()} style={{ marginBottom: '1rem' }}>
                + Nuevo usuario
            </button>

            <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#007bff', color: '#fff' }}>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id} style={{ background: '#fff', borderBottom: '1px solid #ccc' }}>
                            <td>{u.id}</td>
                            <td>{u.nombre}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.rol}</td>
                            <td>{u.estado}</td>
                            <td>
                                <button onClick={() => abrirFormulario(u)}>Editar</button>
                                <button
                                    onClick={() => (u.estado === 'activo' ? desactivarUsuario(u.id) : activarUsuario(u.id))}
                                    style={{
                                        backgroundColor: u.estado === 'activo' ? '#dc3545' : '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                </button>   
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {mostrarFormulario && (
                <UsuarioForm
                    usuario={usuarioSeleccionado}
                    onSuccess={cargarUsuarios}
                    onClose={() => setMostrarFormulario(false)}
                />
            )}
        </div>
    );
}

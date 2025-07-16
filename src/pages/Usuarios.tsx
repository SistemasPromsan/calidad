import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import API from '../config';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [form, setForm] = useState({
        nombre: '',
        username: '',
        email: '',
        password: '',
        id_rol: '2'
    });
    const [editandoId, setEditandoId] = useState<number | null>(null);

    const cargarUsuarios = async () => {
        try {
            const res = await axios.get(API + 'usuarios.php');
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editandoId
                ? API + 'actualizar_usuario.php'
                : API + 'crear_usuario.php';

            const payload = editandoId ? { ...form, id: editandoId } : form;
            const res = await axios.post(url, payload);

            if (res.data.success) {
                cargarUsuarios();
                setForm({ nombre: '', username: '', email: '', password: '', id_rol: '2' });
                setEditandoId(null);
            } else {
                alert('Error: ' + res.data.error);
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
        }
    };

    const editarUsuario = (usuario: any) => {
        setForm({
            nombre: usuario.nombre,
            username: usuario.username,
            email: usuario.email,
            password: '',
            id_rol: usuario.id_rol
        });
        setEditandoId(usuario.id);
    };

    const desactivarUsuario = async (id: number) => {
        if (!confirm('¿Seguro que deseas desactivar este usuario?')) return;
        await axios.post(API + 'desactivar_usuario.php', { id });
        cargarUsuarios();
    };

    const activarUsuario = async (id: number) => {
        await axios.post(API + 'activar_usuario.php', { id });
        cargarUsuarios();
    };

    return (
        <LayoutPrivado>
            <div style={{ padding: '2rem' }}>
                <h2>Registrar nuevo usuario</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        required
                    />
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Usuario"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Correo"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        required={!editandoId}
                    />
                    <select name="id_rol" value={form.id_rol} onChange={handleChange}>
                        <option value="1">Administrador</option>
                        <option value="2">Supervisor</option>
                        <option value="3">Coordinador</option>
                        <option value="4">Cliente</option>
                    </select>
                    <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px' }}>
                        {editandoId ? 'Actualizar' : 'Guardar'}
                    </button>
                </form>

                <h3>Lista de usuarios</h3>
                <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#007bff', color: '#fff' }}>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Usuario</th>
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
                                    <button onClick={() => editarUsuario(u)}>Editar</button>{' '}
                                    <button
                                        onClick={() => (u.estado === 'activo' ? desactivarUsuario(u.id) : activarUsuario(u.id))}
                                        style={{
                                            backgroundColor: u.estado === 'activo' ? '#dc3545' : '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            marginLeft: '5px'
                                        }}
                                    >
                                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

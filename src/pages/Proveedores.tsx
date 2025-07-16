import React, { useEffect, useState } from 'react';
import LayoutPrivado from '../components/LayoutPrivado';
import axios from 'axios';
import './Proveedores.css';
import API from '../config';

interface Proveedor {
    id?: number;
    nombre: string;
    descripcion: string;
    estatus: string;
}

export default function Proveedores() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [form, setForm] = useState<Partial<Proveedor>>({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const API_URL = API + 'proveedores';

    useEffect(() => {
        obtenerProveedores();
    }, []);

    const obtenerProveedores = async () => {
        try {
            const res = await axios.get(`${API_URL}/proveedores.php`);
            if (Array.isArray(res.data)) {
                setProveedores(res.data);
            } else {
                setProveedores([]);
                console.error('Respuesta inesperada:', res.data);
            }
        } catch (err) {
            console.error('Error al obtener proveedores:', err);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const guardar = async () => {
        try {
            await axios.post(`${API_URL}/crear_proveedor.php`, form);
            setForm({ nombre: '', descripcion: '' });
            obtenerProveedores();
        } catch (err) {
            console.error('Error al crear proveedor:', err);
        }
    };

    const editar = (proveedor: Proveedor) => {
        setModoEdicion(true);
        setForm(proveedor);
    };

    const actualizar = async () => {
        try {
            await axios.put(`${API_URL}/editar_proveedor.php`, form);
            setModoEdicion(false);
            setForm({ nombre: '', descripcion: '' });
            obtenerProveedores();
        } catch (err) {
            console.error('Error al actualizar proveedor:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/desactivar_proveedor.php`, { id });
            obtenerProveedores();
        } catch (err) {
            console.error('Error al desactivar proveedor:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/activar_proveedor.php`, { id });
            obtenerProveedores();
        } catch (err) {
            console.error('Error al activar proveedor:', err);
        }
    };

    const eliminar = async (id: number) => {
        const confirmar = window.confirm('¿Eliminar este proveedor permanentemente?');
        if (!confirmar) return;
        try {
            await axios.delete(`${API_URL}/eliminar_proveedor.php`, {
                data: { id },
            });
            obtenerProveedores();
        } catch (err) {
            console.error('Error al eliminar proveedor:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">{modoEdicion ? 'Editar proveedor' : 'Registrar nuevo proveedor'}</h2>

                <div className="formulario">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre del proveedor"
                        value={form.nombre || ''}
                        onChange={manejarCambio}
                    />
                    <input
                        type="text"
                        name="descripcion"
                        placeholder="Descripción"
                        value={form.descripcion || ''}
                        onChange={manejarCambio}
                    />
                    <button onClick={modoEdicion ? actualizar : guardar}>
                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>

                <h3 className="subtitulo">Lista de proveedores</h3>

                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map((proveedor) => (
                            <tr key={proveedor.id}>
                                <td>{proveedor.id}</td>
                                <td>{proveedor.nombre}</td>
                                <td>{proveedor.descripcion}</td>
                                <td>{proveedor.estatus}</td>
                                <td>
                                    <button onClick={() => editar(proveedor)}>Editar</button>
                                    {proveedor.estatus === 'activo' ? (
                                        <button onClick={() => proveedor.id && desactivar(proveedor.id)} className="btn-rojo">Desactivar</button>
                                    ) : (
                                        <button onClick={() => proveedor.id && activar(proveedor.id)} className="btn-verde">Activar</button>
                                    )}
                                    <button onClick={() => proveedor.id && eliminar(proveedor.id)} className="btn-rojo">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

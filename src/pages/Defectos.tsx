import React, { useEffect, useState } from 'react';
import LayoutPrivado from '../components/LayoutPrivado';
import axios from 'axios';
import './Defectos.css';

interface Defecto {
    id?: number;
    nombre: string;
    descripcion: string;
    estatus: string;
}

export default function Defectos() {
    const [defectos, setDefectos] = useState<Defecto[]>([]);
    const [form, setForm] = useState<Partial<Defecto>>({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const API_URL = 'http://localhost/calidad/calidad-backend/api/defectos';

    useEffect(() => {
        obtenerDefectos();
    }, []);

    const obtenerDefectos = async () => {
        try {
            const res = await axios.get(`${API_URL}/defectos.php`);
            if (Array.isArray(res.data)) {
                setDefectos(res.data);
            } else {
                setDefectos([]);
                console.error('Respuesta inesperada:', res.data);
            }
        } catch (err) {
            console.error('Error al obtener defectos:', err);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const guardar = async () => {
        try {
            await axios.post(`${API_URL}/crear_defecto.php`, form);
            setForm({ nombre: '', descripcion: '' });
            obtenerDefectos();
        } catch (err) {
            console.error('Error al crear defecto:', err);
        }
    };

    const editar = (defecto: Defecto) => {
        setModoEdicion(true);
        setForm(defecto);
    };

    const actualizar = async () => {
        try {
            await axios.put(`${API_URL}/editar_defecto.php`, form);
            setModoEdicion(false);
            setForm({ nombre: '', descripcion: '' });
            obtenerDefectos();
        } catch (err) {
            console.error('Error al actualizar:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/desactivar_defecto.php`, { id });
            obtenerDefectos();
        } catch (err) {
            console.error('Error al desactivar:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/activar_defecto.php`, { id });
            obtenerDefectos();
        } catch (err) {
            console.error('Error al activar:', err);
        }
    };

    const eliminar = async (id: number) => {
        const confirmar = window.confirm('¿Eliminar este defecto permanentemente?');
        if (!confirmar) return;
        try {
            await axios.delete(`${API_URL}/eliminar_defecto.php`, {
                data: { id },
            });
            obtenerDefectos();
        } catch (err) {
            console.error('Error al eliminar:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">{modoEdicion ? 'Editar defecto' : 'Registrar nuevo defecto'}</h2>

                <div className="formulario">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre del defecto"
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

                <h3 className="subtitulo">Lista de defectos</h3>

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
                        {defectos.map((defecto) => (
                            <tr key={defecto.id}>
                                <td>{defecto.id}</td>
                                <td>{defecto.nombre}</td>
                                <td>{defecto.descripcion}</td>
                                <td>{defecto.estatus}</td>
                                <td>
                                    <button onClick={() => editar(defecto)}>Editar</button>
                                    {defecto.estatus === 'activo' ? (
                                        <button onClick={() => defecto.id && desactivar(defecto.id)} className="btn-rojo">Desactivar</button>
                                    ) : (
                                        <button onClick={() => defecto.id && activar(defecto.id)} className="btn-verde">Activar</button>
                                    )}
                                    <button onClick={() => defecto.id && eliminar(defecto.id)} className="btn-rojo">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

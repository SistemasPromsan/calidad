import React, { useEffect, useState } from 'react';
import LayoutPrivado from '../components/LayoutPrivado';
import axios from 'axios';
import './Plataformas.css';

interface Plataforma {
    id?: number;
    nombre: string;
    descripcion: string;
    estatus: string;
}

export default function Plataformas() {
    const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
    const [form, setForm] = useState<Partial<Plataforma>>({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const API_URL = 'http://localhost/calidad/calidad-backend/api/plataformas';

    useEffect(() => {
        obtenerPlataformas();
    }, []);

    const obtenerPlataformas = async () => {
        try {
            const res = await axios.get(`${API_URL}/plataformas.php`);
            if (Array.isArray(res.data)) {
                setPlataformas(res.data);
            } else {
                console.error("Respuesta inesperada:", res.data);
                setPlataformas([]);
            }
        } catch (err) {
            console.error('Error al obtener plataformas:', err);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const guardar = async () => {
        try {
            await axios.post(`${API_URL}/crear_plataforma.php`, form);
            setForm({ nombre: '', descripcion: '' });
            obtenerPlataformas();
        } catch (err) {
            console.error('Error al crear plataforma:', err);
        }
    };

    const editar = (plataforma: Plataforma) => {
        setModoEdicion(true);
        setForm(plataforma);
    };

    const actualizar = async () => {
        try {
            await axios.put(`${API_URL}/editar_plataforma.php`, form);
            setModoEdicion(false);
            setForm({ nombre: '', descripcion: '' });
            obtenerPlataformas();
        } catch (err) {
            console.error('Error al actualizar plataforma:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/desactivar_plataforma.php`, { id });
            obtenerPlataformas();
        } catch (err) {
            console.error('Error al desactivar plataforma:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/activar_plataforma.php`, { id });
            obtenerPlataformas();
        } catch (err) {
            console.error('Error al activar plataforma:', err);
        }
    };

    const eliminar = async (id: number) => {
        const confirmar = window.confirm("¿Eliminar esta plataforma permanentemente?");
        if (!confirmar) return;
        try {
            await axios.delete(`${API_URL}/eliminar_plataforma.php`, {
                data: { id }
            });
            obtenerPlataformas();
        } catch (err) {
            console.error('Error al eliminar plataforma:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">{modoEdicion ? 'Editar plataforma' : 'Registrar nueva plataforma'}</h2>

                <div className="formulario">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre de la plataforma"
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

                <h3 className="subtitulo">Lista de plataformas</h3>

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
                        {plataformas.map((plataforma) => (
                            <tr key={plataforma.id}>
                                <td>{plataforma.id}</td>
                                <td>{plataforma.nombre}</td>
                                <td>{plataforma.descripcion}</td>
                                <td>{plataforma.estatus}</td>
                                <td>
                                    <button onClick={() => editar(plataforma)}>Editar</button>
                                    {plataforma.estatus === 'activo' ? (
                                        <button onClick={() => plataforma.id && desactivar(plataforma.id)} className="btn-rojo">Desactivar</button>
                                    ) : (
                                        <button onClick={() => plataforma.id && activar(plataforma.id)} className="btn-verde">Activar</button>
                                    )}
                                    <button onClick={() => plataforma.id && eliminar(plataforma.id)} className="btn-rojo">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

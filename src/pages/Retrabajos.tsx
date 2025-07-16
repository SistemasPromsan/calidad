import React, { useEffect, useState } from 'react';
import LayoutPrivado from '../components/LayoutPrivado';
import axios from 'axios';
import './Retrabajos.css';
import API from '../config';

interface Retrabajo {
    id?: number;
    nombre: string;
    descripcion: string;
    estatus: string;
}

export default function Retrabajos() {
    const [retrabajos, setRetrabajos] = useState<Retrabajo[]>([]);
    const [form, setForm] = useState<Partial<Retrabajo>>({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const endpoint = `${API}retrabajos/`;

    useEffect(() => {
        obtenerRetrabajos();
    }, []);

    const obtenerRetrabajos = async () => {
        try {
            const res = await axios.get(`${endpoint}retrabajos.php`);
            setRetrabajos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error al obtener retrabajos:', err);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const guardar = async () => {
        try {
            await axios.post(`${endpoint}crear_retrabajo.php`, form);
            setForm({ nombre: '', descripcion: '' });
            obtenerRetrabajos();
        } catch (err) {
            console.error('Error al crear retrabajo:', err);
        }
    };

    const editar = (retrabajo: Retrabajo) => {
        setModoEdicion(true);
        setForm(retrabajo);
    };

    const actualizar = async () => {
        try {
            await axios.put(`${endpoint}editar_retrabajo.php`, form);
            setModoEdicion(false);
            setForm({ nombre: '', descripcion: '' });
            obtenerRetrabajos();
        } catch (err) {
            console.error('Error al actualizar retrabajo:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${endpoint}desactivar_retrabajo.php`, { id });
            obtenerRetrabajos();
        } catch (err) {
            console.error('Error al desactivar retrabajo:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${endpoint}activar_retrabajo.php`, { id });
            obtenerRetrabajos();
        } catch (err) {
            console.error('Error al activar retrabajo:', err);
        }
    };

    const eliminar = async (id: number) => {
        const confirmar = window.confirm('¿Eliminar este retrabajo permanentemente?');
        if (!confirmar) return;
        try {
            await axios.delete(`${endpoint}eliminar_retrabajo.php`, {
                data: { id },
            });
            obtenerRetrabajos();
        } catch (err) {
            console.error('Error al eliminar retrabajo:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">{modoEdicion ? 'Editar retrabajo' : 'Registrar nuevo retrabajo'}</h2>

                <div className="formulario">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre del retrabajo"
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

                <h3 className="subtitulo">Lista de retrabajos</h3>

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
                        {retrabajos.map((retrabajo) => (
                            <tr key={retrabajo.id}>
                                <td>{retrabajo.id}</td>
                                <td>{retrabajo.nombre}</td>
                                <td>{retrabajo.descripcion}</td>
                                <td>{retrabajo.estatus}</td>
                                <td>
                                    <button onClick={() => editar(retrabajo)}>Editar</button>
                                    {retrabajo.estatus === 'activo' ? (
                                        <button onClick={() => retrabajo.id && desactivar(retrabajo.id)} className="btn-rojo">Desactivar</button>
                                    ) : (
                                        <button onClick={() => retrabajo.id && activar(retrabajo.id)} className="btn-verde">Activar</button>
                                    )}
                                    <button onClick={() => retrabajo.id && eliminar(retrabajo.id)} className="btn-rojo">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

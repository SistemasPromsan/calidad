import React, { useEffect, useState } from 'react';
import LayoutPrivado from '../components/LayoutPrivado';
import axios from 'axios';
import './Turnos.css';
import API from '../config';

interface Turno {
    id?: number;
    nombre: string;
    descripcion: string;
    estatus: string;
}

export default function Turnos() {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [form, setForm] = useState<Partial<Turno>>({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const endpoint = `${API}turnos/`;

    useEffect(() => {
        obtenerTurnos();
    }, []);

    const obtenerTurnos = async () => {
        try {
            const res = await axios.get(`${endpoint}turnos.php`);
            setTurnos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error al obtener turnos:', err);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const guardar = async () => {
        try {
            await axios.post(`${endpoint}crear_turno.php`, form);
            setForm({ nombre: '', descripcion: '' });
            obtenerTurnos();
        } catch (err) {
            console.error('Error al crear turno:', err);
        }
    };

    const editar = (turno: Turno) => {
        setModoEdicion(true);
        setForm(turno);
    };

    const actualizar = async () => {
        try {
            await axios.put(`${endpoint}editar_turno.php`, form);
            setModoEdicion(false);
            setForm({ nombre: '', descripcion: '' });
            obtenerTurnos();
        } catch (err) {
            console.error('Error al actualizar turno:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${endpoint}desactivar_turno.php`, { id });
            obtenerTurnos();
        } catch (err) {
            console.error('Error al desactivar turno:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${endpoint}activar_turno.php`, { id });
            obtenerTurnos();
        } catch (err) {
            console.error('Error al activar turno:', err);
        }
    };

    const eliminar = async (id: number) => {
        const confirmar = window.confirm('¿Eliminar este turno permanentemente?');
        if (!confirmar) return;
        try {
            await axios.delete(`${endpoint}eliminar_turno.php`, {
                data: { id },
            });
            obtenerTurnos();
        } catch (err) {
            console.error('Error al eliminar turno:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">{modoEdicion ? 'Editar turno' : 'Registrar nuevo turno'}</h2>

                <div className="formulario">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre del turno"
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

                <h3 className="subtitulo">Lista de turnos</h3>

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
                        {turnos.map((turno) => (
                            <tr key={turno.id}>
                                <td>{turno.id}</td>
                                <td>{turno.nombre}</td>
                                <td>{turno.descripcion}</td>
                                <td>{turno.estatus}</td>
                                <td>
                                    <button onClick={() => editar(turno)}>Editar</button>
                                    {turno.estatus === 'activo' ? (
                                        <button onClick={() => turno.id && desactivar(turno.id)} className="btn-rojo">Desactivar</button>
                                    ) : (
                                        <button onClick={() => turno.id && activar(turno.id)} className="btn-verde">Activar</button>
                                    )}
                                    <button onClick={() => turno.id && eliminar(turno.id)} className="btn-rojo">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

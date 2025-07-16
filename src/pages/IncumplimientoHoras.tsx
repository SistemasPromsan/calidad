import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import './IncumplimientoHoras.css';
import API from '../config';

export default function IncumplimientoHoras() {
    const [registros, setRegistros] = useState([]);
    const [formulario, setFormulario] = useState({ id: null, nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const endpoint = `${API}incumplimiento_horas/`;

    useEffect(() => {
        obtenerRegistros();
    }, []);

    const obtenerRegistros = async () => {
        try {
            const res = await axios.get(`${endpoint}incumplimiento_horas.php`);
            setRegistros(res.data);
        } catch (err) {
            console.error('Error al obtener registros:', err);
        }
    };

    const guardar = async () => {
        if (!formulario.nombre.trim() || !formulario.descripcion.trim()) {
            alert('Por favor, completa todos los campos antes de guardar.');
            return;
        }

        try {
            await axios.post(`${endpoint}crear_incumplimiento_horas.php`, {
                nombre: formulario.nombre,
                descripcion: formulario.descripcion
            });
            setFormulario({ id: null, nombre: '', descripcion: '' });
            obtenerRegistros();
        } catch (err) {
            console.error('Error al guardar:', err);
        }
    };

    const actualizar = async () => {
        try {
            await axios.post(`${endpoint}editar_incumplimiento_horas.php`, formulario);
            setFormulario({ id: null, nombre: '', descripcion: '' });
            setModoEdicion(false);
            obtenerRegistros();
        } catch (err) {
            console.error('Error al actualizar:', err);
        }
    };

    const editar = (registro: any) => {
        setFormulario({
            id: registro.id,
            nombre: registro.nombre,
            descripcion: registro.descripcion
        });
        setModoEdicion(true);
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${endpoint}desactivar_incumplimiento_horas.php`, { id });
            obtenerRegistros();
        } catch (err) {
            console.error('Error al desactivar:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${endpoint}activar_incumplimiento_horas.php`, { id });
            obtenerRegistros();
        } catch (err) {
            console.error('Error al activar:', err);
        }
    };

    const eliminar = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este registro permanentemente?')) return;
        try {
            await axios.delete(`${endpoint}eliminar_incumplimiento_horas.php`, {
                data: { id }
            });
            obtenerRegistros();
        } catch (err) {
            console.error('Error al eliminar:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">Catálogo: Incumplimiento de Horas</h2>

                <div className="formulario">
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={formulario.nombre}
                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={formulario.descripcion}
                        onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                    />

                    {modoEdicion ? (
                        <button onClick={actualizar}>Actualizar</button>
                    ) : (
                        <button onClick={guardar}>Guardar</button>
                    )}
                </div>

                <table className="tabla">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.map((r: any) => (
                            <tr key={r.id}>
                                <td>{r.nombre}</td>
                                <td>{r.descripcion}</td>
                                <td>{r.estatus}</td>
                                <td>
                                    <button className="btn-verde" onClick={() => editar(r)}>Editar</button>
                                    {r.estatus === 'activo' ? (
                                        <button className="btn-rojo" onClick={() => desactivar(r.id)}>Desactivar</button>
                                    ) : (
                                        <>
                                            <button className="btn-verde" onClick={() => activar(r.id)}>Activar</button>
                                            <button className="btn-rojo" onClick={() => eliminar(r.id)}>Eliminar</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

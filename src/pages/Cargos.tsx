import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import './Cargos.css';
import API from '../config';

interface Cargo {
    id: number;
    nombre: string;
    descripcion: string;
    estatus: string;
}

export default function Cargos() {
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [formulario, setFormulario] = useState({ id: null as number | null, nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const obtenerCargos = async () => {
        try {
            const res = await axios.get(`${API}cargos/cargos.php`);
            setCargos(res.data);
        } catch (err) {
            console.error('Error al obtener cargos:', err);
        }
    };

    useEffect(() => {
        obtenerCargos();
    }, []);

    const guardar = async () => {
        if (!formulario.nombre.trim()) return;

        try {
            await axios.post(`${API}cargos/crear_cargo.php`, {
                nombre: formulario.nombre,
                descripcion: formulario.descripcion
            });
            setFormulario({ id: null, nombre: '', descripcion: '' });
            obtenerCargos();
        } catch (err) {
            console.error('Error al crear cargo:', err);
        }
    };

    const editar = (cargo: Cargo) => {
        setFormulario({ id: cargo.id, nombre: cargo.nombre, descripcion: cargo.descripcion });
        setModoEdicion(true);
    };

    const actualizar = async () => {
        try {
            await axios.post(`${API}cargos/editar_cargo.php`, {
                id: formulario.id,
                nombre: formulario.nombre,
                descripcion: formulario.descripcion
            });
            setFormulario({ id: null, nombre: '', descripcion: '' });
            setModoEdicion(false);
            obtenerCargos();
        } catch (err) {
            console.error('Error al actualizar cargo:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${API}cargos/desactivar_cargo.php`, { id });
            obtenerCargos();
        } catch (err) {
            console.error('Error al desactivar cargo:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${API}cargos/activar_cargo.php`, { id });
            obtenerCargos();
        } catch (err) {
            console.error('Error al activar cargo:', err);
        }
    };

    const eliminar = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este cargo permanentemente?')) return;
        try {
            await axios.delete(`${API}cargos/eliminar_cargo.php`, {
                data: { id }
            });
            obtenerCargos();
        } catch (err) {
            console.error('Error al eliminar cargo:', err);
        }
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">Cargos</h2>

                <div className="formulario">
                    <input
                        type="text"
                        placeholder="Nombre del cargo"
                        value={formulario.nombre}
                        onChange={(e) =>
                            setFormulario({ ...formulario, nombre: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={formulario.descripcion}
                        onChange={(e) =>
                            setFormulario({ ...formulario, descripcion: e.target.value })
                        }
                    />
                    <button onClick={modoEdicion ? actualizar : guardar}>
                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                    </button>
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
                        {cargos.map((c) => (
                            <tr key={c.id}>
                                <td>{c.nombre}</td>
                                <td>{c.descripcion}</td>
                                <td>{c.estatus}</td>
                                <td>
                                    <button className="btn-azul" onClick={() => editar(c)}>Editar</button>
                                    {c.estatus === 'activo' ? (
                                        <button className="btn-rojo" onClick={() => desactivar(c.id)}>Desactivar</button>
                                    ) : (
                                        <button className="btn-verde" onClick={() => activar(c.id)}>Activar</button>
                                    )}
                                    <button className="btn-rojo" onClick={() => eliminar(c.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

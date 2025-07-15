import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import './Cargos.css';

const API = 'http://localhost/calidad/calidad-backend/api/cargos';

export default function Cargos() {
    const [cargos, setCargos] = useState([]);
    const [formulario, setFormulario] = useState({ id: null, nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    useEffect(() => {
        obtenerCargos();
    }, []);

    const obtenerCargos = async () => {
        try {
            const res = await axios.get(`${API}/cargos.php`);
            setCargos(res.data);
        } catch (err) {
            console.error('Error al obtener cargos:', err);
        }
    };

    const guardar = async () => {
        if (!formulario.nombre.trim()) return;

        try {
            await axios.post(`${API}/crear_cargo.php`, { nombre: formulario.nombre, descripcion: formulario.descripcion });
            setFormulario({ id: null, nombre: '', descripcion: '' });
            obtenerCargos();
        } catch (err) {
            console.error('Error al crear cargo:', err);
        }
    };

    const editar = (cargo: any) => {
        setFormulario({ id: cargo.id, nombre: cargo.nombre, descripcion: cargo.descripcion });
        setModoEdicion(true);
    };

    const actualizar = async () => {
        try {
            await axios.post(`${API}/editar_cargo.php`, { id: formulario.id, nombre: formulario.nombre, descripcion: formulario.descripcion });
            setFormulario({ id: null, nombre: '', descripcion: '' });
            setModoEdicion(false);
            obtenerCargos();
        } catch (err) {
            console.error('Error al actualizar cargo:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${API}/desactivar_cargo.php`, { id });
            obtenerCargos();
        } catch (err) {
            console.error('Error al desactivar:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${API}/activar_cargo.php`, { id });
            obtenerCargos();
        } catch (err) {
            console.error('Error al activar:', err);
        }
    };

    const eliminar = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este cargo permanentemente?')) return;
        try {
            await axios.delete(`${API}/eliminar_cargo.php`, {
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
                        {cargos.map((c: any) => (
                            <tr key={c.id}>
                                <td>{c.nombre}</td>
                                <td>{c.descripcion}</td>
                                <td>{c.estatus}</td>
                                <td>
                                    <button className="btn-azul" onClick={() => editar(c)}>
                                        Editar
                                    </button>
                                    {c.estatus === 'activo' ? (
                                        <button className="btn-rojo" onClick={() => desactivar(c.id)}>
                                            Desactivar
                                        </button>
                                    ) : (
                                        <button className="btn-verde" onClick={() => activar(c.id)}>
                                            Activar
                                        </button>
                                    )}
                                    <button className="btn-rojo" onClick={() => eliminar(c.id)}>Eliminar    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

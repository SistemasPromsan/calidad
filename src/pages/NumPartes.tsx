import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import './NumPartes.css';

type NumParte = {
    id: number;
    num_parte: string;
    descripcion: string;
    estatus: string;
};

export default function NumPartes() {
    const [numPartes, setNumPartes] = useState<NumParte[]>([]);
    const [form, setForm] = useState<Partial<NumParte>>({ num_parte: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);

    const API_URL = 'http://localhost/calidad/calidad-backend/api/num_partes';

    useEffect(() => {
        obtenerNumPartes();
    }, []);

    const obtenerNumPartes = async () => {
        try {
            const res = await axios.get(`${API_URL}/num_partes.php`);
            setNumPartes(res.data);
        } catch (err) {
            console.error('Error al obtener partes:', err);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const guardar = async () => {
        try {
            await axios.post(`${API_URL}/crear_num_parte.php`, form);
            setForm({ num_parte: '', descripcion: '' });
            obtenerNumPartes();
        } catch (err) {
            console.error('Error al crear parte:', err);
        }
    };

    const editar = (parte: NumParte) => {
        setModoEdicion(true);
        setForm(parte);
    };

    const actualizar = async () => {
        try {
            await axios.put(`${API_URL}/editar_num_parte.php`, form);
            setForm({ num_parte: '', descripcion: '' });
            setModoEdicion(false);
            obtenerNumPartes();
        } catch (err) {
            console.error('Error al actualizar:', err);
        }
    };

    const desactivar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/desactivar_num_parte.php`, { id });
            obtenerNumPartes();
        } catch (err) {
            console.error('Error al desactivar:', err);
        }
    };

    const activar = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/activar_num_parte.php`, { id });
            obtenerNumPartes();
        } catch (err) {
            console.error('Error al activar:', err);
        }
    };

    const eliminar = async (id: number) => {
        const confirmar = window.confirm("¿Estás seguro de eliminar este número de parte permanentemente?");
        if (!confirmar) return;

        try {
            await axios.delete(`${API_URL}/eliminar_num_parte.php`, {
                data: { id }
            });
            obtenerNumPartes();
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };


    return (
        <LayoutPrivado>
            <div className="contenido">
                <h2 className="titulo">{modoEdicion ? 'Editar número de parte' : 'Registrar número de parte'}</h2>

                <div className="formulario">
                    <input
                        type="text"
                        name="num_parte"
                        placeholder="Número de parte"
                        value={form.num_parte}
                        onChange={manejarCambio}
                    />
                    <input
                        type="text"
                        name="descripcion"
                        placeholder="Descripción"
                        value={form.descripcion}
                        onChange={manejarCambio}
                    />
                    <button onClick={modoEdicion ? actualizar : guardar}>
                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>

                <h3 className="subtitulo">Lista de números de parte</h3>

                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Número de parte</th>
                            <th>Descripción</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {numPartes.map((parte) => (
                            <tr key={parte.id}>
                                <td>{parte.id}</td>
                                <td>{parte.num_parte}</td>
                                <td>{parte.descripcion}</td>
                                <td>{parte.estatus}</td>
                                <td>
                                    <button onClick={() => editar(parte)}>Editar</button>
                                    {parte.estatus === 'activo' ? (
                                        <button onClick={() => desactivar(parte.id)} className="btn-rojo">Desactivar</button>
                                    ) : (
                                        <button onClick={() => activar(parte.id)} className="btn-verde">Activar</button>
                                    )}
                                    <button onClick={() => eliminar(parte.id)} className="btn-rojo">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

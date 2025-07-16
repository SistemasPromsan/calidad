import { useEffect, useState } from 'react';
import axios from 'axios';
import './NumPartes.css';
import LayoutPrivado from '../components/LayoutPrivado';

import API from '../config';

type NumParte = {
    id?: number;
    num_parte: string;
    descripcion: string;
    id_plataforma: number;
    plataforma?: string;
    proveedores: any[];
};

type Plataforma = {
    id: number;
    nombre: string;
};

type Proveedor = {
    id: number;
    nombre: string;
};

export default function NumPartes() {
    const [numPartes, setNumPartes] = useState<NumParte[]>([]);
    const [formulario, setFormulario] = useState<NumParte>({
        num_parte: '',
        descripcion: '',
        id_plataforma: 0,
        proveedores: [],
    });
    const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);

    useEffect(() => {
        obtenerNumPartes();
        obtenerPlataformas();
        obtenerProveedores();
    }, []);

    const obtenerNumPartes = async () => {
        try {
            const res = await axios.get(`${API}num_partes/num_partes.php`);
            setNumPartes(res.data);
        } catch (error) {
            console.error('Error al obtener num_partes:', error);
        }
    };

    const obtenerPlataformas = async () => {
        try {
            const res = await axios.get(`${API}plataformas/plataformas.php`);
            setPlataformas(res.data);
        } catch (error) {
            console.error('Error al obtener plataformas:', error);
        }
    };

    const obtenerProveedores = async () => {
        try {
            const res = await axios.get(`${API}proveedores/proveedores.php`);
            setProveedores(res.data);
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
        }
    };

    const guardar = async () => {
        try {
            await axios.post(`${API}num_partes/crear_num_parte.php`, formulario);
            obtenerNumPartes();
            limpiar();
        } catch (error) {
            console.error('Error al crear num_parte:', error);
        }
    };

    const actualizar = async () => {
        try {
            await axios.put(`${API}num_partes/editar_num_parte.php`, formulario);
            obtenerNumPartes();
            limpiar();
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
    };

    const editar = (np: NumParte) => {
        setFormulario({
            id: np.id,
            num_parte: np.num_parte,
            descripcion: np.descripcion,
            id_plataforma: np.id_plataforma,
            proveedores: np.proveedores.map((p: any) => p.id),
        });
    };

    const limpiar = () => {
        setFormulario({ num_parte: '', descripcion: '', id_plataforma: 0, proveedores: [] });
    };

    return (
        <LayoutPrivado>
            <div className="contenido">
                <h1 className="titulo">Catálogo de Números de Parte</h1>

                <div className="formulario">
                    <input
                        type="text"
                        placeholder="Número de Parte"
                        value={formulario.num_parte}
                        onChange={(e) => setFormulario({ ...formulario, num_parte: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={formulario.descripcion}
                        onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                    />

                    <select
                        value={formulario.id_plataforma || ''}
                        onChange={(e) => setFormulario({ ...formulario, id_plataforma: parseInt(e.target.value) })}
                    >
                        <option value=''>Selecciona una plataforma</option>
                        {plataformas.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>

                    <select
                        multiple
                        value={formulario.proveedores.map(String)}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
                            setFormulario({ ...formulario, proveedores: selected });
                        }}
                    >
                        {proveedores.map((prov) => (
                            <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                        ))}
                    </select>

                    {formulario.id ? (
                        <button onClick={actualizar}>Actualizar</button>
                    ) : (
                        <button onClick={guardar}>Guardar</button>
                    )}
                </div>

                <h2 className="subtitulo">Lista</h2>
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Número de Parte</th>
                            <th>Descripción</th>
                            <th>Plataforma</th>
                            <th>Proveedores</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {numPartes.map((np) => (
                            <tr key={np.id}>
                                <td>{np.id}</td>
                                <td>{np.num_parte}</td>
                                <td>{np.descripcion}</td>
                                <td>{np.plataforma || '-'}</td>
                                <td>
                                    {np.proveedores && np.proveedores.length > 0
                                        ? np.proveedores.map((p: any) => p.nombre).join(', ')
                                        : '-'}
                                </td>
                                <td>
                                    <button onClick={() => editar(np)}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

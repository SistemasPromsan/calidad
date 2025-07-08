import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LayoutPrivado from '../components/LayoutPrivado';

type Inspector = {
    id: number;
    inspector: string;
    descripcion: string;
    estatus: string;
    creado_en: string;
};

export default function Inspectores() {
    const [inspectores, setInspectores] = useState<Inspector[]>([]);
    const { usuario } = useAuth();

    useEffect(() => {
        fetchInspectores();
    }, []);

    const fetchInspectores = async () => {
        try {
            const res = await axios.get('http://localhost/calidad/calidad-backend/api/inspectores/inspectores.php');
            setInspectores(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar inspectores:", error);
        }
    };      

    const desactivarInspector = async (id: number) => {
        try {
            await axios.patch('http://localhost/calidad/calidad-backend/api/inspectores/desactivar_inspector.php', { id });
            fetchInspectores();
        } catch (error) {
            console.error("Error al desactivar inspector:", error);
        }
    };

    const eliminarInspector = async (id: number) => {
        try {
            await axios.post('http://localhost/calidad/calidad-backend/api/inspectores/eliminar_inspector.php', {
                id,
                rol: usuario?.rol || ''
            });
            fetchInspectores();
        } catch (error) {
            console.error("Error al eliminar inspector:", error);
        }
    };

    return (
        <LayoutPrivado>
            <div className="p-6 w-full">
                <h1>Listado de Inspectores</h1>
                <button style={{ marginBottom: '10px' }}>+ Nuevo inspector</button>

                <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Inspector</th>
                            <th>Descripción</th>
                            <th>Estatus</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inspectores.map((i) => (
                            <tr key={i.id}>
                                <td>{i.id}</td>
                                <td>{i.inspector}</td>
                                <td>{i.descripcion}</td>
                                <td>{i.estatus}</td>
                                <td>{new Date(i.creado_en).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => console.log('Editar', i)}>Editar</button>
                                    {' '}
                                    <button onClick={() => desactivarInspector(i.id)}>Desactivar</button>
                                    {' '}
                                    {usuario?.rol === 'admin' && (
                                        <button onClick={() => eliminarInspector(i.id)} style={{ color: 'red' }}>
                                            Eliminar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {inspectores.length === 0 && (
                            <tr>
                                <td colSpan={6}>No hay inspectores registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </LayoutPrivado>
    );
}

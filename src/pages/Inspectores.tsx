import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import InspectorForm from '../components/InspectorForm';
import API from '../config';

type Inspector = {
    id: number;
    nombre: string;
    descripcion: string;
    estatus: string;
    creado_en: string;
};

export default function Inspectores() {
    const [inspectores, setInspectores] = useState<Inspector[]>([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [inspectorSeleccionado, setInspectorSeleccionado] = useState<Inspector | null>(null);

    useEffect(() => {
        fetchInspectores();
    }, []);

    const fetchInspectores = async () => {
        try {
            const res = await axios.get(API + 'inspectores/inspectores.php');

            // Como el backend devuelve directamente un array:
            if (Array.isArray(res.data)) {
                setInspectores(res.data);
                console.log("Inspectores cargados:", res.data);
            } else {
                setInspectores([]);
                console.error('Respuesta inesperada:', res.data);
            }
        } catch (error) {
            console.error("Error al cargar inspectores:", error);
        }
    };

    const desactivarInspector = async (id: number) => {
        if (!confirm("¿Deseas desactivar este inspector?")) return;
        try {
            const res = await axios.post(API + 'inspectores/desactivar_inspector.php', { id });
            if (res.data.success) {
                alert('Inspector desactivado correctamente.');
                fetchInspectores();
            } else {
                alert('No se pudo desactivar el inspector.');
            }
        } catch (error) {
            console.error("Error al desactivar inspector:", error);
            alert('Hubo un error al intentar desactivar el inspector.');
        }
    };

    const activarInspector = async (id: number) => {
        try {
            const res = await axios.post(API + 'inspectores/activar_inspector.php', { id });
            if (res.data.success) {
                alert('Inspector activado correctamente.');
                fetchInspectores();
            } else {
                alert('No se pudo activar el inspector.');
            }
        } catch (error) {
            console.error("Error al activar inspector:", error);
            alert('Hubo un error al intentar activar el inspector.');
        }
    };




    const eliminarInspector = async (id: number) => {
        if (!confirm("¿Eliminar permanentemente este inspector?")) return;
        try {
            await axios.post(API + 'inspectores/eliminar_inspector.php', {
                id,
                rol: 'admin' // puedes reemplazarlo por el rol dinámico si lo tienes
            });
            fetchInspectores();
        } catch (error) {
            console.error("Error al eliminar inspector:", error);
        }
    };

    const abrirFormulario = (inspector: Inspector | null = null) => {
        setInspectorSeleccionado(inspector);
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setInspectorSeleccionado(null);
        setMostrarFormulario(false);
    };

    return (
        <LayoutPrivado>
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">Listado de Inspectores</h1>
                <button
                    onClick={() => abrirFormulario()}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    + Nuevo inspector
                </button>

                <table width="100%" cellPadding={10} style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#007bff', color: '#fff' }}>
                            <th>ID</th>
                            <th>Inspector</th>
                            <th>Descripción</th>
                            <th>Estatus</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inspectores.length > 0 ? (
                            inspectores.map((i) => (
                                <tr key={i.id} style={{ background: '#fff', borderBottom: '1px solid #ccc' }}>
                                    <td>{i.id}</td>
                                    <td>{i.nombre}</td>
                                    <td>{i.descripcion}</td>
                                    <td>{i.estatus}</td>
                                    <td>{new Date(i.creado_en).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => abrirFormulario(i)}>Editar</button>
                                        {' '}
                                        <button
                                            onClick={() =>
                                                i.estatus === 'activo'
                                                    ? desactivarInspector(i.id)
                                                    : activarInspector(i.id)
                                            }
                                            style={{
                                                backgroundColor: i.estatus === 'activo' ? '#dc3545' : '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                marginLeft: '5px'
                                            }}
                                        >
                                            {i.estatus === 'activo' ? 'Desactivar' : 'Activar'}
                                        </button>
                                        {' '}
                                        <button
                                            onClick={() => eliminarInspector(i.id)}
                                            style={{ color: 'red', marginLeft: '5px' }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6}>No hay inspectores registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {mostrarFormulario && (
                    <InspectorForm
                        inspector={inspectorSeleccionado ?? null}
                        onSuccess={() => {
                            fetchInspectores();
                            cerrarFormulario();
                        }}
                        onClose={cerrarFormulario}
                    />
                )}
            </div>
        </LayoutPrivado>
    );
}

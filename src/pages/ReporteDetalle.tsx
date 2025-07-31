import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Alert } from "react-bootstrap";
import LayoutPrivado from "../components/LayoutPrivado";
import { API_URL } from "../config/api";


export default function ReporteDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [reporte, setReporte] = useState<any>(null);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        if (!id) return;

        axios.get(`${API_URL}/reportes/obtener_reporte_detalle.php?id=${id}`)
            .then(res => {
                setReporte(res.data);
            })
            .catch(err => {
                console.error(err);
                setMensaje("Error al obtener el detalle del reporte.");
            });
    }, [id]);


    const handleEliminar = () => {
        if (!window.confirm("¿Seguro que deseas eliminar este reporte?")) return;

        axios.post(`${API_URL}/reportes/eliminar_reporte.php`, { id })
            .then(() => {
                alert("Reporte eliminado.");
                navigate("/reportes");
            })
            .catch(() => alert("Error al eliminar el reporte."));
    };

    if (!reporte) return <p>Cargando...</p>;

    return (
        <LayoutPrivado>
            <div className="container mt-4">
                <h3>Detalle del Reporte #{reporte.id}</h3>
                {mensaje && <Alert variant="danger">{mensaje}</Alert>}

                <p><strong>Fecha:</strong> {reporte.fecha}</p>
                <p><strong>Inspector:</strong> {reporte.inspector}</p>
                <p><strong>Supervisor:</strong> {reporte.supervisor}</p>
                <p><strong>Turno:</strong> {reporte.turno}</p>
                <p><strong>Horas trabajadas:</strong> {reporte.horas_trabajadas}</p>

                <h5>Inspecciones</h5>
                {reporte.inspecciones.map((insp: any, i: number) => (
                    <div key={i} className="border p-3 mb-3 rounded">
                        <p><strong>No. Parte:</strong> {insp.id_num_parte}</p>
                        <p><strong>Descripción:</strong> {insp.descripcion}</p>
                        <p><strong>Proveedor:</strong> {insp.proveedor}</p>
                        <p><strong>LPN:</strong> {insp.lpn}</p>
                        <p><strong>Lote:</strong> {insp.lote}</p>
                        <p><strong>Hora inicio:</strong> {insp.hora_inicio} / <strong>Hora fin:</strong> {insp.hora_fin}</p>
                        <p><strong>Pzas inspeccionadas:</strong> {insp.piezas_inspeccionadas}, <strong>OK:</strong> {insp.piezas_ok}, <strong>No OK:</strong> {insp.piezas_no_ok}</p>
                        <p><strong>Total retrabajos:</strong> {insp.total_retrabajos}</p>
                        <p><strong>Observaciones:</strong> {insp.observaciones}</p>

                        <h6>Retrabajos</h6>
                        <ul>
                            {insp.retrabajos.map((r: any, j: number) => (
                                <li key={j}>{r.motivo} - {r.cantidad}</li>
                            ))}
                        </ul>

                        <h6>Rechazos</h6>
                        <ul>
                            {insp.rechazos.map((d: any, j: number) => (
                                <li key={j}>{d.motivo} - {d.cantidad}</li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="mt-3">
                    <Button variant="warning" onClick={() => navigate(`/reporte-editar?id=${reporte.id}`)}>Editar</Button>

                    <Button variant="danger" onClick={handleEliminar}>Eliminar</Button>
                </div>
            </div>
        </LayoutPrivado>
    );
}

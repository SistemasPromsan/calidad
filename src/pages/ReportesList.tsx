import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Alert } from 'react-bootstrap';
import { API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import LayoutPrivado from '../components/LayoutPrivado';

export default function ReportesList() {
    const navigate = useNavigate();
    const [reportes, setReportes] = useState([]);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        obtenerReportes();
    }, []);

    const obtenerReportes = () => {
        axios.post(`${API_URL}/reportes/obtener_reportes.php`, {}, {
            headers: { "Content-Type": "application/json" }
        })
            .then(res => setReportes(res.data))
            .catch(() => setMensaje("Error al cargar reportes"));
    };



    return (
        <LayoutPrivado>
            <div className="container mt-4">
                <h4>Lista de Reportes</h4>
                {mensaje && <Alert variant="danger">{mensaje}</Alert>}

                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Inspector</th>
                            <th>Supervisor</th>
                            <th>Turno</th>
                            <th>Horas trabajadas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.map((rep: any) => (
                            <tr key={rep.id}>
                                <td>{rep.id}</td>
                                <td>{rep.fecha}</td>
                                <td>{rep.inspector}</td>
                                <td>{rep.supervisor}</td>
                                <td>{rep.turno}</td>
                                <td>{rep.horas_trabajadas}</td>
                                <td>
                                    <Button size="sm" onClick={() => navigate(`/reporte/${rep.id}`)}>Ver detalles</Button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </LayoutPrivado>
    );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Alert, Form, Row, Col } from 'react-bootstrap';
import { API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import LayoutPrivado from '../components/LayoutPrivado';
import * as XLSX from 'xlsx';

export default function ReportesList() {
    const navigate = useNavigate();
    const [reportes, setReportes] = useState([]);
    const [mensaje, setMensaje] = useState('');

    const [filtros, setFiltros] = useState({
        fecha: '',
        inspector: '',
        supervisor: '',
        turno: ''
    });

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

    const handleFiltroChange = (e: any) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const reportesFiltrados = reportes.filter((rep: any) =>
        (rep.fecha || "").includes(filtros.fecha) &&
        (rep.inspector || "").toLowerCase().includes(filtros.inspector.toLowerCase()) &&
        (rep.supervisor || "").toLowerCase().includes(filtros.supervisor.toLowerCase()) &&
        (rep.turno || "").toLowerCase().includes(filtros.turno.toLowerCase())
    );


    return (
        <LayoutPrivado>
            <div className="container mt-4">
                <h4>Lista de Reportes</h4>
                {mensaje && <Alert variant="danger">{mensaje}</Alert>}

                <Row className="mb-3">
                    <Col><Form.Control name="fecha" placeholder="Filtrar por fecha" value={filtros.fecha} onChange={handleFiltroChange} /></Col>
                    <Col><Form.Control name="inspector" placeholder="Filtrar por inspector" value={filtros.inspector} onChange={handleFiltroChange} /></Col>
                    <Col><Form.Control name="supervisor" placeholder="Filtrar por supervisor" value={filtros.supervisor} onChange={handleFiltroChange} /></Col>
                    <Col><Form.Control name="turno" placeholder="Filtrar por turno" value={filtros.turno} onChange={handleFiltroChange} /></Col>
                    <Col>
                        <Button
                            variant="success"
                            onClick={() => {
                                window.open(`${API_URL}/reportes/exportar_reportes_excel.php`, "_blank");
                            }}
                        >
                            Exportar a Excel
                        </Button>
                    </Col>

                </Row>

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
                        {reportesFiltrados.map((rep: any) => (
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

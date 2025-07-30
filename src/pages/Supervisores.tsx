import { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Table, Modal } from 'react-bootstrap';
import LayoutPrivado from '../components/LayoutPrivado';
import { API_URL } from '../config/api';

interface Supervisor {
    id: number;
    nombre: string;
    estatus: number;
}

export default function Supervisores() {
    const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
    const [nombre, setNombre] = useState('');
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const obtenerSupervisores = async () => {
        try {
            const res = await axios.get(`${API_URL}/supervisores/supervisores.php`);
            setSupervisores(res.data);
        } catch (error) {
            console.error('Error al obtener supervisores:', error);
        }
    };

    const abrirModal = (supervisor?: Supervisor) => {
        if (supervisor) {
            setEditandoId(supervisor.id);
            setNombre(supervisor.nombre);
        } else {
            setEditandoId(null);
            setNombre('');
        }
        setMostrarModal(true);
    };

    const guardarSupervisor = async () => {
        try {
            if (editandoId) {
                await axios.put(`${API_URL}/supervisores/editar_supervisor.php`, {
                    id: editandoId,
                    nombre,
                });
            } else {
                await axios.post(`${API_URL}/supervisores/crear_supervisor.php`, {
                    nombre,
                });
            }
            setMostrarModal(false);
            obtenerSupervisores();
        } catch (error) {
            console.error('Error al guardar supervisor:', error);
        }
    };

    const cambiarEstatus = async (id: number, estatus: number) => {
        try {
            await axios.patch(`${API_URL}/supervisores/desactivar_supervisor.php`, {
                id,
                estatus: estatus === 1 ? 0 : 1,
            });
            obtenerSupervisores();
        } catch (error) {
            console.error('Error al cambiar estatus:', error);
        }
    };

    useEffect(() => {
        obtenerSupervisores();
    }, []);

    return (
        <LayoutPrivado>
            <div className="container mt-4">
                <h2>Supervisores</h2>
                <Button onClick={() => abrirModal()} className="mb-3">+ Nuevo Supervisor</Button>

                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supervisores.map((s, i) => (
                            <tr key={s.id}>
                                <td>{i + 1}</td>
                                <td>{s.nombre}</td>
                                <td>{s.estatus === 1 ? 'Activo' : 'Inactivo'}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => abrirModal(s)} className="me-2">
                                        Editar
                                    </Button>
                                    <Button
                                        variant={s.estatus === 1 ? 'danger' : 'success'}
                                        size="sm"
                                        onClick={() => cambiarEstatus(s.id, s.estatus)}
                                    >
                                        {s.estatus === 1 ? 'Desactivar' : 'Activar'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Modal */}
                <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editandoId ? 'Editar Supervisor' : 'Nuevo Supervisor'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={guardarSupervisor}>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </LayoutPrivado>
    );
}

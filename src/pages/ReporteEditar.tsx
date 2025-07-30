import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LayoutPrivado from "../components/LayoutPrivado";
import { API_URL } from "../config/api";
import { Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";

export default function ReporteEditar() {
    const [form, setForm] = useState<any>(null);
    const [catalogos, setCatalogos] = useState<any>({});
    const [mensaje, setMensaje] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const id = searchParams.get("id");

    useEffect(() => {
        if (!id) return;

        axios
            .get(`${API_URL}/reportes/obtener_reporte_detalle.php?id=${id}`)
            .then((res) => {
                const data = res.data;

                // Calcular total de minutos trabajados
                let totalMin = 0;

                const inspecciones = data.inspecciones.map((insp: any) => {
                    const inicio = new Date(`1970-01-01T${insp.hora_inicio}`);
                    const fin = new Date(`1970-01-01T${insp.hora_fin}`);
                    const minutos = (fin.getTime() - inicio.getTime()) / 60000;
                    totalMin += minutos;

                    return {
                        id_num_parte: insp.id_num_parte,
                        proveedor: insp.proveedor || "",
                        cargo: insp.cargo || "",
                        lpn: insp.lpn,
                        lote: insp.lote,
                        hora_inicio: insp.hora_inicio,
                        hora_fin: insp.hora_fin,
                        piezas_inspeccionadas: insp.piezas_inspeccionadas,
                        piezas_ok: insp.piezas_ok,
                        piezas_no_ok: insp.piezas_no_ok,
                        retrabajos: insp.retrabajos.map((r: any) => ({
                            id_retrabajo: r.id_retrabajo,
                            cantidad: r.cantidad,
                        })),
                        rechazos: insp.rechazos.map((d: any) => ({
                            id_defecto: d.id_defecto,
                            cantidad: d.cantidad,
                        })),
                    };
                });

                const horasTrabajadas = parseFloat((totalMin / 60).toFixed(2));

                const formateado = {
                    id: data.id,
                    fecha: data.fecha,
                    id_turno: data.id_turno,
                    id_inspector: data.id_inspector,
                    id_supervisor: data.id_supervisor,
                    horas_trabajadas: horasTrabajadas,
                    inspecciones,
                };

                setForm(formateado);
            })
            .catch(() => {
                alert("Error al cargar el reporte.");
                navigate("/reportes");
            });
    }, [id]);

    const validarAntesDeEnviar = () => {
        for (let i = 0; i < form.inspecciones.length; i++) {
            const insp = form.inspecciones[i];
            const no_ok = Number(insp.piezas_no_ok || 0);
            const totalRechazos = insp.rechazos?.reduce((sum: number, r: any) => sum + Number(r.cantidad || 0), 0) || 0;
            const totalRetrabajos = insp.retrabajos?.reduce((sum: number, r: any) => sum + Number(r.cantidad || 0), 0) || 0;

            if (no_ok > 0 && totalRechazos + totalRetrabajos === 0) {
                alert(`La inspección #${i + 1} tiene piezas NO OK sin registrar motivos de rechazo o retrabajo.`);
                return false;
            }

            if ((totalRechazos + totalRetrabajos) !== no_ok) {
                alert(`La suma de rechazo + retrabajo no coincide con piezas NO OK en inspección #${i + 1}`);
                return false;
            }
        }
        return true;
    };


    const handleGuardar = () => {
        axios
            .post(`${API_URL}/reportes/editar_reporte.php`, form)
            .then(() => {
                alert("Reporte actualizado correctamente.");
                navigate("/reportes-list");
            })
            .catch(() => {
                alert("Error al guardar el reporte.");
            });
    };

    // Load catalogs
    useEffect(() => {
        axios.get(`${API_URL}/reportes/obtener_catalogos.php`)
            .then((res) => setCatalogos(res.data));
    }, []);

    const handleChangeInspeccion = (index: number, field: string, value: any) => {
        const updated = [...form.inspecciones];
        (updated[index] as any)[field] = value;
        setForm({ ...form, inspecciones: updated });
    };

    const handleAddInspeccion = () => {
        setForm({
            ...form,
            inspecciones: [
                ...form.inspecciones,
                {
                    id_num_parte: "",
                    descripcion: "",
                    proveedor: "",
                    plataforma: "",
                    cargo: "",
                    lpn: "",
                    lote: "",
                    hora_inicio: "",
                    hora_fin: "",
                    piezas_inspeccionadas: 0,
                    piezas_ok: 0,
                    piezas_no_ok: 0,
                    retrabajos: [],
                    rechazos: []
                }
            ]
        });
    };

    const handleRemoveInspeccion = (index: number) => {
        const updated = [...form.inspecciones];
        updated.splice(index, 1);
        setForm({ ...form, inspecciones: updated });
    };

    const handleAddMotivo = (index: number, tipo: "retrabajos" | "rechazos") => {
        const updated = [...form.inspecciones];
        updated[index][tipo].push({ id_retrabajo: "", id_defecto: "", cantidad: 0 });
        setForm({ ...form, inspecciones: updated });
    };

    const handleRemoveMotivo = (index: number, tipo: "retrabajos" | "rechazos", i: number) => {
        const updated = [...form.inspecciones];
        updated[index][tipo].splice(i, 1);
        setForm({ ...form, inspecciones: updated });
    };

    const handleChangeMotivo = (index: number, tipo: "retrabajos" | "rechazos", i: number, field: string, value: any) => {
        const updated = [...form.inspecciones];
        (updated[index][tipo][i] as any)[field] = value;
        setForm({ ...form, inspecciones: updated });
    };

    if (!form) return <p className="text-center mt-4">Cargando reporte...</p>;

    return (
        <LayoutPrivado>
            <div className="container mt-4">
                <h3>Formulario de Reporte</h3>
                {mensaje && (
                    <Alert
                        variant="info"
                        dismissible
                        onClose={() => setMensaje("")}
                    >
                        {mensaje}
                    </Alert>
                )}

                <Form>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={form.fecha}
                                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Turno</Form.Label>
                                <Form.Select
                                    value={form.id_turno}
                                    onChange={(e) => setForm({ ...form, id_turno: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {catalogos.turnos?.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Inspector</Form.Label>
                                <Form.Select
                                    value={form.id_inspector}
                                    onChange={(e) => setForm({ ...form, id_inspector: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {catalogos.inspectores?.map((i: any) => (
                                        <option key={i.id} value={i.id}>{i.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Supervisor</Form.Label>
                                <Form.Select
                                    value={form.id_supervisor}
                                    onChange={(e) => setForm({ ...form, id_supervisor: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {catalogos.supervisores?.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Horas trabajadas</Form.Label>
                                <Form.Control
                                    value={form.horas_trabajadas.toFixed(2)}
                                    disabled
                                    className={form.horas_trabajadas < 8 ? "border border-danger text-danger fw-bold" : ""}
                                />
                                {form.horas_trabajadas < 8 && (
                                    <div className="text-danger mt-1">
                                        Debes cumplir al menos 8 horas trabajadas para guardar el reporte.
                                    </div>
                                )}

                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />
                    <h5>Inspecciones</h5>
                    {form.inspecciones.map((insp: any, idx: number) => (
                        <div key={idx} className="border p-3 mb-3 rounded">
                            <Row>
                                <Col md={3}>
                                    <Form.Label>No. Parte</Form.Label>
                                    <Form.Select
                                        value={insp.id_num_parte}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "id_num_parte", e.target.value)
                                        }
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {catalogos.num_partes?.map((np: any) => (
                                            <option key={np.id} value={np.id}>{np.num_parte}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control value={insp.descripcion} disabled />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Plataforma</Form.Label>
                                    <Form.Control value={insp.plataforma} disabled />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Proveedor</Form.Label>
                                    <Form.Control value={insp.proveedor} disabled />
                                </Col>

                                {/*
                                <Col md={3}>
                                    <Form.Label>Cargo</Form.Label>
                                    <Form.Control
                                        value={insp.cargo}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "cargo", e.target.value)
                                        }
                                    />
                                </Col>*/}
                                <Col md={3}>
                                    <Form.Label>Eaton LPN</Form.Label>
                                    <Form.Control
                                        value={insp.lpn}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "lpn", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Lote</Form.Label>
                                    <Form.Control
                                        value={insp.lote}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "lote", e.target.value)
                                        }
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-2">
                                <Col md={3}>
                                    <Form.Label>Hora inicio</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={insp.hora_inicio}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "hora_inicio", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Hora fin</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={insp.hora_fin}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "hora_fin", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Label>Pzas inspeccionadas</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={insp.piezas_inspeccionadas}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "piezas_inspeccionadas", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Label>Pzas OK</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={insp.piezas_ok}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "piezas_ok", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Label>No OK</Form.Label>
                                    <Form.Control value={insp.piezas_no_ok} disabled />
                                </Col>
                            </Row>

                            {insp.piezas_no_ok > 0 && (
                                <>
                                    <hr />
                                    <Row>
                                        <Col>
                                            <h6>Retrabajos</h6>
                                            {insp.retrabajos.map((r: any, i: number) => (
                                                <Row key={i} className="align-items-center mb-2">
                                                    <Col md={4}>
                                                        <Form.Control
                                                            type="number"
                                                            value={r.cantidad}
                                                            onChange={(e) =>
                                                                handleChangeMotivo(idx, "retrabajos", i, "cantidad", e.target.value)
                                                            }
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Select
                                                            value={r.id_retrabajo}
                                                            onChange={(e) =>
                                                                handleChangeMotivo(idx, "retrabajos", i, "id_retrabajo", e.target.value)
                                                            }
                                                        >
                                                            <option value="">-- Motivo --</option>
                                                            {catalogos.retrabajos?.map((mot: any) => (
                                                                <option key={mot.id} value={mot.id}>{mot.nombre}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={2}>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleRemoveMotivo(idx, "retrabajos", i)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleAddMotivo(idx, "retrabajos")}>+ Agregar retrabajo</Button>
                                        </Col>

                                        <Col>
                                            <h6>Rechazos</h6>
                                            {insp.rechazos.map((d: any, i: number) => (
                                                <Row key={i} className="align-items-center mb-2">
                                                    <Col md={4}>
                                                        <Form.Control
                                                            type="number"
                                                            value={d.cantidad}
                                                            onChange={(e) =>
                                                                handleChangeMotivo(idx, "rechazos", i, "cantidad", e.target.value)
                                                            }
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Select
                                                            value={d.id_defecto}
                                                            onChange={(e) =>
                                                                handleChangeMotivo(idx, "rechazos", i, "id_defecto", e.target.value)
                                                            }
                                                        >
                                                            <option value="">-- Motivo --</option>
                                                            {catalogos.defectos?.map((def: any) => (
                                                                <option key={def.id} value={def.id}>{def.defecto}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={2}>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleRemoveMotivo(idx, "rechazos", i)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            ))}

                                            <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleAddMotivo(idx, "rechazos")}>+ Agregar rechazo</Button>
                                        </Col>
                                    </Row>
                                </>
                            )}
                            <div className="text-end mt-2">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemoveInspeccion(idx)}
                                >
                                    Eliminar inspección
                                </Button>
                            </div>
                        </div>

                    ))}

                    <Button variant="outline-primary" className="mt-3" onClick={handleAddInspeccion}>
                        + Agregar inspección
                    </Button>

                    <div className="mt-4">
                        <Button
                            variant="success"
                            onClick={() => setShowConfirm(true)}
                            disabled={form.horas_trabajadas < 8}
                        >
                            Guardar
                        </Button>

                    </div>
                </Form>

                {/* Confirmación */}
                <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>¿Estás seguro de que deseas guardar el reporte?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (validarAntesDeEnviar()) {
                                    setShowConfirm(false);
                                    handleGuardar();
                                }
                            }}
                        >
                            Confirmar
                        </Button>

                    </Modal.Footer>
                </Modal>
            </div>
        </LayoutPrivado>
    );
}

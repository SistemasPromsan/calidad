import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";
import LayoutPrivado from "../components/LayoutPrivado";
import { API_URL } from "../config/api";

interface Inspeccion {
    id_num_parte: string;
    descripcion: string;
    proveedor: string;
    plataforma: string;
    cargo: string;
    lpn: string;
    lote: string;
    hora_inicio: string;
    hora_fin: string;
    piezas_inspeccionadas: number;
    piezas_ok: number;
    piezas_no_ok: number;
    minutos?: number;
    lista_proveedores?: any[];
    retrabajos: Array<{ id_retrabajo: string; id_defecto: string; cantidad: number }>;
    rechazos: Array<{ id_retrabajo: string; id_defecto: string; cantidad: number }>;
}

interface FormData {
    fecha: string;
    id_turno: string;
    id_inspector: string;
    id_supervisor: string;
    id_usuario: number;
    inspecciones: Inspeccion[];
    horas_trabajadas: number;
}

const ReporteForm = () => {
    const [catalogos, setCatalogos] = useState<any>({});
    const [form, setForm] = useState<FormData>({
        fecha: new Date().toISOString().split("T")[0],
        id_turno: "",
        id_inspector: "",
        id_supervisor: "",
        id_usuario: 1, // ID del usuario logueado (simulado)
        inspecciones: [],
        horas_trabajadas: 0
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        axios
            .get(`${API_URL}/reportes/obtener_catalogos.php`)
            .then((res) => setCatalogos(res.data));
    }, []);

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
                    lista_proveedores: [],
                    retrabajos: [],
                    rechazos: []
                }
            ]
        });
    };

    const handleChangeInspeccion = (index: number, field: keyof Inspeccion, value: any) => {
        const updated = [...form.inspecciones];
        (updated[index] as any)[field] = value;

        if (field === "id_num_parte") {
            const parte = catalogos.num_partes.find((p: any) => p.id == value);
            const proveedores = catalogos.proveedores_por_parte?.[value] || [];

            updated[index].descripcion = parte?.descripcion || "";
            updated[index].plataforma = parte?.plataforma || "";
            updated[index].proveedor = proveedores.length > 0 ? proveedores[0].nombre : "";
            updated[index].lista_proveedores = proveedores;
        }


        // Calcular no OK
        const inspeccionadas = parseInt(updated[index].piezas_inspeccionadas?.toString() || "0");
        const ok = parseInt(updated[index].piezas_ok?.toString() || "0");
        updated[index].piezas_no_ok = Math.max(inspeccionadas - ok, 0);

        // Calcular horas
        if (updated[index].hora_inicio && updated[index].hora_fin) {
            const ini = new Date(`2000-01-01T${updated[index].hora_inicio}`);
            const fin = new Date(`2000-01-01T${updated[index].hora_fin}`);
            const diffMin = (fin.getTime() - ini.getTime()) / 60000;
            if (!isNaN(diffMin) && diffMin > 0) {
                updated[index].minutos = diffMin;
            }
        }

        // Calcular horas totales
        const totalMin = updated.reduce((sum, ins) => sum + (ins.minutos || 0), 0);
        const totalHoras = +(totalMin / 60).toFixed(2);

        setForm({ ...form, inspecciones: updated, horas_trabajadas: totalHoras });
    };

    const handleRemoveInspeccion = (index: number) => {
        const updated = [...form.inspecciones];
        updated.splice(index, 1); // Elimina por índice
        const totalMin = updated.reduce((sum, ins) => sum + (ins.minutos || 0), 0);
        const totalHoras = +(totalMin / 60).toFixed(2);

        setForm({ ...form, inspecciones: updated, horas_trabajadas: totalHoras });
    };


    const handleAddMotivo = (index: number, tipo: "retrabajos" | "rechazos") => {
        const updated = [...form.inspecciones];
        updated[index][tipo].push({ id_retrabajo: "", id_defecto: "", cantidad: 0 });
        setForm({ ...form, inspecciones: updated });
    };

    const handleRemoveMotivo = (index: number, tipo: "retrabajos" | "rechazos", i: number) => {
        const updated = [...form.inspecciones];
        updated[index][tipo].splice(i, 1); // elimina el elemento en la posición i
        setForm({ ...form, inspecciones: updated });
    };


    const handleChangeMotivo = (index: number, tipo: "retrabajos" | "rechazos", i: number, field: string, value: any) => {
        const updated = [...form.inspecciones];
        (updated[index][tipo][i] as any)[field] = value;
        setForm({ ...form, inspecciones: updated });
    };

    const validarCantidadMotivos = (insp: any) => {
        const totalMotivos =
            insp.retrabajos.reduce((sum: number, r: any) => sum + parseInt(r.cantidad || 0), 0) +
            insp.rechazos.reduce((sum: number, d: any) => sum + parseInt(d.cantidad || 0), 0);
        return totalMotivos <= insp.piezas_no_ok;
    };


    const validarFormulario = () => {
        if (!form.id_turno || !form.id_inspector || !form.id_supervisor) {
            alert("Por favor completa todos los datos principales.");
            return false;
        }

        if (form.inspecciones.length === 0) {
            alert("Debes agregar al menos una inspección.");
            return false;
        }

        for (let i = 0; i < form.inspecciones.length; i++) {
            const ins = form.inspecciones[i];
            if (
                !ins.id_num_parte ||
                !ins.hora_inicio ||
                !ins.hora_fin ||
                !ins.piezas_inspeccionadas ||
                !ins.piezas_ok
            ) {
                alert(`Faltan campos en la inspección #${i + 1}`);
                return false;
            }

            // Validar retrabajos
            for (let r of ins.retrabajos) {
                if (!r.id_retrabajo || !r.cantidad || parseInt(r.cantidad.toString()) <= 0) {
                    alert(`Hay un retrabajo incompleto en inspección #${i + 1}`);
                    return false;
                }
            }

            // Validar rechazos
            for (let d of ins.rechazos) {
                if (!d.id_defecto || !d.cantidad || parseInt(d.cantidad.toString()) <= 0) {
                    alert(`Hay un rechazo incompleto en inspección #${i + 1}`);
                    return false;
                }
            }
        }

        return true;
    };



    const handleGuardar = () => {
        if (!validarFormulario()) {
            return;
        }

        if (!form.inspecciones.every(validarCantidadMotivos)) {
            alert("¡Error! La suma de rechazos y retrabajos excede las piezas No OK.");
            return;
        }

        axios
            .post(`${API_URL}/reportes/crear_reporte.php`, form)
            .then(() => {
                setMensaje("Reporte guardado correctamente.");
                setForm({
                    fecha: new Date().toISOString().split("T")[0],
                    id_turno: "",
                    id_inspector: "",
                    id_supervisor: "",
                    id_usuario: 1,
                    inspecciones: [],
                    horas_trabajadas: 0
                });
            })
            .catch(() => setMensaje("Error al guardar el reporte."));
    };


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
                        <Button variant="primary" onClick={() => { setShowConfirm(false); handleGuardar(); }}>
                            Confirmar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </LayoutPrivado>
    );
};

export default ReporteForm;
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
    total_retrabajos: string;
    hora_inicio: string;
    hora_fin: string;
    piezas_inspeccionadas: string | number;
    piezas_ok: string | number;
    piezas_no_ok: string | number;
    observaciones: string;
    horas_extras: string | number;
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
    horas_extras: number;
}

interface ReporteFormProps {
    initialData?: any;
    catalogos?: any;
    onSubmit?: (formData: any) => void;
    modo?: string;
    permitirGuardarSinHoras?: boolean;
    motivoNoHoras?: string;
    setPermitirGuardarSinHoras?: (value: boolean) => void;
}

const ReporteForm = ({ initialData, catalogos: propCatalogos, onSubmit, permitirGuardarSinHoras, motivoNoHoras, setPermitirGuardarSinHoras }: ReporteFormProps = {}) => {
    const [catalogos, setCatalogos] = useState<any>(propCatalogos || {});
    const [form, setForm] = useState<FormData>(() => {
        const data = initialData || {
            fecha: new Date().toISOString().split("T")[0],
            id_turno: "",
            id_inspector: "",
            id_supervisor: "",
            id_usuario: 1,
            inspecciones: [],
            horas_trabajadas: 0,
            horas_extras: 0
        };

        data.horas_trabajadas = Number(data.horas_trabajadas || 0) // Asegura que sea un número
        return data;
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        if (!propCatalogos) {
            axios
                .get(`${API_URL}/reportes/obtener_catalogos.php`)
                .then((res) => setCatalogos(res.data));
        }
    }, [propCatalogos]);

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
                    total_retrabajos: "",
                    hora_inicio: "",
                    hora_fin: "",
                    piezas_inspeccionadas: "",
                    piezas_ok: "",
                    piezas_no_ok: "",
                    observaciones: "",
                    horas_extras: "",
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

        if (field === "piezas_inspeccionadas" || field === "piezas_no_ok") {
            const inspeccionadas = toInt(updated[index].piezas_inspeccionadas);
            let noOk = toInt(updated[index].piezas_no_ok);
            if (noOk > inspeccionadas) {
                noOk = inspeccionadas;
                updated[index].piezas_no_ok = noOk;
            }
            updated[index].piezas_ok = Math.max(inspeccionadas - noOk, 0);
        }




        // Calcular minutos trabajados por inspección
        if (updated[index].hora_inicio && updated[index].hora_fin) {
            const ini = new Date(`2000-01-01T${updated[index].hora_inicio}`);
            let fin = new Date(`2000-01-01T${updated[index].hora_fin}`);

            // Si la hora de fin es menor que la de inicio, significa que pasó a otro día
            if (fin < ini) {
                fin.setDate(fin.getDate() + 1);
            }

            const diffMin = (fin.getTime() - ini.getTime()) / 60000;
            updated[index].minutos = isNaN(diffMin) ? 0 : diffMin;
        }

        // Calcular total de horas trabajadas y horas extras
        const totalMin = updated.reduce((sum, ins) => sum + (ins.minutos || 0), 0);
        const totalHoras = +(totalMin / 60).toFixed(2);
        const horasExtras = totalHoras > 8 ? +(totalHoras - 8).toFixed(2) : 0;

        setForm({ ...form, inspecciones: updated, horas_trabajadas: totalHoras, horas_extras: horasExtras });
    };


    const handleRemoveInspeccion = (index: number) => {
        const updated = [...form.inspecciones];
        updated.splice(index, 1); // Elimina por índice
        const totalMin = updated.reduce((sum, ins) => sum + (ins.minutos || 0), 0);
        const totalHoras = +(totalMin / 60).toFixed(2);

        setForm({ ...form, inspecciones: updated, horas_trabajadas: totalHoras, horas_extras: totalHoras - 8 });
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

    const toInt = (v: any) => {
        const n = parseInt(String(v), 10);
        return isNaN(n) ? 0 : n;
    };

    const validarFormulario = () => {
        if (!form.id_turno || !form.id_inspector || !form.id_supervisor) {
            alert("Por favor completa todos los datos principales.");
            return false;
        }

        if (!form.inspecciones.length) {
            alert("Debes agregar al menos una inspección.");
            return false;
        }

        for (let i = 0; i < form.inspecciones.length; i++) {
            const ins = form.inspecciones[i];

            // Requeridos básicos (NOTA: piezas_ok ya no se valida como requerido)
            if (!ins.id_num_parte || !ins.hora_inicio || !ins.hora_fin || !ins.cargo) {
                alert(`Faltan campos en la inspección #${i + 1}`);
                return false;
            }

            // Números válidos
            const inspeccionadas = toInt(ins.piezas_inspeccionadas);
            const noOk = toInt(ins.piezas_no_ok);

            if (inspeccionadas <= 0) {
                alert(`Piezas inspeccionadas debe ser > 0 en inspección #${i + 1}`);
                return false;
            }
            if (noOk < 0) {
                alert(`Piezas NO OK debe ser ≥ 0 en inspección #${i + 1}`);
                return false;
            }
            if (noOk > inspeccionadas) {
                alert(`Piezas NO OK no puede ser mayor que las inspeccionadas en inspección #${i + 1}`);
                return false;
            }

            // Rechazos deben justificar los NO OK
            const totalRechazos = (ins.rechazos || []).reduce(
                (sum: number, r: any) => sum + toInt(r.cantidad),
                0
            );

            if (noOk > 0) {
                if (totalRechazos === 0) {
                    alert(`La inspección #${i + 1} tiene NO OK sin registrar motivos de rechazo.`);
                    return false;
                }
                if (totalRechazos !== noOk) {
                    alert(`La suma de rechazos debe ser igual a las piezas NO OK en inspección #${i + 1}`);
                    return false;
                }
            }

            // Validar cada retrabajo si existe
            for (const r of ins.retrabajos || []) {
                if (!r.id_retrabajo || !toInt(r.cantidad) || toInt(r.cantidad) <= 0) {
                    alert(`Hay un retrabajo incompleto en inspección #${i + 1}`);
                    return false;
                }
            }

            // (Opcional) Validar coherencia con total_retrabajos si usas ese campo
            const declaradoRet = toInt((ins as any).total_retrabajos);
            const sumaRet = (ins.retrabajos || []).reduce(
                (sum: number, r: any) => sum + toInt(r.cantidad),
                0
            );
            if (declaradoRet > 0) {
                if (sumaRet === 0) {
                    alert(`Indicó total de retrabajos en inspección #${i + 1}, pero no agregó motivos.`);
                    return false;
                }
                if (sumaRet !== declaradoRet) {
                    alert(`La suma de retrabajos debe ser igual al Total retrabajos en inspección #${i + 1}`);
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

        // Armamos el payload incluyendo el motivo (solo si aplica)
        const payload = {
            ...form,
            motivo_no_horas: currentPermitirGuardarSinHoras ? currentMotivoNoHoras : null,
            permitir_guardar_sin_horas: currentPermitirGuardarSinHoras ? 1 : 0, // opcional por si lo quieres auditar
        };

        // Si viene from parent (edición, etc.), usar el mismo payload
        if (onSubmit) {
            onSubmit(payload);
            return;
        }

        axios
            .post(`${API_URL}/reportes/crear_reporte.php`, payload)
            .then(() => {
                setMensaje("Reporte guardado correctamente.");
                setForm({
                    fecha: new Date().toISOString().split("T")[0],
                    id_turno: "",
                    id_inspector: "",
                    id_supervisor: "",
                    id_usuario: 1,
                    inspecciones: [],
                    horas_trabajadas: 0,
                    horas_extras: 0
                });
                // Limpiar controles del candado
                currentSetPermitirGuardarSinHoras(false);
                setLocalMotivoNoHoras("");
            })
            .catch(() => setMensaje("Error al guardar el reporte."));
    };



    const [localPermitirGuardarSinHoras, setLocalPermitirGuardarSinHoras] = useState(permitirGuardarSinHoras || false);
    const [localMotivoNoHoras, setLocalMotivoNoHoras] = useState(motivoNoHoras || "");

    // Use props if provided, otherwise use local state
    const currentPermitirGuardarSinHoras = permitirGuardarSinHoras !== undefined ? permitirGuardarSinHoras : localPermitirGuardarSinHoras;
    const currentMotivoNoHoras = motivoNoHoras !== undefined ? motivoNoHoras : localMotivoNoHoras;
    const currentSetPermitirGuardarSinHoras = setPermitirGuardarSinHoras || setLocalPermitirGuardarSinHoras;




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

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Horas extras</Form.Label>
                                <Form.Control
                                    value={Number(form.horas_extras || 0).toFixed(2)}
                                    disabled
                                    className="fw-bold"
                                />
                            </Form.Group>
                        </Col>

                        {form.horas_trabajadas < 8 && (
                            <Col md={5}>
                                <Form.Check
                                    type="checkbox"
                                    label="Permitir guardar indicando motivo"
                                    checked={currentPermitirGuardarSinHoras}
                                    onChange={(e) => {
                                        currentSetPermitirGuardarSinHoras(e.target.checked);
                                        if (!e.target.checked) setLocalMotivoNoHoras("");
                                    }}
                                />
                                {currentPermitirGuardarSinHoras && (
                                    <Form.Select
                                        className="mt-2"
                                        value={currentMotivoNoHoras}
                                        onChange={(e) => setLocalMotivoNoHoras(e.target.value)}
                                    >
                                        <option value="">-- Selecciona motivo --</option>
                                        <option value="Falta de material">Falta de material</option>
                                        <option value="Falla en máquina">Falla en máquina</option>
                                        <option value="Ausencia personal">Ausencia de personal</option>
                                        <option value="Otro">Otro</option>
                                    </Form.Select>
                                )}
                            </Col>
                        )}

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
                                <Col md={2}>
                                    <Form.Label>Eaton LPN</Form.Label>
                                    <Form.Control
                                        value={insp.lpn}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "lpn", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Label>Lote</Form.Label>
                                    <Form.Control
                                        value={insp.lote}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "lote", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Label>Cargo</Form.Label>
                                    <Form.Select
                                        required
                                        value={insp.cargo}
                                        onChange={(e) => handleChangeInspeccion(idx, "cargo", e.target.value)}
                                    >
                                        <option value="">-- Selecciona --</option>
                                        <option value="interno">Interno</option>
                                        <option value="externo">Externo</option>
                                    </Form.Select>

                                </Col>
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

                            </Row>

                            <Row className="mt-2">

                                <Col md={3}>
                                    <Form.Label>Total retrabajos</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={insp.total_retrabajos === 0 ? 0 : insp.total_retrabajos || ""}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "total_retrabajos", e.target.value)
                                        }
                                    />
                                </Col>

                                <Col md={3}>
                                    <Form.Label>Pzas inspeccionadas</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={insp.piezas_inspeccionadas ?? ""}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "piezas_inspeccionadas", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>No OK</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={insp.piezas_no_ok ?? ""}
                                        onChange={(e) =>
                                            handleChangeInspeccion(idx, "piezas_no_ok", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Pzas OK</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={insp.piezas_ok}
                                        disabled // ← ahora es calculado automáticamente
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-2">
                                <Col md={12}>
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={insp.observaciones || ""}
                                        onChange={(e) => handleChangeInspeccion(idx, "observaciones", e.target.value)}
                                    />
                                </Col>
                            </Row>


                            {/* Mostrar RETRABAJOS si total_retrabajos > 0 */}
                            {parseInt(insp.total_retrabajos || "0") > 0 && (
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
                                                            min="0"
                                                            value={r.cantidad ?? ""}
                                                            onChange={(e) =>
                                                                handleChangeMotivo(idx, "retrabajos", i, "cantidad", e.target.value)
                                                            }
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Select
                                                            value={r.id_retrabajo ?? ""}
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
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handleAddMotivo(idx, "retrabajos")}
                                            >
                                                + Agregar retrabajo
                                            </Button>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* Mostrar RECHAZOS si piezas_no_ok > 0 */}
                            {parseInt(insp.piezas_no_ok || "0") > 0 && (
                                <>
                                    <hr />
                                    <Row>
                                        <Col>
                                            <h6>Rechazos</h6>
                                            {insp.rechazos.map((d: any, i: number) => (
                                                <Row key={i} className="align-items-center mb-2">
                                                    <Col md={4}>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            value={d.cantidad ?? ""}
                                                            onChange={(e) =>
                                                                handleChangeMotivo(idx, "rechazos", i, "cantidad", e.target.value)
                                                            }
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Select
                                                            value={d.id_defecto ?? ""}
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
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handleAddMotivo(idx, "rechazos")}
                                            >
                                                + Agregar rechazo
                                            </Button>
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

                    <Button
                        variant="success"
                        onClick={() => setShowConfirm(true)}
                        disabled={form.horas_trabajadas < 8 && !currentPermitirGuardarSinHoras}
                    >
                        Guardar
                    </Button>

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
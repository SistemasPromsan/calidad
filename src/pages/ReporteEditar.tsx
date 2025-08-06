import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReporteForm from "./ReporteForm";
import { API_URL } from "../config/api";

const ReporteEditar = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get("id");
    const [formulario, setFormulario] = useState(null);
    const [catalogos, setCatalogos] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [permitirGuardarSinHoras, setPermitirGuardarSinHoras] = useState(false);
    const [motivoNoHoras, setMotivoNoHoras] = useState("");

    useEffect(() => {
        if (!id) {
            alert("ID no proporcionado.");
            navigate("/reportes-list");
            return;
        }

        const fetchData = async () => {
            try {
                const [catRes, repRes] = await Promise.all([
                    axios.get(`${API_URL}/reportes/obtener_catalogos.php`),
                    axios.get(`${API_URL}/reportes/obtener_reporte_detalle.php?id=${id}`)
                ]);

                const reporte = repRes.data;

                // ✅ Precargar motivo y checkbox si ya existe
                setPermitirGuardarSinHoras(!!reporte.motivo_no_horas);
                setMotivoNoHoras(reporte.motivo_no_horas || "");

                // ✅ Corregir total_retrabajos en cada inspección sumando los retrabajos reales
                if (Array.isArray(reporte.inspecciones)) {
                    reporte.inspecciones.forEach((insp: any) => {
                        insp.total_retrabajos = insp.retrabajos.reduce(
                            (sum: number, r: any) => sum + Number(r.cantidad || 0),
                            0
                        ).toString();

                        // ✅ Agregar descripción y plataforma
                        const parte = catRes.data.num_partes.find((p: any) => p.id == insp.id_num_parte);
                        if (parte) {
                            insp.descripcion = parte.descripcion;
                            insp.plataforma = parte.plataforma;
                        }

                        // ✅ Cargar lista_proveedores si existe
                        const proveedores = catRes.data.proveedores_por_parte?.[insp.id_num_parte] || [];
                        insp.lista_proveedores = proveedores;
                    });
                }

                setCatalogos(catRes.data);
                setFormulario(reporte);
            } catch (error) {
                alert("Error al cargar el reporte.");
                navigate("/reportes-list");
            }
        };

        fetchData();
    }, [id]);



    const handleGuardarEdicion = async (formData: any) => {
        try {
            // ✅ Enviar también el motivo y el permiso de guardar sin cumplir horas
            await axios.post(`${API_URL}/reportes/editar_reporte.php`, {
                ...formData,
                id,
                motivo_no_horas: permitirGuardarSinHoras ? motivoNoHoras : null
            });

            setMensaje("Reporte actualizado correctamente.");
            setTimeout(() => {
                navigate("/reportes-list");
            }, 1500);
        } catch (error) {
            console.error(error);
            alert("Error al guardar los cambios.");
        }
    };

    if (!formulario || !catalogos) return <div className="p-4">Cargando...</div>;

    return (
        <div className="p-4">
            <h3>Editar Reporte</h3>
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <ReporteForm
                initialData={formulario}
                catalogos={catalogos}
                onSubmit={handleGuardarEdicion}
                modo="edicion"
                permitirGuardarSinHoras={permitirGuardarSinHoras}
                motivoNoHoras={motivoNoHoras}
                setPermitirGuardarSinHoras={setPermitirGuardarSinHoras}
            />
        </div>
    );
};

export default ReporteEditar;

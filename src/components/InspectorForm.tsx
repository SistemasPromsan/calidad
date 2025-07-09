import { useState, useEffect } from 'react';
import axios from 'axios';

type Inspector = {
    id?: number;
    inspector: string;
    descripcion: string;
    estatus?: string;
};

type Props = {
    inspector: Inspector | null;
    onSuccess: () => void;
    onClose: () => void;
};

export default function InspectorForm({ inspector, onSuccess, onClose }: Props) {
    const [form, setForm] = useState<Inspector>({
        inspector: '',
        descripcion: ''
    });

    const [loading, setLoading] = useState(false);
    const isEditing = inspector !== null;

    useEffect(() => {
        if (inspector) {
            setForm({
                inspector: inspector.inspector,
                descripcion: inspector.descripcion
            });
        }
    }, [inspector]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.inspector.trim()) {
            alert('El nombre del inspector es obligatorio.');
            return;
        }

        setLoading(true);

        try {
            const url = isEditing
                ? 'http://localhost/calidad/calidad-backend/api/inspectores/editar_inspector.php'
                : 'http://localhost/calidad/calidad-backend/api/inspectores/crear_inspector.php';

            const payload = isEditing
                ? { id: inspector!.id, ...form }
                : { ...form };

            const res = await axios.post(url, payload);

            if (res.data.success) {
                alert(isEditing ? 'Inspector actualizado exitosamente.' : 'Inspector creado exitosamente.');
                onSuccess(); // recargar lista y cerrar modal
            } else {
                alert(res.data.message || 'Error inesperado.');
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar el inspector.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
        }}>
            <form onSubmit={handleSubmit} style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px'
            }}>
                <h2>{isEditing ? 'Editar Inspector' : 'Nuevo Inspector'}</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Nombre del Inspector</label>
                    <input
                        type="text"
                        name="inspector"
                        value={form.inspector}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Descripción</label>
                    <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        rows={3}
                        style={{ width: '100%', padding: '8px' }}
                    ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: 'gray', color: '#fff' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

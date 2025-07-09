import { useState, useEffect } from 'react';
import axios from 'axios';

type Props = {
    usuario?: any;
    onSuccess: () => void;
    onClose: () => void;
};

export default function UsuarioForm({ usuario, onSuccess, onClose }: Props) {
    const [form, setForm] = useState({
        nombre: '',
        username: '',
        email: '',
        password: '',
        id_rol: '2', // valor por defecto
    });

    useEffect(() => {
        if (usuario) {
            setForm({
                nombre: usuario.nombre || '',
                username: usuario.username || '',
                email: usuario.email || '',
                password: '',
                id_rol: usuario.id_rol || '2',
            });
        }
    }, [usuario]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = usuario
                ? 'http://localhost/calidad/calidad-backend/api/actualizar_usuario.php'
                : 'http://localhost/calidad/calidad-backend/api/crear_usuario.php';

            const data = usuario ? { ...form, id: usuario.id } : form;

            const res = await axios.post(url, data);
            if (res.data.success) {
                onSuccess();
                onClose();
            } else {
                alert('Error: ' + res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error en el servidor');
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>{usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                    <input type="text" name="username" placeholder="Usuario" value={form.username} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Correo" value={form.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required={!usuario} />
                    <select name="id_rol" value={form.id_rol} onChange={handleChange}>
                        <option value="1">Administrador</option>
                        <option value="2">Supervisor</option>
                        <option value="3">Coordinador</option>
                        <option value="4">Cliente</option>
                    </select>
                    <div className="form-actions">
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

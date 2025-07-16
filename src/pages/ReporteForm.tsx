import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPrivado from '../components/LayoutPrivado';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../config';

export default function ReporteForm() {
    const [form, setForm] = useState({
        fecha: '',
        id_turno: '',
        id_inspector: '',
        id_num_parte: '',
        descripcion: '',
        plataforma: '',
        proveedor: '',
        id_cargo: '',
        lpn: '',
        lote_proveedor: '',
        cantidad_inspeccionada: '',
        cantidad_correcta: '',
        cantidad_retrabajo: '',
        cantidad_rechazada: '',
        horas: '',
        minutos: '',
        motivo_inspeccion: '',
        defectos: '',
        observaciones: '',
        id_motivo_incumplimiento: '',
    });

    type NumParte = {
        id: number;
        num_parte: string;
        descripcion: string;
        plataforma: string;
        proveedor: string;
    };

    const [totalHoras, setTotalHoras] = useState(0);
    const [incumpleHoras, setIncumpleHoras] = useState(false);
    const [mostrarMotivo, setMostrarMotivo] = useState(false);

    const [turnos, setTurnos] = useState<any[]>([]);
    const [inspectores, setInspectores] = useState<any[]>([]);
    const [numPartes, setNumPartes] = useState<NumParte[]>([]);
    const [cargos, setCargos] = useState<any[]>([]);
    const [motivosIncumplimiento, setMotivosIncumplimiento] = useState<any[]>([]);

    useEffect(() => {
        axios.get(API + 'turnos/turnos.php').then(res => setTurnos(res.data));
        axios.get(API + 'inspectores/inspectores.php').then(res => setInspectores(res.data));
        axios.get(API + 'num_partes/num_partes.php').then(res => setNumPartes(res.data));
        axios.get(API + 'cargos/cargos.php').then(res => setCargos(res.data));
        axios.get(API + 'incumplimiento_horas/incumplimiento_horas.php').then(res => setMotivosIncumplimiento(res.data));
    }, []);

    useEffect(() => {
        const total = parseInt(form.horas || '0') + parseInt(form.minutos || '0') / 60;
        const esIncumplimiento = total < 8 && form.horas !== '' && form.minutos !== '';
        setTotalHoras(total);
        setIncumpleHoras(esIncumplimiento);

        if (!esIncumplimiento) {
            setMostrarMotivo(false);
            setForm(prev => ({ ...prev, id_motivo_incumplimiento: '' }));
        }
    }, [form.horas, form.minutos]);

    useEffect(() => {
        if (form.id_num_parte) {
            const parte = numPartes.find(p => p.id === Number(form.id_num_parte));
            if (parte) {
                setForm(prev => ({
                    ...prev,
                    descripcion: parte.descripcion || '',
                    plataforma: parte.plataforma || '',
                    proveedor: parte.proveedor || ''
                }));
            }
        }
    }, [form.id_num_parte, numPartes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const datos = {
                ...form,
                total_horas: totalHoras.toFixed(2),
                id_usuario: 1
            };
            await axios.post(API + 'reportes/crear_reporte.php', datos);
            alert('Reporte guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el reporte');
        }
    };

    return (
        <LayoutPrivado>
            <div className="container my-4">
                <h1 className="mb-4">Nuevo Reporte</h1>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Fecha:</label>
                            <input type="date" className="form-control" name="fecha" value={form.fecha} onChange={handleChange} required />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Turno:</label>
                            <select className="form-select" name="id_turno" value={form.id_turno} onChange={handleChange} required>
                                <option value="">Seleccione turno</option>
                                {turnos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Inspector:</label>
                            <select className="form-select" name="id_inspector" value={form.id_inspector} onChange={handleChange} required>
                                <option value="">Seleccione inspector</option>
                                {inspectores.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Número de parte:</label>
                            <select className="form-select" name="id_num_parte" value={form.id_num_parte} onChange={handleChange} required>
                                <option value="">Seleccione número de parte</option>
                                {numPartes.map((n) => <option key={n.id} value={n.id}>{n.num_parte}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Descripción:</label>
                            <input type="text" className="form-control" name="descripcion" value={form.descripcion || ''} readOnly />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Plataforma:</label>
                            <input type="text" className="form-control" name="plataforma" value={form.plataforma || ''} readOnly />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Proveedor:</label>
                            <input type="text" className="form-control" name="proveedor" value={form.proveedor || ''} readOnly />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Cargo:</label>
                            <select className="form-select" name="id_cargo" value={form.id_cargo} onChange={handleChange} required>
                                <option value="">Seleccione cargo</option>
                                {cargos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">LPN (Lote Eaton):</label>
                            <input type="text" className="form-control" name="lpn" value={form.lpn} onChange={handleChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Lote proveedor:</label>
                            <input type="text" className="form-control" name="lote_proveedor" value={form.lote_proveedor} onChange={handleChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Cantidad inspeccionada:</label>
                            <input type="number" className="form-control" name="cantidad_inspeccionada" value={form.cantidad_inspeccionada} onChange={handleChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Cantidad correcta:</label>
                            <input type="number" className="form-control" name="cantidad_correcta" value={form.cantidad_correcta} onChange={handleChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Cantidad rechazada:</label>
                            <input type="number" className="form-control" name="cantidad_rechazada" value={form.cantidad_rechazada} onChange={handleChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Cantidad retrabajo:</label>
                            <input type="number" className="form-control" name="cantidad_retrabajo" value={form.cantidad_retrabajo} onChange={handleChange} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Horas trabajadas:</label>
                            <input type="number" className="form-control" name="horas" value={form.horas} onChange={handleChange} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Minutos trabajados:</label>
                            <input type="number" className="form-control" name="minutos" value={form.minutos} onChange={handleChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Total de horas:</label>
                            <input type="text" className="form-control" value={totalHoras.toFixed(2)} readOnly />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Motivo inspección:</label>
                            <input type="text" className="form-control" name="motivo_inspeccion" value={form.motivo_inspeccion} onChange={handleChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Defectos:</label>
                            <input type="text" className="form-control" name="defectos" value={form.defectos} onChange={handleChange} />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Observaciones:</label>
                            <textarea className="form-control" name="observaciones" value={form.observaciones} onChange={handleChange} rows={3}></textarea>
                        </div>

                        {incumpleHoras && (
                            <div className="col-12 bg-light border p-3 rounded">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={mostrarMotivo}
                                        onChange={(e) => {
                                            const marcado = e.target.checked;
                                            setMostrarMotivo(marcado);
                                            if (!marcado) {
                                                setForm(prev => ({ ...prev, id_motivo_incumplimiento: '' }));
                                            }
                                        }}
                                    />
                                    <label className="form-check-label">
                                        Marcar como incumplimiento de horas
                                    </label>
                                </div>

                                {mostrarMotivo && (
                                    <div className="mt-3">
                                        <label className="form-label">Motivo del incumplimiento:</label>
                                        <select
                                            className="form-select"
                                            name="id_motivo_incumplimiento"
                                            value={form.id_motivo_incumplimiento}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Seleccione motivo</option>
                                            {motivosIncumplimiento.map((m) => (
                                                <option key={m.id} value={m.id}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </div>
                </form>
            </div>
        </LayoutPrivado>
    );
}

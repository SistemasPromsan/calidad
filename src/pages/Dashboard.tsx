import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LayoutPrivado from '../components/LayoutPrivado';
import API from '../config';
import './Dashboard.css';

import {
    ResponsiveContainer, ComposedChart, Bar, Line,
    XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, ReferenceLine
} from 'recharts';

// -----------------------------
// Tipos y helpers
// -----------------------------
type OkNokResp = { ok_total: number; no_ok_total: number };
type Categoria = { categoria: string; cantidad: number; acumulado: number; acumulado_pct: number };

function yyyyMmDd(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

// Paleta
const COLORS = {
    ok: '#22c55e',
    nok: '#ef4444',
    line: '#3b82f6',
    grid: '#e5e7eb',
};

// Tooltip bonito
function PrettyTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="pretty-tooltip">
            <div className="pt-title">{label}</div>
            {payload.map((p: any) => (
                <div className="pt-row" key={p.dataKey}>
                    <span className="pt-dot" style={{ background: p.color }} />
                    <span className="pt-name">{p.name}</span>
                    <span className="pt-val">
                        {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                        {p.dataKey?.toLowerCase().includes('pct') ? '%' : ''}
                    </span>
                </div>
            ))}
        </div>
    );
}

// =============================
// Card 1: Pareto OK vs NO OK (con filtros de fechas)
// =============================
function ParetoOkVsNok() {
    const [filtros, setFiltros] = useState({
        fecha_desde: yyyyMmDd(primerDiaMes),
        fecha_hasta: yyyyMmDd(ultimoDiaMes),
    });
    const [data, setData] = useState<OkNokResp | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const rangoValido = useMemo(
        () => (!filtros.fecha_desde || !filtros.fecha_hasta) || (filtros.fecha_desde <= filtros.fecha_hasta),
        [filtros]
    );

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<number | null>(null);

    const consultar = async (params: { fecha_desde?: string; fecha_hasta?: string }) => {
        if (!rangoValido) return;
        try {
            setLoading(true);
            setErr(null);

            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            const res = await axios.get(`${API}dashboard.php`, {
                params: {
                    fecha_desde: params.fecha_desde || undefined,
                    fecha_hasta: params.fecha_hasta || undefined,
                    tipo: 'todos',
                    _t: Date.now(),
                },
                signal: abortRef.current.signal as any,
            });

            const ok = Number(res.data?.ok_total ?? 0);
            const nok = Number(res.data?.no_ok_total ?? 0);
            setData({ ok_total: ok, no_ok_total: nok });
        } catch (e: any) {
            if (!axios.isCancel?.(e)) setErr(e?.message || 'Error cargando totales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { consultar(filtros); /* eslint-disable-next-line */ }, []);

    // Re-consultar automáticamente cuando cambian las fechas (debounce 350ms)
    useEffect(() => {
        if (!rangoValido) return;
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => consultar(filtros), 350);
        return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.fecha_desde, filtros.fecha_hasta, rangoValido]);

    const chartData = useMemo(() => {
        const ok = data?.ok_total ?? 0;
        const nok = data?.no_ok_total ?? 0;
        const total = Math.max(ok + nok, 1);
        const ordered = [
            { label: 'NO OK', valor: nok },
            { label: 'OK', valor: ok },
        ].sort((a, b) => b.valor - a.valor);
        let acum = 0;
        return ordered.map(it => {
            acum += it.valor;
            const pct = Math.round((acum / total) * 1000) / 10; // 1 decimal
            return { categoria: it.label, cantidad: it.valor, acumPct: pct };
        });
    }, [data]);

    const totalInspeccionadas = useMemo(
        () => (data?.ok_total ?? 0) + (data?.no_ok_total ?? 0),
        [data]
    );

    return (
        <div className="card mb-4 card-fancy">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <strong className="card-title-gradient">OK vs NO OK</strong>
                <div className="row gy-2 gx-2 align-items-end">
                    <div className="col-auto">
                        <label className="form-label mb-1">Desde</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filtros.fecha_desde}
                            onChange={(e) => setFiltros(f => ({ ...f, fecha_desde: e.target.value }))}
                        />
                    </div>
                    <div className="col-auto">
                        <label className="form-label mb-1">Hasta</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filtros.fecha_hasta}
                            onChange={(e) => setFiltros(f => ({ ...f, fecha_hasta: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            <div className="card-body">
                {!rangoValido && (
                    <div className="alert alert-warning mb-3">El rango de fechas no es válido.</div>
                )}
                {err && <div className="alert alert-danger mb-3">{err}</div>}

                {/* KPIs */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                        <div className="kpi kpi-ok lift">
                            <div className="kpi-label">Piezas OK</div>
                            <div className="kpi-value">{(data?.ok_total ?? 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="kpi kpi-nok lift">
                            <div className="kpi-label">Piezas NO OK</div>
                            <div className="kpi-value">{(data?.no_ok_total ?? 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="kpi kpi-total lift">
                            <div className="kpi-label">Total inspeccionadas</div>
                            <div className="kpi-value">{totalInspeccionadas.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Gráfica */}
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border" role="status" />
                    </div>
                ) : (
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer>
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                                {/* Gradientes */}
                                <defs>
                                    <linearGradient id="gradOK" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.ok} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={COLORS.ok} stopOpacity={0.4} />
                                    </linearGradient>
                                    <linearGradient id="gradNOK" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.nok} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={COLORS.nok} stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                                <XAxis dataKey="categoria" />
                                <YAxis yAxisId="qty" />
                                <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} unit="%" />
                                <Tooltip content={<PrettyTooltip />} />
                                <Legend />

                                <Bar
                                    yAxisId="qty"
                                    dataKey="cantidad"
                                    name="Cantidad"
                                    barSize={46}
                                    isAnimationActive
                                    animationBegin={150}
                                    animationDuration={900}
                                >
                                    {chartData.map((entry, idx) => (
                                        <Cell
                                            key={`cell-oknok-${idx}`}
                                            fill={entry.categoria === 'OK' ? 'url(#gradOK)' : 'url(#gradNOK)'}
                                        />
                                    ))}
                                </Bar>

                                <Line
                                    yAxisId="pct"
                                    type="monotone"
                                    dataKey="acumPct"
                                    name="% acumulado"
                                    dot={false}
                                    stroke={COLORS.line}
                                    strokeWidth={3}
                                    isAnimationActive
                                    animationBegin={250}
                                    animationDuration={900}
                                />

                                {/* Línea objetivo 80% */}
                                <ReferenceLine
                                    yAxisId="pct"
                                    y={80}
                                    stroke="#94a3b8"
                                    strokeDasharray="4 4"
                                    ifOverflow="extendDomain"
                                    label={{ value: '80%', position: 'right', fill: '#64748b', fontSize: 12 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================
// Card 2: Pareto de Defectos (con filtros, % acumulado, línea 80% y tabla paginada)
// =============================
function ParetoDefectos() {
    const [filtros, setFiltros] = useState({
        fecha_desde: yyyyMmDd(primerDiaMes),
        fecha_hasta: yyyyMmDd(ultimoDiaMes),
        tipo: 'rechazo' as 'rechazo' | 'retrabajo' | 'todos',
    });

    const [rows, setRows] = useState<Categoria[]>([]);
    const [totalDef, setTotalDef] = useState(0);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // --- PAGINACIÓN ---
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const rangoValido = useMemo(
        () => (!filtros.fecha_desde || !filtros.fecha_hasta) || (filtros.fecha_desde <= filtros.fecha_hasta),
        [filtros]
    );

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<number | null>(null);

    const consultar = async (params: { fecha_desde?: string; fecha_hasta?: string; tipo?: string }) => {
        if (!rangoValido) return;
        try {
            setLoading(true);
            setErr(null);

            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            const res = await axios.get(`${API}dashboard.php`, {
                params: {
                    fecha_desde: params.fecha_desde || undefined,
                    fecha_hasta: params.fecha_hasta || undefined,
                    tipo: params.tipo || 'rechazo',
                    _t: Date.now(),
                },
                signal: abortRef.current.signal as any,
            });

            const categorias: Categoria[] = Array.isArray(res.data?.categorias) ? res.data.categorias : [];
            const total = Number(
                res.data?.total_defectos ??
                categorias.reduce((s, c) => s + Number(c.cantidad || 0), 0)
            );

            setRows(categorias);
            setTotalDef(total);
        } catch (e: any) {
            if (!axios.isCancel?.(e)) setErr(e?.message || 'Error cargando defectos');
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial
    useEffect(() => { consultar(filtros); /* eslint-disable-next-line */ }, []);

    // Cambia TIPO → actualizar ya
    useEffect(() => {
        setPage(1);
        consultar(filtros);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.tipo]);

    // Cambian FECHAS → debounce
    useEffect(() => {
        if (!rangoValido) return;
        setPage(1);
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => consultar(filtros), 350);
        return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.fecha_desde, filtros.fecha_hasta, rangoValido]);

    const chartData = useMemo(() => {
        if (!rows.length) return [];
        return rows.map(r => ({
            motivo: r.categoria,
            cantidad: Number(r.cantidad),
            acumulado_pct: Number(r.acumulado_pct),
        }));
    }, [rows]);

    // --- datos paginados para la tabla ---
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const pageSafe = Math.min(page, totalPages);
    const start = (pageSafe - 1) * pageSize;
    const visible = rows.slice(start, start + pageSize);

    const goPrev = () => setPage(p => Math.max(1, p - 1));
    const goNext = () => setPage(p => Math.min(totalPages, p + 1));

    return (
        <div className="card card-fancy">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <strong className="card-title-gradient">
                    Pareto de {filtros.tipo === 'todos' ? 'defectos (rechazo + retrabajo)' : filtros.tipo}
                </strong>
                <div className="row gy-2 gx-2 align-items-end">
                    <div className="col-auto">
                        <label className="form-label mb-1">Desde</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filtros.fecha_desde}
                            onChange={(e) => setFiltros(f => ({ ...f, fecha_desde: e.target.value }))}
                        />
                    </div>
                    <div className="col-auto">
                        <label className="form-label mb-1">Hasta</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filtros.fecha_hasta}
                            onChange={(e) => setFiltros(f => ({ ...f, fecha_hasta: e.target.value }))}
                        />
                    </div>
                    <div className="col-auto">
                        <label className="form-label mb-1">Tipo</label>
                        <select
                            className="form-select"
                            value={filtros.tipo}
                            onChange={(e) => setFiltros(f => ({ ...f, tipo: e.target.value as any }))}
                        >
                            <option value="rechazo">Rechazo</option>
                            <option value="retrabajo">Retrabajo</option>
                            <option value="todos">Ambos</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card-body">
                {!rangoValido && (
                    <div className="alert alert-warning mb-3">El rango de fechas no es válido.</div>
                )}
                {err && <div className="alert alert-danger mb-3">{err}</div>}

                <div className="mb-2 text-muted">
                    Total {filtros.tipo === 'retrabajo' ? 'retrabajos' : filtros.tipo === 'rechazo' ? 'rechazos' : 'motivos'}:{' '}
                    <strong>{totalDef.toLocaleString()}</strong>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border" role="status" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="alert alert-warning mb-3">Sin datos para el rango/tipo seleccionado.</div>
                ) : (
                    <div style={{ width: '100%', height: 420 }} className="mb-3">
                        <ResponsiveContainer>
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                                {/* Gradiente para barras de defectos */}
                                <defs>
                                    <linearGradient id="gradDEF" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                                <XAxis dataKey="motivo" interval={0} angle={-45} textAnchor="end" height={70} />
                                <YAxis yAxisId="qty" />
                                <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} unit="%" />
                                <Tooltip content={<PrettyTooltip />} />
                                <Legend />

                                <Bar
                                    yAxisId="qty"
                                    dataKey="cantidad"
                                    name="Cantidad"
                                    barSize={28}
                                    fill="url(#gradDEF)"
                                    isAnimationActive
                                    animationBegin={120}
                                    animationDuration={900}
                                />
                                <Line
                                    yAxisId="pct"
                                    type="monotone"
                                    dataKey="acumulado_pct"
                                    name="% acumulado"
                                    dot={false}
                                    stroke={COLORS.line}
                                    strokeWidth={3}
                                    isAnimationActive
                                    animationBegin={220}
                                    animationDuration={900}
                                />

                                {/* Línea objetivo 80% */}
                                <ReferenceLine
                                    yAxisId="pct"
                                    y={80}
                                    stroke="#94a3b8"
                                    strokeDasharray="4 4"
                                    ifOverflow="extendDomain"
                                    label={{ value: '80%', position: 'right', fill: '#64748b', fontSize: 12 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Tabla paginada */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-muted small">
                        Mostrando <strong>{visible.length}</strong> de <strong>{rows.length}</strong> categorías
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label className="me-1 text-muted small">Por página</label>
                        <select
                            className="form-select form-select-sm"
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            style={{ width: 90 }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <div className="ms-3 text-muted small">
                            Página <strong>{pageSafe}</strong> de <strong>{totalPages}</strong>
                        </div>
                        <div className="btn-group ms-2">
                            <button className="btn btn-outline-secondary btn-sm" disabled={pageSafe <= 1} onClick={goPrev}>
                                ← Anterior
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" disabled={pageSafe >= totalPages} onClick={goNext}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover fancy-table mb-0">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>#</th>
                                <th>Motivo</th>
                                <th className="text-end">Cantidad</th>
                                <th className="text-end">% Acumulado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((r, idx) => (
                                <tr key={r.categoria + idx}>
                                    <td>{start + idx + 1}</td>
                                    <td>{r.categoria}</td>
                                    <td className="text-end">{Number(r.cantidad).toLocaleString()}</td>
                                    <td className="text-end">{Number(r.acumulado_pct).toFixed(2)}%</td>
                                </tr>
                            ))}
                            {!visible.length && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-3">
                                        Sin datos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

// =============================
// Página Dashboard con LayoutPrivado
// =============================
export default function Dashboard() {
    const { usuario } = useAuth();

    return (
        <LayoutPrivado>
            <div className="dashboard-content">
                <h1 className="dash-title">Bienvenido, {usuario?.nombre} 👋</h1>

                {/* 1) OK vs NO OK */}
                <ParetoOkVsNok />

                {/* 2) Pareto de Defectos */}
                <ParetoDefectos />
            </div>
        </LayoutPrivado>
    );
}

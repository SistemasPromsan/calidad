import { useAuth } from '../context/AuthContext';
import LayoutPrivado from '../components/LayoutPrivado';


export default function Dashboard() {
    const { usuario } = useAuth();

    return (
        <LayoutPrivado>
            <div className="dashboard-content">
                <h1>Bienvenido, {usuario?.nombre} 👋</h1>

                <div className="cards">
                    <div className="card">
                        <p className="card-title">Usuarios registrados</p>
                        <h2>132</h2>
                    </div>
                    <div className="card">
                        <p className="card-title">Inspecciones hoy</p>
                        <h2>27</h2>
                    </div>
                    <div className="card">
                        <p className="card-title">Total registros</p>
                        <h2>896</h2>
                    </div>
                </div>

                <div className="grafica-falsa">
                    <h3>Actividad reciente</h3>
                    <p>Aquí iría una gráfica en el futuro.</p>
                </div>
            </div>
        </LayoutPrivado>
    );
}

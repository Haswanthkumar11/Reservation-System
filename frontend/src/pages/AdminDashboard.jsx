import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import TrendChart from '../components/charts/TrendChart';
import StatusChart from '../components/charts/StatusChart';
import Alert from '../components/Alert';
import { Icon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { adminListReservations } from '../services/reservationApi';
import { listTables } from '../services/tableApi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminListReservations(), listTables()])
      .then(([res, tbl]) => {
        setReservations(res);
        setTables(tbl);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayCount = reservations.filter((r) => r.reservationDate === today).length;
  const activeTables = tables.filter((t) => t.isActive).length;
  const occupied = new Set(
    reservations.filter((r) => r.reservationDate === today && r.status === 'confirmed').map((r) => r.table?._id)
  ).size;
  const occupancyRate = tables.length ? Math.round((occupied / tables.length) * 100) : 0;

  const statusCounts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([label, value]) => ({ label, value }));

  const recent = [...reservations]
    .sort((a, b) => (a.reservationDate < b.reservationDate ? 1 : -1))
    .slice(0, 6);

  return (
    <DashboardShell title="Dashboard">
      <p className="page-greeting">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
      <Alert type="error" message={error} />

      <h2 className="section-title">Reservation Overview</h2>
      <div className="kpi-grid">
        <StatCard icon={Icon.Calendar} label="Total Reservations" value={reservations.length} percent={72} tone="primary" />
        <StatCard icon={Icon.Clock} label="Today's Reservations" value={todayCount} percent={Math.min(todayCount * 10, 100)} tone="warning" />
        <StatCard icon={Icon.Table} label="Available Tables" value={`${activeTables}/${tables.length}`} percent={tables.length ? Math.round((activeTables / tables.length) * 100) : 0} tone="success" />
        <StatCard icon={Icon.Trend} label="Occupancy Rate" value={`${occupancyRate}%`} percent={occupancyRate} tone="danger" />
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Reservation Trend</h3>
            <span className="demo-tag">Demo data</span>
          </div>
          <TrendChart />
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>Status Distribution</h3>
            {!statusData.length && <span className="demo-tag">Demo data</span>}
          </div>
          <StatusChart data={statusData} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Recent Reservations</h3>
          <Link to="/admin/reservations" className="panel-link">View all</Link>
        </div>
        {loading ? (
          <p className="loading-state">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="empty-state">No reservations yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Customer</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r._id}>
                    <td>{r.customer?.name}</td>
                    <td>{r.reservationDate}</td>
                    <td>{r.timeSlot}</td>
                    <td>{r.guestCount}</td>
                    <td>{r.table?.tableNumber}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Table Status</h3>
          <span className="demo-tag">"Cleaning" is demo-only</span>
        </div>
        <div className="table-status-grid">
          {tables.map((t, i) => {
            const reservedNow = reservations.some(
              (r) => r.reservationDate === today && r.status === 'confirmed' && r.table?._id === t._id
            );
            const status = !t.isActive ? 'cleaning' : reservedNow ? 'reserved' : 'available';
            const label = { available: 'Available', reserved: 'Reserved', cleaning: 'Cleaning' }[status];
            return (
              <div key={t._id} className={`table-status-chip status-${status}`}>
                <span className="table-status-dot" />
                <div><strong>{t.tableNumber}</strong><small>{label}</small></div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-actions">
        <Link className="quick-action" to="/admin/reservations">
          <Icon.Calendar width={20} height={20} />
          <div><strong>Manage Reservations</strong><small>Filter, update or cancel bookings</small></div>
        </Link>
        <Link className="quick-action" to="/admin/tables">
          <Icon.Table width={20} height={20} />
          <div><strong>Manage Tables</strong><small>Add tables or toggle availability</small></div>
        </Link>
      </div>
    </DashboardShell>
  );
}

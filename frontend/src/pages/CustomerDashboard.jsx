import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import { Icon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { getMyReservations } from '../services/reservationApi';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = reservations
    .filter((r) => r.status === 'confirmed' && r.reservationDate >= today)
    .sort((a, b) => (a.reservationDate > b.reservationDate ? 1 : -1))[0];
  const upcomingCount = reservations.filter((r) => r.status === 'confirmed' && r.reservationDate >= today).length;
  const pastCount = reservations.filter((r) => r.status === 'confirmed' && r.reservationDate < today).length;
  const cancelledCount = reservations.filter((r) => r.status === 'cancelled').length;
  const favoriteSlot = useMemo(() => {
    if (!reservations.length) return '—';
    const counts = {};
    reservations.forEach((r) => { counts[r.timeSlot] = (counts[r.timeSlot] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [reservations]);
  const recent = reservations.slice(0, 4);

  return (
    <DashboardShell title="My Space">
      <p className="page-greeting">Hello, {user?.name?.split(' ')[0]} 👋</p>

      <div className="kpi-grid">
        <StatCard icon={Icon.Calendar} label="Upcoming Reservations" value={upcomingCount} tone="primary" />
        <StatCard icon={Icon.Check} label="Past Reservations" value={pastCount} tone="success" />
        <StatCard icon={Icon.XCircle} label="Cancelled" value={cancelledCount} tone="danger" />
        <StatCard icon={Icon.Clock} label="Favorite Time Slot" value={favoriteSlot} tone="warning" />
      </div>

      <div className="dash-grid-2">
        <div className="panel upcoming-card">
          <div className="panel-head"><h3>Upcoming Reservation</h3></div>
          {loading ? (
            <p className="loading-state">Loading…</p>
          ) : upcoming ? (
            <div className="upcoming-body">
              <div className="upcoming-date">
                <Icon.Calendar width={22} height={22} />
                <div>
                  <strong>{upcoming.reservationDate}</strong>
                  <small>{upcoming.timeSlot} · {upcoming.guestCount} guests</small>
                </div>
              </div>
              <span className={`badge badge-${upcoming.status}`}>{upcoming.status}</span>
            </div>
          ) : (
            <p className="empty-state">No upcoming reservations. Ready to book a table?</p>
          )}
          <Link className="btn" to="/reservations/new"><Icon.Plus width={16} height={16} /> Quick Book</Link>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Restaurant Information</h3></div>
          <ul className="info-list">
            <li><Icon.Clock width={16} height={16} /> Open daily · 11:00 AM – 11:00 PM</li>
            <li><Icon.MapPin width={16} height={16} /> 24 Harborview Lane, Guntur</li>
            <li><Icon.Users width={16} height={16} /> Parties up to 12 — larger groups, contact us</li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Reservation History</h3>
          <Link to="/reservations/my" className="panel-link">View all</Link>
        </div>
        {loading ? (
          <p className="loading-state">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="empty-state">You have no reservations yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r._id}>
                    <td>{r.reservationDate}</td>
                    <td>{r.timeSlot}</td>
                    <td>{r.guestCount}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

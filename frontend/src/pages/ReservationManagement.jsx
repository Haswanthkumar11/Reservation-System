import { useEffect, useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import Alert from '../components/Alert';
import { Icon } from '../components/icons';
import {
  adminListReservations,
  adminListByDate,
  adminUpdateReservation,
  adminCancelReservation,
} from '../services/reservationApi';
import { getSlots } from '../services/settingsApi';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '', timeSlot: '', search: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { getSlots().then(setSlots).catch(() => {}); }, []);

  const load = async (f = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = { status: f.status || undefined, timeSlot: f.timeSlot || undefined, search: f.search || undefined };
      setReservations(f.date ? await adminListByDate(f.date, params) : await adminListReservations(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = (e) => { e.preventDefault(); load(filters); };
  const handleReset = () => { const cleared = { date: '', status: '', timeSlot: '', search: '' }; setFilters(cleared); load(cleared); };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    try { await adminCancelReservation(id); load(filters); } catch (err) { setError(err.message); }
  };

  const handleStatusChange = async (id, status) => {
    try { await adminUpdateReservation(id, { status }); load(filters); } catch (err) { setError(err.message); }
  };

  const shortId = (id) => `#${id.slice(-6).toUpperCase()}`;

  return (
    <DashboardShell title="Reservations">
      <Alert type="error" message={error} />

      <form onSubmit={handleSearch} className="filter-bar">
        <div className="filter-field">
          <Icon.Search width={15} height={15} />
          <input name="search" placeholder="Search name, email, table, date, status…" value={filters.search} onChange={handleFilterChange} />
        </div>
        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
        <select name="timeSlot" value={filters.timeSlot} onChange={handleFilterChange}>
          <option value="">Any time</option>
          {slots.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Any status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-sm" type="submit">Search</button>
        <button className="btn btn-outline btn-sm" type="button" onClick={handleReset}>Reset Filters</button>
      </form>

      <div className="panel">
        {loading ? (
          <p className="loading-state">Loading reservations…</p>
        ) : reservations.length === 0 ? (
          <p className="empty-state">No reservations found.</p>
        ) : (
          <>
            <div className="table-wrap table-wrap-desktop">
              <table className="table">
                <thead>
                  <tr><th>Reservation #</th><th>Customer</th><th>Date</th><th>Time</th><th>Table</th><th>Guests</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id}>
                      <td>{shortId(r._id)}</td>
                      <td>{r.customer?.name}<br /><small>{r.customer?.email}</small></td>
                      <td>{r.reservationDate}</td>
                      <td>{r.timeSlot}</td>
                      <td>{r.table?.tableNumber} (cap {r.table?.capacity})</td>
                      <td>{r.guestCount}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td className="actions-cell">
                        <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)}>
                          <option value="confirmed">confirmed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        {r.status !== 'cancelled' && (
                          <button className="link-btn" onClick={() => handleCancel(r._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-list">
              {reservations.map((r) => (
                <div className="record-card" key={r._id}>
                  <div className="record-card-row">
                    <strong>{shortId(r._id)} · {r.customer?.name}</strong>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                  <div className="record-card-row"><span>Date</span><span>{r.reservationDate} · {r.timeSlot}</span></div>
                  <div className="record-card-row"><span>Guests</span><span>{r.guestCount}</span></div>
                  <div className="record-card-row"><span>Table</span><span>{r.table?.tableNumber}</span></div>
                  <div className="record-card-actions">
                    <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)}>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    {r.status !== 'cancelled' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleCancel(r._id)}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

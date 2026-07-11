import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import Alert from '../components/Alert';
import { getMyReservations, cancelMyReservation } from '../services/reservationApi';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ date: '', table: '', status: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setReservations(await getMyReservations());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await cancelMyReservation(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const tableOptions = useMemo(
    () => [...new Set(reservations.map((r) => r.table?.tableNumber).filter(Boolean))],
    [reservations]
  );

  const filtered = reservations.filter((r) => {
    if (filters.date && r.reservationDate !== filters.date) return false;
    if (filters.table && r.table?.tableNumber !== filters.table) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  const shortId = (id) => `#${id.slice(-6).toUpperCase()}`;
  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleReset = () => setFilters({ date: '', table: '', status: '' });

  return (
    <DashboardShell title="My Reservations">
      <Alert type="error" message={error} />

      <div className="filter-bar">
        <input type="date" name="date" value={filters.date} onChange={handleChange} />
        <select name="table" value={filters.table} onChange={handleChange}>
          <option value="">Any table</option>
          {tableOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">Any status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-outline btn-sm" type="button" onClick={handleReset}>Reset Filters</button>
      </div>

      <div className="panel">
        {loading ? (
          <p className="loading-state">Loading reservations…</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">No reservations match your filters.</p>
        ) : (
          <>
            <div className="table-wrap table-wrap-desktop">
              <table className="table">
                <thead>
                  <tr><th>Reservation #</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id}>
                      <td>{shortId(r._id)}</td>
                      <td>{r.reservationDate}</td>
                      <td>{r.timeSlot}</td>
                      <td>{r.guestCount}</td>
                      <td>{r.table?.tableNumber} (cap {r.table?.capacity})</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>{r.status === 'confirmed' && <button className="link-btn" onClick={() => handleCancel(r._id)}>Cancel</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-list">
              {filtered.map((r) => (
                <div className="record-card" key={r._id}>
                  <div className="record-card-row">
                    <strong>{shortId(r._id)} · {r.reservationDate}</strong>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                  <div className="record-card-row"><span>Time</span><span>{r.timeSlot}</span></div>
                  <div className="record-card-row"><span>Guests</span><span>{r.guestCount}</span></div>
                  <div className="record-card-row"><span>Table</span><span>{r.table?.tableNumber} (cap {r.table?.capacity})</span></div>
                  {r.status === 'confirmed' && (
                    <button className="btn btn-outline btn-sm btn-block" onClick={() => handleCancel(r._id)}>Cancel</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

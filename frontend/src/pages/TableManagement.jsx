import { useEffect, useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import Alert from '../components/Alert';
import { listTables, createTable, updateTable, deleteTable } from '../services/tableApi';
import { getSettings, updateSettings } from '../services/settingsApi';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ tableNumber: '', capacity: '' });
  const [settings, setSettings] = useState(null);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setTables(await listTables());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); getSettings().then(setSettings).catch(() => {}); }, []);

  const handleSettingsChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsMsg('');
    try {
      const saved = await updateSettings(settings);
      setSettings(saved);
      setSettingsMsg('Restaurant hours updated — booking slots regenerate automatically.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTable({ tableNumber: form.tableNumber, capacity: Number(form.capacity) });
      setForm({ tableNumber: '', capacity: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (table) => {
    try {
      await updateTable(table._id, { isActive: !table.isActive });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this table?')) return;
    try {
      await deleteTable(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardShell title="Tables">
      <Alert type="error" message={error} />

      <div className="panel">
        <h3 style={{ marginBottom: 4 }}>Restaurant Hours</h3>
        <p style={{ fontSize: 13, marginBottom: 10 }}>Booking slots are generated automatically from these settings.</p>
        <Alert type="success" message={settingsMsg} />
        {settings && (
          <form onSubmit={handleSettingsSave} className="inline-form">
            <input type="time" name="openingTime" value={settings.openingTime} onChange={handleSettingsChange} />
            <input type="time" name="closingTime" value={settings.closingTime} onChange={handleSettingsChange} />
            <input type="number" name="slotDurationMinutes" min={5} max={240} value={settings.slotDurationMinutes} onChange={handleSettingsChange} title="Slot duration (minutes)" />
            <button className="btn btn-sm" type="submit">Save</button>
          </form>
        )}
      </div>

      <form onSubmit={handleCreate} className="inline-form">
        <input name="tableNumber" placeholder="Table number (e.g. T5)" value={form.tableNumber} onChange={handleChange} required />
        <input name="capacity" type="number" placeholder="Capacity" min={1} value={form.capacity} onChange={handleChange} required />
        <button className="btn" type="submit">Add Table</button>
      </form>

      <div className="panel">
        {loading ? (
          <p className="loading-state">Loading tables…</p>
        ) : tables.length === 0 ? (
          <p className="empty-state">No tables yet. Add one above to get started.</p>
        ) : (
          <>
            <div className="table-wrap table-wrap-desktop">
              <table className="table">
                <thead><tr><th>Table</th><th>Capacity</th><th>Active</th><th></th></tr></thead>
                <tbody>
                  {tables.map((t) => (
                    <tr key={t._id}>
                      <td>{t.tableNumber}</td>
                      <td>{t.capacity}</td>
                      <td><button className="link-btn" onClick={() => handleToggleActive(t)}>{t.isActive ? 'Active' : 'Inactive'}</button></td>
                      <td><button className="link-btn" onClick={() => handleDelete(t._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-list">
              {tables.map((t) => (
                <div className="record-card" key={t._id}>
                  <div className="record-card-row"><strong>Table {t.tableNumber}</strong><span className={`badge ${t.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></div>
                  <div className="record-card-row"><span>Capacity</span><span>{t.capacity}</span></div>
                  <div className="record-card-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggleActive(t)}>{t.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
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

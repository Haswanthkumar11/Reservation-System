import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import Alert from '../components/Alert';
import { Icon } from '../components/icons';
import { createReservation, previewAllocation } from '../services/reservationApi';
import { getSlots } from '../services/settingsApi';

const STEPS = ['Date', 'Time', 'Guests', 'Confirm'];

export default function CreateReservation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ reservationDate: '', timeSlot: '', guestCount: 2 });
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { getSlots().then(setSlots).catch(() => {}); }, []);

  const today = new Date().toISOString().split('T')[0];

  const goPreview = async () => {
    setError('');
    setPreviewLoading(true);
    setPreview(null);
    try {
      const table = await previewAllocation(form);
      setPreview(table);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const reservation = await createReservation(form);
      setSuccess(`Reservation confirmed at table ${reservation.table.tableNumber} (capacity ${reservation.table.capacity}).`);
      setTimeout(() => navigate('/reservations/my'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Quick Book">
      <div className="panel panel-narrow">
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`stepper-item ${i === step ? 'stepper-active' : ''} ${i < step ? 'stepper-done' : ''}`}>
              <span className="stepper-dot">{i < step ? '✓' : i + 1}</span>
              <span className="stepper-label">{s}</span>
            </div>
          ))}
        </div>

        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        {step === 0 && (
          <div className="wizard-step">
            <label>Choose a date</label>
            <input type="date" min={today} value={form.reservationDate}
              onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} />
            <button className="btn btn-block" disabled={!form.reservationDate} onClick={() => setStep(1)}>Next</button>
          </div>
        )}

        {step === 1 && (
          <div className="wizard-step">
            <label>Choose a time</label>
            <select value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}>
              <option value="">Select a time…</option>
              {slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="wizard-actions">
              <button className="btn btn-outline" onClick={() => setStep(0)}>Back</button>
              <button className="btn" disabled={!form.timeSlot} onClick={() => setStep(2)}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <label>Number of guests</label>
            <input type="number" min={1} value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} />
            <div className="wizard-actions">
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn" disabled={previewLoading} onClick={goPreview}>
                {previewLoading ? 'Checking availability…' : 'Preview Table'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            {preview ? (
              <div className="allocation-preview">
                <Icon.Table width={22} height={22} />
                <div>
                  <strong>Table {preview.tableNumber}</strong>
                  <small>Capacity {preview.capacity} · Allocated automatically</small>
                </div>
              </div>
            ) : (
              <p className="empty-state">No table available for that date, time and party size.</p>
            )}
            <div className="wizard-actions">
              <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
              <button className="btn" disabled={!preview || loading} onClick={handleSubmit}>
                {loading ? 'Booking…' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

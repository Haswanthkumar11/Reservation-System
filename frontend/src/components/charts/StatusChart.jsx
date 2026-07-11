const COLORS = {
  confirmed: '#16a34a',
  pending: '#d97706',
  completed: '#6b7280',
  cancelled: '#dc2626',
  'no-show': '#9333ea',
};

// Demo distribution used only when there is no live data yet.
const DEMO = [
  { label: 'confirmed', value: 14 },
  { label: 'pending', value: 4 },
  { label: 'completed', value: 9 },
  { label: 'cancelled', value: 3 },
];

export default function StatusChart({ data }) {
  const bars = data && data.length ? data : DEMO;
  const W = 320;
  const H = 200;
  const pad = 28;
  const max = Math.max(...bars.map((b) => b.value), 1) * 1.2;
  const gap = 18;
  const barW = (W - pad * 2 - gap * (bars.length - 1)) / bars.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none" role="img" aria-label="Reservation status distribution">
      {bars.map((b, i) => {
        const h = (b.value / max) * (H - pad * 1.8);
        const x = pad + i * (barW + gap);
        const y = H - pad - h;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill={COLORS[b.label] || 'var(--primary)'} opacity="0.9" />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="chart-bar-value">{b.value}</text>
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="chart-axis-label">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

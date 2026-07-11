// Demonstration data — not wired to live analytics. See README "Dashboard Analytics".
const DEMO = [12, 18, 14, 22, 19, 27, 24];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TrendChart({ data = DEMO, labels = DAYS }) {
  const W = 560;
  const H = 200;
  const pad = 28;
  const max = Math.max(...data) * 1.15;
  const step = (W - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = H - pad - (v / max) * (H - pad * 1.6);
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1][0]},${H - pad} L${points[0][0]},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none" role="img" aria-label="Weekly reservation trend, demonstration data">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 1.6)} y2={H - pad - f * (H - pad * 1.6)} className="chart-gridline" />
      ))}
      <path d={areaPath} fill="url(#trendFill)" stroke="none" />
      <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={pad + i * step} y={H - 6} className="chart-axis-label" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

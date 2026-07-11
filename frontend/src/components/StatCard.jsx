export default function StatCard({ icon: IconCmp, label, value, sublabel, percent, tone = 'primary' }) {
  return (
    <div className="stat-card2">
      <div className="stat-card2-top">
        <span className={`stat-card2-icon tone-${tone}`}><IconCmp width={18} height={18} /></span>
      </div>
      <div className="stat-card2-value">{value}</div>
      <div className="stat-card2-label">{label}</div>
      {typeof percent === 'number' && (
        <div className="stat-card2-progress">
          <div className="stat-card2-progress-bar" style={{ width: `${percent}%` }} />
        </div>
      )}
      {sublabel && <div className="stat-card2-sub">{sublabel}</div>}
    </div>
  );
}

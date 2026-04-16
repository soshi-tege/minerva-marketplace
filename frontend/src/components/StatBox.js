export default function StatBox({ label, value, color }) {
  return (
    <div className="stat-box" style={{ background: color + "18", color }}>
      <div className="stat-box-value">{value}</div>
      <div className="stat-box-label">{label}</div>
    </div>
  );
}

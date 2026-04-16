export default function SectionCard({ title, children }) {
  return (
    <div className="card section-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

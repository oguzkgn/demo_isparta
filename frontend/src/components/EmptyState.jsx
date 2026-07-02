export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden />
      {title && <p className="empty-state-title">{title}</p>}
      {description && <p className="empty-state-desc">{description}</p>}
      {action}
    </div>
  );
}

"use client";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card p-8 text-center animate-slide-in">
      <div className="text-5xl mb-3 opacity-60">{icon}</div>
      <div className="text-primary font-medium mb-1">{title}</div>
      {description && <div className="text-sm text-muted mb-3">{description}</div>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}

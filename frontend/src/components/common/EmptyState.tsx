/**
 * Component trạng thái rỗng - hiển thị khi không có dữ liệu.
 */
import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-4 text-base-tertiary">{icon || <Inbox className="h-16 w-16" />}</div>
      <h3 className="text-lg font-medium text-base-primary mb-2">{title}</h3>
      {description && <p className="text-sm text-base-secondary max-w-md mb-4">{description}</p>}
      {action}
    </div>
  );
}

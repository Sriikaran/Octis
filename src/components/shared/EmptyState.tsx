import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed bg-white">
      <div className="rounded-full bg-stone-100 p-3 mb-4">
        <FolderOpen className="h-6 w-6 text-stone-400" />
      </div>
      <h3 className="text-lg font-medium text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-500 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-amber-700 hover:bg-amber-800 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

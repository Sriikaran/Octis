import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium leading-6 text-stone-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {children}
      </div>
    </div>
  );
}

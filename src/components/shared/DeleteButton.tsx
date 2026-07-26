import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteButton({ children, label = 'Delete', ...props }: React.ComponentProps<typeof Button> & { label?: string }) {
  return (
    <Button variant="destructive" {...props}>
      <Trash2 className="mr-2 h-4 w-4" />
      {children || label}
    </Button>
  );
}

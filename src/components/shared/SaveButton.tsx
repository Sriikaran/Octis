import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface SaveButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  label?: string;
}

export function SaveButton({ isLoading, label = 'Save', children, ...props }: SaveButtonProps) {
  return (
    <Button disabled={isLoading} className="bg-amber-700 hover:bg-amber-800 text-white" {...props}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {children || label}
    </Button>
  );
}

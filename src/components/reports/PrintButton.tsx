'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button 
      variant="outline" 
      onClick={handlePrint} 
      className="gap-2 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Print Report
    </Button>
  );
}

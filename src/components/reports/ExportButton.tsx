'use client';

import * as React from 'react';
import * as xlsx from 'xlsx';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ExportButtonProps {
  data: Record<string, string | number>[];
  filename: string;
  reportName: string;
  filters: { label: string; value: string }[];
  disabled?: boolean;
}

export function ExportButton({ data, filename, reportName, filters, disabled }: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Create the metadata header block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aoa: any[][] = [];
    aoa.push(['Jewellery Tracking System']);
    aoa.push([reportName]);
    aoa.push(['Generated On', format(new Date(), 'dd/MM/yyyy hh:mm a')]);
    aoa.push(['Applied Filters']);
    
    filters.forEach(f => {
      aoa.push([f.label, f.value]);
    });
    
    // Blank row before data
    aoa.push([]);

    // Data Headers
    if (data.length > 0) {
      aoa.push(Object.keys(data[0]));
    }

    // Data Rows (format numeric values with exactly 3 decimals as strings)
    data.forEach(row => {
      const rowData = Object.values(row).map(val => {
        if (typeof val === 'number') {
          return val.toFixed(3); // force 3 decimals as string so Excel doesn't trim
        }
        return val;
      });
      aoa.push(rowData);
    });

    const worksheet = xlsx.utils.aoa_to_sheet(aoa);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Generate Excel file and trigger download
    xlsx.writeFile(workbook, filename);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      disabled={disabled || data.length === 0}
      className="gap-2 print:hidden"
    >
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
}

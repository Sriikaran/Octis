'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { GoldDistributionRecord } from '@/types';
import { DataTable } from '@/components/shared/DataTable';
import { formatDate, formatDecimal } from '@/utils';
import { Button } from '@/components/ui/button';


interface GoldDistributionTableProps {
  data: GoldDistributionRecord[];
  onEdit: (record: GoldDistributionRecord) => void;
  onDelete: (record: GoldDistributionRecord) => void;
}

export function GoldDistributionTable({ data, onEdit, onDelete }: GoldDistributionTableProps) {
  const columns: ColumnDef<GoldDistributionRecord>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'worker',
      header: 'Worker',
    },
    {
      accessorKey: 'subWorker',
      header: 'Sub Worker',
      cell: ({ row }) => row.getValue('subWorker') || '-',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => formatDecimal(row.getValue('quantity'), 3),
    },
    {
      accessorKey: 'purity',
      header: 'Purity',
      cell: ({ row }) => formatDecimal(row.getValue('purity'), 3),
    },
    {
      accessorKey: 'totalPure',
      header: 'Total Pure',
      cell: ({ row }) => <span className="font-semibold">{formatDecimal(row.getValue('totalPure'), 3)}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(record)}
              className="h-8 w-8 text-stone-500 hover:text-stone-900"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(record)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} />;
}

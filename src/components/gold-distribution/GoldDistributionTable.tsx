'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Edit2 } from 'lucide-react';
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
      header: 'Actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(record)}
              className="text-stone-700 hover:text-amber-700"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(record)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} />;
}

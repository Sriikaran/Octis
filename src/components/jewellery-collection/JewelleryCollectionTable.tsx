'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { JewelleryCollectionRecord } from '@/types';
import { DataTable } from '@/components/shared/DataTable';
import { formatDate, formatDecimal } from '@/utils';
import { Button } from '@/components/ui/button';

interface JewelleryCollectionTableProps {
  data: JewelleryCollectionRecord[];
  onEdit: (record: JewelleryCollectionRecord) => void;
  onDelete: (record: JewelleryCollectionRecord) => void;
}

export function JewelleryCollectionTable({
  data,
  onEdit,
  onDelete,
}: JewelleryCollectionTableProps) {
  const columns: ColumnDef<JewelleryCollectionRecord>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: 'worker',
      header: 'Worker',
    },
    {
      accessorKey: 'item',
      header: 'Item',
    },
    {
      accessorKey: 'manualTag',
      header: 'Manual Tag',
    },
    {
      accessorKey: 'grossWeight',
      header: 'Gross Wt',
      cell: ({ row }) => formatDecimal(row.original.grossWeight, 3),
    },
    {
      accessorKey: 'stoneWeight',
      header: 'Stone Wt',
      cell: ({ row }) => formatDecimal(row.original.stoneWeight, 3),
    },
    {
      accessorKey: 'tagWeight',
      header: 'Tag Wt',
      cell: ({ row }) => formatDecimal(row.original.tagWeight, 3),
    },
    {
      accessorKey: 'netWeight',
      header: 'Net Wt',
      cell: ({ row }) => formatDecimal(row.original.netWeight, 3),
    },
    {
      accessorKey: 'purity',
      header: 'Purity %',
      cell: ({ row }) => formatDecimal(row.original.purity, 3),
    },
    {
      accessorKey: 'totalPure',
      header: 'Total Pure',
      cell: ({ row }) => formatDecimal(row.original.totalPure, 3),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 text-stone-500 hover:text-stone-900"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}

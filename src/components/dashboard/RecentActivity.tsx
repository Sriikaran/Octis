'use client';

import * as React from 'react';
import Link from 'next/link';
import { GoldDistributionRecord, JewelleryCollectionRecord } from '@/types';
import { DataTable } from '@/components/shared/DataTable';
import { formatDecimal, formatDate, parseValidDate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecentActivityProps {
  goldRecords: GoldDistributionRecord[];
  jewelleryRecords: JewelleryCollectionRecord[];
}

export function RecentActivity({ goldRecords, jewelleryRecords }: RecentActivityProps) {
  const router = useRouter();



  const goldColumns: ColumnDef<GoldDistributionRecord>[] = React.useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    { accessorKey: 'worker', header: 'Worker' },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => formatDecimal(row.getValue('quantity'), 3),
    },
    {
      accessorKey: 'totalPure',
      header: 'Total Pure',
      cell: ({ row }) => formatDecimal(row.getValue('totalPure'), 3),
    },
  ], []);

  const jewelleryColumns: ColumnDef<JewelleryCollectionRecord>[] = React.useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    { accessorKey: 'worker', header: 'Worker' },
    { accessorKey: 'item', header: 'Item' },
    { accessorKey: 'manualTag', header: 'Manual Tag' },
    {
      accessorKey: 'netWeight',
      header: 'Net Wt',
      cell: ({ row }) => formatDecimal(row.getValue('netWeight'), 3),
    },
  ], []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <Card className="bg-white border-stone-200">
        <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0 pb-2 border-b">
          <CardTitle className="text-lg font-bold text-stone-800">
            Recent Gold Distribution
          </CardTitle>
          <Link href="/gold-distribution">
            <Button variant="ghost" size="sm" className="text-[#8c7355] hover:text-[#4A3219] flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            className="max-h-[400px] overflow-auto [&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-stone-50"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('tbody tr')) {
                router.push('/gold-distribution');
              }
            }}
          >
            <DataTable 
              columns={goldColumns} 
              data={goldRecords} 
              hideSearch={true} 
              className="overflow-auto w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-stone-200">
        <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0 pb-2 border-b">
          <CardTitle className="text-lg font-bold text-stone-800">
            Recent Jewellery Collection
          </CardTitle>
          <Link href="/jewellery-collection">
            <Button variant="ghost" size="sm" className="text-[#8c7355] hover:text-[#4A3219] flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            className="max-h-[400px] overflow-auto [&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-stone-50"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('tbody tr')) {
                router.push('/jewellery-collection');
              }
            }}
          >
            <DataTable 
              columns={jewelleryColumns} 
              data={jewelleryRecords} 
              hideSearch={true} 
              className="overflow-auto w-full h-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

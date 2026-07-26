'use client';

import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { JewelleryCollectionRecord } from '@/types';
import { jewelleryCollectionService } from '@/services/jewelleryCollectionService';
import { DataTable } from '@/components/shared/DataTable';
import { ReportFilters } from './ReportFilters';
import { ReportSummaryCards } from './ReportSummaryCards';
import { ExportButton } from './ExportButton';
import { PrintButton } from './PrintButton';
import { formatDecimal, formatDate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { masterDataService } from '@/services/masterDataService';
import { format } from 'date-fns';

interface Props {
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  worker: string;
  setWorker: (worker: string) => void;
}

export function JewelleryCollectionReport({
  dateFrom, setDateFrom, dateTo, setDateTo, worker, setWorker
}: Props) {
  const [records, setRecords] = useState<JewelleryCollectionRecord[]>([]);

  const [workersList, setWorkersList] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [workers, recordsData] = await Promise.all([
          masterDataService.getWorkers(),
          jewelleryCollectionService.getAll()
        ]);
        setWorkersList(workers.map(w => ({ label: w.name, value: w.name })));
        setRecords(recordsData);
      } catch {
        // Handled silently or toast
      }
    };
    initializeData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      let matches = true;
      if (worker) {
        matches = matches && record.worker === worker;
      }
      if (dateFrom) {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        matches = matches && recordDate >= from;
      }
      if (dateTo) {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        const to = new Date(dateTo);
        to.setHours(0, 0, 0, 0);
        matches = matches && recordDate <= to;
      }
      return matches;
    });
  }, [records, worker, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const totalGross = filteredRecords.reduce((sum, r) => sum + r.grossWeight, 0);
    const totalNet = filteredRecords.reduce((sum, r) => sum + r.netWeight, 0);
    const totalPure = filteredRecords.reduce((sum, r) => sum + r.totalPure, 0);
    return [
      { title: 'Total Records', value: filteredRecords.length },
      { title: 'Total Gross Weight', value: formatDecimal(totalGross, 3) },
      { title: 'Total Net Weight', value: formatDecimal(totalNet, 3) },
      { title: 'Total Pure', value: formatDecimal(totalPure, 3) },
    ];
  }, [filteredRecords]);

  const columns: ColumnDef<JewelleryCollectionRecord>[] = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    { accessorKey: 'worker', header: 'Worker' },
    { accessorKey: 'item', header: 'Item' },
    { accessorKey: 'manualTag', header: 'Manual Tag' },
    {
      accessorKey: 'grossWeight',
      header: 'Gross Wt',
      cell: ({ row }) => formatDecimal(row.getValue('grossWeight'), 3),
    },
    {
      accessorKey: 'stoneWeight',
      header: 'Stone Wt',
      cell: ({ row }) => formatDecimal(row.getValue('stoneWeight'), 3),
    },
    {
      accessorKey: 'tagWeight',
      header: 'Tag Wt',
      cell: ({ row }) => formatDecimal(row.getValue('tagWeight'), 3),
    },
    {
      accessorKey: 'netWeight',
      header: 'Net Wt',
      cell: ({ row }) => formatDecimal(row.getValue('netWeight'), 3),
    },
    {
      accessorKey: 'purity',
      header: 'Purity (%)',
      cell: ({ row }) => formatDecimal(row.getValue('purity'), 3),
    },
    {
      accessorKey: 'totalPure',
      header: 'Total Pure',
      cell: ({ row }) => formatDecimal(row.getValue('totalPure'), 3),
    },
  ], []);

  const handleClear = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setWorker('');
  };

  const exportData = filteredRecords.map(r => ({
    Date: formatDate(r.date),
    Worker: r.worker,
    Item: r.item,
    'Manual Tag': r.manualTag,
    'Gross Weight': r.grossWeight,
    'Stone Weight': r.stoneWeight,
    'Tag Weight': r.tagWeight,
    'Net Weight': r.netWeight,
    Purity: r.purity,
    'Total Pure': r.totalPure
  }));

  const appliedFilters = [
    { label: 'Date From', value: dateFrom ? format(dateFrom, 'dd/MM/yyyy') : '' },
    { label: 'Date To', value: dateTo ? format(dateTo, 'dd/MM/yyyy') : '' },
    { label: 'Worker', value: worker || '' }
  ].filter(f => f.value !== '');

  return (
    <div className="space-y-4">
      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Jewellery Tracking System</h2>
        <h3 className="text-xl text-stone-600 mt-1">Jewellery Collection Report</h3>
        <p className="text-sm text-stone-500 mt-4">Generated On: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
        
        {appliedFilters.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-stone-700">Applied Filters</p>
            <div className="mt-2 text-sm text-stone-600 grid grid-cols-2 gap-2 max-w-sm">
              {appliedFilters.map((f, i) => (
                <React.Fragment key={i}>
                  <div>{f.label}</div>
                  <div className="font-medium text-stone-800">{f.value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReportFilters
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        worker={worker}
        setWorker={setWorker}
        workersList={workersList}
        onClear={handleClear}
      />
      
      <ReportSummaryCards metrics={summary} />
      
      <div className="flex justify-end gap-2 print:hidden mb-4">
        <PrintButton />
        <ExportButton 
          data={exportData} 
          filename="jewellery-collection-report.xlsx" 
          reportName="Jewellery Collection Report"
          filters={appliedFilters}
        />
      </div>

      <DataTable columns={columns} data={filteredRecords} />
    </div>
  );
}

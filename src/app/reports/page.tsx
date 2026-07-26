'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoldDistributionReport } from '@/components/reports/GoldDistributionReport';
import { JewelleryCollectionReport } from '@/components/reports/JewelleryCollectionReport';
import { ManualTagReport } from '@/components/reports/ManualTagReport';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

function ReportsContent() {
  const searchParams = useSearchParams();
  
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [worker, setWorker] = useState<string>('');
  const [manualTag, setManualTag] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const workerParam = searchParams.get('worker');
    if (workerParam && worker !== workerParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorker(workerParam);
    }
    // Simulate initial loading to align with dashboard loading pattern
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filterProps = {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    worker,
    setWorker
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Reports</h1>
          <p className="text-sm text-stone-500 mt-1">
            View, filter, print, and export reports across all modules.
          </p>
        </div>
      </div>

      <Tabs defaultValue="gold" className="w-full">
        <TabsList className="mb-4 print:hidden">
          <TabsTrigger value="gold">Gold Distribution</TabsTrigger>
          <TabsTrigger value="jewellery">Jewellery Collection</TabsTrigger>
          <TabsTrigger value="manualtag">Manual Tag</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="mt-8 space-y-8">
             <div className="flex gap-4">
               <div className="h-10 w-48 bg-stone-200 rounded animate-pulse" />
               <div className="h-10 w-48 bg-stone-200 rounded animate-pulse" />
             </div>
             <TableSkeleton rows={10} />
          </div>
        ) : (
          <>
            <TabsContent value="gold" className="m-0">
              <GoldDistributionReport {...filterProps} />
            </TabsContent>
            
            <TabsContent value="jewellery" className="m-0">
              <JewelleryCollectionReport {...filterProps} />
            </TabsContent>
            
            <TabsContent value="manualtag" className="m-0">
              <ManualTagReport 
                {...filterProps} 
                manualTag={manualTag} 
                setManualTag={setManualTag} 
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={10} />}>
      <ReportsContent />
    </Suspense>
  );
}

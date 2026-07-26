'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDecimal } from '@/utils';
import { navigateToReports } from '@/utils/navigation';

interface TopWorker {
  name: string;
  value: number;
}

interface TopWorkersProps {
  topGoldWorkers: TopWorker[];
  topJewelleryWorkers: TopWorker[];
}

export function TopWorkers({ topGoldWorkers, topJewelleryWorkers }: TopWorkersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card className="bg-white border-stone-200">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg font-bold text-stone-800">
            Top 5 Workers (Gold Distributed)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {topGoldWorkers.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">No data available.</p>
          ) : (
            <div className="space-y-4">
              {topGoldWorkers.map((worker, index) => (
                <Link 
                  href={navigateToReports({ worker: worker.name })} 
                  key={index} 
                  className="flex justify-between items-center group cursor-pointer p-2 -mx-2 rounded-md hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fcf8f2] text-[#8c7355] flex items-center justify-center text-xs font-bold border border-[#e2d5c8] group-hover:bg-[#f3e8da]">
                      {index + 1}
                    </div>
                    <span className="font-medium text-stone-700 group-hover:text-stone-900">{worker.name}</span>
                  </div>
                  <span className="font-bold text-[#4A3219]">{formatDecimal(worker.value, 3)} qty</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-stone-200">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg font-bold text-stone-800">
            Top 5 Workers (Jewellery Collected)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {topJewelleryWorkers.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">No data available.</p>
          ) : (
            <div className="space-y-4">
              {topJewelleryWorkers.map((worker, index) => (
                <Link 
                  href={navigateToReports({ worker: worker.name })} 
                  key={index} 
                  className="flex justify-between items-center group cursor-pointer p-2 -mx-2 rounded-md hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fcf8f2] text-[#8c7355] flex items-center justify-center text-xs font-bold border border-[#e2d5c8] group-hover:bg-[#f3e8da]">
                      {index + 1}
                    </div>
                    <span className="font-medium text-stone-700 group-hover:text-stone-900">{worker.name}</span>
                  </div>
                  <span className="font-bold text-[#4A3219]">{formatDecimal(worker.value, 3)} wt</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

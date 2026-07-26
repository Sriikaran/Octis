'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickStatisticsProps {
  goldEntriesCount: number;
  jewelleryEntriesCount: number;
}

export function QuickStatistics({ goldEntriesCount, jewelleryEntriesCount }: QuickStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="bg-[#fcf8f2] border-[#e2d5c8]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#8c7355]">
            Gold Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#4A3219]">{goldEntriesCount}</div>
        </CardContent>
      </Card>
      <Card className="bg-[#fcf8f2] border-[#e2d5c8]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#8c7355]">
            Jewellery Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#4A3219]">{jewelleryEntriesCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}

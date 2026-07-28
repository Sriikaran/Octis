'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryMetric {
  title: string;
  value: React.ReactNode;
}

interface ReportSummaryCardsProps {
  metrics: SummaryMetric[];
}

export function ReportSummaryCards({ metrics }: ReportSummaryCardsProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:flex print:flex-row print:w-full gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="print:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

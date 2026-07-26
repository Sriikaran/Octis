'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export interface SummaryMetric {
  title: string;
  value: React.ReactNode;
  trend?: {
    status: 'positive' | 'negative' | 'none' | 'new';
    formattedValue?: string;
  };
  linkTo?: string;
}

interface SummaryCardsProps {
  metrics: SummaryMetric[];
  isLoading?: boolean;
}

export function SummaryCards({ metrics, isLoading = false }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white border-stone-200 animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-stone-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-stone-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-stone-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const CardContentWrapper = ({ children }: { children: React.ReactNode }) => (
          metric.linkTo ? (
            <Link href={metric.linkTo} className="block h-full transition-transform hover:-translate-y-1 hover:shadow-md rounded-xl">
              {children}
            </Link>
          ) : (
            <div className="h-full">{children}</div>
          )
        );

        return (
          <CardContentWrapper key={index}>
            <Card className="bg-white border-stone-200 h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-500">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#4A3219]">{metric.value}</div>
                {metric.trend && (
                  <div className="mt-2 flex items-center text-xs">
                    {metric.trend.status === 'positive' && (
                      <span className="flex items-center text-emerald-600 font-medium">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        {metric.trend.formattedValue}
                      </span>
                    )}
                    {metric.trend.status === 'negative' && (
                      <span className="flex items-center text-rose-600 font-medium">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        {metric.trend.formattedValue}
                      </span>
                    )}
                    {metric.trend.status === 'none' && (
                      <span className="flex items-center text-stone-400 font-medium">
                        <Minus className="h-3 w-3 mr-1" />
                        —
                      </span>
                    )}
                    {metric.trend.status === 'new' && (
                      <span className="flex items-center text-emerald-600 font-medium">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        New
                      </span>
                    )}
                    {metric.trend.status !== 'none' && metric.trend.status !== 'new' && (
                      <span className="text-stone-400 ml-2">vs previous period</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContentWrapper>
        );
      })}
    </div>
  );
}

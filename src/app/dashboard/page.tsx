'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoldDistributionRecord, JewelleryCollectionRecord } from '@/types';
import { goldDistributionService } from '@/services/goldDistributionService';
import { jewelleryCollectionService } from '@/services/jewelleryCollectionService';
import { DashboardFilters, DashboardFilterType } from '@/components/dashboard/DashboardFilters';
import { SummaryCards, SummaryMetric } from '@/components/dashboard/SummaryCards';
import { QuickStatistics } from '@/components/dashboard/QuickStatistics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TopWorkers } from '@/components/dashboard/TopWorkers';
import { formatDecimal } from '@/utils';
import { startOfWeek, startOfMonth, startOfYear, isWithinInterval, subDays, subWeeks, subMonths, subYears, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [goldRecords, setGoldRecords] = useState<GoldDistributionRecord[]>([]);
  const [jewelleryRecords, setJewelleryRecords] = useState<JewelleryCollectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [filterType, setFilterType] = useState<DashboardFilterType>('Today');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [gdData, jcData] = await Promise.all([
        goldDistributionService.getAll(),
        jewelleryCollectionService.getAll()
      ]);
      setGoldRecords(gdData);
      setJewelleryRecords(jcData);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const refreshDashboard = () => {
    fetchData();
  };

  // Sync dateFrom and dateTo based on filterType
  useEffect(() => {
    const today = new Date();
    switch (filterType) {
      case 'Today':
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDateFrom(today);
        setDateTo(today);
        break;
      case 'Yesterday':
        setDateFrom(subDays(today, 1));
        setDateTo(subDays(today, 1));
        break;
      case 'This Week':
        setDateFrom(startOfWeek(today, { weekStartsOn: 1 }));
        setDateTo(today);
        break;
      case 'This Month':
        setDateFrom(startOfMonth(today));
        setDateTo(today);
        break;
      case 'This Year':
        setDateFrom(startOfYear(today));
        setDateTo(today);
        break;
    }
  }, [filterType]);

  const calculatePreviousPeriod = (currentFrom: Date, currentTo: Date, type: DashboardFilterType) => {
    switch (type) {
      case 'Today':
        return { from: subDays(currentFrom, 1), to: subDays(currentTo, 1) };
      case 'Yesterday':
        return { from: subDays(currentFrom, 1), to: subDays(currentTo, 1) };
      case 'This Week':
        return { from: subWeeks(currentFrom, 1), to: subWeeks(currentTo, 1) };
      case 'This Month':
        return { from: subMonths(currentFrom, 1), to: subMonths(currentTo, 1) };
      case 'This Year':
        return { from: subYears(currentFrom, 1), to: subYears(currentTo, 1) };
      case 'Custom Date Range':
      default:
        // For custom ranges, compute the same duration immediately preceding
        const diff = differenceInDays(currentTo, currentFrom) + 1;
        return { from: subDays(currentFrom, diff), to: subDays(currentTo, diff) };
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return { status: 'none' as const };
    if (previous === 0 && current > 0) return { status: 'new' as const };
    
    const change = ((current - previous) / previous) * 100;
    const isPositive = change >= 0;
    return {
      status: (isPositive ? 'positive' : 'negative') as 'positive' | 'negative',
      formattedValue: `${isPositive ? '+' : ''}${change.toFixed(1)}%`
    };
  };

  // Helper to filter records by a specific date range
  const filterByDateRange = <T extends { date: string }>(records: T[], from?: Date, to?: Date) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      if (from && to) {
        const start = new Date(from);
        start.setHours(0, 0, 0, 0);
        const end = new Date(to);
        end.setHours(0, 0, 0, 0);
        return recordDate >= start && recordDate <= end;
      }
      if (from) {
        const start = new Date(from);
        start.setHours(0, 0, 0, 0);
        return recordDate >= start;
      }
      if (to) {
        const end = new Date(to);
        end.setHours(0, 0, 0, 0);
        return recordDate <= end;
      }
      return true;
    });
  };

  const filteredGold = useMemo(() => filterByDateRange(goldRecords, dateFrom, dateTo), [goldRecords, dateFrom, dateTo]);
  const filteredJewellery = useMemo(() => filterByDateRange(jewelleryRecords, dateFrom, dateTo), [jewelleryRecords, dateFrom, dateTo]);

  // Previous period filtering for trends
  const prevDateRange = useMemo(() => {
    if (!dateFrom || !dateTo) return null;
    return calculatePreviousPeriod(dateFrom, dateTo, filterType);
  }, [dateFrom, dateTo, filterType]);

  const prevFilteredGold = useMemo(() => 
    prevDateRange ? filterByDateRange(goldRecords, prevDateRange.from, prevDateRange.to) : [], 
  [goldRecords, prevDateRange]);
  
  const prevFilteredJewellery = useMemo(() => 
    prevDateRange ? filterByDateRange(jewelleryRecords, prevDateRange.from, prevDateRange.to) : [], 
  [jewelleryRecords, prevDateRange]);

  // Calculate Summary Cards
  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    const totalGoldDist = filteredGold.reduce((sum, r) => sum + r.quantity, 0);
    const totalJewelleryCol = filteredJewellery.reduce((sum, r) => sum + r.netWeight, 0);
    const totalPureDist = filteredGold.reduce((sum, r) => sum + r.totalPure, 0);
    const totalPureCol = filteredJewellery.reduce((sum, r) => sum + r.totalPure, 0);

    const prevTotalGoldDist = prevFilteredGold.reduce((sum, r) => sum + r.quantity, 0);
    const prevTotalJewelleryCol = prevFilteredJewellery.reduce((sum, r) => sum + r.netWeight, 0);
    const prevTotalPureDist = prevFilteredGold.reduce((sum, r) => sum + r.totalPure, 0);
    const prevTotalPureCol = prevFilteredJewellery.reduce((sum, r) => sum + r.totalPure, 0);
    
    const uniqueWorkers = new Set([
      ...filteredGold.map(r => r.worker),
      ...filteredJewellery.map(r => r.worker)
    ]).size;

    return [
      { 
        title: 'Total Gold Distributed', 
        value: `${formatDecimal(totalGoldDist, 3)} qty`,
        trend: calculateTrend(totalGoldDist, prevTotalGoldDist),
        linkTo: '/gold-distribution'
      },
      { 
        title: 'Total Jewellery Collected', 
        value: `${formatDecimal(totalJewelleryCol, 3)} wt`,
        trend: calculateTrend(totalJewelleryCol, prevTotalJewelleryCol),
        linkTo: '/jewellery-collection'
      },
      { 
        title: 'Total Pure Distributed', 
        value: formatDecimal(totalPureDist, 3),
        trend: calculateTrend(totalPureDist, prevTotalPureDist)
      },
      { 
        title: 'Total Pure Collected', 
        value: formatDecimal(totalPureCol, 3),
        trend: calculateTrend(totalPureCol, prevTotalPureCol)
      },
      { 
        title: 'Total Workers', 
        value: uniqueWorkers,
        linkTo: '/reports'
      },
      { 
        title: 'Total Jewellery Pieces', 
        value: filteredJewellery.length 
      },
    ];
  }, [filteredGold, filteredJewellery, prevFilteredGold, prevFilteredJewellery]);

  // Quick Statistics
  const goldCount = filteredGold.length;
  const jewelleryCount = filteredJewellery.length;

  // Recent Activity
  const recentGold = useMemo(() => {
    return [...filteredGold].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [filteredGold]);

  const recentJewellery = useMemo(() => {
    return [...filteredJewellery].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [filteredJewellery]);

  // Top Workers
  const topGoldWorkers = useMemo(() => {
    const workerTotals: Record<string, number> = {};
    filteredGold.forEach(r => {
      workerTotals[r.worker] = (workerTotals[r.worker] || 0) + r.quantity;
    });
    return Object.entries(workerTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredGold]);

  const topJewelleryWorkers = useMemo(() => {
    const workerTotals: Record<string, number> = {};
    filteredJewellery.forEach(r => {
      workerTotals[r.worker] = (workerTotals[r.worker] || 0) + r.netWeight;
    });
    return Object.entries(workerTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredJewellery]);

  return (
    <div className="flex flex-col gap-6 w-full h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">
            Overview of gold distribution and jewellery collection.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshDashboard} 
          disabled={isRefreshing}
          className="text-stone-600 bg-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <DashboardFilters 
        filterType={filterType}
        setFilterType={setFilterType}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      <SummaryCards metrics={summaryMetrics} isLoading={isLoading} />
      
      {!isLoading && (
        <>
          <QuickStatistics 
            goldEntriesCount={goldCount} 
            jewelleryEntriesCount={jewelleryCount} 
          />

          <RecentActivity 
            goldRecords={recentGold} 
            jewelleryRecords={recentJewellery} 
          />

          <TopWorkers 
            topGoldWorkers={topGoldWorkers} 
            topJewelleryWorkers={topJewelleryWorkers} 
          />
        </>
      )}
    </div>
  );
}

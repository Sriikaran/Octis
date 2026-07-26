'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type DashboardFilterType = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'This Year' | 'Custom Date Range';

interface DashboardFiltersProps {
  filterType: DashboardFilterType;
  setFilterType: (f: DashboardFilterType) => void;
  dateFrom: Date | undefined;
  setDateFrom: (d: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (d: Date | undefined) => void;
}

export function DashboardFilters({
  filterType,
  setFilterType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}: DashboardFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-md border border-stone-200 mb-6 flex flex-col md:flex-row gap-4 items-end print:hidden">
      <div className="flex flex-col gap-2 w-full md:w-auto flex-1 max-w-xs">
        <Label className="text-xs text-stone-500">Period</Label>
        <Select value={filterType} onValueChange={(val) => { if (val) setFilterType(val as DashboardFilterType); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="Yesterday">Yesterday</SelectItem>
            <SelectItem value="This Week">This Week</SelectItem>
            <SelectItem value="This Month">This Month</SelectItem>
            <SelectItem value="This Year">This Year</SelectItem>
            <SelectItem value="Custom Date Range">Custom Date Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filterType === 'Custom Date Range' && (
        <>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1 max-w-xs">
            <Label className="text-xs text-stone-500">Date From</Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto flex-1 max-w-xs">
            <Label className="text-xs text-stone-500">Date To</Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}
    </div>
  );
}

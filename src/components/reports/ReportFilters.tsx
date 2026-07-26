'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatableDropdown } from '@/components/shared/CreatableDropdown';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ReportFiltersProps {
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
  worker: string;
  setWorker: (worker: string) => void;
  workersList: { label: string; value: string }[];
  manualTag?: string;
  setManualTag?: (tag: string) => void;
  showManualTag?: boolean;
  onClear: () => void;
}

export function ReportFilters({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  worker,
  setWorker,
  workersList,
  manualTag,
  setManualTag,
  showManualTag,
  onClear,
}: ReportFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-md border border-stone-200 mb-6 flex flex-col md:flex-row gap-4 items-end print:hidden">
      <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
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

      <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
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

      <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
        <Label className="text-xs text-stone-500">Worker</Label>
        <CreatableDropdown
          options={workersList}
          value={worker}
          onChange={setWorker}
          placeholder="All Workers"
        />
      </div>

      {showManualTag && setManualTag && (
        <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
          <Label className="text-xs text-stone-500">Manual Tag</Label>
          <Input 
            value={manualTag || ''} 
            onChange={(e) => setManualTag(e.target.value)} 
            placeholder="Search by tag..."
          />
        </div>
      )}

      <div className="w-full md:w-auto flex items-end">
        <Button variant="ghost" onClick={onClear} className="w-full md:w-auto gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}

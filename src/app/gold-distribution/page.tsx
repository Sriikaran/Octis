'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/PageHeader';
import { PageContainer } from '@/components/shared/PageContainer';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { GoldDistributionForm } from '@/components/gold-distribution/GoldDistributionForm';
import { GoldDistributionTable } from '@/components/gold-distribution/GoldDistributionTable';
import { goldDistributionService } from '@/services/goldDistributionService';
import { GoldDistributionRecord } from '@/types';
import { masterDataService } from '@/services/masterDataService';

export default function GoldDistributionPage() {
  const [records, setRecords] = useState<GoldDistributionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingRecord, setEditingRecord] = useState<GoldDistributionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<GoldDistributionRecord | null>(null);

  // Dynamic Options state
  const [workerOptions, setWorkerOptions] = useState<{label: string, value: string}[]>([]);
  const [purityOptions, setPurityOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [workers, purities, recordsData] = await Promise.all([
          masterDataService.getWorkers(),
          masterDataService.getPurities(),
          goldDistributionService.getAll()
        ]);
        
        setWorkerOptions(workers.map(w => ({ label: w.name, value: w.name })));
        setPurityOptions(purities.map(p => ({ label: p.label, value: p.value.toString() })));
        setRecords(recordsData);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);



  const handleAddWorker = (name: string) => {
    if (!workerOptions.some(w => w.value.toLowerCase() === name.toLowerCase())) {
      setWorkerOptions(prev => [...prev, { label: name, value: name }]);
    }
  };

  const handleAddPurity = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val) && !purityOptions.some(p => p.value === val.toString())) {
      setPurityOptions(prev => [...prev, { label: val.toFixed(3), value: val.toString() }]);
    }
  };

  const handleFormSubmit = async (data: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        const updated = await goldDistributionService.update(editingRecord.id, data, editingRecord);
        setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Record updated successfully.');
        setEditingRecord(null); // Switch back to create mode
      } else {
        const created = await goldDistributionService.create(data);
        setRecords(prev => [created, ...prev]);
        toast.success('Gold Distribution record created successfully.');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    try {
      await goldDistributionService.delete(deletingRecord.id, deletingRecord);
      setRecords(prev => prev.filter(r => r.id !== deletingRecord.id));
      toast.success('Record deleted successfully.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete record');
    } finally {
      setDeletingRecord(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Gold Distribution" 
        description="Record and manage gold issued to workers." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <GoldDistributionForm
            initialData={editingRecord}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            workerOptions={workerOptions}
            purityOptions={purityOptions}
            onAddWorker={handleAddWorker}
            onAddPurity={handleAddPurity}
          />
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center flex-1 text-stone-500">
              Loading records...
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col flex-1">
              <GoldDistributionTable 
                data={records} 
                onEdit={setEditingRecord} 
                onDelete={setDeletingRecord} 
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={!!deletingRecord}
        title="Delete Record"
        description={`Are you sure you want to delete this record for ${deletingRecord?.worker}?`}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeletingRecord(null);
        }}
      />
    </PageContainer>
  );
}

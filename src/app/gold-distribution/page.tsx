'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/PageHeader';
import { PageContainer } from '@/components/shared/PageContainer';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { GoldDistributionForm } from '@/components/gold-distribution/GoldDistributionForm';
import { GoldDistributionTable } from '@/components/gold-distribution/GoldDistributionTable';
import { goldDistributionService } from '@/services/goldDistributionService';
import { GoldDistributionRecord } from '@/types';
import { masterDataService } from '@/services/masterDataService';
import { Option } from '@/components/shared/CreatableDropdown';

export default function GoldDistributionPage() {
  const [records, setRecords] = useState<GoldDistributionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingRecord, setEditingRecord] = useState<GoldDistributionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<GoldDistributionRecord | null>(null);

  // Dynamic Options state
  const [workerOptions, setWorkerOptions] = useState<Option[]>([]);
  const [purityOptions, setPurityOptions] = useState<Option[]>([]);

  const loadMasterData = useCallback(async (forceRefresh = false) => {
    try {
      const [workers, purities] = await Promise.all([
        masterDataService.getWorkers(forceRefresh),
        masterDataService.getPurities(forceRefresh),
      ]);

      setWorkerOptions(workers.map((w) => ({ label: w.name, value: w.name })));
      setPurityOptions(purities.map((p) => ({ label: p.label, value: p.value.toString() })));
    } catch (error: unknown) {
      console.error('Failed to load master data', error);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadMasterData();
        const recordsData = await goldDistributionService.getAll();
        setRecords(recordsData);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Subscribe to global master data cache updates
    const unsubscribe = masterDataService.subscribe(() => {
      loadMasterData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadMasterData]);

  const handleAddWorker = async (name: string) => {
    try {
      await masterDataService.createWorker(name);
      toast.success(`✓ Worker "${name}" created.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create worker');
    }
  };

  const handleDeleteWorker = async (option: Option) => {
    try {
      await masterDataService.deleteWorker(option.value);
      toast.success(`✓ Worker "${option.label}" deleted.`);
    } catch (error: any) {
      toast.error(error.message || `Cannot delete worker "${option.label}"`);
    }
  };

  const handleAddPurity = async (valStr: string) => {
    try {
      await masterDataService.createPurity(valStr);
      toast.success(`✓ Purity ${valStr}% created.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purity');
    }
  };

  const handleDeletePurity = async (option: Option) => {
    try {
      await masterDataService.deletePurity(option.value);
      toast.success(`✓ Purity "${option.label}" deleted.`);
    } catch (error: any) {
      toast.error(error.message || `Cannot delete purity "${option.label}"`);
    }
  };

  const handleFormSubmit = async (data: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        const updated = await goldDistributionService.update(editingRecord.id, data, editingRecord);
        setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Record updated successfully.');
        setEditingRecord(null);
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
            onDeleteWorker={handleDeleteWorker}
            onAddPurity={handleAddPurity}
            onDeletePurity={handleDeletePurity}
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

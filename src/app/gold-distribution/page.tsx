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
  const [workerOptions, setWorkerOptions] = useState<{label: string, value: string, id: string}[]>([]);
  const [purityOptions, setPurityOptions] = useState<{label: string, value: string, id: string}[]>([]);
  
  const [isCreatingWorker, setIsCreatingWorker] = useState(false);
  const [isDeletingWorker, setIsDeletingWorker] = useState(false);
  const [isCreatingPurity, setIsCreatingPurity] = useState(false);
  const [isDeletingPurity, setIsDeletingPurity] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [workers, purities, recordsData] = await Promise.all([
          masterDataService.getWorkers(),
          masterDataService.getPurities(),
          goldDistributionService.getAll()
        ]);
        
        setWorkerOptions(workers.map(w => ({ label: w.name, value: w.name, id: w.id })));
        setPurityOptions(purities.map(p => ({ label: p.label, value: p.value.toString(), id: p.id || '' })));
        setRecords(recordsData);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);



  const handleAddWorker = async (name: string) => {
    if (!name.trim()) return;
    setIsCreatingWorker(true);
    try {
      const newWorker = await masterDataService.createWorker(name.trim());
      setWorkerOptions(prev => [...prev, { label: newWorker.name, value: newWorker.name, id: newWorker.id }]);
      toast.success('Worker created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create worker');
    } finally {
      setIsCreatingWorker(false);
    }
  };

  const handleDeleteWorker = async (option: { label: string, value: string, id?: string }) => {
    if (!option.id) return;
    setIsDeletingWorker(true);
    try {
      await masterDataService.deleteWorker(option.id, option.label);
      setWorkerOptions(prev => prev.filter(w => w.id !== option.id));
      toast.success('Worker deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete worker. It might be in use.');
    } finally {
      setIsDeletingWorker(false);
    }
  };

  const handleAddPurity = async (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    setIsCreatingPurity(true);
    try {
      const newPurity = await masterDataService.createPurity(val);
      setPurityOptions(prev => [...prev, { label: newPurity.label, value: newPurity.value.toString(), id: newPurity.id || '' }]);
      toast.success('Purity created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purity');
    } finally {
      setIsCreatingPurity(false);
    }
  };

  const handleDeletePurity = async (option: { label: string, value: string, id?: string }) => {
    if (!option.id) return;
    setIsDeletingPurity(true);
    try {
      await masterDataService.deletePurity(option.id, parseFloat(option.value));
      setPurityOptions(prev => prev.filter(p => p.id !== option.id));
      toast.success('Purity deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purity. It might be in use.');
    } finally {
      setIsDeletingPurity(false);
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

      <div className="flex flex-col gap-6 flex-1">
        <div>
          <GoldDistributionForm
            initialData={editingRecord}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            workerOptions={workerOptions}
            purityOptions={purityOptions}
            onAddWorker={handleAddWorker}
            onAddPurity={handleAddPurity}
            onDeleteWorker={handleDeleteWorker}
            onDeletePurity={handleDeletePurity}
            isCreatingWorker={isCreatingWorker}
            isDeletingWorker={isDeletingWorker}
            isCreatingPurity={isCreatingPurity}
            isDeletingPurity={isDeletingPurity}
          />
        </div>

        <div className="flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center flex-1 text-stone-500">
              Loading records...
            </div>
          ) : (
            <div className="flex flex-col flex-1">
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

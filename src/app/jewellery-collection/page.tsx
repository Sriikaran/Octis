'use client';

import { useState, useEffect, useCallback } from 'react';
import { JewelleryCollectionRecord } from '@/types';
import { jewelleryCollectionService } from '@/services/jewelleryCollectionService';
import { JewelleryCollectionForm } from '@/components/jewellery-collection/JewelleryCollectionForm';
import { JewelleryCollectionTable } from '@/components/jewellery-collection/JewelleryCollectionTable';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { masterDataService } from '@/services/masterDataService';
import { Option } from '@/components/shared/CreatableDropdown';
import { toast } from 'sonner';

export default function JewelleryCollectionPage() {
  const [records, setRecords] = useState<JewelleryCollectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JewelleryCollectionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<JewelleryCollectionRecord | null>(null);

  const [workerOptions, setWorkerOptions] = useState<Option[]>([]);
  const [itemOptions, setItemOptions] = useState<Option[]>([]);
  const [purityOptions, setPurityOptions] = useState<Option[]>([]);

  const loadMasterData = useCallback(async (forceRefresh = false) => {
    try {
      const [workers, items, purities] = await Promise.all([
        masterDataService.getWorkers(forceRefresh),
        masterDataService.getItems(forceRefresh),
        masterDataService.getPurities(forceRefresh),
      ]);

      setWorkerOptions(workers.map((w) => ({ label: w.name, value: w.name })));
      setItemOptions(items.map((i) => ({ label: i.name, value: i.name })));
      setPurityOptions(purities.map((p) => ({ label: p.label, value: p.value.toString() })));
    } catch (error: unknown) {
      console.error('Failed to load master data', error);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadMasterData();
        const recordsData = await jewelleryCollectionService.getAll();
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

  const handleAddItem = async (name: string) => {
    try {
      await masterDataService.createItem(name);
      toast.success(`✓ Item "${name}" created.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create item');
    }
  };

  const handleDeleteItem = async (option: Option) => {
    try {
      await masterDataService.deleteItem(option.value);
      toast.success(`✓ Item "${option.label}" deleted.`);
    } catch (error: any) {
      toast.error(error.message || `Cannot delete item "${option.label}"`);
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

  const handleFormSubmit = async (data: Omit<JewelleryCollectionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'netWeight' | 'totalPure'>) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        const updated = await jewelleryCollectionService.update(editingRecord.id, data, editingRecord);
        setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Record updated successfully.');
        setEditingRecord(null);
      } else {
        const created = await jewelleryCollectionService.create(data);
        setRecords(prev => [created, ...prev]);
        toast.success('Jewellery Collection record created successfully.');
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
      await jewelleryCollectionService.delete(deletingRecord.id, deletingRecord);
      setRecords(prev => prev.filter(r => r.id !== deletingRecord.id));
      toast.success('Record deleted successfully.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete record');
    } finally {
      setDeletingRecord(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Jewellery Collection</h1>
        <p className="text-stone-500 mt-1">Receive finished jewellery from workers.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <JewelleryCollectionForm
            initialData={editingRecord}
            onSubmit={handleFormSubmit}
            workerOptions={workerOptions}
            itemOptions={itemOptions}
            purityOptions={purityOptions}
            onAddWorker={handleAddWorker}
            onDeleteWorker={handleDeleteWorker}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onAddPurity={handleAddPurity}
            onDeletePurity={handleDeletePurity}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="xl:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
              <p className="text-stone-500">Loading records...</p>
            </div>
          ) : (
            <JewelleryCollectionTable
              data={records}
              onEdit={setEditingRecord}
              onDelete={setDeletingRecord}
            />
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={!!deletingRecord}
        onOpenChange={(open) => !open && setDeletingRecord(null)}
        title="Delete Record"
        description="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete"
      />
    </div>
  );
}

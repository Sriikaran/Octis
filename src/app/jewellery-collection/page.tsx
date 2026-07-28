'use client';

import { useState, useEffect } from 'react';
import { JewelleryCollectionRecord } from '@/types';
import { jewelleryCollectionService } from '@/services/jewelleryCollectionService';
import { JewelleryCollectionForm } from '@/components/jewellery-collection/JewelleryCollectionForm';
import { JewelleryCollectionTable } from '@/components/jewellery-collection/JewelleryCollectionTable';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { masterDataService } from '@/services/masterDataService';
import { toast } from 'sonner';

export default function JewelleryCollectionPage() {
  const [records, setRecords] = useState<JewelleryCollectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JewelleryCollectionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<JewelleryCollectionRecord | null>(null);

  const [workerOptions, setWorkerOptions] = useState<{label: string, value: string, id: string}[]>([]);
  const [itemOptions, setItemOptions] = useState<{label: string, value: string, id: string}[]>([]);
  const [purityOptions, setPurityOptions] = useState<{label: string, value: string, id: string}[]>([]);

  const [isCreatingWorker, setIsCreatingWorker] = useState(false);
  const [isDeletingWorker, setIsDeletingWorker] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isCreatingPurity, setIsCreatingPurity] = useState(false);
  const [isDeletingPurity, setIsDeletingPurity] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [workers, items, purities, recordsData] = await Promise.all([
          masterDataService.getWorkers(),
          masterDataService.getItems(),
          masterDataService.getPurities(),
          jewelleryCollectionService.getAll()
        ]);
        
        setWorkerOptions(workers.map(w => ({ label: w.name, value: w.name, id: w.id })));
        setItemOptions(items.map(i => ({ label: i.name, value: i.name, id: i.id })));
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

  const handleAddItem = async (name: string) => {
    if (!name.trim()) return;
    setIsCreatingItem(true);
    try {
      const newItem = await masterDataService.createItem(name.trim());
      setItemOptions(prev => [...prev, { label: newItem.name, value: newItem.name, id: newItem.id }]);
      toast.success('Item created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create item');
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleDeleteItem = async (option: { label: string, value: string, id?: string }) => {
    if (!option.id) return;
    setIsDeletingItem(true);
    try {
      await masterDataService.deleteItem(option.id, option.label);
      setItemOptions(prev => prev.filter(i => i.id !== option.id));
      toast.success('Item deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item. It might be in use.');
    } finally {
      setIsDeletingItem(false);
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

      <div className="flex flex-col gap-6">
        <div>
          <JewelleryCollectionForm
            initialData={editingRecord}
            onSubmit={handleFormSubmit}
            workerOptions={workerOptions}
            itemOptions={itemOptions}
            purityOptions={purityOptions}
            onAddWorker={handleAddWorker}
            onAddItem={handleAddItem}
            onAddPurity={handleAddPurity}
            onDeleteWorker={handleDeleteWorker}
            onDeleteItem={handleDeleteItem}
            onDeletePurity={handleDeletePurity}
            isSubmitting={isSubmitting}
            isCreatingWorker={isCreatingWorker}
            isDeletingWorker={isDeletingWorker}
            isCreatingItem={isCreatingItem}
            isDeletingItem={isDeletingItem}
            isCreatingPurity={isCreatingPurity}
            isDeletingPurity={isDeletingPurity}
          />
        </div>

        <div>
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

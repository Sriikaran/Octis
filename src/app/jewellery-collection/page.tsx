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

  const [workerOptions, setWorkerOptions] = useState<{label: string, value: string}[]>([]);
  const [itemOptions, setItemOptions] = useState<{label: string, value: string}[]>([]);
  const [purityOptions, setPurityOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [workers, items, purities, recordsData] = await Promise.all([
          masterDataService.getWorkers(),
          masterDataService.getItems(),
          masterDataService.getPurities(),
          jewelleryCollectionService.getAll()
        ]);
        
        setWorkerOptions(workers.map(w => ({ label: w.name, value: w.name })));
        setItemOptions(items.map(i => ({ label: i.name, value: i.name })));
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

  const handleAddItem = (name: string) => {
    if (!itemOptions.some(i => i.value.toLowerCase() === name.toLowerCase())) {
      setItemOptions(prev => [...prev, { label: name, value: name }]);
    }
  };

  const handleAddPurity = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val) && !purityOptions.some(p => p.value === val.toString())) {
      setPurityOptions(prev => [...prev, { label: val.toFixed(3), value: val.toString() }]);
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
            onAddItem={handleAddItem}
            onAddPurity={handleAddPurity}
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

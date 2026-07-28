'use client';

import * as z from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/shared/NumberInput';
import { CreatableDropdown } from '@/components/shared/CreatableDropdown';
import { SaveButton } from '@/components/shared/SaveButton';
import { FormSection } from '@/components/shared/FormSection';
import { calculateTotalPure, calculateNetWeight, formatDecimal } from '@/utils';
import { JewelleryCollectionRecord } from '@/types';
import { jewelleryCollectionService } from '@/services/jewelleryCollectionService';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  worker: z.string().min(1, 'Worker is required'),
  item: z.string().min(1, 'Item is required'),
  manualTag: z.string().min(1, 'Manual Tag is required'),
  grossWeight: z.number().min(0.001, 'Gross Weight must be > 0'),
  stoneWeight: z.number().min(0, 'Stone Weight cannot be negative'),
  tagWeight: z.number().min(0, 'Tag Weight cannot be negative'),
  purity: z.number().min(0, 'Min purity is 0').max(100, 'Max purity is 100'),
});

type FormData = z.infer<typeof formSchema>;

interface JewelleryCollectionFormProps {
  initialData?: JewelleryCollectionRecord | null;
  onSubmit: (data: Omit<JewelleryCollectionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'netWeight' | 'totalPure'>) => Promise<void>;
  workerOptions: { label: string; value: string; id?: string }[];
  itemOptions: { label: string; value: string; id?: string }[];
  purityOptions: { label: string; value: string; id?: string }[];
  onAddWorker: (name: string) => Promise<void>;
  onAddItem: (name: string) => Promise<void>;
  onAddPurity: (val: string) => Promise<void>;
  onDeleteWorker: (option: { label: string; value: string; id?: string }) => Promise<void>;
  onDeleteItem: (option: { label: string; value: string; id?: string }) => Promise<void>;
  onDeletePurity: (option: { label: string; value: string; id?: string }) => Promise<void>;
  isSubmitting?: boolean;
  isCreatingWorker?: boolean;
  isDeletingWorker?: boolean;
  isCreatingItem?: boolean;
  isDeletingItem?: boolean;
  isCreatingPurity?: boolean;
  isDeletingPurity?: boolean;
}

export function JewelleryCollectionForm({
  initialData,
  onSubmit,
  workerOptions,
  itemOptions,
  purityOptions,
  onAddWorker,
  onAddItem,
  onAddPurity,
  onDeleteWorker,
  onDeleteItem,
  onDeletePurity,
  isSubmitting,
  isCreatingWorker,
  isDeletingWorker,
  isCreatingItem,
  isDeletingItem,
  isCreatingPurity,
  isDeletingPurity,
}: JewelleryCollectionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      worker: '',
      item: '',
      manualTag: '',
      grossWeight: 0,
      stoneWeight: 0,
      tagWeight: 0,
      purity: 0,
    },
  });

  const [isDuplicateTag, setIsDuplicateTag] = useState(false);

  useEffect(() => {
    if (initialData) {
      const dateStr = initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      reset({
        date: dateStr,
        worker: initialData.worker,
        item: initialData.item,
        manualTag: initialData.manualTag,
        grossWeight: initialData.grossWeight,
        stoneWeight: initialData.stoneWeight,
        tagWeight: initialData.tagWeight,
        purity: initialData.purity,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDuplicateTag(false);
    } else {
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        worker: '',
        item: '',
        manualTag: '',
        grossWeight: 0,
        stoneWeight: 0,
        tagWeight: 0,
        purity: 0,
      });
      setIsDuplicateTag(false);
    }
  }, [initialData, reset]);

  const grossWeight = useWatch({ control, name: 'grossWeight', defaultValue: 0 });
  const stoneWeight = useWatch({ control, name: 'stoneWeight', defaultValue: 0 });
  const tagWeight = useWatch({ control, name: 'tagWeight', defaultValue: 0 });
  const purity = useWatch({ control, name: 'purity', defaultValue: 0 });
  const manualTag = useWatch({ control, name: 'manualTag', defaultValue: '' });

  const netWeight = calculateNetWeight(Number(grossWeight) || 0, Number(stoneWeight) || 0);
  const totalPure = calculateTotalPure(netWeight, Number(purity) || 0);

  // Check duplicate tag
  useEffect(() => {
    const checkTag = async () => {
      if (manualTag) {
        const isDup = await jewelleryCollectionService.checkDuplicateTag(manualTag, initialData?.id);
        setIsDuplicateTag(isDup);
      } else {
        setIsDuplicateTag(false);
      }
    };
    const timer = setTimeout(() => {
      checkTag();
    }, 500); // debounce
    return () => clearTimeout(timer);
  }, [manualTag, initialData]);

  const handleFormSubmit = async (data: FormData) => {
    if (isDuplicateTag) {
      toast.error('Warning: Duplicate Manual Tag. Saving anyway...');
    }
    await onSubmit({
      ...data,
      date: new Date(data.date).toISOString(),
    });
    if (!initialData) {
      reset({
        date: data.date,
        worker: '',
        item: '',
        manualTag: '',
        grossWeight: 0,
        stoneWeight: 0,
        tagWeight: 0,
        purity: 0,
      });
      document.getElementById('date-field')?.focus();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormSection title={initialData ? 'Edit Record' : 'New Jewellery Collection'}>
          
          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label htmlFor="date-field" className="block text-sm font-medium text-stone-700 mb-1">
              Date *
            </label>
            <Input
              id="date-field"
              type="date"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Worker *
            </label>
            <CreatableDropdown
              options={workerOptions}
              value={useWatch({ control, name: 'worker' })}
              onChange={(val) => setValue('worker', val, { shouldValidate: true })}
              onOptionCreate={onAddWorker}
              onOptionDelete={onDeleteWorker}
              isCreating={isCreatingWorker}
              isDeleting={isDeletingWorker}
              placeholder="Select worker..."
            />
            {errors.worker && <p className="text-red-500 text-xs mt-1">{errors.worker.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Item *
            </label>
            <CreatableDropdown
              options={itemOptions}
              value={useWatch({ control, name: 'item' })}
              onChange={(val) => setValue('item', val, { shouldValidate: true })}
              onOptionCreate={onAddItem}
              onOptionDelete={onDeleteItem}
              isCreating={isCreatingItem}
              isDeleting={isDeletingItem}
              placeholder="Select item..."
            />
            {errors.item && <p className="text-red-500 text-xs mt-1">{errors.item.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Manual Tag *
            </label>
            <Input
              {...register('manualTag')}
              placeholder="e.g. T001"
              className={errors.manualTag ? 'border-red-500' : isDuplicateTag ? 'border-yellow-500 bg-yellow-50' : ''}
            />
            {errors.manualTag && <p className="text-red-500 text-xs mt-1">{errors.manualTag.message}</p>}
            {isDuplicateTag && !errors.manualTag && <p className="text-yellow-600 text-xs mt-1">Warning: Duplicate Tag</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Gross Weight *
            </label>
            <NumberInput
              value={grossWeight}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setValue('grossWeight', isNaN(val) ? 0 : val, { shouldValidate: true });
              }}
              placeholder="0.000"
              className={errors.grossWeight ? 'border-red-500' : ''}
            />
            {errors.grossWeight && <p className="text-red-500 text-xs mt-1">{errors.grossWeight.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Stone Weight
            </label>
            <NumberInput
              value={stoneWeight}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setValue('stoneWeight', isNaN(val) ? 0 : val, { shouldValidate: true });
              }}
              placeholder="0.000"
              className={errors.stoneWeight ? 'border-red-500' : ''}
            />
            {errors.stoneWeight && <p className="text-red-500 text-xs mt-1">{errors.stoneWeight.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Tag Weight
            </label>
            <NumberInput
              value={tagWeight}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setValue('tagWeight', isNaN(val) ? 0 : val, { shouldValidate: true });
              }}
              placeholder="0.000"
              className={errors.tagWeight ? 'border-red-500' : ''}
            />
            {errors.tagWeight && <p className="text-red-500 text-xs mt-1">{errors.tagWeight.message}</p>}
          </div>
          
          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Net Weight
            </label>
            <Input
              value={formatDecimal(netWeight, 3)}
              readOnly
              className="bg-stone-50 text-stone-500 font-semibold"
            />
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Purity *
            </label>
            <CreatableDropdown
              options={purityOptions}
              value={useWatch({ control, name: 'purity' })?.toString()}
              onChange={(val) => {
                const num = parseFloat(val);
                if (!isNaN(num)) setValue('purity', num, { shouldValidate: true });
              }}
              onOptionCreate={async (val) => {
                const num = parseFloat(val);
                if (!isNaN(num)) await onAddPurity(num.toString());
              }}
              onOptionDelete={onDeletePurity}
              isCreating={isCreatingPurity}
              isDeleting={isDeletingPurity}
              placeholder="e.g. 91.600"
            />
            {errors.purity && <p className="text-red-500 text-xs mt-1">{errors.purity.message}</p>}
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Total Pure
            </label>
            <Input
              value={formatDecimal(totalPure, 3)}
              readOnly
              className="bg-stone-50 text-stone-500 font-semibold"
            />
          </div>

        </FormSection>

        <div className="mt-6 flex justify-end">
          <SaveButton isLoading={isSubmitting} label={initialData ? 'Update Record' : 'Save Record'} type="submit" />
        </div>
      </form>
    </div>
  );
}

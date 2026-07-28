'use client';

import * as z from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { format } from 'date-fns';

import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/shared/NumberInput';
import { CreatableDropdown } from '@/components/shared/CreatableDropdown';
import { SaveButton } from '@/components/shared/SaveButton';
import { FormSection } from '@/components/shared/FormSection';
import { calculateTotalPure, formatDecimal } from '@/utils';
import { GoldDistributionRecord } from '@/types';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  worker: z.string().min(1, 'Worker is required'),
  subWorker: z.string().optional(),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  purity: z.number().min(0, 'Min purity is 0').max(100, 'Max purity is 100'),
});

type FormData = z.infer<typeof formSchema>;

interface GoldDistributionFormProps {
  initialData?: GoldDistributionRecord | null;
  onSubmit: (data: Omit<GoldDistributionRecord, 'id' | 'recordId' | 'createdAt' | 'updatedAt' | 'totalPure'>) => Promise<void>;
  workerOptions: { label: string; value: string; id?: string }[];
  purityOptions: { label: string; value: string; id?: string }[];
  onAddWorker: (name: string) => Promise<void>;
  onAddPurity: (val: string) => Promise<void>;
  onDeleteWorker: (option: { label: string; value: string; id?: string }) => Promise<void>;
  onDeletePurity: (option: { label: string; value: string; id?: string }) => Promise<void>;
  isSubmitting?: boolean;
  isCreatingWorker?: boolean;
  isDeletingWorker?: boolean;
  isCreatingPurity?: boolean;
  isDeletingPurity?: boolean;
}

export function GoldDistributionForm({
  initialData,
  onSubmit,
  workerOptions,
  purityOptions,
  onAddWorker,
  onAddPurity,
  onDeleteWorker,
  onDeletePurity,
  isSubmitting,
  isCreatingWorker,
  isDeletingWorker,
  isCreatingPurity,
  isDeletingPurity,
}: GoldDistributionFormProps) {
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
      subWorker: '',
      quantity: 0,
      purity: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      // Set values if editing
      const dateStr = initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      reset({
        date: dateStr,
        worker: initialData.worker,
        subWorker: initialData.subWorker || '',
        quantity: initialData.quantity,
        purity: initialData.purity,
      });
    } else {
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        worker: '',
        subWorker: '',
        quantity: 0,
        purity: 0,
      });
    }
  }, [initialData, reset]);

  const quantity = useWatch({ control, name: 'quantity', defaultValue: 0 });
  const purity = useWatch({ control, name: 'purity', defaultValue: 0 });

  const totalPure = calculateTotalPure(Number(quantity) || 0, Number(purity) || 0);

  const handleFormSubmit = async (data: FormData) => {
    // Ensuring the API gets date ISO string if required, or keep it standard. We use the form string.
    await onSubmit({
      ...data,
      date: new Date(data.date).toISOString(),
    });
    if (!initialData) {
      // Clear form except date after create
      reset({
        date: data.date,
        worker: '',
        subWorker: '',
        quantity: 0,
        purity: 0,
      });
      // Try to focus date field
      document.getElementById('date-field')?.focus();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormSection title={initialData ? 'Edit Record' : 'New Gold Distribution'}>
          
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
              Sub Worker
            </label>
            <Input
              {...register('subWorker')}
              placeholder="Optional"
            />
          </div>

          <div className="col-span-1 sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Quantity *
            </label>
            <NumberInput
              value={quantity}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setValue('quantity', isNaN(val) ? 0 : val, { shouldValidate: true });
              }}
              placeholder="0.000"
              className={errors.quantity ? 'border-red-500' : ''}
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
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

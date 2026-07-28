'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { X, Loader2 } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  id?: string;
}

interface CreatableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onOptionCreate?: (newOption: string) => Promise<void> | void;
  onOptionDelete?: (option: Option) => Promise<void> | void;
  placeholder?: string;
  isCreating?: boolean;
  isDeleting?: boolean;
}

export function CreatableDropdown({
  options,
  value,
  onChange,
  onOptionCreate,
  onOptionDelete,
  placeholder = 'Select or create...',
  isCreating = false,
  isDeleting = false,
}: CreatableDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  
  const [optionToDelete, setOptionToDelete] = React.useState<Option | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  
  // Check if current input exactly matches any option (case-insensitive and trimmed)
  const trimmedInput = inputValue.trim().toLowerCase();
  const hasExactMatch = options.some(
    (opt) => opt.label.trim().toLowerCase() === trimmedInput
  );

  const handleCreate = async () => {
    if (!inputValue.trim() || isCreating || isDeleting) return;
    if (onOptionCreate) {
      await onOptionCreate(inputValue.trim());
      onChange(inputValue.trim());
    } else {
      onChange(inputValue.trim());
    }
    setInputValue('');
    setOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!optionToDelete || !onOptionDelete || isDeleting) return;
    await onOptionDelete(optionToDelete);
    if (value === optionToDelete.value) {
      onChange('');
    }
    setOptionToDelete(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isCreating || isDeleting}
          />
        }
      >
        <span className="truncate">
          {isCreating ? 'Creating...' : (selectedOption ? selectedOption.label : placeholder)}
        </span>
        {isCreating ? (
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {!hasExactMatch && inputValue.length > 0 && (
                <div
                  className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-stone-100"
                  onClick={handleCreate}
                >
                  Create &quot;{inputValue}&quot;
                </div>
              )}
              {(!inputValue || hasExactMatch) && 'No results found.'}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search against label
                  onSelect={(currentValue) => {
                    const selected = options.find(opt => opt.label.toLowerCase() === currentValue.toLowerCase());
                    if (selected) {
                      onChange(selected.value);
                    }
                    setOpen(false);
                  }}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center flex-1 overflow-hidden">
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </div>
                  
                  {onOptionDelete && (
                    <div 
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 cursor-pointer ml-2 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent onSelect from firing
                        setOptionToDelete(option);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </CommandItem>
              ))}
              {!hasExactMatch && inputValue.length > 0 && (
                <CommandItem
                  value={inputValue}
                  onSelect={handleCreate}
                >
                  <span className="font-medium">Create &quot;{inputValue}&quot;</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

      <ConfirmationDialog
        open={!!optionToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setOptionToDelete(null);
        }}
        title={`Delete ${optionToDelete?.label}?`}
        description="Are you sure you want to delete this option? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete"
      />
    </Popover>
  );
}

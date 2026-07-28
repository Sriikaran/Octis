'use client';

import * as React from 'react';
import {
  Check,
  ChevronsUpDown,
  User,
  Sparkles,
  Gem,
  X,
  Loader2,
} from 'lucide-react';

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

export interface Option {
  label: string;
  value: string;
  isBuiltIn?: boolean;
}

export type MasterDataType = 'worker' | 'item' | 'purity' | 'default';

interface CreatableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onOptionCreate?: (newOption: string) => Promise<void> | void;
  onOptionDelete?: (option: Option) => Promise<void> | void;
  type?: MasterDataType;
  placeholder?: string;
  disabled?: boolean;
}

export function CreatableDropdown({
  options,
  value,
  onChange,
  onOptionCreate,
  onOptionDelete,
  type = 'default',
  placeholder = 'Select or create...',
  disabled = false,
}: CreatableDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [deletingValue, setDeletingValue] = React.useState<string | null>(null);
  const [confirmDeleteOption, setConfirmDeleteOption] = React.useState<Option | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Check if current input matches any existing option (case-insensitive & trimmed)
  const normalizedInput = inputValue.trim().toLowerCase();
  const hasExactMatch = options.some(
    (opt) => opt.label.trim().toLowerCase() === normalizedInput
  );

  const getTypeIcon = () => {
    switch (type) {
      case 'worker':
        return <User className="h-4 w-4 shrink-0 opacity-60 mr-2 text-stone-500" />;
      case 'item':
        return <Sparkles className="h-4 w-4 shrink-0 opacity-60 mr-2 text-amber-500" />;
      case 'purity':
        return <Gem className="h-4 w-4 shrink-0 opacity-60 mr-2 text-amber-600" />;
      default:
        return null;
    }
  };

  const handleCreate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onOptionCreate) {
        await onOptionCreate(trimmed);
      }
      onChange(trimmed);
      setInputValue('');
      setOpen(false);
    } catch (error) {
      // Error handling managed by parent via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDeleteConfirm = async (option: Option) => {
    if (!onOptionDelete || deletingValue) return;

    setDeletingValue(option.value);
    try {
      await onOptionDelete(option);
      setConfirmDeleteOption(null);
      // If deleted option was selected, clear form selection
      if (value === option.value) {
        onChange('');
      }
    } catch (error) {
      // Error handling managed by parent (e.g. reference count toast)
    } finally {
      setDeletingValue(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between bg-white text-left font-normal border-stone-200 shadow-sm hover:bg-stone-50"
          />
        }
      >
        <span className="flex items-center truncate">
          {getTypeIcon()}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            if (!search) return 1;
            return itemValue.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !hasExactMatch && inputValue.trim().length > 0) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <CommandList className="max-h-60 overflow-y-auto p-1">
            <CommandEmpty className="py-2 px-3 text-sm text-stone-500">
              {!hasExactMatch && inputValue.trim().length > 0 ? (
                <div
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                  onClick={handleCreate}
                >
                  <span className="truncate">Create &quot;{inputValue.trim()}&quot;</span>
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin ml-2" />
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded ml-2">
                      Enter ↵
                    </span>
                  )}
                </div>
              ) : (
                'No matching options.'
              )}
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value;
                const isDeleting = deletingValue === option.value;
                const isConfirming = confirmDeleteOption?.value === option.value;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      if (!isConfirming && !isDeleting) {
                        onChange(option.value);
                        setOpen(false);
                      }
                    }}
                    className="flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-stone-100 group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center truncate mr-2 flex-1">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 text-stone-900 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {getTypeIcon()}
                      <span className={cn('truncate text-sm', isSelected && 'font-semibold text-stone-900')}>
                        {option.label}
                      </span>
                    </div>

                    {/* Right action area: Delete / Confirmation */}
                    {onOptionDelete && !option.isBuiltIn && (
                      <div
                        className="flex items-center shrink-0 ml-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />
                        ) : isConfirming ? (
                          <div className="flex items-center space-x-1 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 animate-in fade-in zoom-in-95 duration-100">
                            <span className="text-[11px] text-red-700 font-medium mr-1">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(option)}
                              className="text-xs bg-red-600 text-white font-medium px-1.5 py-0.5 rounded hover:bg-red-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOption(null)}
                              className="text-xs bg-stone-200 text-stone-700 font-medium px-1.5 py-0.5 rounded hover:bg-stone-300 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isSelected}
                            title={
                              isSelected
                                ? 'Cannot delete currently selected option'
                                : `Delete ${option.label}`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSelected) {
                                setConfirmDeleteOption(option);
                              }
                            }}
                            className={cn(
                              'p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors',
                              isSelected && 'opacity-30 cursor-not-allowed hover:text-stone-400 hover:bg-transparent'
                            )}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </CommandItem>
                );
              })}

              {!hasExactMatch && inputValue.trim().length > 0 && (
                <CommandItem
                  value={inputValue.trim()}
                  onSelect={handleCreate}
                  className="py-2 px-2.5 font-medium text-amber-700 hover:bg-amber-50 cursor-pointer"
                >
                  <span className="flex items-center">
                    <span className="mr-1.5 text-xs">✚</span> Create &quot;{inputValue.trim()}&quot;
                  </span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

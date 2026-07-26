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

interface Option {
  label: string;
  value: string;
}

interface CreatableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onOptionCreate?: (newOption: string) => void;
  placeholder?: string;
}

export function CreatableDropdown({
  options,
  value,
  onChange,
  onOptionCreate,
  placeholder = 'Select or create...',
}: CreatableDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedOption = options.find((opt) => opt.value === value);
  
  // Check if current input exactly matches any option
  const hasExactMatch = options.some(
    (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
  );

  const handleCreate = () => {
    if (!inputValue) return;
    onOptionCreate?.(inputValue);
    onChange(inputValue); // Using label as value for simple implementation
    setInputValue('');
    setOpen(false);
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
          />
        }
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
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
    </Popover>
  );
}

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchableDropdownProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Minimal implementation using Select for MVP
export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
}: SearchableDropdownProps) {
  return (
    <Select value={value} onValueChange={(val) => {
      if (val !== null) onChange(val as string);
    }}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

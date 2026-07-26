import { Input } from '@/components/ui/input';
import { forwardRef, useState, useEffect } from 'react';

export type NumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, onBlur, onFocus, value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState<string>('');

    // Sync external value to local string state when not focused
    useEffect(() => {
      if (!isFocused) {
        if (value === undefined || value === null) {
          setLocalValue('');
        } else if (typeof value === 'number') {
          setLocalValue(value === 0 ? '0.000' : value.toFixed(3));
        } else {
          setLocalValue(String(value));
        }
      }
    }, [value, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // When focusing, if the value is 0.000, we clear it for easy typing.
      // Otherwise, we strip unnecessary trailing zeros for editing.
      if (typeof value === 'number') {
        if (value === 0) {
          setLocalValue('');
        } else {
          setLocalValue(String(value));
        }
      }
      if (onFocus) onFocus(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow user to type raw strings like "5." without React Hook Form forcing it back to "5" instantly
      setLocalValue(e.target.value);
      if (onChange) onChange(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      const num = parseFloat(localValue);
      if (!isNaN(num)) {
        setLocalValue(num.toFixed(3));
      } else {
        setLocalValue('');
      }

      if (onBlur) onBlur(e);
    };

    return (
      <Input
        type="text"
        inputMode="decimal"
        ref={ref}
        value={isFocused ? localValue : (typeof value === 'number' ? value.toFixed(3) : localValue)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full ${className}`}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

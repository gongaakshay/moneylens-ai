import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validation?: (value: string) => string | null;
  realTimeValidation?: boolean;
  onEnter?: () => void;
  error?: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      className,
      type,
      validation,
      realTimeValidation = false,
      onEnter,
      error: externalError,
      showClearButton = false,
      onClear,
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = React.useState<string | null>(
      null
    );
    const [touched, setTouched] = React.useState(false);

    const error = externalError || internalError;
    const isValid = touched && !error && value && String(value).length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Format validation for number inputs (real-time)
      if (type === "number" && realTimeValidation) {
        // Only allow numbers and one decimal point
        const regex = /^\d*\.?\d*$/;
        if (!regex.test(newValue) && newValue !== "") {
          return; // Don't update if invalid format
        }
      }

      // Run validation if real-time is enabled
      if (realTimeValidation && validation) {
        const validationError = validation(newValue);
        setInternalError(validationError);
      }

      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);

      // Run validation on blur
      if (validation && !realTimeValidation) {
        const validationError = validation(e.target.value);
        setInternalError(validationError);
      }

      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      }
      props.onKeyDown?.(e);
    };

    const handleClear = () => {
      setInternalError(null);
      setTouched(false);
      onClear?.();
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          <Input
            type={type}
            className={cn(
              className,
              error && "border-red-500 focus-visible:ring-red-500",
              isValid && "border-green-500 focus-visible:ring-green-500",
              showClearButton && value && String(value).length > 0 && "pr-10"
            )}
            ref={ref}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...props}
          />
          {showClearButton && value && String(value).length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

export { ValidatedInput };


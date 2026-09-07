import { useState, useCallback } from "react";

export function useFormState<T>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setError(null);
  }, [initialState]);

  const setSubmitting = useCallback((value: boolean) => {
    setIsSubmitting(value);
  }, []);

  const setFormError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    isSubmitting,
    setSubmitting,
    error,
    setFormError,
  };
}


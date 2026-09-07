import { useState, useCallback } from "react";

export function useDialogState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleDialog = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openDialog,
    closeDialog,
    toggleDialog,
    setIsOpen,
  };
}


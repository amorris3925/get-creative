'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface PendingChange {
  sectionKey: string;
  path: string[];
  value: string;
}

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  pendingChanges: Map<string, PendingChange>;
  addChange: (sectionKey: string, path: string[], value: string) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
}

interface EditModeProviderProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export function EditModeProvider({ children, isAdmin }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());
  const [changeCounter, setChangeCounter] = useState(0); // Force re-renders

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode(prev => !prev);
  }, [isAdmin]);

  const addChange = useCallback((sectionKey: string, path: string[], value: string) => {
    const key = `${sectionKey}.${path.join('.')}`;
    pendingChangesRef.current.set(key, { sectionKey, path, value });
    setChangeCounter(c => c + 1);
  }, []);

  const saveChanges = useCallback(async () => {
    if (pendingChangesRef.current.size === 0) return;

    setIsSaving(true);
    try {
      // Group changes by section
      const changesBySection = new Map<string, { path: string[]; value: string }[]>();

      pendingChangesRef.current.forEach(change => {
        const existing = changesBySection.get(change.sectionKey) || [];
        existing.push({ path: change.path, value: change.value });
        changesBySection.set(change.sectionKey, existing);
      });

      // Save each section
      for (const [sectionKey, changes] of changesBySection) {
        const res = await fetch('/api/sections/inline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionKey, changes }),
        });

        if (!res.ok) {
          throw new Error(`Failed to save ${sectionKey}`);
        }
      }

      pendingChangesRef.current.clear();
      setChangeCounter(c => c + 1);

      // Refresh the page to show saved changes
      window.location.reload();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const discardChanges = useCallback(() => {
    pendingChangesRef.current.clear();
    setChangeCounter(c => c + 1);
    window.location.reload();
  }, []);

  // Only provide edit functionality to admins
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        pendingChanges: pendingChangesRef.current,
        addChange,
        saveChanges,
        discardChanges,
        isSaving,
        hasChanges: pendingChangesRef.current.size > 0,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

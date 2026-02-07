'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface PendingChange {
  sectionKey: string;
  path: string[];
  value: string;
  previousValue?: string;
}

interface HistoryEntry {
  id: string;
  sectionKey: string;
  path: string[];
  previousValue: string;
  newValue: string;
  timestamp: Date;
  source: 'inline' | 'cms';
}

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  pendingChanges: Map<string, PendingChange>;
  addChange: (sectionKey: string, path: string[], value: string, previousValue?: string) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // History
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  history: HistoryEntry[];
  fetchHistory: () => Promise<void>;
  rollbackTo: (entryId: string) => Promise<void>;
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
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());
  const [changeCounter, setChangeCounter] = useState(0); // Force re-renders

  // Undo/Redo stacks
  const undoStackRef = useRef<PendingChange[]>([]);
  const redoStackRef = useRef<PendingChange[]>([]);
  const [undoRedoCounter, setUndoRedoCounter] = useState(0);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode(prev => !prev);
  }, [isAdmin]);

  const addChange = useCallback((sectionKey: string, path: string[], value: string, previousValue?: string) => {
    const key = `${sectionKey}.${path.join('.')}`;

    // Get the previous value from existing change or store the provided one
    const existingChange = pendingChangesRef.current.get(key);
    const prevVal = previousValue ?? existingChange?.previousValue;

    // Add to undo stack before making the change
    if (existingChange) {
      undoStackRef.current.push({ ...existingChange });
    } else if (prevVal) {
      undoStackRef.current.push({ sectionKey, path, value: prevVal, previousValue: prevVal });
    }

    // Keep undo stack to last 50 items
    if (undoStackRef.current.length > 50) {
      undoStackRef.current = undoStackRef.current.slice(-50);
    }

    // Clear redo stack on new change
    redoStackRef.current = [];

    pendingChangesRef.current.set(key, { sectionKey, path, value, previousValue: prevVal });
    setChangeCounter(c => c + 1);
    setUndoRedoCounter(c => c + 1);
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;

    const lastChange = undoStackRef.current.pop()!;
    const key = `${lastChange.sectionKey}.${lastChange.path.join('.')}`;

    // Get current value before undoing
    const currentChange = pendingChangesRef.current.get(key);
    if (currentChange) {
      // Add current state to redo stack
      redoStackRef.current.push({ ...currentChange });
    }

    // Restore previous value
    if (lastChange.previousValue !== undefined) {
      pendingChangesRef.current.set(key, {
        ...lastChange,
        value: lastChange.previousValue,
      });

      // Also update the DOM element if it exists
      const element = document.querySelector(`[data-section="${lastChange.sectionKey}"][data-field="${lastChange.path.join('.')}"]`);
      if (element) {
        element.textContent = lastChange.previousValue;
      }
    } else {
      // Remove the change entirely
      pendingChangesRef.current.delete(key);
    }

    setChangeCounter(c => c + 1);
    setUndoRedoCounter(c => c + 1);
  }, []);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;

    const redoChange = redoStackRef.current.pop()!;
    const key = `${redoChange.sectionKey}.${redoChange.path.join('.')}`;

    // Get current value before redoing
    const currentChange = pendingChangesRef.current.get(key);
    if (currentChange) {
      undoStackRef.current.push({ ...currentChange });
    }

    // Apply redo value
    pendingChangesRef.current.set(key, redoChange);

    // Also update the DOM element if it exists
    const element = document.querySelector(`[data-section="${redoChange.sectionKey}"][data-field="${redoChange.path.join('.')}"]`);
    if (element) {
      element.textContent = redoChange.value;
    }

    setChangeCounter(c => c + 1);
    setUndoRedoCounter(c => c + 1);
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

      // Clear stacks and pending changes
      pendingChangesRef.current.clear();
      undoStackRef.current = [];
      redoStackRef.current = [];
      setChangeCounter(c => c + 1);
      setUndoRedoCounter(c => c + 1);

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
    undoStackRef.current = [];
    redoStackRef.current = [];
    setChangeCounter(c => c + 1);
    setUndoRedoCounter(c => c + 1);
    window.location.reload();
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/sections/history?limit=20');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  }, []);

  const rollbackTo = useCallback(async (entryId: string) => {
    try {
      const res = await fetch('/api/sections/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: entryId }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        throw new Error('Rollback failed');
      }
    } catch (error) {
      console.error('Rollback failed:', error);
      alert('Failed to rollback. Please try again.');
    }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!isEditMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Z (undo) or Cmd/Ctrl + Shift + Z (redo)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Also support Cmd/Ctrl + Y for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, undo, redo]);

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
        undo,
        redo,
        canUndo: undoStackRef.current.length > 0,
        canRedo: redoStackRef.current.length > 0,
        showHistory,
        setShowHistory,
        history,
        fetchHistory,
        rollbackTo,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

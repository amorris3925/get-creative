'use client';

import { useEditMode } from './EditModeContext';
import { useEffect, useRef, useState, useCallback } from 'react';

interface EditingState {
  element: HTMLElement;
  originalText: string;
  sectionKey: string;
  path: string[];
}

export default function GlobalEditableOverlay() {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const addChange = editContext?.addChange;

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Get section key and path from element's data attributes or DOM position
  const getElementPath = useCallback((element: HTMLElement): { sectionKey: string; path: string[] } => {
    // Try to find data attributes first
    let current: HTMLElement | null = element;
    while (current) {
      const sectionKey = current.dataset.section;
      const fieldPath = current.dataset.field;
      if (sectionKey && fieldPath) {
        return { sectionKey, path: fieldPath.split('.') };
      }
      current = current.parentElement;
    }

    // Fallback: generate path from element position and content
    const section = element.closest('section');
    const sectionId = section?.id || 'unknown';
    const textContent = element.textContent?.slice(0, 20) || '';
    const hash = textContent.replace(/\s+/g, '_').toLowerCase();

    return {
      sectionKey: sectionId,
      path: ['text', hash],
    };
  }, []);

  // Check if element is editable text
  const isEditableElement = useCallback((element: HTMLElement): boolean => {
    if (!element) return false;

    // Skip certain elements
    const tagName = element.tagName.toLowerCase();
    if (['button', 'a', 'input', 'textarea', 'select', 'svg', 'path', 'img', 'video', 'iframe'].includes(tagName)) {
      return false;
    }

    // Skip elements with onclick handlers or interactive roles
    if (element.onclick || element.getAttribute('role') === 'button') {
      return false;
    }

    // Check if it contains only text (no interactive children)
    const hasOnlyText = element.childElementCount === 0 ||
      Array.from(element.children).every(child =>
        ['span', 'strong', 'em', 'b', 'i', 'br'].includes(child.tagName.toLowerCase())
      );

    // Must have text content
    const text = element.textContent?.trim();
    if (!text || text.length === 0) return false;

    // Skip very long text (likely paragraphs that should use textarea)
    // But allow them anyway for editing

    return hasOnlyText;
  }, []);

  // Handle click on editable element
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isEditMode) return;

    const target = e.target as HTMLElement;

    // Don't interfere with toolbar clicks
    if (target.closest('[data-admin-toolbar]')) return;

    if (isEditableElement(target)) {
      e.preventDefault();
      e.stopPropagation();

      const { sectionKey, path } = getElementPath(target);

      setEditing({
        element: target,
        originalText: target.textContent || '',
        sectionKey,
        path,
      });

      // Make element editable
      target.contentEditable = 'true';
      target.focus();

      // Select all text
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      // Style the editing element
      target.style.outline = '2px solid #ED7F35';
      target.style.outlineOffset = '2px';
      target.style.borderRadius = '4px';
    }
  }, [isEditMode, isEditableElement, getElementPath]);

  // Handle blur (save changes)
  const handleBlur = useCallback((e: FocusEvent) => {
    if (!editing) return;

    const target = e.target as HTMLElement;
    const newText = target.textContent || '';

    // Reset styles
    target.contentEditable = 'false';
    target.style.outline = '';
    target.style.outlineOffset = '';
    target.style.borderRadius = '';

    // Save if changed
    if (newText !== editing.originalText && addChange) {
      addChange(editing.sectionKey, editing.path, newText);
    }

    setEditing(null);
  }, [editing, addChange]);

  // Handle keydown
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }

    if (e.key === 'Escape') {
      const target = e.target as HTMLElement;
      target.textContent = editing.originalText;
      target.blur();
    }
  }, [editing]);

  // Handle mouseover for highlight
  const handleMouseOver = useCallback((e: MouseEvent) => {
    if (!isEditMode || editing) return;

    const target = e.target as HTMLElement;
    if (target.closest('[data-admin-toolbar]')) return;

    if (isEditableElement(target)) {
      setHovered(target);
      target.style.boxShadow = '0 0 0 1px rgba(237, 127, 53, 0.4)';
      target.style.borderRadius = '2px';
      target.style.cursor = 'text';
    }
  }, [isEditMode, editing, isEditableElement]);

  // Handle mouseout
  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === hovered) {
      target.style.boxShadow = '';
      target.style.borderRadius = '';
      target.style.cursor = '';
      setHovered(null);
    }
  }, [hovered]);

  // Set up event listeners
  useEffect(() => {
    if (!isEditMode) return;

    document.addEventListener('click', handleClick, true);
    document.addEventListener('blur', handleBlur, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('blur', handleBlur, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);

      // Clean up any lingering styles
      if (hovered) {
        hovered.style.boxShadow = '';
        hovered.style.borderRadius = '';
        hovered.style.cursor = '';
      }
    };
  }, [isEditMode, handleClick, handleBlur, handleKeyDown, handleMouseOver, handleMouseOut, hovered]);

  // Clean up when edit mode is disabled
  useEffect(() => {
    if (!isEditMode && editing) {
      editing.element.contentEditable = 'false';
      editing.element.style.outline = '';
      editing.element.style.outlineOffset = '';
      editing.element.style.borderRadius = '';
      setEditing(null);
    }
  }, [isEditMode, editing]);

  if (!isEditMode) return null;

  return (
    <div
      ref={overlayRef}
      data-admin-toolbar
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {/* Edit mode indicator at cursor */}
      {editing && (
        <div
          style={{
            position: 'fixed',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(237, 127, 53, 0.95)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          Editing • Press Enter to save, Esc to cancel
        </div>
      )}
    </div>
  );
}

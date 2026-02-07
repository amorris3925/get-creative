'use client';

import { useEditMode } from './EditModeContext';
import { useRef, useState, useCallback, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  sectionKey: string;
  path: string[];
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  style?: React.CSSProperties;
  className?: string;
  multiline?: boolean;
}

export default function EditableText({
  value,
  sectionKey,
  path,
  as: Tag = 'span',
  style,
  className,
  multiline = false,
}: EditableTextProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const addChange = editContext?.addChange;

  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsEditing(true);
  }, [isEditMode]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localValue !== value && addChange) {
      addChange(sectionKey, path, localValue);
    }
  }, [localValue, value, sectionKey, path, addChange]);

  const handleInput = useCallback((e: React.FormEvent<HTMLElement>) => {
    const newValue = e.currentTarget.textContent || '';
    setLocalValue(newValue);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      elementRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
      elementRef.current?.blur();
    }
  }, [multiline, value]);

  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(elementRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(isEditMode && {
      cursor: 'text',
      position: 'relative',
      outline: isEditing ? '2px solid #ED7F35' : 'none',
      outlineOffset: 2,
      borderRadius: 4,
      transition: 'box-shadow 0.15s ease',
      boxShadow: isEditing ? 'none' : '0 0 0 1px rgba(237, 127, 53, 0.2)',
    }),
  };

  const setRef = useCallback((el: HTMLElement | null) => {
    (elementRef as React.MutableRefObject<HTMLElement | null>).current = el;
  }, []);

  return (
    <Tag
      ref={setRef}
      contentEditable={isEditMode && isEditing}
      suppressContentEditableWarning
      style={combinedStyle}
      className={className}
      onClick={handleClick}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    >
      {localValue}
    </Tag>
  );
}

interface EditableNumberProps {
  value: number;
  sectionKey: string;
  path: string[];
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}

export function EditableNumber({
  value,
  sectionKey,
  path,
  prefix = '',
  suffix = '',
  style,
}: EditableNumberProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const addChange = editContext?.addChange;

  const [localValue, setLocalValue] = useState(String(value));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (addChange) {
      addChange(sectionKey, path, newValue);
    }
  }, [sectionKey, path, addChange]);

  if (!isEditMode) {
    return <span style={style}>{prefix}{value}{suffix}</span>;
  }

  return (
    <span style={{ ...style, display: 'inline-flex', alignItems: 'center' }}>
      {prefix}
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        style={{
          width: Math.max(40, String(localValue).length * 12),
          background: 'rgba(237, 127, 53, 0.1)',
          border: '1px solid rgba(237, 127, 53, 0.3)',
          borderRadius: 4,
          padding: '2px 6px',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'center',
        }}
      />
      {suffix}
    </span>
  );
}

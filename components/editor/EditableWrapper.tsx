'use client';

import { EditModeProvider } from './EditModeContext';
import { ResponsiveProvider } from './ResponsiveContext';
import AdminToolbar from './AdminToolbar';
import GlobalEditableOverlay from './GlobalEditableOverlay';

interface EditableWrapperProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export default function EditableWrapper({ children, isAdmin }: EditableWrapperProps) {
  return (
    <EditModeProvider isAdmin={isAdmin}>
      <ResponsiveProvider>
        {children}
        {isAdmin && (
          <>
            <GlobalEditableOverlay />
            <AdminToolbar />
          </>
        )}
      </ResponsiveProvider>
    </EditModeProvider>
  );
}

'use client';

import { EditModeProvider } from './EditModeContext';
import AdminToolbar from './AdminToolbar';

interface EditableWrapperProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export default function EditableWrapper({ children, isAdmin }: EditableWrapperProps) {
  return (
    <EditModeProvider isAdmin={isAdmin}>
      {children}
      {isAdmin && <AdminToolbar />}
    </EditModeProvider>
  );
}

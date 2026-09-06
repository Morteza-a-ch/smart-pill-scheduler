import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { AppLayout } from './AppLayout';
import { Loader2 } from 'lucide-react';
import { OPEN_PREVIEW } from '@/config/previewAccess';

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: AppRole[] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (roles && role && !roles.includes(role)) {
    return (
      <AppLayout>
        <div className="schedule-container text-center py-12">
          <p className="text-muted-foreground">شما به این بخش دسترسی ندارید.</p>
        </div>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

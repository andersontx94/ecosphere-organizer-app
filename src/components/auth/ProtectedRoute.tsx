import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Leaf } from 'lucide-react';

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">EcoGest</span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if account is inactive
  if (profile?.account_status === 'inactive') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold">Conta inativa</h1>
          <p className="text-muted-foreground">
            Sua conta está temporariamente desativada. Entre em contato com o suporte para mais informações.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
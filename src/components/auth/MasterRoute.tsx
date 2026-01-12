import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const MasterRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isMaster } = useAuth();
  
  console.log('MasterRoute Check:', { loading, hasUser: !!user, isMaster });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Verificando credenciais master...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("MasterRoute: Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" replace />;
  }

  if (!isMaster) {
    console.log("MasterRoute: Usuário não é master, redirecionando para /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

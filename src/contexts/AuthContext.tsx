import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isMaster: boolean;
  isClinicActive: boolean;
  planFeatures: {
    ativar_atendimento: boolean;
  };
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaster, setIsMaster] = useState(false);
  const [isClinicActive, setIsClinicActive] = useState(true);
  const [planFeatures, setPlanFeatures] = useState({ ativar_atendimento: false });
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    // Função única para processar mudanças de estado
    const processAuthState = async (session: Session | null) => {
      if (!mounted) return;
      
      console.log('Processando estado de autenticação:', session?.user?.email || 'sem usuário');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        // Busca metadados, mas com limite de tempo para não travar o F5
        const fetchMetadata = async () => {
          try {
            console.log('Iniciando busca de metadados...');
            const { data: profile, error: pError } = await supabase
              .from('profiles')
              .select('is_master')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (mounted) {
              if (pError) console.error('Erro profile:', pError);
              setIsMaster(profile?.is_master || false);
            }

            const { data: clinic, error: cError } = await supabase
              .from('informacoes_clinica')
              .select('active, plano_id, planos(ativar_atendimento)')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (mounted) {
              if (cError) console.error('Erro clinica:', cError);
              setIsClinicActive(clinic ? clinic.active : true);
              
              if (clinic?.planos) {
                // @ts-ignore - planos is a single object because of maybeSingle and the relationship
                setPlanFeatures({ ativar_atendimento: !!clinic.planos.ativar_atendimento });
              }
            }
            console.log('Metadados carregados com sucesso');
          } catch (error) {
            console.error('Erro fatal ao carregar metadados:', error);
          }
        };

        // Executamos a busca e aguardamos no máximo 2.5 segundos
        await Promise.race([
          fetchMetadata(),
          new Promise(resolve => setTimeout(() => {
            console.warn('Timeout na busca de metadados, continuando...');
            resolve(null);
          }, 2500))
        ]);
      } else {
        setIsMaster(false);
        setIsClinicActive(true);
      }
      
      if (mounted) {
        console.log('Finalizando estado de loading');
        setLoading(false);
      }
    };

    // 1. Escuta mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      processAuthState(session);
    });

    // 2. Recupera sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      processAuthState(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear React Query cache before anything else
      queryClient.clear();
      
      // Attempt supabase sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error (ignoring and clearing local state):', error);
      }
      
      console.log('Logout state cleanup');
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    } finally {
      // ALWAYS clear local state regardless of server response
      setSession(null);
      setUser(null);
      setIsMaster(false);
      setIsClinicActive(true);
      setPlanFeatures({ ativar_atendimento: false });
      
      // Force remove any persistence from local storage just in case
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    }
  };

  const value = {
    user,
    session,
    loading,
    isMaster,
    isClinicActive,
    planFeatures,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
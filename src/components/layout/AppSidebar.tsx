import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Home,
  Settings,
  Stethoscope,
  CreditCard,
  Wrench,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCheck,
  FileText,
  Building,
  Truck,
  Package,
  FlaskConical,
  Shield,
  Calculator,
  Receipt,
  TrendingUp,
  Banknote,
  CheckSquare,
  PieChart,
  TrendingDown,
  CreditCard as CreditCardIcon,
  BookOpen,
  Phone,
  Lock,
  Info,
  ShieldCheck,
  User,
  MessageSquare,
  Tags,
  ListChecks,
  Zap,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const cadastroItems = [
  { title: "Dentistas", url: "/cadastros/dentistas", icon: UserCheck },
  { title: "Pacientes", url: "/patients", icon: Users },
  { title: "Ordem de Serviço (OS)", url: "/cadastros/os", icon: FileText },
  { title: "Funcionários", url: "/cadastros/funcionarios", icon: Building },
  { title: "Fornecedores", url: "/cadastros/fornecedores", icon: Truck },
  { title: "Patrimônio", url: "/cadastros/patrimonio", icon: Shield },
  { title: "Controle de estoque", url: "/cadastros/estoque", icon: Package },
  { title: "Laboratório", url: "/cadastros/laboratorio", icon: FlaskConical },
  { title: "Convênio / Planos", url: "/cadastros/convenios", icon: Shield },
  { title: "Tabela de Preços", url: "/cadastros/honorarios", icon: Calculator },
];

const financeiroItems = [
  { title: "Contas a Pagar", url: "/financeiro/contas-pagar", icon: Receipt },
  { title: "Contas a Receber", url: "/financeiro/contas-receber", icon: TrendingUp },
  { title: "Fluxo de Caixa", url: "/financeiro/fluxo-caixa", icon: Banknote },
  { title: "Controle de Cheques", url: "/financeiro/cheques", icon: CheckSquare },
  { title: "Relatório", url: "/relatorios/financeiro", icon: BarChart3 },
];



const pagamentosItems = [
  { title: "Efetuar pagamento", url: "/pagamentos/efetuar-pagamento", icon: CreditCardIcon },
];

const utilitariosItems = [
  { title: "Manuais e Códigos", url: "/utilitarios/manuais-codigos", icon: BookOpen },
  { title: "Contatos Úteis", url: "/utilitarios/contatos-uteis", icon: Phone },
];

const configuracoesItems = [
  { title: "Perfil", url: "/profile", icon: User },
  { title: "Senha do Administrador", url: "/configuracoes/senha-admin", icon: Lock },
  { title: "Informações da Clínica", url: "/configuracoes/informacoes-clinica", icon: Info },
  { title: "Permissões", url: "/configuracoes/permissoes", icon: ShieldCheck },
];

const atendimentoItems = [
  { title: "Chat", url: "/atendimento/chat", icon: MessageSquare },
  { title: "Filas de Espera", url: "/atendimento/filas", icon: ListChecks },
  { title: "Tags", url: "/atendimento/tags", icon: Tags },
  { title: "Respostas Rápidas", url: "/atendimento/respostas-rapidas", icon: Zap },
  { title: "Agendados", url: "/atendimento/agendados", icon: Calendar },
];

const menuItems = [
  { title: "Início", url: "/dashboard", icon: Home },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const { user, isMaster, signOut, planFeatures } = useAuth();

  // Route match helpers for submenu opening
  const cadastroMatch = currentPath.startsWith("/cadastros") || currentPath === "/patients";
  const financeiroMatch = currentPath.startsWith("/financeiro") || currentPath === "/relatorios/financeiro";
  const pagamentosMatch = currentPath.startsWith("/pagamentos");
  const utilitariosMatch = currentPath.startsWith("/utilitarios");
  const configuracoesMatch = currentPath.startsWith("/configuracoes") || currentPath === "/profile";
  const atendimentoMatch = currentPath.startsWith("/atendimento");

  // Active state helpers - only true when the parent menu should be highlighted
  const isCadastroActive = false; // Parent menu never highlighted, only children
  const isFinanceiroActive = false; // Parent menu never highlighted, only children
  const isPagamentosActive = false; // Parent menu never highlighted, only children
  const isUtilitariosActive = false; // Parent menu never highlighted, only children
  const isConfiguracoesActive = false; // Parent menu never highlighted, only children
  const isAtendimentoActive = false;

  // Initialize open state from current route to avoid flicker
  const [isCadastroOpen, setIsCadastroOpen] = useState(cadastroMatch);
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(financeiroMatch);
  const [isPagamentosOpen, setIsPagamentosOpen] = useState(pagamentosMatch);
  const [isUtilitariosOpen, setIsUtilitariosOpen] = useState(utilitariosMatch);
  const [isConfiguracoesOpen, setIsConfiguracoesOpen] = useState(configuracoesMatch);
  const [isAtendimentoOpen, setIsAtendimentoOpen] = useState(atendimentoMatch);

  const { toast } = useToast();

  // Keep the matching group open on route change without closing others
  React.useLayoutEffect(() => {
    if (cadastroMatch) setIsCadastroOpen(true);
    if (financeiroMatch) setIsFinanceiroOpen(true);
    if (pagamentosMatch) setIsPagamentosOpen(true);
    if (utilitariosMatch) setIsUtilitariosOpen(true);
    if (configuracoesMatch) setIsConfiguracoesOpen(true);
    if (atendimentoMatch) setIsAtendimentoOpen(true);
  }, [cadastroMatch, financeiroMatch, pagamentosMatch, utilitariosMatch, configuracoesMatch, atendimentoMatch]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate("/auth", { replace: true });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = (_: { isActive: boolean }) => "hover:bg-muted/50";

  const getSubmenuNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium ml-4" : "text-sidebar-foreground hover:bg-muted/50 ml-4";
    
  const getParentNavClass = (_isChildActive: boolean) =>
    "hover:bg-muted/50";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-2 h-14 sm:h-16 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">TeiaOdontoPRO</h2>
              <p className="text-xs text-muted-foreground truncate">Sistema Odontológico</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isMaster && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/master" 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive 
                          ? "bg-amber-100 text-amber-900 font-bold" 
                          : "text-amber-600 hover:bg-amber-50"
                        }`
                      }
                    >
                      <Shield className="w-4 h-4" />
                      {!isCollapsed && <span>Painel Master Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Agenda */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/appointments" end className={getNavClass}>
                    <Calendar className="w-4 h-4" />
                    {!isCollapsed && <span>Agenda</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Atendimento with submenu (Plan controlled) */}
              {(planFeatures.ativar_atendimento || isMaster) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsAtendimentoOpen(!isAtendimentoOpen)}
                    className={getParentNavClass(isAtendimentoActive)}
                  >
                    <MessageSquare className={isAtendimentoActive ? "w-4 h-4 text-primary" : "w-4 h-4 text-green-600"} />
                    {!isCollapsed && (
                      <>
                        <span className={isAtendimentoActive ? "text-primary font-bold" : "text-green-600 font-bold"}>Atendimento</span>
                        {isAtendimentoOpen ? (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                  
                  {isAtendimentoOpen && !isCollapsed && (
                    <SidebarMenuSub>
                      {atendimentoItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <NavLink to={item.url} end>
                              <item.icon className="w-3 h-3" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )}
              
              {/* Cadastros with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCadastroOpen(!isCadastroOpen)}
                  className={getParentNavClass(isCadastroActive)}
                >
                  <Users className={isCadastroActive ? "w-4 h-4 text-primary" : "w-4 h-4"} />
                  {!isCollapsed && (
                    <>
                      <span className={isCadastroActive ? "text-primary" : undefined}>Cadastros</span>
                      {isCadastroOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isCadastroOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {cadastroItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {/* Financeiro with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsFinanceiroOpen(!isFinanceiroOpen)}
                  className={getParentNavClass(isFinanceiroActive)}
                >
                  <DollarSign className={isFinanceiroActive ? "w-4 h-4 text-primary" : "w-4 h-4"} />
                  {!isCollapsed && (
                    <>
                      <span className={isFinanceiroActive ? "text-primary" : undefined}>Financeiro</span>
                      {isFinanceiroOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isFinanceiroOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {financeiroItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              

              
              {/* Pagamentos with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsPagamentosOpen(!isPagamentosOpen)}
                  className={getParentNavClass(isPagamentosActive)}
                >
                  <CreditCard className={isPagamentosActive ? "w-4 h-4 text-primary" : "w-4 h-4"} />
                  {!isCollapsed && (
                    <>
                      <span className={isPagamentosActive ? "text-primary" : undefined}>Pagamentos</span>
                      {isPagamentosOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isPagamentosOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {pagamentosItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {/* Utilitários with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsUtilitariosOpen(!isUtilitariosOpen)}
                  className={getParentNavClass(isUtilitariosActive)}
                >
                  <Wrench className={isUtilitariosActive ? "w-4 h-4 text-primary" : "w-4 h-4"} />
                  {!isCollapsed && (
                    <>
                      <span className={isUtilitariosActive ? "text-primary" : undefined}>Utilitários</span>
                      {isUtilitariosOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isUtilitariosOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {utilitariosItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              
              {/* Configurações with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsConfiguracoesOpen(!isConfiguracoesOpen)}
                  className={getParentNavClass(isConfiguracoesActive)}
                >
                  <Settings className={isConfiguracoesActive ? "w-4 h-4 text-primary" : "w-4 h-4"} />
                  {!isCollapsed && (
                    <>
                      <span className={isConfiguracoesActive ? "text-primary" : undefined}>Configurações</span>
                      {isConfiguracoesOpen ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Submenu */}
                {isConfiguracoesOpen && !isCollapsed && (
                  <SidebarMenuSub>
                    {configuracoesItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} end>
                            <item.icon className="w-3 h-3" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Fixed logout button at bottom */}
      <div className="mt-auto border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer mobile-touch-target"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Desconectar</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
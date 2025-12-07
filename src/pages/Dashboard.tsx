import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, proximosAgendamentos, estoqueBaixo, isLoading } = useDashboardStats();

  const statsCards = [
    {
      title: "Total Pacientes",
      value: stats.totalPacientes.toLocaleString("pt-BR"),
      change: "Pacientes ativos no sistema",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Agendamentos Hoje",
      value: stats.agendamentosHoje.total.toString(),
      change: `${stats.agendamentosHoje.confirmados} confirmados, ${stats.agendamentosHoje.pendentes} pendentes`,
      icon: Calendar,
      color: "text-secondary",
    },
    {
      title: "Faturamento Mensal",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats.faturamentoMensal),
      change: "Contas recebidas este mês",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Produtos em Falta",
      value: stats.produtosFalta.toString(),
      change: stats.produtosFalta > 0 ? "Necessário reposição" : "Estoque adequado",
      icon: Package,
      color: stats.produtosFalta > 0 ? "text-warning" : "text-success",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu sistema de gestão odontológica
          </p>
        </div>
        <Button 
          variant="medical" 
          className="w-full sm:w-auto"
          onClick={() => navigate("/appointments")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="medical-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          statsCards.map((stat) => (
            <Card key={stat.title} className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Appointments */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>
              Consultas e procedimentos para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : proximosAgendamentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {proximosAgendamentos.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.patient}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">{appointment.procedure}</p>
                        <Badge
                          variant={appointment.status === "Confirmado" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate("/appointments")}
                >
                  Ver Agenda Completa
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              Alertas de Estoque
            </CardTitle>
            <CardDescription>
              Produtos com estoque baixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : estoqueBaixo.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50 text-success" />
                <p>Todos os produtos estão com estoque adequado</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {estoqueBaixo.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.current}/{item.minimum}
                        </span>
                      </div>
                      <Progress 
                        value={(item.current / item.minimum) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate("/cadastros/estoque")}
                >
                  Gerenciar Estoque
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
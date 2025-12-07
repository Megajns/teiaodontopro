import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Plus,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Clock
} from "lucide-react";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { usePacientes } from "@/hooks/usePacientes";
import { useDentistas } from "@/hooks/useDentistas";
import { AgendamentoForm } from "@/components/agenda/AgendamentoForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusOptions = ["Todos", "Agendado", "Confirmado", "Realizado", "Cancelado", "Faltou"];

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [dentistaFilter, setDentistaFilter] = useState("Todos");
  const [pacienteFilter, setPacienteFilter] = useState("Todos");
  const [procedimentoFilter, setProcedimentoFilter] = useState("");
  
  const { agendamentos, loading, fetchAgendamentos, createAgendamento, updateAgendamento, deleteAgendamento, confirmarAgendamento } = useAgendamentos();
  const { pacientes } = usePacientes();
  const { dentistas } = useDentistas();

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    fetchAgendamentos(start, end);
  }, [currentMonth]);

  // Filtrar agendamentos
  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(appointment => {
      const matchStatus = statusFilter === "Todos" || appointment.status === statusFilter;
      const matchDentista = dentistaFilter === "Todos" || appointment.dentista_id === dentistaFilter;
      const matchPaciente = pacienteFilter === "Todos" || appointment.paciente_id === pacienteFilter;
      const matchProcedimento = !procedimentoFilter || 
        appointment.procedimento.toLowerCase().includes(procedimentoFilter.toLowerCase());
      
      return matchStatus && matchDentista && matchPaciente && matchProcedimento;
    });
  }, [agendamentos, statusFilter, dentistaFilter, pacienteFilter, procedimentoFilter]);

  // Agendamentos do dia selecionado
  const selectedDayAppointments = useMemo(() => {
    return filteredAgendamentos.filter(appointment => 
      isSameDay(new Date(appointment.data_agendamento), selectedDate)
    ).sort((a, b) => 
      new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime()
    );
  }, [filteredAgendamentos, selectedDate]);

  // Agrupar agendamentos por dia para o calendário
  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, typeof filteredAgendamentos>();
    filteredAgendamentos.forEach(appointment => {
      const dateKey = format(new Date(appointment.data_agendamento), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(appointment);
    });
    return grouped;
  }, [filteredAgendamentos]);

  const limparFiltros = () => {
    setStatusFilter("Todos");
    setDentistaFilter("Todos");
    setPacienteFilter("Todos");
    setProcedimentoFilter("");
  };

  const handleSubmit = async (data: any) => {
    if (editingAgendamento) {
      await updateAgendamento((editingAgendamento as any).id, data);
    } else {
      await createAgendamento(data);
    }
  };

  const handleEdit = (agendamento: any) => {
    setEditingAgendamento(agendamento);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAgendamento(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmado":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "Agendado":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "Realizado":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "Cancelado":
      case "Faltou":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "status-active";
      case "Agendado":
        return "status-pending";
      case "Realizado":
        return "bg-primary/20 text-primary border border-primary/30";
      case "Cancelado":
      case "Faltou":
        return "status-inactive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie seus agendamentos
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-initial"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button 
              variant="medical" 
              className="flex-1 sm:flex-initial"
              onClick={() => {
                setEditingAgendamento(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="medical-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Filter className="w-5 h-5 mr-2 text-primary" />
                  Filtros
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={limparFiltros}>
                  Limpar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Dentista</label>
                  <Select value={dentistaFilter} onValueChange={setDentistaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dentista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      {dentistas.map(dentista => (
                        <SelectItem key={dentista.id} value={dentista.id}>
                          {dentista.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Paciente</label>
                  <Select value={pacienteFilter} onValueChange={setPacienteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      {pacientes.map(paciente => (
                        <SelectItem key={paciente.id} value={paciente.id}>
                          {paciente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Procedimento</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar procedimento..."
                      value={procedimentoFilter}
                      onChange={(e) => setProcedimentoFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendário e Lista */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Calendário */}
          <Card className="medical-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendário de Agendamentos</CardTitle>
              <CardDescription>
                {filteredAgendamentos.length} agendamento(s) este mês
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                onMonthChange={setCurrentMonth}
                month={currentMonth}
                locale={ptBR}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  hasAppointments: (day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    return appointmentsByDay.has(dateKey);
                  }
                }}
                modifiersClassNames={{
                  hasAppointments: "has-appointments"
                }}
              />
            </CardContent>
          </Card>

          {/* Agendamentos do dia */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {selectedDayAppointments.length} agendamento(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">Carregando...</p>
                </div>
              ) : selectedDayAppointments.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedDayAppointments.map((appointment) => {
                    const dataAgendamento = new Date(appointment.data_agendamento);
                    return (
                      <div
                        key={appointment.id}
                        className="p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="gradient-secondary text-white text-xs font-semibold">
                                {getInitials(appointment.pacientes?.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {appointment.pacientes?.nome || "Paciente"}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(dataAgendamento, "HH:mm")} - {appointment.duracao}min
                              </p>
                            </div>
                          </div>
                          <Badge className={cn("text-xs px-2 py-0.5", getStatusColor(appointment.status))}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-primary">
                            {appointment.procedimento}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dr(a). {appointment.dentistas?.nome || "Dentista"}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {!appointment.confirmado && appointment.status === "Agendado" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 text-xs h-7"
                              onClick={() => confirmarAgendamento(appointment.id)}
                            >
                              Confirmar
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEdit(appointment)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setDeleteId(appointment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AgendamentoForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          agendamento={editingAgendamento}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

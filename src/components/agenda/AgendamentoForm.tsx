import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Agendamento, useAgendamentos } from "@/hooks/useAgendamentos";
import { usePacientes } from "@/hooks/usePacientes";
import { useDentistas } from "@/hooks/useDentistas";
import { useConvenios } from "@/hooks/useConvenios";
import { useHorariosDisponiveis } from "@/hooks/useHorariosDisponiveis";

interface AgendamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  agendamento?: Agendamento | null;
}

export function AgendamentoForm({ open, onOpenChange, onSubmit, agendamento }: AgendamentoFormProps) {
  const { pacientes, refetch: refetchPacientes } = usePacientes();
  const { dentistas, refetch: refetchDentistas } = useDentistas();
  const { convenios, refetch: refetchConvenios } = useConvenios();
  const { agendamentos: todosAgendamentos, fetchAgendamentos } = useAgendamentos();
  const { horarios: horariosConfigurados } = useHorariosDisponiveis();

  const [formData, setFormData] = useState({
    paciente_id: "",
    dentista_id: "",
    data_agendamento: new Date(),
    hora: "09:00",
    duracao: 30,
    procedimento: "",
    tipo_atendimento: "Consulta",
    status: "Agendado",
    convenio_id: "particular",
    valor: 0,
    observacoes: "",
    confirmado: false,
  });

  useEffect(() => {
    if (open) {
      refetchPacientes();
      refetchDentistas();
      refetchConvenios();
    }
  }, [open]);

  // Buscar agendamentos quando a data mudar
  useEffect(() => {
    if (formData.data_agendamento && formData.dentista_id) {
      const startOfDay = new Date(formData.data_agendamento);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(formData.data_agendamento);
      endOfDay.setHours(23, 59, 59, 999);
      fetchAgendamentos(startOfDay, endOfDay);
    }
  }, [formData.data_agendamento, formData.dentista_id]);

  // Calcular horários disponíveis baseado na configuração e agendamentos
  const horariosDisponiveis = useMemo(() => {
    if (!formData.data_agendamento || !formData.dentista_id) {
      return [];
    }

    // Obter dia da semana (0 = Domingo, 1 = Segunda, etc.)
    const diaSemana = formData.data_agendamento.getDay();

    // Filtrar horários configurados para este dia da semana que estão ativos
    const horariosConfiguradosDoDia = horariosConfigurados
      .filter(h => h.dia_semana === diaSemana && h.ativo)
      .map(h => h.hora.substring(0, 5)) // Formatar de "10:00:00" para "10:00"
      .sort();

    if (horariosConfiguradosDoDia.length === 0) {
      return [];
    }

    // Filtrar agendamentos do mesmo dentista na mesma data
    const agendamentosDoDia = todosAgendamentos.filter(apt => {
      const aptDate = new Date(apt.data_agendamento);
      const statusOcupado = ["Agendado", "Confirmado", "Realizado"];
      
      return (
        apt.dentista_id === formData.dentista_id &&
        isSameDay(aptDate, formData.data_agendamento) &&
        statusOcupado.includes(apt.status) &&
        apt.id !== agendamento?.id
      );
    });

    // Remover horários já ocupados
    return horariosConfiguradosDoDia.filter(horario => {
      return !agendamentosDoDia.some(apt => {
        const aptDate = new Date(apt.data_agendamento);
        const aptHora = format(aptDate, "HH:mm");
        return aptHora === horario;
      });
    });
  }, [horariosConfigurados, todosAgendamentos, formData.data_agendamento, formData.dentista_id, agendamento?.id]);

  useEffect(() => {
    if (agendamento) {
      const dataAgendamento = new Date(agendamento.data_agendamento);
      setFormData({
        paciente_id: agendamento.paciente_id,
        dentista_id: agendamento.dentista_id,
        data_agendamento: dataAgendamento,
        hora: format(dataAgendamento, "HH:mm"),
        duracao: agendamento.duracao,
        procedimento: agendamento.procedimento,
        tipo_atendimento: agendamento.tipo_atendimento,
        status: agendamento.status,
        convenio_id: agendamento.convenio_id || "particular",
        valor: agendamento.valor || 0,
        observacoes: agendamento.observacoes || "",
        confirmado: agendamento.confirmado,
      });
    } else {
      setFormData({
        paciente_id: "",
        dentista_id: "",
        data_agendamento: new Date(),
        hora: "09:00",
        duracao: 30,
        procedimento: "",
        tipo_atendimento: "Consulta",
        status: "Agendado",
        convenio_id: "particular",
        valor: 0,
        observacoes: "",
        confirmado: false,
      });
    }
  }, [agendamento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const [hour, minute] = formData.hora.split(':');
    const dataAgendamento = new Date(formData.data_agendamento);
    dataAgendamento.setHours(parseInt(hour), parseInt(minute), 0, 0);

    // Remove hora do objeto pois não existe no banco
    const { hora, ...dataToSubmit } = formData;

    const submitData = {
      ...dataToSubmit,
      data_agendamento: dataAgendamento.toISOString(),
      convenio_id: formData.convenio_id === "particular" ? null : formData.convenio_id,
      valor: formData.valor || null,
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select value={formData.paciente_id} onValueChange={(value) => setFormData({ ...formData, paciente_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="dentista_id">Dentista *</Label>
              <Select value={formData.dentista_id} onValueChange={(value) => setFormData({ ...formData, dentista_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((dentista) => (
                    <SelectItem key={dentista.id} value={dentista.id}>
                      {dentista.nome} - {dentista.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_agendamento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_agendamento ? format(formData.data_agendamento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_agendamento}
                    onSelect={(date) => date && setFormData({ ...formData, data_agendamento: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Horário *</Label>
              <Select 
                value={formData.hora} 
                onValueChange={(value) => setFormData({ ...formData, hora: value })}
                disabled={!formData.dentista_id || !formData.data_agendamento}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponiveis.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {!formData.data_agendamento 
                        ? "Selecione uma data primeiro" 
                        : "Nenhum horário configurado para este dia"}
                    </SelectItem>
                  ) : (
                    horariosDisponiveis.map((horario) => (
                      <SelectItem key={horario} value={horario}>
                        {horario}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!formData.dentista_id && (
                <p className="text-xs text-muted-foreground">
                  Selecione um dentista primeiro
                </p>
              )}
              {formData.dentista_id && formData.data_agendamento && horariosDisponiveis.length === 0 && (
                <p className="text-xs text-destructive">
                  Nenhum horário disponível para este dia. Configure os horários em Configurações → Informações da Clínica
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (min) *</Label>
              <Input
                id="duracao"
                type="number"
                min="15"
                step="15"
                value={formData.duracao}
                onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_atendimento">Tipo de Atendimento *</Label>
              <Select value={formData.tipo_atendimento} onValueChange={(value) => setFormData({ ...formData, tipo_atendimento: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                  <SelectItem value="Procedimento">Procedimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="procedimento">Procedimento *</Label>
              <Input
                id="procedimento"
                value={formData.procedimento}
                onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                placeholder="Ex: Limpeza, Obturação, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Confirmado">Confirmado</SelectItem>
                  <SelectItem value="Realizado">Realizado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Faltou">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="convenio_id">Convênio</Label>
              <Select value={formData.convenio_id} onValueChange={(value) => setFormData({ ...formData, convenio_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Particular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  {convenios.map((convenio) => (
                    <SelectItem key={convenio.id} value={convenio.id}>
                      {convenio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {agendamento ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

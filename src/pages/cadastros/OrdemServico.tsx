import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Plus, Search, Edit, Eye, Calendar, User, DollarSign, X, Trash2 } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useOrdemServico, Procedimento } from "@/hooks/useOrdemServico";
import { usePacientes } from "@/hooks/usePacientes";
import { useDentistas } from "@/hooks/useDentistas";

export function OrdemServico() {
  const { ordensServico, loading, createOrdemServico, updateOrdemServico, deleteOrdemServico } = useOrdemServico();
  const { pacientes } = usePacientes();
  const { dentistas } = useDentistas();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingOS, setViewingOS] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newOS, setNewOS] = useState({
    paciente_id: "",
    dentista_id: "",
    data_abertura: new Date().toISOString().split('T')[0],
    data_prevista: "",
    status: "Aberta",
    prioridade: "Normal",
    observacoes: "",
  });

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [currentProcedimento, setCurrentProcedimento] = useState<Procedimento>({
    descricao: "",
    valor: 0,
    dente: "",
  });

  const filteredOS = ordensServico.filter(os => {
    const paciente = pacientes.find(p => p.id === os.paciente_id);
    const dentista = dentistas.find(d => d.id === os.dentista_id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      os.numero_os.toLowerCase().includes(searchLower) ||
      paciente?.nome.toLowerCase().includes(searchLower) ||
      dentista?.nome.toLowerCase().includes(searchLower)
    );
  });

  const addProcedimento = () => {
    if (!currentProcedimento.descricao || currentProcedimento.valor <= 0) return;
    
    setProcedimentos([...procedimentos, currentProcedimento]);
    setCurrentProcedimento({
      descricao: "",
      valor: 0,
      dente: "",
    });
  };

  const removeProcedimento = (index: number) => {
    setProcedimentos(procedimentos.filter((_, i) => i !== index));
  };

  const calcularValorTotal = () => {
    return procedimentos.reduce((total, proc) => total + proc.valor, 0);
  };

  const handleSave = async () => {
    if (!newOS.paciente_id || !newOS.dentista_id || procedimentos.length === 0) {
      return;
    }

    try {
      const valorTotal = calcularValorTotal();
      
      if (editingOS) {
        await updateOrdemServico(editingOS.id, {
          ...newOS,
          procedimentos,
          valor_total: valorTotal,
        });
      } else {
        await createOrdemServico({
          ...newOS,
          procedimentos,
          valor_total: valorTotal,
        });
      }

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar OS:", error);
    }
  };

  const resetForm = () => {
    setNewOS({
      paciente_id: "",
      dentista_id: "",
      data_abertura: new Date().toISOString().split('T')[0],
      data_prevista: "",
      status: "Aberta",
      prioridade: "Normal",
      observacoes: "",
    });
    setProcedimentos([]);
    setEditingOS(null);
  };

  const handleEdit = (os: any) => {
    setEditingOS(os);
    setNewOS({
      paciente_id: os.paciente_id,
      dentista_id: os.dentista_id,
      data_abertura: os.data_abertura,
      data_prevista: os.data_prevista || "",
      status: os.status,
      prioridade: os.prioridade,
      observacoes: os.observacoes || "",
    });
    setProcedimentos(os.procedimentos);
    setDialogOpen(true);
  };

  const handleView = (os: any) => {
    setViewingOS(os);
    setViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteOrdemServico(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída": return "default";
      case "Em Andamento": return "secondary";
      case "Aberta": return "outline";
      case "Cancelada": return "destructive";
      default: return "secondary";
    }
  };

  const columns = [
    { 
      key: 'numero_os' as const, 
      header: 'Número OS', 
      className: 'font-medium',
    },
    { 
      key: 'paciente_id' as const, 
      header: 'Paciente',
      render: (value: string) => pacientes.find(p => p.id === value)?.nome || 'N/A'
    },
    { 
      key: 'dentista_id' as const, 
      header: 'Dentista', 
      className: 'hidden md:table-cell',
      render: (value: string) => dentistas.find(d => d.id === value)?.nome || 'N/A'
    },
    { 
      key: 'status' as const, 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'valor_total' as const, 
      header: 'Valor', 
      className: 'hidden lg:table-cell font-medium',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    { 
      key: 'data_abertura' as const, 
      header: 'Data', 
      className: 'hidden lg:table-cell',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    }
  ];

  const mobileCardRender = (os: any) => {
    const paciente = pacientes.find(p => p.id === os.paciente_id);
    const dentista = dentistas.find(d => d.id === os.dentista_id);
    
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-base">{os.numero_os}</h3>
            <p className="text-sm text-muted-foreground">{paciente?.nome}</p>
          </div>
          <Badge variant={getStatusColor(os.status)}>
            {os.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{dentista?.nome}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">R$ {os.valor_total.toFixed(2)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{new Date(os.data_abertura).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = (os: any) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleView(os)}>
        <Eye className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Ver</span>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEdit(os)}>
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setDeleteId(os.id)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ordem de Serviço</h1>
            <p className="text-muted-foreground">Gerencie as ordens de serviço da clínica</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOS ? "Editar" : "Nova"} Ordem de Serviço</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Paciente e Dentista */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paciente">Paciente *</Label>
                    <Select value={newOS.paciente_id} onValueChange={(value) => setNewOS({ ...newOS, paciente_id: value })}>
                      <SelectTrigger id="paciente">
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

                  <div>
                    <Label htmlFor="dentista">Dentista *</Label>
                    <Select value={newOS.dentista_id} onValueChange={(value) => setNewOS({ ...newOS, dentista_id: value })}>
                      <SelectTrigger id="dentista">
                        <SelectValue placeholder="Selecione o dentista" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentistas.map((dentista) => (
                          <SelectItem key={dentista.id} value={dentista.id}>
                            {dentista.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Datas e Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_abertura">Data de Abertura *</Label>
                    <Input
                      id="data_abertura"
                      type="date"
                      value={newOS.data_abertura}
                      onChange={(e) => setNewOS({ ...newOS, data_abertura: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_prevista">Data Prevista</Label>
                    <Input
                      id="data_prevista"
                      type="date"
                      value={newOS.data_prevista}
                      onChange={(e) => setNewOS({ ...newOS, data_prevista: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newOS.status} onValueChange={(value) => setNewOS({ ...newOS, status: value })}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aberta">Aberta</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Concluída">Concluída</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={newOS.prioridade} onValueChange={(value) => setNewOS({ ...newOS, prioridade: value })}>
                      <SelectTrigger id="prioridade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Adicionar Procedimentos */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Procedimentos *</h4>
                  
                  <div className="border rounded-md p-4 space-y-4 bg-muted/30">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="proc_descricao">Descrição *</Label>
                        <Input
                          id="proc_descricao"
                          value={currentProcedimento.descricao}
                          onChange={(e) => setCurrentProcedimento({ ...currentProcedimento, descricao: e.target.value })}
                          placeholder="Ex: Restauração em resina"
                        />
                      </div>
                      <div>
                        <Label htmlFor="proc_dente">Dente</Label>
                        <Input
                          id="proc_dente"
                          value={currentProcedimento.dente}
                          onChange={(e) => setCurrentProcedimento({ ...currentProcedimento, dente: e.target.value })}
                          placeholder="Ex: 11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proc_valor">Valor *</Label>
                        <Input
                          id="proc_valor"
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentProcedimento.valor || ""}
                          onChange={(e) => setCurrentProcedimento({ ...currentProcedimento, valor: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={addProcedimento}
                          disabled={!currentProcedimento.descricao || currentProcedimento.valor <= 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Procedimento
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Procedimentos */}
                  {procedimentos.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Procedimentos Adicionados:</h5>
                      {procedimentos.map((proc, index) => (
                        <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-md">
                          <div className="flex-1 text-sm">
                            <div className="font-medium">{proc.descricao}</div>
                            <div className="text-muted-foreground">
                              {proc.dente && `Dente ${proc.dente} • `}R$ {proc.valor.toFixed(2)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProcedimento(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-end text-lg font-bold pt-2">
                        Total: R$ {calcularValorTotal().toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={newOS.observacoes}
                    onChange={(e) => setNewOS({ ...newOS, observacoes: e.target.value })}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!newOS.paciente_id || !newOS.dentista_id || procedimentos.length === 0 || loading}
                  >
                    {editingOS ? "Atualizar" : "Criar"} OS
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Lista de Ordens de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por número, paciente ou dentista..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <MobileTable
              data={filteredOS}
              columns={columns}
              mobileCardRender={mobileCardRender}
              actions={renderActions}
              loading={loading}
              emptyState={{
                icon: FileText,
                title: searchTerm ? "Nenhuma ordem de serviço encontrada" : "Nenhuma ordem de serviço cadastrada",
                description: searchTerm 
                  ? "Não encontramos ordens de serviço com os termos pesquisados. Tente ajustar os filtros."
                  : "Você ainda não possui ordens de serviço cadastradas. Crie sua primeira ordem de serviço para começar.",
                actionLabel: searchTerm ? undefined : "Nova Ordem de Serviço",
                onAction: searchTerm ? undefined : () => setDialogOpen(true)
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {viewingOS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Número OS:</strong> {viewingOS.numero_os}
                </div>
                <div>
                  <strong>Status:</strong> <Badge variant={getStatusColor(viewingOS.status)}>{viewingOS.status}</Badge>
                </div>
                <div>
                  <strong>Paciente:</strong> {pacientes.find(p => p.id === viewingOS.paciente_id)?.nome}
                </div>
                <div>
                  <strong>Dentista:</strong> {dentistas.find(d => d.id === viewingOS.dentista_id)?.nome}
                </div>
                <div>
                  <strong>Data Abertura:</strong> {new Date(viewingOS.data_abertura).toLocaleDateString('pt-BR')}
                </div>
                {viewingOS.data_prevista && (
                  <div>
                    <strong>Data Prevista:</strong> {new Date(viewingOS.data_prevista).toLocaleDateString('pt-BR')}
                  </div>
                )}
                <div>
                  <strong>Prioridade:</strong> {viewingOS.prioridade}
                </div>
              </div>

              <div>
                <strong className="block mb-2">Procedimentos:</strong>
                {viewingOS.procedimentos.map((proc: Procedimento, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-md mb-2">
                    <div className="font-medium">{proc.descricao}</div>
                    <div className="text-sm text-muted-foreground">
                      {proc.dente && `Dente ${proc.dente} • `}R$ {proc.valor.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="text-right font-bold text-lg mt-2">
                  Total: R$ {viewingOS.valor_total.toFixed(2)}
                </div>
              </div>

              {viewingOS.observacoes && (
                <div>
                  <strong className="block mb-2">Observações:</strong>
                  <p className="text-sm p-3 bg-muted rounded-md">{viewingOS.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

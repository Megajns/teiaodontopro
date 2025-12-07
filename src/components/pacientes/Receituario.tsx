import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Printer, FileText, Pill, Clock, Calendar, Trash2, X } from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useReceituario, Medicamento } from "@/hooks/useReceituario";
import { useState } from "react";

export function Receituario() {
  const { pacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const { receituarios, loading, createReceituario, deleteReceituario } = useReceituario(selectedPacienteId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newReceituario, setNewReceituario] = useState({
    data_prescricao: new Date().toISOString().split('T')[0],
    diagnostico: "",
    observacoes: "",
    validade: "",
  });

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [currentMedicamento, setCurrentMedicamento] = useState<Medicamento>({
    nome: "",
    dosagem: "",
    frequencia: "",
    duracao: "",
    observacoes: "",
  });

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);

  const addMedicamento = () => {
    if (!currentMedicamento.nome || !currentMedicamento.dosagem) return;
    
    setMedicamentos([...medicamentos, currentMedicamento]);
    setCurrentMedicamento({
      nome: "",
      dosagem: "",
      frequencia: "",
      duracao: "",
      observacoes: "",
    });
  };

  const removeMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedPacienteId || medicamentos.length === 0) {
      return;
    }

    try {
      await createReceituario({
        paciente_id: selectedPacienteId,
        ...newReceituario,
        medicamentos,
      });
      setNewReceituario({
        data_prescricao: new Date().toISOString().split('T')[0],
        diagnostico: "",
        observacoes: "",
        validade: "",
      });
      setMedicamentos([]);
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar receituário:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteReceituario(deleteId);
      setDeleteId(null);
    }
  };

  const handlePrint = (receituario: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const medicamentosHTML = receituario.medicamentos
      .map((med: Medicamento) => `
        <div style="margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
          <strong>${med.nome}</strong><br/>
          Dosagem: ${med.dosagem}<br/>
          Frequência: ${med.frequencia}<br/>
          Duração: ${med.duracao}
          ${med.observacoes ? `<br/>Obs: ${med.observacoes}` : ''}
        </div>
      `)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receituário - ${selectedPaciente?.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .info { margin: 10px 0; }
            .medicamentos { margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Receituário Odontológico</h1>
            <div class="info"><strong>Paciente:</strong> ${selectedPaciente?.nome}</div>
            <div class="info"><strong>Data:</strong> ${new Date(receituario.data_prescricao).toLocaleDateString('pt-BR')}</div>
            ${receituario.diagnostico ? `<div class="info"><strong>Diagnóstico:</strong> ${receituario.diagnostico}</div>` : ''}
          </div>
          
          <div class="medicamentos">
            <h2>Medicamentos Prescritos:</h2>
            ${medicamentosHTML}
          </div>
          
          ${receituario.observacoes ? `
            <div style="margin-top: 30px;">
              <strong>Observações:</strong>
              <p>${receituario.observacoes}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>___________________________________</p>
            <p>Assinatura do Profissional</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paciente">Paciente</Label>
            <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
              <SelectTrigger id="paciente">
                <SelectValue placeholder="Selecione um paciente" />
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

          {selectedPaciente && (
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <p className="text-sm"><strong>Email:</strong> {selectedPaciente.email}</p>
              <p className="text-sm"><strong>Telefone:</strong> {selectedPaciente.telefone}</p>
              {selectedPaciente.cpf && <p className="text-sm"><strong>CPF:</strong> {selectedPaciente.cpf}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPacienteId && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Receituário</h2>
              <p className="text-sm text-muted-foreground">
                Prescrições médicas e medicamentos do paciente
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Receita</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_prescricao">Data da Prescrição *</Label>
                      <Input
                        id="data_prescricao"
                        type="date"
                        value={newReceituario.data_prescricao}
                        onChange={(e) => setNewReceituario({ ...newReceituario, data_prescricao: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="validade">Validade</Label>
                      <Input
                        id="validade"
                        type="date"
                        value={newReceituario.validade}
                        onChange={(e) => setNewReceituario({ ...newReceituario, validade: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="diagnostico">Diagnóstico/CID</Label>
                    <Input
                      id="diagnostico"
                      value={newReceituario.diagnostico}
                      onChange={(e) => setNewReceituario({ ...newReceituario, diagnostico: e.target.value })}
                      placeholder="Ex: K04.1 - Necrose da polpa"
                    />
                  </div>

                  <Separator />

                  {/* Adicionar Medicamento */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Adicionar Medicamento
                    </h4>
                    
                    <div className="border rounded-md p-4 space-y-4 bg-muted/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medicamento">Medicamento *</Label>
                          <Input
                            id="medicamento"
                            value={currentMedicamento.nome}
                            onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, nome: e.target.value })}
                            placeholder="Ex: Amoxicilina 500mg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosagem">Dosagem *</Label>
                          <Input
                            id="dosagem"
                            value={currentMedicamento.dosagem}
                            onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, dosagem: e.target.value })}
                            placeholder="Ex: 1 cápsula"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="frequencia">Frequência</Label>
                          <Input
                            id="frequencia"
                            value={currentMedicamento.frequencia}
                            onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, frequencia: e.target.value })}
                            placeholder="Ex: 8/8h ou 3x ao dia"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duracao">Duração</Label>
                          <Input
                            id="duracao"
                            value={currentMedicamento.duracao}
                            onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, duracao: e.target.value })}
                            placeholder="Ex: 7 dias"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="obs_medicamento">Observações do Medicamento</Label>
                        <Input
                          id="obs_medicamento"
                          value={currentMedicamento.observacoes}
                          onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, observacoes: e.target.value })}
                          placeholder="Ex: Tomar com alimentos"
                        />
                      </div>

                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={addMedicamento}
                        disabled={!currentMedicamento.nome || !currentMedicamento.dosagem}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar à Lista
                      </Button>
                    </div>

                    {/* Lista de Medicamentos */}
                    {medicamentos.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Medicamentos Adicionados:</h5>
                        {medicamentos.map((med, index) => (
                          <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-md">
                            <div className="flex-1 text-sm">
                              <div className="font-medium">{med.nome}</div>
                              <div className="text-muted-foreground">
                                {med.dosagem} • {med.frequencia} • {med.duracao}
                              </div>
                              {med.observacoes && (
                                <div className="text-xs text-muted-foreground mt-1">Obs: {med.observacoes}</div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedicamento(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="observacoes">Observações e Orientações Gerais</Label>
                    <Textarea
                      id="observacoes"
                      value={newReceituario.observacoes}
                      onChange={(e) => setNewReceituario({ ...newReceituario, observacoes: e.target.value })}
                      placeholder="Orientações especiais, cuidados, contraindicações..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={medicamentos.length === 0 || loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Receita
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Histórico de Receitas */}
          {receituarios.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma receita emitida ainda. Clique em "Nova Receita" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receituarios.map((receituario) => (
                    <Card key={receituario.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(receituario.data_prescricao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {receituario.diagnostico && (
                          <div className="mb-3 text-sm">
                            <strong>Diagnóstico:</strong> {receituario.diagnostico}
                          </div>
                        )}

                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2 text-sm">
                            <Pill className="w-4 h-4" />
                            Medicamentos Prescritos
                          </h4>
                          
                          {receituario.medicamentos.map((med, index) => (
                            <div key={index} className="bg-muted/50 rounded p-3 space-y-1">
                              <div className="font-medium text-sm">{med.nome}</div>
                              <div className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>Dose: {med.dosagem}</div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {med.frequencia}
                                </div>
                                <div>Por: {med.duracao}</div>
                              </div>
                              {med.observacoes && (
                                <div className="text-xs text-muted-foreground">Obs: {med.observacoes}</div>
                              )}
                            </div>
                          ))}

                          {receituario.observacoes && (
                            <>
                              <Separator />
                              <div>
                                <h5 className="font-medium text-sm mb-1">Observações:</h5>
                                <p className="text-sm text-muted-foreground">{receituario.observacoes}</p>
                              </div>
                            </>
                          )}

                          <div className="flex justify-end gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrint(receituario)}
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Imprimir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(receituario.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

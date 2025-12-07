import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileImage, Upload, Trash2, Edit } from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useRadiografias } from "@/hooks/useRadiografias";
import { useState, useRef } from "react";

export function Radiografias() {
  const { pacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const { radiografias, loading, createRadiografia, updateRadiografia, deleteRadiografia } = useRadiografias(selectedPacienteId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [laudoDialogOpen, setLaudoDialogOpen] = useState(false);
  const [selectedRadiografia, setSelectedRadiografia] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newRadiografia, setNewRadiografia] = useState({
    titulo: "",
    tipo_exame: "",
    data_exame: "",
    laudo: "",
    observacoes: "",
    imagem_base64: "",
  });

  const [editLaudo, setEditLaudo] = useState("");

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Arquivo muito grande. Máximo 50MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRadiografia((prev) => ({
          ...prev,
          imagem_base64: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedPacienteId || !newRadiografia.imagem_base64 || !newRadiografia.titulo) {
      return;
    }

    try {
      await createRadiografia({
        paciente_id: selectedPacienteId,
        ...newRadiografia,
      });
      setNewRadiografia({
        titulo: "",
        tipo_exame: "",
        data_exame: "",
        laudo: "",
        observacoes: "",
        imagem_base64: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar radiografia:", error);
    }
  };

  const handleSaveLaudo = async () => {
    if (!selectedRadiografia) return;

    try {
      await updateRadiografia(selectedRadiografia.id, {
        laudo: editLaudo,
      });
      setLaudoDialogOpen(false);
      setSelectedRadiografia(null);
      setEditLaudo("");
    } catch (error) {
      console.error("Erro ao salvar laudo:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRadiografia(deleteId);
      setDeleteId(null);
    }
  };

  const openLaudoDialog = (radiografia: any) => {
    setSelectedRadiografia(radiografia);
    setEditLaudo(radiografia.laudo || "");
    setLaudoDialogOpen(true);
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
              <h2 className="text-xl font-semibold">Radiografias</h2>
              <p className="text-sm text-muted-foreground">
                Exames radiográficos e laudos do paciente
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Radiografia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Radiografia</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={newRadiografia.titulo}
                      onChange={(e) => setNewRadiografia({ ...newRadiografia, titulo: e.target.value })}
                      placeholder="Ex: Panorâmica Inicial"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_exame">Tipo de Exame</Label>
                      <Select value={newRadiografia.tipo_exame} onValueChange={(value) => setNewRadiografia({ ...newRadiografia, tipo_exame: value })}>
                        <SelectTrigger id="tipo_exame">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Panorâmica">Panorâmica</SelectItem>
                          <SelectItem value="Telerradiografia Lateral">Telerradiografia Lateral</SelectItem>
                          <SelectItem value="Telerradiografia PA">Telerradiografia PA</SelectItem>
                          <SelectItem value="Periapical">Periapical</SelectItem>
                          <SelectItem value="Bite Wing">Bite Wing</SelectItem>
                          <SelectItem value="Oclusal">Oclusal</SelectItem>
                          <SelectItem value="Tomografia">Tomografia Computadorizada</SelectItem>
                          <SelectItem value="Ressonância">Ressonância Magnética</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="data_exame">Data do Exame</Label>
                      <Input
                        id="data_exame"
                        type="date"
                        value={newRadiografia.data_exame}
                        onChange={(e) => setNewRadiografia({ ...newRadiografia, data_exame: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="laudo">Laudo</Label>
                    <Textarea
                      id="laudo"
                      value={newRadiografia.laudo}
                      onChange={(e) => setNewRadiografia({ ...newRadiografia, laudo: e.target.value })}
                      placeholder="Laudo radiográfico detalhado..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={newRadiografia.observacoes}
                      onChange={(e) => setNewRadiografia({ ...newRadiografia, observacoes: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imagem">Imagem * (Máx 50MB)</Label>
                    <div className="mt-2">
                      <Input
                        ref={fileInputRef}
                        id="imagem"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    {newRadiografia.imagem_base64 && (
                      <div className="mt-4">
                        <img
                          src={newRadiografia.imagem_base64}
                          alt="Preview"
                          className="max-h-64 rounded-lg mx-auto bg-black/90"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={!newRadiografia.titulo || !newRadiografia.imagem_base64 || loading}
                    >
                      Salvar Radiografia
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Galeria de Radiografias */}
          {radiografias.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma radiografia adicionada ainda. Clique em "Adicionar Radiografia" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radiografias.map((radiografia) => (
                <Card key={radiografia.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-square bg-black/90 rounded-lg overflow-hidden">
                      <img
                        src={radiografia.imagem_base64}
                        alt={radiografia.titulo}
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(radiografia.imagem_base64, '_blank')}
                      />
                    </div>
                    <div>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-medium text-sm">{radiografia.titulo}</h3>
                        {radiografia.tipo_exame && (
                          <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded shrink-0">
                            {radiografia.tipo_exame}
                          </span>
                        )}
                      </div>
                      {radiografia.data_exame && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(radiografia.data_exame).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {radiografia.laudo && (
                        <p className="text-xs mt-2 p-2 bg-muted/50 rounded line-clamp-3">
                          <strong>Laudo:</strong> {radiografia.laudo}
                        </p>
                      )}
                      {radiografia.observacoes && (
                        <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{radiografia.observacoes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openLaudoDialog(radiografia)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar Laudo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = radiografia.imagem_base64;
                          link.download = `${radiografia.titulo}.png`;
                          link.click();
                        }}
                      >
                        Baixar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(radiografia.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialog de Edição de Laudo */}
      <Dialog open={laudoDialogOpen} onOpenChange={setLaudoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Laudo - {selectedRadiografia?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_laudo">Laudo Radiográfico</Label>
              <Textarea
                id="edit_laudo"
                value={editLaudo}
                onChange={(e) => setEditLaudo(e.target.value)}
                placeholder="Descreva os achados radiográficos..."
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLaudoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveLaudo}>
                Salvar Laudo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta radiografia? Esta ação não pode ser desfeita.
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

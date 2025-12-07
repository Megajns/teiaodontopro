import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Camera, Upload, Trash2 } from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useFotos } from "@/hooks/useFotos";
import { useState, useRef } from "react";

export function Fotos() {
  const { pacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const { fotos, loading, createFoto, deleteFoto } = useFotos(selectedPacienteId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newFoto, setNewFoto] = useState({
    titulo: "",
    tipo: "",
    data_foto: "",
    observacoes: "",
    imagem_base64: "",
  });

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Arquivo muito grande. Máximo 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFoto((prev) => ({
          ...prev,
          imagem_base64: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedPacienteId || !newFoto.imagem_base64 || !newFoto.titulo) {
      return;
    }

    try {
      await createFoto({
        paciente_id: selectedPacienteId,
        ...newFoto,
      });
      setNewFoto({
        titulo: "",
        tipo: "",
        data_foto: "",
        observacoes: "",
        imagem_base64: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFoto(deleteId);
      setDeleteId(null);
    }
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
              <h2 className="text-xl font-semibold">Fotos</h2>
              <p className="text-sm text-muted-foreground">
                Documentação fotográfica do paciente
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Foto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={newFoto.titulo}
                      onChange={(e) => setNewFoto({ ...newFoto, titulo: e.target.value })}
                      placeholder="Ex: Foto inicial - Frontal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select value={newFoto.tipo} onValueChange={(value) => setNewFoto({ ...newFoto, tipo: value })}>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inicial">Inicial</SelectItem>
                          <SelectItem value="Durante Tratamento">Durante Tratamento</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                          <SelectItem value="Frontal">Frontal</SelectItem>
                          <SelectItem value="Perfil">Perfil</SelectItem>
                          <SelectItem value="Intraoral">Intraoral</SelectItem>
                          <SelectItem value="Extraoral">Extraoral</SelectItem>
                          <SelectItem value="Sorriso">Sorriso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="data_foto">Data da Foto</Label>
                      <Input
                        id="data_foto"
                        type="date"
                        value={newFoto.data_foto}
                        onChange={(e) => setNewFoto({ ...newFoto, data_foto: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={newFoto.observacoes}
                      onChange={(e) => setNewFoto({ ...newFoto, observacoes: e.target.value })}
                      placeholder="Adicione observações sobre a foto..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imagem">Imagem * (Máx 10MB)</Label>
                    <div className="mt-2">
                      <Input
                        ref={fileInputRef}
                        id="imagem"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    {newFoto.imagem_base64 && (
                      <div className="mt-4">
                        <img
                          src={newFoto.imagem_base64}
                          alt="Preview"
                          className="max-h-64 rounded-lg mx-auto"
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
                      disabled={!newFoto.titulo || !newFoto.imagem_base64 || loading}
                    >
                      Salvar Foto
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Galeria de Fotos */}
          {fotos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma foto adicionada ainda. Clique em "Adicionar Foto" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fotos.map((foto) => (
                <Card key={foto.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={foto.imagem_base64}
                        alt={foto.titulo}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(foto.imagem_base64, '_blank')}
                      />
                    </div>
                    <div>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-medium text-sm">{foto.titulo}</h3>
                        {foto.tipo && (
                          <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded shrink-0">
                            {foto.tipo}
                          </span>
                        )}
                      </div>
                      {foto.data_foto && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(foto.data_foto).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {foto.observacoes && (
                        <p className="text-xs mt-2 line-clamp-2 text-muted-foreground">{foto.observacoes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = foto.imagem_base64;
                          link.download = `${foto.titulo}.png`;
                          link.click();
                        }}
                      >
                        Baixar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(foto.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Padrões de Documentação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Padrões de Documentação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Fotos Extraorais</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Frontal em repouso</li>
                    <li>• Frontal sorrindo</li>
                    <li>• Perfil direito</li>
                    <li>• Perfil esquerdo</li>
                    <li>• 3/4 direita e esquerda</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Fotos Intraorais</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Frontal em oclusão</li>
                    <li>• Oclusal superior</li>
                    <li>• Oclusal inferior</li>
                    <li>• Lateral direita</li>
                    <li>• Lateral esquerda</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Especiais</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Detalhes específicos</li>
                    <li>• Comparações</li>
                    <li>• Pós-operatórias</li>
                    <li>• Intercorrências</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
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

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus, Search, Edit, Trash2, Clock, DollarSign, Tag } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useHonorarios, Honorario } from "@/hooks/useHonorarios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function TabelaHonorarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHonorario, setEditingHonorario] = useState<Honorario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { honorarios, loading, fetchHonorarios, createHonorario, updateHonorario, deleteHonorario } = useHonorarios();

  const [formData, setFormData] = useState({
    procedimento: "",
    codigo: "",
    categoria: "",
    valor_particular: 0,
    valor_convenio: 0,
    duracao_media: 30,
    status: "Ativo",
    observacoes: "",
  });

  useEffect(() => {
    fetchHonorarios();
  }, []);

  useEffect(() => {
    if (editingHonorario) {
      setFormData({
        procedimento: editingHonorario.procedimento,
        codigo: editingHonorario.codigo,
        categoria: editingHonorario.categoria,
        valor_particular: editingHonorario.valor_particular,
        valor_convenio: editingHonorario.valor_convenio,
        duracao_media: editingHonorario.duracao_media,
        status: editingHonorario.status,
        observacoes: editingHonorario.observacoes || "",
      });
    }
  }, [editingHonorario]);

  const filteredHonorarios = honorarios.filter(item =>
    item.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHonorario) {
      await updateHonorario(editingHonorario.id, formData);
    } else {
      await createHonorario(formData);
    }
    setDialogOpen(false);
    setEditingHonorario(null);
    setFormData({
      procedimento: "",
      codigo: "",
      categoria: "",
      valor_particular: 0,
      valor_convenio: 0,
      duracao_media: 30,
      status: "Ativo",
      observacoes: "",
    });
  };

  const handleEdit = (honorario: Honorario) => {
    setEditingHonorario(honorario);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteHonorario(deleteId);
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'procedimento' as const, header: 'Procedimento', className: 'font-medium' },
    { key: 'codigo' as const, header: 'Código', className: 'hidden sm:table-cell' },
    { key: 'categoria' as const, header: 'Categoria', className: 'hidden md:table-cell' },
    { 
      key: 'valor_particular' as const, 
      header: 'Particular', 
      className: 'font-medium text-primary',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    { 
      key: 'valor_convenio' as const, 
      header: 'Convênio', 
      className: 'hidden lg:table-cell font-medium',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    { 
      key: 'duracao_media' as const, 
      header: 'Duração', 
      className: 'hidden lg:table-cell',
      render: (value: number) => `${value} min`
    },
    { 
      key: 'status' as const, 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === "Ativo" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    }
  ];

  const mobileCardRender = (item: Honorario) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{item.procedimento}</h3>
          <p className="text-sm text-muted-foreground">{item.codigo}</p>
        </div>
        <Badge variant={item.status === "Ativo" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{item.categoria}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium text-primary">Part: R$ {item.valor_particular.toFixed(2)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Conv: R$ {item.valor_convenio.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{item.duracao_media} min</span>
        </div>
      </div>
    </div>
  );

  const renderActions = (item: Honorario) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEdit(item)}>
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => setDeleteId(item.id)}>
        <Trash2 className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Excluir</span>
      </Button>
    </div>
  );

  const totalProcedimentos = honorarios.length;
  const valorMedio = honorarios.length > 0 
    ? honorarios.reduce((acc, h) => acc + h.valor_particular, 0) / honorarios.length 
    : 0;
  const maiorValor = honorarios.length > 0 
    ? Math.max(...honorarios.map(h => h.valor_particular)) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tabela de Preços</h1>
            <p className="text-muted-foreground">Gerencie os valores dos procedimentos odontológicos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto" onClick={() => {
                setEditingHonorario(null);
                setFormData({
                  procedimento: "",
                  codigo: "",
                  categoria: "",
                  valor_particular: 0,
                  valor_convenio: 0,
                  duracao_media: 30,
                  status: "Ativo",
                  observacoes: "",
                });
              }}>
                <Plus className="w-4 h-4" />
                Novo Procedimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingHonorario ? "Editar Procedimento" : "Novo Procedimento"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="procedimento">Procedimento *</Label>
                    <Input
                      id="procedimento"
                      value={formData.procedimento}
                      onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Preventiva">Preventiva</SelectItem>
                      <SelectItem value="Restauradora">Restauradora</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                      <SelectItem value="Endodontia">Endodontia</SelectItem>
                      <SelectItem value="Periodontia">Periodontia</SelectItem>
                      <SelectItem value="Prótese">Prótese</SelectItem>
                      <SelectItem value="Estética">Estética</SelectItem>
                      <SelectItem value="Implante">Implante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_particular">Valor Particular (R$) *</Label>
                    <Input
                      id="valor_particular"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_particular}
                      onChange={(e) => setFormData({ ...formData, valor_particular: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_convenio">Valor Convênio (R$) *</Label>
                    <Input
                      id="valor_convenio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor_convenio}
                      onChange={(e) => setFormData({ ...formData, valor_convenio: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracao_media">Duração Média (min) *</Label>
                    <Input
                      id="duracao_media"
                      type="number"
                      min="0"
                      value={formData.duracao_media}
                      onChange={(e) => setFormData({ ...formData, duracao_media: parseInt(e.target.value) || 0 })}
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
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingHonorario ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Total Procedimentos</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold">{totalProcedimentos}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Valor Médio</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold">R$ {valorMedio.toFixed(0)}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Ativos</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold">
                  {honorarios.filter(h => h.status === "Ativo").length}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="ml-2 text-xs sm:text-sm font-medium truncate">Maior Valor</span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold">R$ {maiorValor.toFixed(0)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5" />
              Procedimentos e Valores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por procedimento, código ou categoria..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <MobileTable
              data={filteredHonorarios}
              columns={columns}
              mobileCardRender={mobileCardRender}
              actions={renderActions}
              loading={loading}
              emptyState={{
                icon: Calculator,
                title: searchTerm ? "Nenhum procedimento encontrado" : "Nenhum procedimento cadastrado",
                description: searchTerm 
                  ? "Não encontramos procedimentos com os termos pesquisados. Tente ajustar os filtros."
                  : "Você ainda não possui procedimentos cadastrados na tabela de preços. Adicione seu primeiro procedimento para começar.",
                actionLabel: searchTerm ? undefined : "Novo Procedimento",
                onAction: searchTerm ? undefined : () => setDialogOpen(true)
              }}
            />
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este procedimento? Esta ação não pode ser desfeita.
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

export default TabelaHonorarios;

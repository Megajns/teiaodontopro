import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Tag,
  Code
} from "lucide-react";
import { useManuaisCodigos, ManualCodigo } from "@/hooks/useManuaisCodigos";
import { ManualCodigoForm } from "@/components/utilitarios/ManualCodigoForm";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManuaisCodigos() {
  const { manuais, loading, createManual, updateManual, deleteManual } = useManuaisCodigos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<ManualCodigo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [busca, setBusca] = useState("");

  const handleSubmit = async (data: any) => {
    if (editingManual) {
      await updateManual(editingManual.id, data);
    } else {
      await createManual(data);
    }
    setDialogOpen(false);
    setEditingManual(null);
  };

  const handleEdit = (manual: ManualCodigo) => {
    setEditingManual(manual);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteManual(deleteId);
      setDeleteId(null);
    }
  };

  // Filtrar manuais
  const filteredManuais = useMemo(() => {
    return manuais.filter(manual => {
      const matchTipo = tipoFilter === "Todos" || manual.tipo === tipoFilter;
      const matchCategoria = categoriaFilter === "Todas" || manual.categoria === categoriaFilter;
      const matchBusca = !busca || 
        manual.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        manual.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
        manual.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
        manual.tags?.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));
      
      return matchTipo && matchCategoria && matchBusca;
    });
  }, [manuais, tipoFilter, categoriaFilter, busca]);

  const limparFiltros = () => {
    setTipoFilter("Todos");
    setCategoriaFilter("Todas");
    setBusca("");
  };

  // Tipos e Categorias únicos
  const tipos = useMemo(() => {
    const tipos = new Set(manuais.map(m => m.tipo));
    return ["Todos", ...Array.from(tipos)];
  }, [manuais]);

  const categorias = useMemo(() => {
    const cats = new Set(manuais.map(m => m.categoria));
    return ["Todas", ...Array.from(cats)];
  }, [manuais]);

  // Estatísticas
  const totalManuais = manuais.filter(m => m.tipo === "Manual").length;
  const totalCodigos = manuais.filter(m => m.tipo === "Código de Procedimento").length;
  const totalTabelas = manuais.filter(m => m.tipo === "Tabela").length;
  const totalDocs = manuais.filter(m => m.tipo === "Documento").length;

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "Manual": return <BookOpen className="w-4 h-4" />;
      case "Código de Procedimento": return <Code className="w-4 h-4" />;
      case "Tabela": return <FileText className="w-4 h-4" />;
      case "Documento": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Manual": return "default";
      case "Código de Procedimento": return "secondary";
      case "Tabela": return "outline";
      case "Documento": return "outline";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manuais e Códigos</h1>
            <p className="text-muted-foreground">Acesso rápido a documentação e códigos de procedimentos</p>
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
              className="gap-2 flex-1 sm:flex-initial"
              onClick={() => {
                setEditingManual(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Manuais</p>
                  <p className="text-2xl font-bold">{totalManuais}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Códigos</p>
                  <p className="text-2xl font-bold">{totalCodigos}</p>
                </div>
                <Code className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tabelas</p>
                  <p className="text-2xl font-bold">{totalTabelas}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documentos</p>
                  <p className="text-2xl font-bold">{totalDocs}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Título, código ou tag..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Manuais e Códigos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Manuais e Códigos</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredManuais.length} de {manuais.length} registro(s)
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredManuais.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {manuais.length > 0 ? "Ajuste os filtros para ver mais resultados" : "Comece adicionando manuais e códigos"}
                </p>
                {manuais.length > 0 && (
                  <Button variant="outline" onClick={limparFiltros}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredManuais.map((manual) => (
                      <TableRow key={manual.id}>
                        <TableCell>
                          <Badge variant={getTipoColor(manual.tipo)} className="gap-1">
                            {getTipoIcon(manual.tipo)}
                            {manual.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            {manual.titulo}
                            {manual.descricao && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {manual.descricao.substring(0, 60)}
                                {manual.descricao.length > 60 ? "..." : ""}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {manual.codigo ? (
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {manual.codigo}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{manual.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          {manual.tags && manual.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {manual.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {manual.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{manual.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {manual.link_externo && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(manual.link_externo!, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(manual)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeleteId(manual.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <ManualCodigoForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          manual={editingManual}
        />

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

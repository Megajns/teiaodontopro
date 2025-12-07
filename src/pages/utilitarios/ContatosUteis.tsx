import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Mail, MapPin, Clock, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useContatosUteis, ContatoUtil } from "@/hooks/useContatosUteis";
import { ContatoUtilForm } from "@/components/utilitarios/ContatoUtilForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ContatosUteis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContato, setSelectedContato] = useState<ContatoUtil | undefined>();
  const [deleteContatoId, setDeleteContatoId] = useState<string | null>(null);
  
  const { contatos, isLoading, createContato, updateContato, deleteContato } = useContatosUteis();

  const handleSubmit = (data: any) => {
    if (selectedContato) {
      updateContato({ id: selectedContato.id, ...data });
    } else {
      createContato(data);
    }
    setIsDialogOpen(false);
    setSelectedContato(undefined);
  };

  const handleEdit = (contato: ContatoUtil) => {
    setSelectedContato(contato);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteContato(id);
    setDeleteContatoId(null);
  };

  const handleAddNew = () => {
    setSelectedContato(undefined);
    setIsDialogOpen(true);
  };

  const filteredContatos = contatos.filter((contato) =>
    contato.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contato.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contato.telefone.includes(searchTerm)
  );

  const contatosPorCategoria = filteredContatos.reduce((acc, contato) => {
    if (!acc[contato.categoria]) {
      acc[contato.categoria] = [];
    }
    acc[contato.categoria].push(contato);
    return acc;
  }, {} as Record<string, ContatoUtil[]>);

  const totalContatos = contatos.length;
  const categorias = Object.keys(contatosPorCategoria);

  const getCategoriaStyle = (categoria: string) => {
    switch (categoria) {
      case "Emergência":
        return {
          cardClass: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
          titleClass: "text-red-700 dark:text-red-400",
          iconClass: "text-red-600 dark:text-red-500",
          badgeVariant: "destructive" as const
        };
      case "Especialista":
        return {
          cardClass: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
          titleClass: "text-blue-700 dark:text-blue-400",
          iconClass: "text-blue-600 dark:text-blue-500",
          badgeVariant: "default" as const
        };
      case "Fornecedor":
        return {
          cardClass: "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
          titleClass: "text-green-700 dark:text-green-400",
          iconClass: "text-green-600 dark:text-green-500",
          badgeVariant: "outline" as const
        };
      case "Serviço Público":
        return {
          cardClass: "border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20",
          titleClass: "text-purple-700 dark:text-purple-400",
          iconClass: "text-purple-600 dark:text-purple-500",
          badgeVariant: "secondary" as const
        };
      case "Laboratório":
        return {
          cardClass: "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20",
          titleClass: "text-orange-700 dark:text-orange-400",
          iconClass: "text-orange-600 dark:text-orange-500",
          badgeVariant: "outline" as const
        };
      default:
        return {
          cardClass: "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20",
          titleClass: "text-foreground",
          iconClass: "text-muted-foreground",
          badgeVariant: "outline" as const
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Contatos Úteis</h1>
            <p className="text-muted-foreground mt-2">
              Agenda de contatos importantes para a clínica
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Contato
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContatos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categorias.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contatos.filter(c => c.status === "Ativo").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredContatos.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar contatos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Contatos por Categoria */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Carregando contatos...</p>
            </CardContent>
          </Card>
        ) : filteredContatos.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                {searchTerm ? "Nenhum contato encontrado com os critérios de busca." : "Nenhum contato cadastrado. Clique em 'Adicionar Contato' para começar."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {categorias.map((categoria) => {
              const style = getCategoriaStyle(categoria);
              return (
                <Card key={categoria}>
                  <CardHeader>
                    <CardTitle className={style.titleClass}>{categoria}</CardTitle>
                    <CardDescription>
                      {contatosPorCategoria[categoria].length} contato(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contatosPorCategoria[categoria].map((contato) => (
                      <div key={contato.id} className={`flex items-start justify-between p-3 border rounded-lg ${style.cardClass}`}>
                        <div className="space-y-1 flex-1">
                          <div className="font-semibold">{contato.nome}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className={`h-4 w-4 ${style.iconClass}`} />
                            {contato.telefone}
                          </div>
                          {contato.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className={`h-4 w-4 ${style.iconClass}`} />
                              {contato.email}
                            </div>
                          )}
                          {contato.horario_funcionamento && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className={`h-4 w-4 ${style.iconClass}`} />
                              {contato.horario_funcionamento}
                            </div>
                          )}
                          {contato.endereco && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className={`h-4 w-4 ${style.iconClass}`} />
                              {contato.endereco}
                            </div>
                          )}
                          {contato.tipo && <Badge variant={style.badgeVariant}>{contato.tipo}</Badge>}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(contato)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteContatoId(contato.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog para criar/editar contato */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContato ? "Editar Contato" : "Novo Contato"}
            </DialogTitle>
          </DialogHeader>
          <ContatoUtilForm
            contato={selectedContato}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedContato(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteContatoId} onOpenChange={() => setDeleteContatoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteContatoId && handleDelete(deleteContatoId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Plus, Search, Edit, Trash2, Phone, Mail, Percent, Clock } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useConvenios, Convenio } from "@/hooks/useConvenios";
import { ConvenioForm } from "@/components/convenios/ConvenioForm";

export function Convenios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
  const { convenios, loading, createConvenio, updateConvenio, deleteConvenio } = useConvenios();

  const filteredConvenios = convenios.filter(convenio =>
    convenio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convenio.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (convenio?: Convenio) => {
    setEditingConvenio(convenio || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingConvenio(null);
  };

  const handleSubmitForm = async (data: any) => {
    if (editingConvenio) {
      return await updateConvenio(editingConvenio.id, data);
    } else {
      return await createConvenio(data);
    }
  };

  const handleDeleteConvenio = async (id: string) => {
    await deleteConvenio(id);
  };

  const columns = [
    { key: 'nome' as const, header: 'Nome', className: 'font-medium' },
    { key: 'tipo' as const, header: 'Tipo' },
    { 
      key: 'percentual_cobertura' as const, 
      header: 'Cobertura', 
      className: 'hidden sm:table-cell font-medium',
      render: (value: number | null) => value ? `${value}%` : '-'
    },
    { 
      key: 'valor_consulta' as const, 
      header: 'Valor Consulta', 
      className: 'hidden md:table-cell',
      render: (value: number | null) => value ? `R$ ${value.toFixed(2)}` : '-'
    },
    { 
      key: 'carencia_dias' as const, 
      header: 'Carência', 
      className: 'hidden lg:table-cell',
      render: (value: number) => `${value} dias`
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

  const mobileCardRender = (convenio: Convenio) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{convenio.nome}</h3>
          <p className="text-sm text-muted-foreground">{convenio.tipo}</p>
        </div>
        <Badge variant={convenio.status === "Ativo" ? "default" : "secondary"}>
          {convenio.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Percent className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">
              {convenio.percentual_cobertura ? `${convenio.percentual_cobertura}%` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{convenio.carencia_dias} dias</span>
          </div>
        </div>
        {convenio.valor_consulta && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Valor Consulta: R$ {convenio.valor_consulta.toFixed(2)}</span>
          </div>
        )}
        {convenio.codigo && (
          <div className="text-sm text-muted-foreground">
            <span>Código: {convenio.codigo}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderActions = (convenio: Convenio) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleOpenForm(convenio)}>
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
            <Trash2 className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Excluir</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir convênio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o convênio "{convenio.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteConvenio(convenio.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Convênios / Planos</h1>
            <p className="text-muted-foreground">Gerencie os convênios e planos odontológicos</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4" />
            Novo Convênio
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Lista de Convênios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por nome do convênio..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando convênios...</p>
                </div>
              </div>
            ) : filteredConvenios.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "Nenhum convênio encontrado" : "Nenhum convênio cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? "Tente ajustar os termos de busca para encontrar o convênio desejado." 
                    : "Comece adicionando o primeiro convênio da sua clínica."
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Convênio
                  </Button>
                )}
              </div>
            ) : (
              <MobileTable
                data={filteredConvenios}
                columns={columns}
                mobileCardRender={mobileCardRender}
                actions={renderActions}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <ConvenioForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        convenio={editingConvenio}
        title={editingConvenio ? "Editar Convênio" : "Novo Convênio"}
      />
    </DashboardLayout>
  );
}
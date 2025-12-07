import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Building, Plus, Search, Edit, Trash2, Phone, Mail, Calendar } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useFuncionarios, Funcionario } from "@/hooks/useFuncionarios";
import { FuncionarioForm } from "@/components/funcionarios/FuncionarioForm";
import { format } from "date-fns";

export function Funcionarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const { funcionarios, loading, createFuncionario, updateFuncionario, deleteFuncionario } = useFuncionarios();

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (funcionario?: Funcionario) => {
    setEditingFuncionario(funcionario || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFuncionario(null);
  };

  const handleSubmitForm = async (data: any) => {
    if (editingFuncionario) {
      return await updateFuncionario(editingFuncionario.id, data);
    } else {
      return await createFuncionario(data);
    }
  };

  const handleDeleteFuncionario = async (id: string) => {
    await deleteFuncionario(id);
  };

  const columns = [
    { key: 'nome' as const, header: 'Nome', className: 'font-medium' },
    { key: 'cargo' as const, header: 'Cargo' },
    { key: 'telefone' as const, header: 'Telefone', className: 'hidden sm:table-cell' },
    { key: 'email' as const, header: 'Email', className: 'hidden md:table-cell' },
    { 
      key: 'data_admissao' as const, 
      header: 'Admissão', 
      className: 'hidden lg:table-cell',
      render: (value: string) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
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

  const mobileCardRender = (funcionario: Funcionario) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{funcionario.nome}</h3>
          <p className="text-sm text-muted-foreground">{funcionario.cargo}</p>
        </div>
        <Badge variant={funcionario.status === "Ativo" ? "default" : "secondary"}>
          {funcionario.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{funcionario.telefone}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{funcionario.email}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Admissão: {funcionario.data_admissao ? format(new Date(funcionario.data_admissao), 'dd/MM/yyyy') : 'Não informada'}</span>
        </div>
      </div>
    </div>
  );

  const renderActions = (funcionario: Funcionario) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleOpenForm(funcionario)}>
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
            <AlertDialogTitle>Excluir funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário "{funcionario.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteFuncionario(funcionario.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground">Gerencie os funcionários da clínica</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4" />
            Novo Funcionário
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              Lista de Funcionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por nome ou cargo..." 
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
                  <p className="text-muted-foreground">Carregando funcionários...</p>
                </div>
              </div>
            ) : filteredFuncionarios.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? "Tente ajustar os termos de busca para encontrar o funcionário desejado." 
                    : "Comece adicionando o primeiro funcionário da sua clínica."
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Funcionário
                  </Button>
                )}
              </div>
            ) : (
              <MobileTable
                data={filteredFuncionarios}
                columns={columns}
                mobileCardRender={mobileCardRender}
                actions={renderActions}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <FuncionarioForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        funcionario={editingFuncionario}
        title={editingFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
      />
    </DashboardLayout>
  );
}
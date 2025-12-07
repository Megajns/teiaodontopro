import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserCheck, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useDentistas, Dentista } from "@/hooks/useDentistas";
import { DentistaForm } from "@/components/dentistas/DentistaForm";
import { useAuth } from "@/contexts/AuthContext";

export function Dentistas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDentista, setEditingDentista] = useState<Dentista | undefined>();
  const { user } = useAuth();
  const { dentistas, loading, createDentista, updateDentista, deleteDentista } = useDentistas();

  const filteredDentistas = dentistas.filter(dentista =>
    dentista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dentista.cro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDentista = async (data: any) => {
    const result = await createDentista(data);
    return !!result;
  };

  const handleUpdateDentista = async (data: any) => {
    if (!editingDentista) return false;
    const result = await updateDentista(editingDentista.id, data);
    setEditingDentista(undefined);
    return result;
  };

  const handleEdit = (dentista: Dentista) => {
    console.log('handleEdit called with:', dentista);
    setEditingDentista(dentista);
    console.log('editingDentista set, opening form');
    setFormOpen(true);
  };

  const handleDelete = async (dentista: Dentista) => {
    await deleteDentista(dentista.id);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  const columns = [
    { key: 'nome' as const, header: 'Nome', className: 'font-medium' },
    { key: 'cro' as const, header: 'CRO' },
    { key: 'especialidade' as const, header: 'Especialidade', className: 'hidden sm:table-cell' },
    { key: 'telefone' as const, header: 'Telefone', className: 'hidden md:table-cell' },
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

  const mobileCardRender = (dentista: Dentista) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-base">{dentista.nome}</h3>
          <p className="text-sm text-muted-foreground">{dentista.cro}</p>
        </div>
        <Badge variant={dentista.status === "Ativo" ? "default" : "secondary"}>
          {dentista.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <UserCheck className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{dentista.especialidade}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{dentista.telefone}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{dentista.email}</span>
        </div>
      </div>
    </div>
  );

  const renderActions = (dentista: Dentista) => (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2"
        onClick={() => handleEdit(dentista)}
      >
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
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o dentista <strong>{dentista.nome}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(dentista)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dentistas</h1>
            <p className="text-muted-foreground">Gerencie os dentistas da clínica</p>
          </div>
          <Button 
            className="gap-2 w-full sm:w-auto"
            onClick={() => {
              setEditingDentista(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Novo Dentista
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="w-5 h-5" />
              Lista de Dentistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por nome ou CRO..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Carregando dentistas...</span>
              </div>
            ) : filteredDentistas.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum dentista encontrado com os critérios de busca.' : 'Nenhum dentista cadastrado ainda.'}
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      setEditingDentista(undefined);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar primeiro dentista
                  </Button>
                )}
              </div>
            ) : (
              <MobileTable
                data={filteredDentistas}
                columns={columns}
                mobileCardRender={mobileCardRender}
                actions={renderActions}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <DentistaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={editingDentista ? handleUpdateDentista : handleCreateDentista}
        dentista={editingDentista}
        title={editingDentista ? 'Editar Dentista' : 'Novo Dentista'}
      />
    </DashboardLayout>
  );
}
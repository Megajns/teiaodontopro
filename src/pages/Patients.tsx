import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { FichaClinica } from "@/components/pacientes/FichaClinica";
import { Odontograma } from "@/components/pacientes/Odontograma";
import { Ortodontia } from "@/components/pacientes/Ortodontia";
import { Fotos } from "@/components/pacientes/Fotos";
import { Radiografias } from "@/components/pacientes/Radiografias";
import { Receituario } from "@/components/pacientes/Receituario";
import { usePacientes, Paciente } from "@/hooks/usePacientes";
import { useAuth } from "@/contexts/AuthContext";
import { MobileTable } from "@/components/ui/mobile-table";
import { 
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Camera,
  Zap,
  FileImage,
  Pill,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Patients() {
  const { user } = useAuth();
  const { pacientes, loading, createPaciente, updatePaciente, deletePaciente } = usePacientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Faça login para gerenciar os pacientes</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredPatients = pacientes.filter(patient => {
    const matchesSearch = patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.telefone.includes(searchTerm);
    
    const matchesStatus = selectedStatus === "all" || 
                         (patient.status === "Ativo" && selectedStatus === "active") ||
                         (patient.status === "Inativo" && selectedStatus === "inactive");
    
    return matchesSearch && matchesStatus;
  });

  const handleAddPaciente = () => {
    setEditingPaciente(null);
    setIsFormOpen(true);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingPaciente) {
      await updatePaciente(editingPaciente.id, data);
    } else {
      await createPaciente(data);
    }
  };

  const handleDeleteClick = (paciente: Paciente) => {
    setPacienteToDelete(paciente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (pacienteToDelete) {
      await deletePaciente(pacienteToDelete.id);
      setDeleteDialogOpen(false);
      setPacienteToDelete(null);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Definir colunas da tabela
  const columns = [
    { 
      key: 'nome' as keyof Paciente, 
      header: 'Nome',
      render: (value: any, paciente: Paciente) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{paciente.nome}</span>
        </div>
      )
    },
    { 
      key: 'email' as keyof Paciente, 
      header: 'Email',
      className: 'text-sm text-muted-foreground'
    },
    { 
      key: 'telefone' as keyof Paciente, 
      header: 'Telefone',
      className: 'text-sm text-muted-foreground'
    },
    { 
      key: 'data_nascimento' as keyof Paciente, 
      header: 'Idade',
      render: (value: any, paciente: Paciente) => (
        <span className="text-sm text-muted-foreground">
          {paciente.data_nascimento ? `${calculateAge(paciente.data_nascimento)} anos` : '-'}
        </span>
      )
    },
    { 
      key: 'ultima_consulta' as keyof Paciente, 
      header: 'Última Consulta',
      render: (value: any, paciente: Paciente) => (
        <span className="text-sm text-muted-foreground">
          {paciente.ultima_consulta ? new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR') : '-'}
        </span>
      )
    },
    { 
      key: 'status' as keyof Paciente, 
      header: 'Status',
      render: (value: any, paciente: Paciente) => (
        <Badge className={paciente.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {paciente.status}
        </Badge>
      )
    }
  ];

  // Renderização para mobile (card)
  const mobileCardRender = (paciente: Paciente) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{paciente.nome}</p>
            <Badge className={paciente.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {paciente.status}
            </Badge>
          </div>
        </div>
        {renderActions(paciente)}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{paciente.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{paciente.telefone}</span>
        </div>
        {paciente.data_nascimento && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{calculateAge(paciente.data_nascimento)} anos</span>
          </div>
        )}
        {paciente.ultima_consulta && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Última consulta: {new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Renderização das ações (dropdown menu)
  const renderActions = (paciente: Paciente) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEditPaciente(paciente)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Dados
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeleteClick(paciente)}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie os dados e histórico dos seus pacientes
            </p>
          </div>
          <Button variant="medical" className="w-full sm:w-auto" onClick={handleAddPaciente}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </div>

        {/* Tabs Interface */}
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="ficha" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Ficha Clínica</span>
            </TabsTrigger>
            <TabsTrigger value="odontograma" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Odontograma</span>
            </TabsTrigger>
            <TabsTrigger value="ortodontia" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Ortodontia</span>
            </TabsTrigger>
            <TabsTrigger value="fotos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Fotos</span>
            </TabsTrigger>
            <TabsTrigger value="radiografias" className="flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              <span className="hidden sm:inline">Radiografias</span>
            </TabsTrigger>
            <TabsTrigger value="receituario" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Receituário</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4 mt-6">
            {/* Search and Filters */}
            <Card className="medical-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedStatus === "all" ? "default" : "outline"}
                      onClick={() => setSelectedStatus("all")}
                      size="sm"
                    >
                      Todos
                    </Button>
                    <Button
                      variant={selectedStatus === "active" ? "default" : "outline"}
                      onClick={() => setSelectedStatus("active")}
                      size="sm"
                    >
                      Ativos
                    </Button>
                    <Button
                      variant={selectedStatus === "inactive" ? "default" : "outline"}
                      onClick={() => setSelectedStatus("inactive")}
                      size="sm"
                    >
                      Inativos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patients Table */}
            <Card className="medical-card">
              <CardContent className="p-0">
                <MobileTable
                  columns={columns}
                  data={filteredPatients}
                  mobileCardRender={mobileCardRender}
                  actions={renderActions}
                  loading={loading}
                  emptyState={{
                    icon: Users,
                    title: searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado",
                    description: searchTerm 
                      ? "Tente ajustar os filtros de busca para encontrar pacientes."
                      : "Comece adicionando o primeiro paciente ao sistema.",
                    actionLabel: searchTerm ? undefined : "Novo Paciente",
                    onAction: searchTerm ? undefined : handleAddPaciente
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ficha" className="mt-6">
            <FichaClinica />
          </TabsContent>

          <TabsContent value="odontograma" className="mt-6">
            <Odontograma />
          </TabsContent>

          <TabsContent value="ortodontia" className="mt-6">
            <Ortodontia />
          </TabsContent>

          <TabsContent value="fotos" className="mt-6">
            <Fotos />
          </TabsContent>

          <TabsContent value="radiografias" className="mt-6">
            <Radiografias />
          </TabsContent>

          <TabsContent value="receituario" className="mt-6">
            <Receituario />
          </TabsContent>
        </Tabs>

        <PacienteForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          paciente={editingPaciente}
          title={editingPaciente ? "Editar Paciente" : "Novo Paciente"}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o paciente "{pacienteToDelete?.nome}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
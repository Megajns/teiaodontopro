import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, CheckSquare, CreditCard, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useCheques, type Cheque as ChequeType } from "@/hooks/useCheques";
import { ChequeForm } from "@/components/financeiro/ChequeForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

export default function ControleCheques() {
  const { cheques, isLoading, createCheque, updateCheque, deleteCheque } = useCheques();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState<ChequeType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chequeToDelete, setChequeToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSubmit = async (data: any) => {
    if (selectedCheque) {
      await updateCheque({ id: selectedCheque.id, ...data });
    } else {
      await createCheque(data);
    }
    setSelectedCheque(null);
  };

  const handleEdit = (cheque: ChequeType) => {
    setSelectedCheque(cheque);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setChequeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (chequeToDelete) {
      await deleteCheque(chequeToDelete);
      setChequeToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Compensado":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "A Compensar":
        return <Clock className="w-4 h-4 text-warning" />;
      case "Devolvido":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "Cancelado":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compensado":
        return "status-active";
      case "A Compensar":
        return "status-pending";
      case "Devolvido":
        return "status-inactive";
      case "Cancelado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge className={`text-xs ${getStatusColor(status)}`}>
      <span className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </span>
    </Badge>
  );

  const filteredCheques = cheques.filter((cheque) => {
    const matchesSearch = 
      cheque.numero_cheque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.emitente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.banco.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cheque.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalACompensar = filteredCheques
    .filter(c => c.status === "A Compensar")
    .reduce((acc, cheque) => acc + Number(cheque.valor), 0);

  const totalCompensado = filteredCheques
    .filter(c => c.status === "Compensado")
    .reduce((acc, cheque) => acc + Number(cheque.valor), 0);

  const totalDevolvido = filteredCheques
    .filter(c => c.status === "Devolvido")
    .reduce((acc, cheque) => acc + Number(cheque.valor), 0);

  const columns = [
    { key: "numero_cheque", label: "Número", sortable: true },
    { key: "banco", label: "Banco", sortable: true },
    { key: "agencia_conta", label: "Ag/Conta", sortable: false },
    { key: "emitente", label: "Emitente", sortable: true },
    { key: "valor", label: "Valor", sortable: true },
    { key: "data_emissao", label: "Emissão", sortable: true },
    { key: "data_vencimento", label: "Vencimento", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  const mobileCardRender = (cheque: ChequeType) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">Cheque #{cheque.numero_cheque}</p>
          <p className="text-sm text-muted-foreground">{cheque.emitente}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">
            {Number(cheque.valor).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
          {getStatusBadge(cheque.status)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Banco:</span>
          <p>{cheque.banco}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Ag/Conta:</span>
          <p>{cheque.agencia}/{cheque.conta}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Emissão:</span>
          <p>{format(new Date(cheque.data_emissao), "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Vencimento:</span>
          <p>{format(new Date(cheque.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>
      </div>
    </div>
  );

  const actions = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (cheque: ChequeType) => handleEdit(cheque),
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: (cheque: ChequeType) => handleDelete(cheque.id),
      variant: "destructive" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Controle de Cheques</h1>
            <p className="text-muted-foreground">Gerencie os cheques recebidos na clínica</p>
          </div>
          <Button onClick={() => { setSelectedCheque(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cheque
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-4 w-4 text-orange-600" />
              <h3 className="text-sm font-medium text-muted-foreground">A Compensar</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {totalACompensar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Compensados</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalCompensado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Devolvidos</h3>
            <p className="text-2xl font-bold text-red-600">
              {totalDevolvido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por número, emitente ou banco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="A Compensar">A Compensar</SelectItem>
                <SelectItem value="Compensado">Compensado</SelectItem>
                <SelectItem value="Devolvido">Devolvido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <MobileTable
            data={filteredCheques}
            columns={columns}
            mobileCardRender={mobileCardRender}
            actions={actions}
            loading={isLoading}
            emptyState={{
              icon: CreditCard,
              title: searchTerm || statusFilter !== "all"
                ? "Nenhum cheque encontrado" 
                : "Nenhum cheque cadastrado",
              description: searchTerm || statusFilter !== "all"
                ? "Ajuste os filtros para ver mais resultados"
                : "Comece cadastrando um novo cheque recebido na clínica",
              action: searchTerm || statusFilter !== "all"
                ? {
                    label: "Limpar filtros",
                    onClick: () => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }
                  }
                : {
                    label: "Novo Cheque",
                    onClick: () => {
                      setSelectedCheque(null);
                      setFormOpen(true);
                    }
                  }
            }}
          />
        </div>
      </div>

      <ChequeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        cheque={selectedCheque}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cheque? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

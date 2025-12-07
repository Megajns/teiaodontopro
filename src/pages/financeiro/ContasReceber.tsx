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
import { Plus, Search, Edit, Trash2, DollarSign, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { useContasReceber, ContaReceber } from "@/hooks/useContasReceber";
import { ContaReceberForm } from "@/components/financeiro/ContaReceberForm";
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

export default function ContasReceber() {
  const { contasReceber, isLoading, createConta, updateConta, deleteConta } = useContasReceber();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSubmit = async (data: any) => {
    if (selectedConta) {
      await updateConta({ id: selectedConta.id, ...data });
    } else {
      await createConta(data);
    }
    setSelectedConta(null);
  };

  const handleEdit = (conta: ContaReceber) => {
    setSelectedConta(conta);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setContaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (contaToDelete) {
      await deleteConta(contaToDelete);
      setContaToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Recebida":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "Pendente":
        return <Clock className="w-4 h-4 text-warning" />;
      case "Vencida":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "Cancelada":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recebida":
        return "status-active";
      case "Pendente":
        return "status-pending";
      case "Vencida":
        return "status-inactive";
      case "Cancelada":
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

  const filteredContas = contasReceber.filter((conta) => {
    const matchesSearch = 
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || conta.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReceber = filteredContas
    .filter(c => c.status === "Pendente" || c.status === "Vencida")
    .reduce((acc, conta) => acc + Number(conta.valor), 0);

  const totalRecebido = filteredContas
    .filter(c => c.status === "Recebida")
    .reduce((acc, conta) => acc + Number(conta.valor), 0);

  // Definir colunas para MobileTable (corrigidas para a API atual)
  const columns = [
    {
      key: "descricao" as const,
      header: "Descrição",
      render: (_value: any, conta: ContaReceber) => (
        <div className="font-medium">{conta.descricao}</div>
      )
    },
    {
      key: "categoria" as const,
      header: "Categoria",
      render: (value: string) => <div>{value}</div>
    },
    {
      key: "valor" as const,
      header: "Valor",
      render: (value: number) => (
        <div className="font-semibold">
          {Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>
      )
    },
    {
      key: "data_vencimento" as const,
      header: "Vencimento",
      render: (value: string) => (
        <div>
          {value ? format(new Date(value), "dd/MM/yyyy", { locale: ptBR }) : "-"}
        </div>
      )
    },
    {
      key: "status" as const,
      header: "Status",
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: "data_recebimento" as const,
      header: "Recebimento",
      render: (value: string, conta: ContaReceber) => (
        <div>
          {value ? (
            <div className="text-sm">
              <div>{format(new Date(value), "dd/MM/yyyy", { locale: ptBR })}</div>
              {conta.forma_pagamento && (
                <div className="text-muted-foreground">{conta.forma_pagamento}</div>
              )}
            </div>
          ) : (
            "-"
          )}
        </div>
      )
    }
  ];

  // Renderização do card mobile
  const mobileCardRender = (conta: ContaReceber) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{conta.descricao}</h3>
          <p className="text-xs text-muted-foreground mt-1">{conta.categoria}</p>
        </div>
        {getStatusBadge(conta.status)}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Valor:</span>
          <div className="font-semibold mt-1">
            {Number(conta.valor).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Vencimento:</span>
          <div className="mt-1">
            {format(new Date(conta.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>
      
      {conta.data_recebimento && (
        <div className="text-xs">
          <span className="text-muted-foreground">Recebimento:</span>
          <div className="mt-1">
            {format(new Date(conta.data_recebimento), "dd/MM/yyyy", { locale: ptBR })}
            {conta.forma_pagamento && (
              <div className="text-muted-foreground">{conta.forma_pagamento}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Ações para cada conta
  const actions = (conta: ContaReceber) => [
    {
      label: "Editar",
      onClick: () => handleEdit(conta),
      icon: Edit
    },
    {
      label: "Excluir",
      onClick: () => handleDelete(conta.id),
      icon: Trash2,
      variant: "destructive" as const
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Contas a Receber</h1>
            <p className="text-muted-foreground">Gerencie os recebimentos da clínica</p>
          </div>
          <Button onClick={() => { setSelectedConta(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">A Receber</h3>
            <p className="text-2xl font-bold text-primary mt-2">
              {totalReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Recebido</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                placeholder="Buscar por descrição ou categoria..."
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
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Recebida">Recebida</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <MobileTable
            data={filteredContas}
            columns={columns}
            mobileCardRender={mobileCardRender}
            actions={actions}
            loading={isLoading}
            emptyState={{
              icon: DollarSign,
              title: searchTerm || statusFilter !== "all" 
                ? "Nenhuma conta encontrada" 
                : "Nenhuma conta cadastrada",
              description: searchTerm || statusFilter !== "all"
                ? "Ajuste os filtros para ver mais resultados"
                : "Comece cadastrando uma nova conta a receber",
              action: searchTerm || statusFilter !== "all"
                ? {
                    label: "Limpar filtros",
                    onClick: () => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }
                  }
                : {
                    label: "Nova Conta",
                    onClick: () => {
                      setSelectedConta(null);
                      setFormOpen(true);
                    }
                  }
            }}
          />
        </div>
      </div>

      <ContaReceberForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        conta={selectedConta}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta a receber? Esta ação não pode ser desfeita.
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

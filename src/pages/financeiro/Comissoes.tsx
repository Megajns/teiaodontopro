import { useState, useMemo } from "react";
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
import { MobileTable } from "@/components/ui/mobile-table";
import { Plus, Search, Edit, Trash2, Calculator, CheckCircle, XCircle, Clock } from "lucide-react";
import { useComissoes, type Comissao as ComissaoType } from "@/hooks/useComissoes";
import { useDentistas } from "@/hooks/useDentistas";
import { ComissaoForm } from "@/components/financeiro/ComissaoForm";
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

export default function Comissoes() {
  const { comissoes, isLoading, createComissao, updateComissao, deleteComissao } = useComissoes();
  const { dentistas } = useDentistas();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedComissao, setSelectedComissao] = useState<ComissaoType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comissaoToDelete, setComissaoToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dentistaFilter, setDentistaFilter] = useState<string>("all");

  const handleSubmit = async (data: any) => {
    if (selectedComissao) {
      await updateComissao({ id: selectedComissao.id, ...data });
    } else {
      await createComissao(data);
    }
    setSelectedComissao(null);
  };

  const handleEdit = (comissao: ComissaoType) => {
    setSelectedComissao(comissao);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setComissaoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (comissaoToDelete) {
      await deleteComissao(comissaoToDelete);
      setComissaoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paga":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "Pendente":
        return <Clock className="w-4 h-4 text-warning" />;
      case "Cancelada":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paga":
        return "status-active";
      case "Pendente":
        return "status-pending";
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

  const getDentistaName = (dentistaId: string) => {
    const dentista = dentistas.find(d => d.id === dentistaId);
    return dentista ? dentista.nome : "Dentista não encontrado";
  };

  const filteredComissoes = comissoes.filter((com) => {
    const dentistaName = getDentistaName(com.dentista_id);
    const matchesSearch = 
      com.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentistaName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || com.status === statusFilter;
    const matchesDentista = dentistaFilter === "all" || com.dentista_id === dentistaFilter;
    return matchesSearch && matchesStatus && matchesDentista;
  });

  const totalComissoesPendentes = filteredComissoes
    .filter(c => c.status === "Pendente")
    .reduce((acc, com) => acc + Number(com.valor_comissao), 0);

  const totalComissoesPagas = filteredComissoes
    .filter(c => c.status === "Paga")
    .reduce((acc, com) => acc + Number(com.valor_comissao), 0);

  // Resumo por dentista
  const resumoPorDentista = useMemo(() => {
    const resumo = new Map<string, { total: number; quantidade: number }>();
    
    comissoes.forEach(com => {
      if (com.status === "Paga") {
        const current = resumo.get(com.dentista_id) || { total: 0, quantidade: 0 };
        resumo.set(com.dentista_id, {
          total: current.total + Number(com.valor_comissao),
          quantidade: current.quantidade + 1
        });
      }
    });
    
    return Array.from(resumo.entries()).map(([dentistaId, dados]) => ({
      dentista: getDentistaName(dentistaId),
      total: dados.total,
      quantidade: dados.quantidade
    }));
  }, [comissoes, dentistas]);

  const columns = [
    { key: "dentista_id", label: "Dentista" },
    { key: "referencia", label: "Referência" },
    { key: "periodo", label: "Período" },
    { key: "valor_total_procedimentos", label: "Valor Procedimentos" },
    { key: "percentual_comissao", label: "% Comissão" },
    { key: "valor_comissao", label: "Valor Comissão" },
    { key: "status", label: "Status" },
  ];

  const mobileCardRender = (com: ComissaoType) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{getDentistaName(com.dentista_id)}</p>
          <p className="text-sm text-muted-foreground">{com.referencia}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">
            {Number(com.valor_comissao).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {Number(com.percentual_comissao).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(com.data_inicio), "dd/MM/yy", { locale: ptBR })} - {format(new Date(com.data_fim), "dd/MM/yy", { locale: ptBR })}
          </p>
          <p className="text-sm text-muted-foreground">
            Procedimentos: {Number(com.valor_total_procedimentos).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
        <div>
          {getStatusBadge(com.status)}
        </div>
      </div>
    </div>
  );

  const actions = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (com: ComissaoType) => handleEdit(com),
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: (com: ComissaoType) => handleDelete(com.id),
      variant: "destructive" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Comissão dos Dentistas</h1>
            <p className="text-muted-foreground">Gerencie as comissões dos profissionais</p>
          </div>
          <Button onClick={() => { setSelectedComissao(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Comissão
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Comissões Pendentes</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {totalComissoesPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Comissões Pagas</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalComissoesPagas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total de Registros</h3>
            <p className="text-2xl font-bold text-primary">
              {filteredComissoes.length}
            </p>
          </div>
        </div>

        {resumoPorDentista.length > 0 && (
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo por Dentista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resumoPorDentista.map((resumo, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">{resumo.dentista}</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {resumo.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resumo.quantidade} comissão{resumo.quantidade !== 1 ? 'ões' : ''} paga{resumo.quantidade !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por referência ou dentista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="dentista-filter">Dentista</Label>
            <Select value={dentistaFilter} onValueChange={setDentistaFilter}>
              <SelectTrigger id="dentista-filter">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {dentistas.map((dentista) => (
                  <SelectItem key={dentista.id} value={dentista.id}>
                    {dentista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="Paga">Paga</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <MobileTable
            data={filteredComissoes}
            columns={columns}
            mobileCardRender={mobileCardRender}
            actions={actions}
            loading={isLoading}
            emptyState={{
              icon: Calculator,
              title: searchTerm || statusFilter !== "all" || dentistaFilter !== "all"
                ? "Nenhuma comissão encontrada" 
                : "Nenhuma comissão cadastrada",
              description: searchTerm || statusFilter !== "all" || dentistaFilter !== "all"
                ? "Ajuste os filtros para ver mais resultados"
                : "Comece cadastrando uma nova comissão para os dentistas",
              action: searchTerm || statusFilter !== "all" || dentistaFilter !== "all"
                ? {
                    label: "Limpar filtros",
                    onClick: () => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDentistaFilter("all");
                    }
                  }
                : {
                    label: "Nova Comissão",
                    onClick: () => {
                      setSelectedComissao(null);
                      setFormOpen(true);
                    }
                  }
            }}
          />
        </div>
      </div>

      <ComissaoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        comissao={selectedComissao}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta comissão? Esta ação não pode ser desfeita.
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

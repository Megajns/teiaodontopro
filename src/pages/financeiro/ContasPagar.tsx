import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  CalendarIcon
} from "lucide-react";
import { useContasPagar } from "@/hooks/useContasPagar";
import { ContaPagarForm } from "@/components/financeiro/ContaPagarForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MobileTable } from "@/components/ui/mobile-table";

const statusOptions = ["Todos", "Pendente", "Vencida", "Paga", "Cancelada"];

export default function ContasPagar() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagarDialogOpen, setPagarDialogOpen] = useState(false);
  const [contaParaPagar, setContaParaPagar] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("");
  
  // Dados para pagamento
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [formaPagamento, setFormaPagamento] = useState("");
  
  const { contas, loading, createConta, updateConta, deleteConta, pagarConta } = useContasPagar();

  const handleSubmit = async (data: any) => {
    if (editingConta) {
      await updateConta((editingConta as any).id, data);
    } else {
      await createConta(data);
    }
    setDialogOpen(false);
    setEditingConta(null);
  };

  const handleEdit = (conta: any) => {
    setEditingConta(conta);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteConta(deleteId);
      setDeleteId(null);
    }
  };

  const handlePagar = (conta: any) => {
    navigate('/pagamentos/efetuar-pagamento');
  };

  const confirmarPagamento = async () => {
    if (contaParaPagar && formaPagamento) {
      await pagarConta(
        contaParaPagar.id, 
        format(dataPagamento, 'yyyy-MM-dd'),
        formaPagamento
      );
      setPagarDialogOpen(false);
      setContaParaPagar(null);
    }
  };

  // Filtrar contas
  const filteredContas = useMemo(() => {
    return contas.filter(conta => {
      const matchStatus = statusFilter === "Todos" || conta.status === statusFilter;
      const matchCategoria = categoriaFilter === "Todas" || conta.categoria === categoriaFilter;
      const matchFornecedor = !fornecedorFilter || 
        conta.fornecedores?.nome?.toLowerCase().includes(fornecedorFilter.toLowerCase()) ||
        conta.descricao.toLowerCase().includes(fornecedorFilter.toLowerCase());
      
      return matchStatus && matchCategoria && matchFornecedor;
    });
  }, [contas, statusFilter, categoriaFilter, fornecedorFilter]);

  const limparFiltros = () => {
    setStatusFilter("Todos");
    setCategoriaFilter("Todas");
    setFornecedorFilter("");
  };

  // Categorias únicas
  const categorias = useMemo(() => {
    const cats = new Set(contas.map(c => c.categoria));
    return ["Todas", ...Array.from(cats)];
  }, [contas]);

  // Estatísticas
  const totalPendente = useMemo(() => {
    return contas
      .filter(c => c.status === "Pendente" || c.status === "Vencida")
      .reduce((acc, c) => acc + Number(c.valor), 0);
  }, [contas]);

  const totalPago = useMemo(() => {
    return contas
      .filter(c => c.status === "Paga")
      .reduce((acc, c) => acc + Number(c.valor), 0);
  }, [contas]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paga":
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
      case "Paga":
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

  // Definir colunas para MobileTable (alinhadas ao componente)
  const columns = [
    {
      key: "descricao" as const,
      header: "Descrição",
      render: (_value: any, conta: any) => (
        <div className="font-medium">{conta.descricao}</div>
      )
    },
    {
      key: "fornecedores" as const,
      header: "Fornecedor",
      render: (value: any) => (
        <div>{value?.nome || "-"}</div>
      )
    },
    {
      key: "categoria" as const,
      header: "Categoria",
      render: (value: any) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: "valor" as const,
      header: "Valor",
      render: (value: any) => (
        <div className="text-right font-semibold">
          R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    {
      key: "data_vencimento" as const,
      header: "Vencimento",
      render: (value: any, conta: any) => (
        <div>
          <div className="text-sm">
            {value ? format(parseISO(value), "dd/MM/yyyy") : "-"}
          </div>
          {conta?.data_pagamento && (
            <div className="text-xs text-muted-foreground">
              Pago: {format(parseISO(conta.data_pagamento), "dd/MM/yyyy")}
            </div>
          )}
          {conta?.forma_pagamento && (
            <div className="text-xs text-muted-foreground">
              {conta.forma_pagamento}
            </div>
          )}
        </div>
      )
    },
    {
      key: "status" as const,
      header: "Status",
      render: (value: string) => (
        <Badge className={cn("text-xs", getStatusColor(value))}>
          <span className="flex items-center gap-1">
            {getStatusIcon(value)}
            {value}
          </span>
        </Badge>
      )
    }
  ];

  // Renderização do card mobile
  const mobileCardRender = (conta: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{conta.descricao}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {conta.fornecedores?.nome || "Sem fornecedor"}
          </p>
        </div>
        <Badge className={cn("text-xs ml-2", getStatusColor(conta.status))}>
          <span className="flex items-center gap-1">
            {getStatusIcon(conta.status)}
            {conta.status}
          </span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Categoria:</span>
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              {conta.categoria}
            </Badge>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Valor:</span>
          <div className="font-semibold mt-1">
            R$ {Number(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      
      <div className="text-xs">
        <span className="text-muted-foreground">Vencimento:</span>
        <div className="mt-1">
          {format(parseISO(conta.data_vencimento), "dd/MM/yyyy")}
          {conta.data_pagamento && (
            <div className="text-muted-foreground">
              Pago: {format(parseISO(conta.data_pagamento), "dd/MM/yyyy")}
            </div>
          )}
          {conta.forma_pagamento && (
            <div className="text-muted-foreground">
              {conta.forma_pagamento}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Ações para cada conta (como nós de React)
  const renderActions = (conta: any) => (
    <div className="flex items-center gap-2">
      {(conta.status === "Pendente" || conta.status === "Vencida") && (
        <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handlePagar(conta)}>
          <DollarSign className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Pagar</span>
        </Button>
      )}
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEdit(conta)}>
        <Edit className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
      </Button>
      <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => setDeleteId(conta.id)}>
        <Trash2 className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Excluir</span>
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground">
              Gerencie as despesas e pagamentos da clínica
            </p>
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
              variant="medical" 
              className="flex-1 sm:flex-initial"
              onClick={() => {
                setEditingConta(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <AlertCircle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {contas.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="medical-card">
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
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
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
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Fornecedor ou descrição..."
                      value={fornecedorFilter}
                      onChange={(e) => setFornecedorFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Contas */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Lista de Contas</CardTitle>
            <CardDescription>
              {filteredContas.length} de {contas.length} conta(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MobileTable
              data={filteredContas}
              columns={columns}
              mobileCardRender={mobileCardRender}
              actions={renderActions}
              loading={loading}
              emptyState={{
                icon: DollarSign,
                title: fornecedorFilter || statusFilter !== "Todos" || categoriaFilter !== "Todas" 
                  ? "Nenhuma conta encontrada" 
                  : "Nenhuma conta cadastrada",
                description: fornecedorFilter || statusFilter !== "Todos" || categoriaFilter !== "Todas"
                  ? "Ajuste os filtros para ver mais resultados"
                  : "Comece cadastrando uma nova conta a pagar",
                actionLabel: fornecedorFilter || statusFilter !== "Todos" || categoriaFilter !== "Todas" ? "Limpar filtros" : "Nova Conta",
                onAction: fornecedorFilter || statusFilter !== "Todos" || categoriaFilter !== "Todas"
                  ? limparFiltros
                  : () => {
                      setEditingConta(null);
                      setDialogOpen(true);
                    }
              }}
            />
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <ContaPagarForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          conta={editingConta}
        />

        {/* Dialog de Pagamento */}
        <Dialog open={pagarDialogOpen} onOpenChange={setPagarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogDescription>
                {contaParaPagar?.descricao} - R$ {Number(contaParaPagar?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data do Pagamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataPagamento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataPagamento ? format(dataPagamento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataPagamento}
                      onSelect={(date) => date && setDataPagamento(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setPagarDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={confirmarPagamento} disabled={!formaPagamento}>
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
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

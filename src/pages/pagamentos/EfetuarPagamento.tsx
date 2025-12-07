import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Search, AlertCircle, CheckCircle } from "lucide-react";
import { usePagamentos, ContaPagar } from "@/hooks/usePagamentos";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const formasPagamento = [
  "Dinheiro",
  "Cartão de Débito",
  "Cartão de Crédito",
  "PIX",
  "Transferência Bancária",
  "Boleto Bancário",
  "Cheque"
];

export function EfetuarPagamento() {
  const { contasPendentes, loading, efetuarPagamento } = usePagamentos();
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataPagamento, setDataPagamento] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [busca, setBusca] = useState("");
  const [processando, setProcessando] = useState(false);

  const getUrgenciaColor = (dataVencimento: string) => {
    const dias = differenceInDays(parseISO(dataVencimento), new Date());
    if (dias < 0) return "destructive"; // Vencida
    if (dias <= 5) return "secondary"; // Próxima de vencer
    return "outline"; // Normal
  };

  const getUrgenciaLabel = (dataVencimento: string) => {
    const dias = differenceInDays(parseISO(dataVencimento), new Date());
    if (dias < 0) return "Vencida";
    if (dias <= 5) return "Urgente";
    return "Normal";
  };

  const handleSelecionarConta = (conta: ContaPagar) => {
    setContaSelecionada(conta);
    setValorPago(conta.valor.toString());
  };

  const handleConfirmarPagamento = async () => {
    if (!contaSelecionada || !formaPagamento || !valorPago || !dataPagamento) {
      return;
    }
    
    setProcessando(true);
    const sucesso = await efetuarPagamento({
      conta_id: contaSelecionada.id,
      forma_pagamento: formaPagamento,
      data_pagamento: dataPagamento,
      valor_pago: Number(valorPago),
      observacoes: observacoes || undefined
    });

    if (sucesso) {
      // Resetar formulário
      setContaSelecionada(null);
      setFormaPagamento("");
      setValorPago("");
      setObservacoes("");
      setDataPagamento(format(new Date(), 'yyyy-MM-dd'));
    }
    setProcessando(false);
  };

  const contasFiltradas = contasPendentes.filter(conta => 
    conta.fornecedor_nome?.toLowerCase().includes(busca.toLowerCase()) ||
    conta.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Efetuar Pagamento</h1>
            <p className="text-muted-foreground">Realize pagamentos das contas a pagar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Lista de Contas Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Contas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Buscar fornecedor ou descrição..." 
                    className="pl-10"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : contasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conta pendente encontrada</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {contasFiltradas.map((conta) => (
                    <div 
                      key={conta.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        contaSelecionada?.id === conta.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => handleSelecionarConta(conta)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{conta.fornecedor_nome}</h4>
                          <p className="text-sm text-muted-foreground">{conta.descricao}</p>
                        </div>
                        <Badge variant={getUrgenciaColor(conta.data_vencimento)}>
                          {getUrgenciaLabel(conta.data_vencimento)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Venc: {format(parseISO(conta.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Dados do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!contaSelecionada ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conta para efetuar o pagamento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resumo da Conta Selecionada */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-1">{contaSelecionada.fornecedor_nome}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{contaSelecionada.descricao}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        R$ {contaSelecionada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <Badge variant="outline">{contaSelecionada.categoria}</Badge>
                    </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="space-y-2">
                    <Label htmlFor="forma-pagamento">Forma de Pagamento *</Label>
                    <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {formasPagamento.map((forma) => (
                          <SelectItem key={forma} value={forma}>
                            {forma}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Data do Pagamento */}
                  <div className="space-y-2">
                    <Label htmlFor="data-pagamento">Data do Pagamento *</Label>
                    <Input 
                      id="data-pagamento"
                      type="date" 
                      value={dataPagamento}
                      onChange={(e) => setDataPagamento(e.target.value)}
                    />
                  </div>

                  {/* Valor Pago */}
                  <div className="space-y-2">
                    <Label htmlFor="valor-pago">Valor Pago *</Label>
                    <Input 
                      id="valor-pago"
                      type="text" 
                      placeholder="0,00"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes"
                      placeholder="Informações adicionais sobre o pagamento..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setContaSelecionada(null)}
                      className="flex-1"
                      disabled={processando}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleConfirmarPagamento}
                      className="flex-1 gap-2"
                      disabled={processando || !formaPagamento || !valorPago || !dataPagamento}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processando ? 'Processando...' : 'Confirmar Pagamento'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendente</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {contasPendentes.reduce((sum, c) => sum + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contas Pendentes</p>
                  <p className="text-2xl font-bold">{contasPendentes.length}</p>
                </div>
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {contasPendentes.filter(c => differenceInDays(parseISO(c.data_vencimento), new Date()) < 0).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
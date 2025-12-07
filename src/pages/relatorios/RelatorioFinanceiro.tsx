import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileTable } from "@/components/ui/mobile-table";
import { DollarSign, Download, Calendar, TrendingUp, TrendingDown, ArrowUp, AlertCircle, Wallet } from "lucide-react";
import { useRelatorioFinanceiro } from "@/hooks/useRelatorioFinanceiro";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function RelatorioFinanceiro() {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(1)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showCalendarInicio, setShowCalendarInicio] = useState(false);
  const [showCalendarFim, setShowCalendarFim] = useState(false);
  
  const { dadosFinanceiros, loading } = useRelatorioFinanceiro(dataInicio, dataFim);

  const handleExportPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
      }

      const margemLucro = dadosFinanceiros.receitas_total > 0 
        ? ((dadosFinanceiros.saldo / dadosFinanceiros.receitas_total) * 100).toFixed(1) 
        : '0.0';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #666; padding-bottom: 10px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .summary-card .value { font-size: 24px; font-weight: bold; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            .neutral { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .section-title { margin-top: 30px; font-size: 18px; font-weight: bold; }
            .category-list { margin: 20px 0; }
            .category-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <p>Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Receitas Totais</h3>
              <div class="value positive">R$ ${dadosFinanceiros.receitas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Despesas Totais</h3>
              <div class="value negative">R$ ${dadosFinanceiros.despesas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Saldo</h3>
              <div class="value neutral">R$ ${dadosFinanceiros.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Margem</h3>
              <div class="value">${margemLucro}%</div>
            </div>
          </div>

          <h2 class="section-title">Pendências Financeiras</h2>
          <div class="summary">
            <div class="summary-card">
              <h3>Contas a Receber</h3>
              <div class="value">R$ ${dadosFinanceiros.contas_receber_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Contas a Pagar</h3>
              <div class="value">R$ ${dadosFinanceiros.contas_pagar_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Cheques a Compensar</h3>
              <div class="value">R$ ${dadosFinanceiros.cheques_compensar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <h2 class="section-title">Receitas por Categoria</h2>
          <div class="category-list">
            ${dadosFinanceiros.receitas_por_categoria.map(r => `
              <div class="category-item">
                <span>${r.categoria}</span>
                <span class="positive">R$ ${r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
          </div>

          <h2 class="section-title">Despesas por Categoria</h2>
          <div class="category-list">
            ${dadosFinanceiros.despesas_por_categoria.map(d => `
              <div class="category-item">
                <span>${d.categoria}</span>
                <span class="negative">R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
          </div>

          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Imprimir / Salvar como PDF
            </button>
            <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Fechar
            </button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      toast.success('Documento preparado para impressão/exportação!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const margemLucro = dadosFinanceiros.receitas_total > 0 
    ? ((dadosFinanceiros.saldo / dadosFinanceiros.receitas_total) * 100).toFixed(1) 
    : '0.0';

  const fluxoColumns = [
    { key: 'mes', header: 'Mês' },
    { 
      key: 'receitas', 
      header: 'Receitas',
      render: (item: any) => `R$ ${(item.receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
    { 
      key: 'despesas', 
      header: 'Despesas',
      render: (item: any) => `R$ ${(item.despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
  ];

  const renderFluxoMobileCard = (item: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{item.mes}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Receitas:</span>
          <span className="font-medium text-green-600">
            R$ {(item.receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Despesas:</span>
          <span className="font-medium text-red-600">
            R$ {(item.despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatório Financeiro</h1>
            <p className="text-muted-foreground">Análise completa da situação financeira da clínica</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover open={showCalendarInicio} onOpenChange={setShowCalendarInicio}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Início: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={(date) => {
                    if (date) {
                      setDataInicio(date);
                      setShowCalendarInicio(false);
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={showCalendarFim} onOpenChange={setShowCalendarFim}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4" />
                  Fim: {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={(date) => {
                    if (date) {
                      setDataFim(date);
                      setShowCalendarFim(false);
                    }
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button 
              className="gap-2 w-full sm:w-auto"
              onClick={handleExportPDF}
              disabled={loading}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Resumo do Período */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="ml-2 text-sm font-medium">Receitas</span>
                  </div>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {dadosFinanceiros.receitas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Período selecionado</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="ml-2 text-sm font-medium">Despesas</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-red-600">
                    R$ {dadosFinanceiros.despesas_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Período selecionado</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span className="ml-2 text-sm font-medium">Saldo</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`text-2xl font-bold ${dadosFinanceiros.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    R$ {dadosFinanceiros.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="ml-2 text-sm font-medium">Margem</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-purple-600">{margemLucro}%</div>
                  <p className="text-xs text-muted-foreground">Lucro/Receita</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pendências Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pendências Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Contas a Receber</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {dadosFinanceiros.contas_receber_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Contas a Pagar</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {dadosFinanceiros.contas_pagar_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Cheques a Compensar</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {dadosFinanceiros.cheques_compensar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receitas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Receitas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : dadosFinanceiros.receitas_por_categoria.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma receita encontrada no período
                </p>
              ) : (
                <div className="space-y-4">
                  {dadosFinanceiros.receitas_por_categoria.map((item, index) => {
                    const percentual = dadosFinanceiros.receitas_total > 0 
                      ? (item.valor / dadosFinanceiros.receitas_total) * 100 
                      : 0;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.categoria}</span>
                            <span className="text-sm text-muted-foreground">{percentual.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(percentual, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-sm font-medium text-green-600">
                            R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : dadosFinanceiros.despesas_por_categoria.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma despesa encontrada no período
                </p>
              ) : (
                <div className="space-y-4">
                  {dadosFinanceiros.despesas_por_categoria.map((item, index) => {
                    const percentual = dadosFinanceiros.despesas_total > 0 
                      ? (item.valor / dadosFinanceiros.despesas_total) * 100 
                      : 0;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.categoria}</span>
                            <span className="text-sm text-muted-foreground">{percentual.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(percentual, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-sm font-medium text-red-600">
                            R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

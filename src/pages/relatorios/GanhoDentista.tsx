import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, TrendingUp, DollarSign, Award, Activity } from "lucide-react";
import { MobileTable } from "@/components/ui/mobile-table";
import { Badge } from "@/components/ui/badge";
import { useGanhoDentista } from "@/hooks/useGanhoDentista";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const getPerformanceColor = (percentual: number) => {
  if (percentual >= 90) return "text-green-600";
  if (percentual >= 70) return "text-yellow-600";
  return "text-red-600";
};

const getCrescimentoColor = (crescimento: string) => {
  return crescimento.startsWith("+") ? "text-green-600" : "text-red-600";
};

export default function GanhoDentista() {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(1)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showCalendarInicio, setShowCalendarInicio] = useState(false);
  const [showCalendarFim, setShowCalendarFim] = useState(false);
  
  const { performanceDentistas, topProcedimentos, loading } = useGanhoDentista(dataInicio, dataFim);

  const handleExportPDF = () => {
    try {
      // Criar conteúdo HTML para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Ganho por Dentista</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #666; padding-bottom: 10px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .summary-card .value { font-size: 24px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .section-title { margin-top: 30px; font-size: 18px; font-weight: bold; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Ganho por Dentista</h1>
          <p>Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Faturamento Total</h3>
              <div class="value">R$ ${totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Comissão Total</h3>
              <div class="value">R$ ${totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>Melhor Performance</h3>
              <div class="value">${melhorPerformance.toFixed(1)}%</div>
            </div>
            <div class="summary-card">
              <h3>Total de Procedimentos</h3>
              <div class="value">${totalProcedimentos}</div>
            </div>
          </div>

          <h2 class="section-title">Performance por Dentista</h2>
          <table>
            <thead>
              <tr>
                <th>Dentista</th>
                <th>Procedimentos</th>
                <th>Faturamento</th>
                <th>Comissão</th>
                <th>Performance</th>
                <th>Crescimento</th>
              </tr>
            </thead>
            <tbody>
              ${performanceDentistas.map(d => `
                <tr>
                  <td>${d.dentista_nome}</td>
                  <td>${d.total_procedimentos}</td>
                  <td>R$ ${(d.faturamento_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ ${(d.total_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${(d.percentual_performance || 0).toFixed(1)}%</td>
                  <td>${d.crescimento}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2 class="section-title">Top Procedimentos por Dentista</h2>
          <table>
            <thead>
              <tr>
                <th>Dentista</th>
                <th>Procedimento</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              ${topProcedimentos.map(p => `
                <tr>
                  <td>${p.dentista_nome}</td>
                  <td>${p.procedimento}</td>
                  <td>${p.quantidade}</td>
                  <td>R$ ${(p.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

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

  // Cálculos de totais
  const totalFaturamento = performanceDentistas.reduce((sum, d) => sum + d.faturamento_total, 0);
  const totalComissao = performanceDentistas.reduce((sum, d) => sum + d.total_comissao, 0);
  const melhorPerformance = performanceDentistas.length > 0 
    ? Math.max(...performanceDentistas.map(d => d.percentual_performance)) 
    : 0;
  const totalProcedimentos = performanceDentistas.reduce((sum, d) => sum + d.total_procedimentos, 0);

  const dentistaColumns = [
    { key: "dentista_nome", header: "Dentista" },
    { key: "total_procedimentos", header: "Procedimentos" },
    { 
      key: "faturamento_total", 
      header: "Faturamento", 
      render: (item: any) => `R$ ${(item.faturamento_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
    { 
      key: "total_comissao", 
      header: "Comissão", 
      render: (item: any) => `R$ ${(item.total_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
    { 
      key: "percentual_performance", 
      header: "Performance", 
      render: (item: any) => (
        <span className={getPerformanceColor(item.percentual_performance || 0)}>
          {(item.percentual_performance || 0).toFixed(1)}%
        </span>
      )
    },
    { 
      key: "crescimento", 
      header: "Crescimento",
      render: (item: any) => (
        <span className={getCrescimentoColor(item.crescimento || '+0%')}>
          {item.crescimento || '+0%'}
        </span>
      )
    },
  ];

  const procedimentosColumns = [
    { key: "dentista_nome", header: "Dentista" },
    { key: "procedimento", header: "Procedimento" },
    { key: "quantidade", header: "Quantidade" },
    { 
      key: "valor_total", 
      header: "Valor Total", 
      render: (item: any) => `R$ ${(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
  ];

  const renderDentistaMobileCard = (item: any) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{item.dentista_nome}</span>
        <Badge variant="outline" className={getPerformanceColor(item.percentual_performance || 0)}>
          {(item.percentual_performance || 0).toFixed(1)}%
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground block">Procedimentos</span>
          <span className="font-medium text-foreground">{item.total_procedimentos || 0}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Crescimento</span>
          <span className={`font-medium ${getCrescimentoColor(item.crescimento || '+0%')}`}>
            {item.crescimento || '+0%'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Faturamento</span>
          <span className="font-medium text-foreground">R$ {(item.faturamento_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Comissão</span>
          <span className="font-medium text-foreground">R$ {(item.total_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );

  const renderProcedimentoMobileCard = (item: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{item.procedimento}</span>
        <Badge variant="secondary">{item.quantidade || 0}x</Badge>
      </div>
      
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dentista:</span>
          <span className="font-medium text-foreground">{item.dentista_nome}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Valor Total:</span>
          <span className="font-medium text-foreground">R$ {(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ganho por Dentista</h1>
            <p className="text-muted-foreground">Relatório de performance e faturamento dos dentistas</p>
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
              disabled={loading || performanceDentistas.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Período selecionado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pagas no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Performance</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{melhorPerformance.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Taxa de sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Procedimentos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProcedimentos}</div>
                <p className="text-xs text-muted-foreground">
                  Realizados no período
                </p>
              </CardContent>
            </Card>
          </div>
        )}




        {/* Tabela de Top Procedimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Procedimentos por Dentista</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : topProcedimentos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum procedimento encontrado para o período selecionado
              </p>
            ) : (
              <MobileTable
                data={topProcedimentos}
                columns={procedimentosColumns}
                mobileCardRender={renderProcedimentoMobileCard}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

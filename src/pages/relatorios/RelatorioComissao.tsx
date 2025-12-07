import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileTable } from "@/components/ui/mobile-table";
import { PieChart, Download, Calendar, UserCheck, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useRelatorioComissao } from "@/hooks/useRelatorioComissao";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function RelatorioComissao() {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(1)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showCalendarInicio, setShowCalendarInicio] = useState(false);
  const [showCalendarFim, setShowCalendarFim] = useState(false);
  
  const { comissoes, resumo, loading } = useRelatorioComissao(dataInicio, dataFim);

  const handleExportPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
      }

      const totalFaturamento = comissoes.reduce((sum, c) => sum + (c.valor_total_procedimentos || 0), 0);
      const percentualMedio = resumo.total_geral > 0 && totalFaturamento > 0
        ? ((resumo.total_geral / totalFaturamento) * 100).toFixed(1)
        : '0.0';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Comissões</title>
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
            .badge-paga { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .badge-pendente { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Comissões</h1>
          <p>Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} - ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}</p>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Pago</h3>
              <div class="value">R$ ${resumo.total_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p style="font-size: 12px; color: #10b981;">${resumo.quantidade_paga} comissões</p>
            </div>
            <div class="summary-card">
              <h3>Total Pendente</h3>
              <div class="value">R$ ${resumo.total_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p style="font-size: 12px; color: #f59e0b;">${resumo.quantidade_pendente} comissões</p>
            </div>
            <div class="summary-card">
              <h3>Total Geral</h3>
              <div class="value">R$ ${resumo.total_geral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3>% Médio</h3>
              <div class="value">${percentualMedio}%</div>
            </div>
          </div>

          <h2 class="section-title">Comissões Detalhadas</h2>
          <table>
            <thead>
              <tr>
                <th>Dentista</th>
                <th>Referência</th>
                <th>Período</th>
                <th>Faturamento</th>
                <th>% Comissão</th>
                <th>Valor Comissão</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${comissoes.map(c => `
                <tr>
                  <td>${c.dentista_nome}</td>
                  <td>${c.referencia}</td>
                  <td>${format(new Date(c.data_inicio), "dd/MM/yyyy")} - ${format(new Date(c.data_fim), "dd/MM/yyyy")}</td>
                  <td>R$ ${c.valor_total_procedimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${c.percentual_comissao}%</td>
                  <td>R$ ${c.valor_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td><span class="badge-${c.status.toLowerCase()}">${c.status}</span></td>
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

  const getStatusColor = (status: string) => {
    return status === "Paga" ? "default" : "secondary";
  };

  const totalFaturamento = comissoes.reduce((sum, c) => sum + (c.valor_total_procedimentos || 0), 0);
  const percentualMedio = resumo.total_geral > 0 && totalFaturamento > 0
    ? ((resumo.total_geral / totalFaturamento) * 100).toFixed(1)
    : '0.0';

  const comissaoColumns = [
    { key: 'dentista_nome', header: 'Dentista' },
    { key: 'referencia', header: 'Referência' },
    { 
      key: 'valor_total_procedimentos', 
      header: 'Faturamento',
      render: (value: number) => `R$ ${(Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
    { 
      key: 'percentual_comissao', 
      header: '% Comissão',
      render: (value: number) => `${Number(value) || 0}%` 
    },
    { 
      key: 'valor_comissao', 
      header: 'Valor',
      render: (value: number) => `R$ ${(Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
  ];

  const renderComissaoMobileCard = (item: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{item.dentista_nome}</h3>
          <p className="text-sm text-muted-foreground">{item.referencia}</p>
        </div>
        <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground block">Faturamento</span>
          <span className="font-medium">R$ {(item.valor_total_procedimentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">% Comissão</span>
          <span className="font-medium">{item.percentual_comissao}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Valor Comissão</span>
          <span className="font-medium text-primary">R$ {(item.valor_comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Período</span>
          <span className="font-medium text-sm">
            {format(new Date(item.data_inicio), "dd/MM", { locale: ptBR })} - {format(new Date(item.data_fim), "dd/MM", { locale: ptBR })}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatório de Comissões</h1>
            <p className="text-muted-foreground">Análise detalhada das comissões dos profissionais</p>
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
              disabled={loading || comissoes.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Resumo Geral */}
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
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="ml-2 text-sm font-medium">Total Pago</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {resumo.total_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">{resumo.quantidade_paga} comissões pagas</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="ml-2 text-sm font-medium">Total Pendente</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {resumo.total_pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">{resumo.quantidade_pendente} comissões pendentes</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="ml-2 text-sm font-medium">Total Geral</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-primary">
                    R$ {resumo.total_geral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Todas as comissões</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <PieChart className="h-4 w-4 text-purple-500" />
                  <span className="ml-2 text-sm font-medium">% Médio</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-purple-600">{percentualMedio}%</div>
                  <p className="text-xs text-muted-foreground">Média ponderada</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comissões Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Comissões Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : comissoes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma comissão encontrada no período selecionado
              </p>
            ) : (
              <MobileTable
                data={comissoes}
                columns={comissaoColumns}
                mobileCardRender={renderComissaoMobileCard}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

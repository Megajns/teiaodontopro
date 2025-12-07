import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Comissao } from "@/hooks/useComissoes";
import { useDentistas } from "@/hooks/useDentistas";

interface ComissaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  comissao?: Comissao | null;
}

const formasPagamento = [
  "Dinheiro",
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Boleto",
  "Transferência"
];

export function ComissaoForm({ open, onOpenChange, onSubmit, comissao }: ComissaoFormProps) {
  const { dentistas } = useDentistas();

  const [formData, setFormData] = useState({
    dentista_id: "",
    referencia: "",
    valor_total_procedimentos: 0,
    percentual_comissao: 0,
    valor_comissao: 0,
    data_inicio: new Date(),
    data_fim: new Date(),
    status: "Pendente" as "Pendente" | "Paga" | "Cancelada",
    data_pagamento: undefined as Date | undefined,
    forma_pagamento: "",
    observacoes: "",
  });

  useEffect(() => {
    if (comissao) {
      setFormData({
        dentista_id: comissao.dentista_id,
        referencia: comissao.referencia,
        valor_total_procedimentos: comissao.valor_total_procedimentos,
        percentual_comissao: comissao.percentual_comissao,
        valor_comissao: comissao.valor_comissao,
        data_inicio: new Date(comissao.data_inicio),
        data_fim: new Date(comissao.data_fim),
        status: comissao.status,
        data_pagamento: comissao.data_pagamento ? new Date(comissao.data_pagamento) : undefined,
        forma_pagamento: comissao.forma_pagamento || "",
        observacoes: comissao.observacoes || "",
      });
    } else {
      setFormData({
        dentista_id: "",
        referencia: "",
        valor_total_procedimentos: 0,
        percentual_comissao: 0,
        valor_comissao: 0,
        data_inicio: new Date(),
        data_fim: new Date(),
        status: "Pendente",
        data_pagamento: undefined,
        forma_pagamento: "",
        observacoes: "",
      });
    }
  }, [comissao]);

  // Calcular valor da comissão automaticamente
  useEffect(() => {
    const valorComissao = (formData.valor_total_procedimentos * formData.percentual_comissao) / 100;
    setFormData(prev => ({ ...prev, valor_comissao: valorComissao }));
  }, [formData.valor_total_procedimentos, formData.percentual_comissao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      data_inicio: format(formData.data_inicio, 'yyyy-MM-dd'),
      data_fim: format(formData.data_fim, 'yyyy-MM-dd'),
      data_pagamento: formData.data_pagamento ? format(formData.data_pagamento, 'yyyy-MM-dd') : undefined,
      forma_pagamento: formData.forma_pagamento || undefined,
      observacoes: formData.observacoes || undefined,
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {comissao ? "Editar Comissão" : "Nova Comissão"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="dentista_id">Dentista *</Label>
              <Select value={formData.dentista_id} onValueChange={(value) => setFormData({ ...formData, dentista_id: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((dentista) => (
                    <SelectItem key={dentista.id} value={dentista.id}>
                      {dentista.nome} - {dentista.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="referencia">Referência *</Label>
              <Input
                id="referencia"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                placeholder="Ex: Janeiro/2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Período - Data Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_inicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_inicio ? format(formData.data_inicio, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_inicio}
                    onSelect={(date) => date && setFormData({ ...formData, data_inicio: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Período - Data Fim *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_fim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_fim ? format(formData.data_fim, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_fim}
                    onSelect={(date) => date && setFormData({ ...formData, data_fim: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_total_procedimentos">Valor Total Procedimentos (R$) *</Label>
              <Input
                id="valor_total_procedimentos"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_total_procedimentos}
                onChange={(e) => setFormData({ ...formData, valor_total_procedimentos: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual_comissao">Percentual Comissão (%) *</Label>
              <Input
                id="percentual_comissao"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.percentual_comissao}
                onChange={(e) => setFormData({ ...formData, percentual_comissao: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="valor_comissao">Valor da Comissão (R$)</Label>
              <Input
                id="valor_comissao"
                type="number"
                step="0.01"
                value={formData.valor_comissao}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Calculado automaticamente: {formData.valor_total_procedimentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {formData.percentual_comissao}%
              </p>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Paga">Paga</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === "Paga" || formData.data_pagamento) && (
              <>
                <div className="space-y-2">
                  <Label>Data de Pagamento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.data_pagamento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.data_pagamento ? format(formData.data_pagamento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_pagamento}
                        onSelect={(date) => setFormData({ ...formData, data_pagamento: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select value={formData.forma_pagamento} onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
              </>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {comissao ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { FluxoCaixa } from "@/hooks/useFluxoCaixa";

interface FluxoCaixaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  movimentacao?: FluxoCaixa | null;
}

const categoriasEntrada = [
  "Consulta",
  "Tratamento",
  "Ortodontia",
  "Implante",
  "Prótese",
  "Outros Recebimentos"
];

const categoriasSaida = [
  "Aluguel",
  "Água",
  "Luz",
  "Internet",
  "Telefone",
  "Material Odontológico",
  "Laboratório",
  "Salários",
  "Impostos",
  "Manutenção",
  "Limpeza",
  "Marketing",
  "Outras Despesas"
];

const formasPagamento = [
  "Dinheiro",
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Boleto",
  "Transferência"
];

export function FluxoCaixaForm({ open, onOpenChange, onSubmit, movimentacao }: FluxoCaixaFormProps) {
  const [formData, setFormData] = useState({
    tipo: "Entrada" as "Entrada" | "Saída",
    descricao: "",
    categoria: "",
    valor: 0,
    data_movimentacao: new Date(),
    forma_pagamento: "",
    observacoes: "",
  });

  useEffect(() => {
    if (movimentacao) {
      setFormData({
        tipo: movimentacao.tipo,
        descricao: movimentacao.descricao,
        categoria: movimentacao.categoria,
        valor: movimentacao.valor,
        data_movimentacao: new Date(movimentacao.data_movimentacao),
        forma_pagamento: movimentacao.forma_pagamento || "",
        observacoes: movimentacao.observacoes || "",
      });
    } else {
      setFormData({
        tipo: "Entrada",
        descricao: "",
        categoria: "",
        valor: 0,
        data_movimentacao: new Date(),
        forma_pagamento: "",
        observacoes: "",
      });
    }
  }, [movimentacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      data_movimentacao: format(formData.data_movimentacao, 'yyyy-MM-dd'),
      forma_pagamento: formData.forma_pagamento || undefined,
      observacoes: formData.observacoes || undefined,
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  const categorias = formData.tipo === "Entrada" ? categoriasEntrada : categoriasSaida;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {movimentacao ? "Editar Movimentação" : "Nova Movimentação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value: "Entrada" | "Saída") => setFormData({ ...formData, tipo: value, categoria: "" })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Recebimento de consulta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_movimentacao && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_movimentacao ? format(formData.data_movimentacao, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_movimentacao}
                    onSelect={(date) => date && setFormData({ ...formData, data_movimentacao: date })}
                    locale={ptBR}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 col-span-2">
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
              {movimentacao ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

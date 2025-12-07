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
import { Cheque } from "@/hooks/useCheques";

interface ChequeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  cheque?: Cheque | null;
}

export function ChequeForm({ open, onOpenChange, onSubmit, cheque }: ChequeFormProps) {
  const [formData, setFormData] = useState({
    numero_cheque: "",
    banco: "",
    agencia: "",
    conta: "",
    emitente: "",
    cpf_cnpj: "",
    valor: 0,
    data_emissao: new Date(),
    data_vencimento: new Date(),
    data_compensacao: undefined as Date | undefined,
    status: "A Compensar" as "A Compensar" | "Compensado" | "Devolvido" | "Cancelado",
    observacoes: "",
  });

  useEffect(() => {
    if (cheque) {
      setFormData({
        numero_cheque: cheque.numero_cheque,
        banco: cheque.banco,
        agencia: cheque.agencia,
        conta: cheque.conta,
        emitente: cheque.emitente,
        cpf_cnpj: cheque.cpf_cnpj || "",
        valor: cheque.valor,
        data_emissao: new Date(cheque.data_emissao),
        data_vencimento: new Date(cheque.data_vencimento),
        data_compensacao: cheque.data_compensacao ? new Date(cheque.data_compensacao) : undefined,
        status: cheque.status,
        observacoes: cheque.observacoes || "",
      });
    } else {
      setFormData({
        numero_cheque: "",
        banco: "",
        agencia: "",
        conta: "",
        emitente: "",
        cpf_cnpj: "",
        valor: 0,
        data_emissao: new Date(),
        data_vencimento: new Date(),
        data_compensacao: undefined,
        status: "A Compensar",
        observacoes: "",
      });
    }
  }, [cheque]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      cpf_cnpj: formData.cpf_cnpj || undefined,
      data_emissao: format(formData.data_emissao, 'yyyy-MM-dd'),
      data_vencimento: format(formData.data_vencimento, 'yyyy-MM-dd'),
      data_compensacao: formData.data_compensacao ? format(formData.data_compensacao, 'yyyy-MM-dd') : undefined,
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
            {cheque ? "Editar Cheque" : "Novo Cheque"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_cheque">Número do Cheque *</Label>
              <Input
                id="numero_cheque"
                value={formData.numero_cheque}
                onChange={(e) => setFormData({ ...formData, numero_cheque: e.target.value })}
                placeholder="Ex: 123456"
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
              <Label htmlFor="banco">Banco *</Label>
              <Input
                id="banco"
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                placeholder="Ex: Banco do Brasil"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencia">Agência *</Label>
              <Input
                id="agencia"
                value={formData.agencia}
                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                placeholder="Ex: 1234-5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta *</Label>
              <Input
                id="conta"
                value={formData.conta}
                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                placeholder="Ex: 12345-6"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emitente">Emitente *</Label>
              <Input
                id="emitente"
                value={formData.emitente}
                onChange={(e) => setFormData({ ...formData, emitente: e.target.value })}
                placeholder="Nome do emitente"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                placeholder="CPF ou CNPJ do emitente"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Emissão *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_emissao && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_emissao ? format(formData.data_emissao, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_emissao}
                    onSelect={(date) => date && setFormData({ ...formData, data_emissao: date })}
                    locale={ptBR}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_vencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_vencimento ? format(formData.data_vencimento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_vencimento}
                    onSelect={(date) => date && setFormData({ ...formData, data_vencimento: date })}
                    locale={ptBR}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Compensar">A Compensar</SelectItem>
                  <SelectItem value="Compensado">Compensado</SelectItem>
                  <SelectItem value="Devolvido">Devolvido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === "Compensado" || formData.data_compensacao) && (
              <div className="space-y-2">
                <Label>Data de Compensação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.data_compensacao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_compensacao ? format(formData.data_compensacao, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.data_compensacao}
                      onSelect={(date) => setFormData({ ...formData, data_compensacao: date })}
                      locale={ptBR}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
              {cheque ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateConvenioData, Convenio } from "@/hooks/useConvenios";

interface ConvenioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConvenioData) => Promise<boolean>;
  convenio?: Convenio | null;
  title: string;
}

export function ConvenioForm({ isOpen, onClose, onSubmit, convenio, title }: ConvenioFormProps) {
  const [formData, setFormData] = useState<CreateConvenioData>({
    nome: convenio?.nome || "",
    codigo: convenio?.codigo || "",
    tipo: convenio?.tipo || "",
    percentual_cobertura: convenio?.percentual_cobertura || undefined,
    valor_consulta: convenio?.valor_consulta || undefined,
    carencia_dias: convenio?.carencia_dias || 0,
    observacoes: convenio?.observacoes || "",
    status: convenio?.status || "Ativo",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza o formulário quando o convênio mudar
  useEffect(() => {
    if (convenio) {
      setFormData({
        nome: convenio.nome || "",
        codigo: convenio.codigo || "",
        tipo: convenio.tipo || "",
        percentual_cobertura: convenio.percentual_cobertura || undefined,
        valor_consulta: convenio.valor_consulta || undefined,
        carencia_dias: convenio.carencia_dias || 0,
        observacoes: convenio.observacoes || "",
        status: convenio.status || "Ativo",
      });
    } else {
      setFormData({
        nome: "",
        codigo: "",
        tipo: "",
        percentual_cobertura: undefined,
        valor_consulta: undefined,
        carencia_dias: 0,
        observacoes: "",
        status: "Ativo",
      });
    }
  }, [convenio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit(formData);
    
    setIsSubmitting(false);
    
    if (success) {
      onClose();
      setFormData({
        nome: "",
        codigo: "",
        tipo: "",
        percentual_cobertura: undefined,
        valor_consulta: undefined,
        carencia_dias: 0,
        observacoes: "",
        status: "Ativo",
      });
    }
  };

  const handleChange = (field: keyof CreateConvenioData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nome">Nome do Convênio *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleChange("codigo", e.target.value)}
                placeholder="Código interno"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plano de Saúde">Plano de Saúde</SelectItem>
                  <SelectItem value="Plano Odontológico">Plano Odontológico</SelectItem>
                  <SelectItem value="Convênio Empresarial">Convênio Empresarial</SelectItem>
                  <SelectItem value="Particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="percentual_cobertura">% Cobertura</Label>
              <Input
                id="percentual_cobertura"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentual_cobertura || ""}
                onChange={(e) => handleChange("percentual_cobertura", parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="valor_consulta">Valor Consulta (R$)</Label>
              <Input
                id="valor_consulta"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_consulta || ""}
                onChange={(e) => handleChange("valor_consulta", parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="carencia_dias">Carência (dias)</Label>
              <Input
                id="carencia_dias"
                type="number"
                min="0"
                value={formData.carencia_dias}
                onChange={(e) => handleChange("carencia_dias", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Informações adicionais sobre o convênio"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateFuncionarioData, Funcionario } from "@/hooks/useFuncionarios";

interface FuncionarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFuncionarioData) => Promise<boolean>;
  funcionario?: Funcionario | null;
  title: string;
}

export function FuncionarioForm({ isOpen, onClose, onSubmit, funcionario, title }: FuncionarioFormProps) {
  const [formData, setFormData] = useState<CreateFuncionarioData>({
    nome: funcionario?.nome || "",
    cargo: funcionario?.cargo || "",
    telefone: funcionario?.telefone || "",
    email: funcionario?.email || "",
    data_admissao: funcionario?.data_admissao || "",
    status: funcionario?.status || "Ativo",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza o formulário quando o funcionário mudar
  useEffect(() => {
    if (funcionario) {
      setFormData({
        nome: funcionario.nome || "",
        cargo: funcionario.cargo || "",
        telefone: funcionario.telefone || "",
        email: funcionario.email || "",
        data_admissao: funcionario.data_admissao || "",
        status: funcionario.status || "Ativo",
      });
    } else {
      setFormData({
        nome: "",
        cargo: "",
        telefone: "",
        email: "",
        data_admissao: "",
        status: "Ativo",
      });
    }
  }, [funcionario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit(formData);
    
    setIsSubmitting(false);
    
    if (success) {
      onClose();
      setFormData({
        nome: "",
        cargo: "",
        telefone: "",
        email: "",
        data_admissao: "",
        status: "Ativo",
      });
    }
  };

  const handleChange = (field: keyof CreateFuncionarioData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleChange("cargo", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="data_admissao">Data de Admissão</Label>
              <Input
                id="data_admissao"
                type="date"
                value={formData.data_admissao}
                onChange={(e) => handleChange("data_admissao", e.target.value)}
              />
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
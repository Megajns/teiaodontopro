import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateFornecedorData, Fornecedor } from "@/hooks/useFornecedores";

interface FornecedorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFornecedorData) => Promise<boolean>;
  fornecedor?: Fornecedor | null;
  title: string;
}

export function FornecedorForm({ isOpen, onClose, onSubmit, fornecedor, title }: FornecedorFormProps) {
  const [formData, setFormData] = useState<CreateFornecedorData>({
    nome: fornecedor?.nome || "",
    cnpj: fornecedor?.cnpj || "",
    contato: fornecedor?.contato || "",
    telefone: fornecedor?.telefone || "",
    email: fornecedor?.email || "",
    endereco: fornecedor?.endereco || "",
    categoria: fornecedor?.categoria || "",
    status: fornecedor?.status || "Ativo",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza o formulário quando o fornecedor mudar
  useEffect(() => {
    if (fornecedor) {
      setFormData({
        nome: fornecedor.nome || "",
        cnpj: fornecedor.cnpj || "",
        contato: fornecedor.contato || "",
        telefone: fornecedor.telefone || "",
        email: fornecedor.email || "",
        endereco: fornecedor.endereco || "",
        categoria: fornecedor.categoria || "",
        status: fornecedor.status || "Ativo",
      });
    } else {
      setFormData({
        nome: "",
        cnpj: "",
        contato: "",
        telefone: "",
        email: "",
        endereco: "",
        categoria: "",
        status: "Ativo",
      });
    }
  }, [fornecedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit(formData);
    
    setIsSubmitting(false);
    
    if (success) {
      onClose();
      setFormData({
        nome: "",
        cnpj: "",
        contato: "",
        telefone: "",
        email: "",
        endereco: "",
        categoria: "",
        status: "Ativo",
      });
    }
  };

  const handleChange = (field: keyof CreateFornecedorData, value: string) => {
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
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contato">Pessoa de Contato *</Label>
              <Input
                id="contato"
                value={formData.contato}
                onChange={(e) => handleChange("contato", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Materiais">Materiais Odontológicos</SelectItem>
                  <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="Laboratório">Laboratório</SelectItem>
                  <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                  <SelectItem value="Limpeza">Produtos de Limpeza</SelectItem>
                  <SelectItem value="Escritório">Material de Escritório</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Endereço completo do fornecedor"
              rows={3}
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
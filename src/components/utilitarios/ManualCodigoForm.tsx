import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManualCodigo } from "@/hooks/useManuaisCodigos";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ManualCodigoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  manual?: ManualCodigo | null;
}

const tiposOptions = ["Manual", "Código de Procedimento", "Tabela", "Documento"];
const categoriasOptions = ["TUSS", "AMB", "SUS", "Próprio", "Geral", "Protocolos", "Legislação"];

export function ManualCodigoForm({ open, onOpenChange, onSubmit, manual }: ManualCodigoFormProps) {
  const [formData, setFormData] = useState({
    tipo: "Manual",
    titulo: "",
    codigo: "",
    descricao: "",
    categoria: "Geral",
    conteudo: "",
    link_externo: "",
    tags: [] as string[]
  });

  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    if (manual) {
      setFormData({
        tipo: manual.tipo,
        titulo: manual.titulo,
        codigo: manual.codigo || "",
        descricao: manual.descricao || "",
        categoria: manual.categoria,
        conteudo: manual.conteudo || "",
        link_externo: manual.link_externo || "",
        tags: manual.tags || []
      });
    } else {
      setFormData({
        tipo: "Manual",
        titulo: "",
        codigo: "",
        descricao: "",
        categoria: "Geral",
        conteudo: "",
        link_externo: "",
        tags: []
      });
    }
  }, [manual, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{manual ? "Editar" : "Novo"} Manual/Código</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposOptions.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasOptions.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              placeholder="Ex: Tabela TUSS - Procedimentos Odontológicos"
            />
          </div>

          {formData.tipo === "Código de Procedimento" && (
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: 81000030"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Breve descrição do manual ou código..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo/Instruções</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              placeholder="Instruções detalhadas, protocolo, ou conteúdo do manual..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_externo">Link Externo</Label>
            <Input
              id="link_externo"
              type="url"
              value={formData.link_externo}
              onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Adicione uma tag..."
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Adicionar
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {manual ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContatoUtil } from "@/hooks/useContatosUteis";

interface ContatoUtilFormProps {
  contato?: ContatoUtil;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const categorias = [
  "Emergência",
  "Especialista",
  "Fornecedor",
  "Serviço Público",
  "Laboratório",
  "Outros"
];

export function ContatoUtilForm({ contato, onSubmit, onCancel }: ContatoUtilFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      nome: contato?.nome || "",
      telefone: contato?.telefone || "",
      categoria: contato?.categoria || "",
      tipo: contato?.tipo || "",
      email: contato?.email || "",
      endereco: contato?.endereco || "",
      horario_funcionamento: contato?.horario_funcionamento || "",
      observacoes: contato?.observacoes || "",
      status: contato?.status || "Ativo",
    },
  });

  const categoria = watch("categoria");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome/Organização*</Label>
          <Input id="nome" {...register("nome", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone*</Label>
          <Input id="telefone" {...register("telefone", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria*</Label>
          <Select
            value={categoria}
            onValueChange={(value) => setValue("categoria", value)}
          >
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

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Input id="tipo" {...register("tipo")} placeholder="Ex: SAMU, Ortodontista, etc." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="horario_funcionamento">Horário de Funcionamento</Label>
          <Input id="horario_funcionamento" {...register("horario_funcionamento")} placeholder="Ex: 24h, Seg-Sex 8h-18h" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input id="endereco" {...register("endereco")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" {...register("observacoes")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={watch("status")}
          onValueChange={(value) => setValue("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{contato ? "Atualizar" : "Criar"}</Button>
      </div>
    </form>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Patrimonio } from "@/hooks/usePatrimonio";

const patrimonioSchema = z.object({
  item: z.string().min(1, "Item é obrigatório").max(200, "Item muito longo"),
  codigo: z.string().min(1, "Código é obrigatório").max(50, "Código muito longo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  valor: z.string().min(1, "Valor é obrigatório"),
  data_aquisicao: z.string().min(1, "Data de aquisição é obrigatória"),
  status: z.string().min(1, "Status é obrigatório"),
  observacoes: z.string().optional(),
});

type PatrimonioFormData = z.infer<typeof patrimonioSchema>;

interface PatrimonioFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  patrimonio?: Patrimonio | null;
}

export function PatrimonioForm({
  open,
  onClose,
  onSubmit,
  patrimonio,
}: PatrimonioFormProps) {
  const form = useForm<PatrimonioFormData>({
    resolver: zodResolver(patrimonioSchema),
    defaultValues: {
      item: "",
      codigo: "",
      categoria: "",
      valor: "",
      data_aquisicao: "",
      status: "Ativo",
      observacoes: "",
    },
  });

  // Reset form when patrimonio changes
  useEffect(() => {
    if (open) {
      form.reset({
        item: patrimonio?.item || "",
        codigo: patrimonio?.codigo || "",
        categoria: patrimonio?.categoria || "",
        valor: patrimonio?.valor?.toString() || "",
        data_aquisicao: patrimonio?.data_aquisicao || "",
        status: patrimonio?.status || "Ativo",
        observacoes: patrimonio?.observacoes || "",
      });
    }
  }, [open, patrimonio, form]);

  const handleSubmit = (data: PatrimonioFormData) => {
    onSubmit({
      ...data,
      valor: parseFloat(data.valor),
      ...(patrimonio?.id && { id: patrimonio.id }),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patrimonio ? "Editar Patrimônio" : "Novo Patrimônio"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cadeira Odontológica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PAT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Equipamento">Equipamento</SelectItem>
                        <SelectItem value="Móvel">Móvel</SelectItem>
                        <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                        <SelectItem value="Eletrônico">Eletrônico</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_aquisicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Aquisição *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {patrimonio ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

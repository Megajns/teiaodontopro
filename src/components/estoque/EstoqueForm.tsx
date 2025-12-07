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
import { type Estoque } from "@/hooks/useEstoque";

const estoqueSchema = z.object({
  item: z.string().min(1, "Item é obrigatório").max(200, "Nome muito longo"),
  codigo: z.string().min(1, "Código é obrigatório").max(50, "Código muito longo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  estoque: z.string().min(1, "Quantidade é obrigatória"),
  minimo: z.string().min(1, "Estoque mínimo é obrigatório"),
  maximo: z.string().min(1, "Estoque máximo é obrigatório"),
  valor_unitario: z.string().min(1, "Valor unitário é obrigatório"),
  observacoes: z.string().optional(),
});

type EstoqueFormData = z.infer<typeof estoqueSchema>;

interface EstoqueFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  estoque?: Estoque | null;
}

export function EstoqueForm({
  open,
  onClose,
  onSubmit,
  estoque,
}: EstoqueFormProps) {
  const form = useForm<EstoqueFormData>({
    resolver: zodResolver(estoqueSchema),
    defaultValues: {
      item: "",
      codigo: "",
      categoria: "",
      estoque: "",
      minimo: "",
      maximo: "",
      valor_unitario: "",
      observacoes: "",
    },
  });

  // Reset form when estoque changes
  useEffect(() => {
    if (open) {
      form.reset({
        item: estoque?.item || "",
        codigo: estoque?.codigo || "",
        categoria: estoque?.categoria || "",
        estoque: estoque?.estoque?.toString() || "",
        minimo: estoque?.minimo?.toString() || "",
        maximo: estoque?.maximo?.toString() || "",
        valor_unitario: estoque?.valor_unitario?.toString() || "",
        observacoes: estoque?.observacoes || "",
      });
    }
  }, [open, estoque, form]);

  const handleSubmit = (data: EstoqueFormData) => {
    onSubmit({
      ...data,
      estoque: parseInt(data.estoque),
      minimo: parseInt(data.minimo),
      maximo: parseInt(data.maximo),
      valor_unitario: parseFloat(data.valor_unitario),
      ...(estoque?.id && { id: estoque.id }),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {estoque ? "Editar Item" : "Novo Item"}
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
                    <Input placeholder="Nome do item" {...field} />
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
                      <Input placeholder="Ex: EST-001" {...field} />
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
                        <SelectItem value="Restaurador">Restaurador</SelectItem>
                        <SelectItem value="Anestésico">Anestésico</SelectItem>
                        <SelectItem value="EPI">EPI</SelectItem>
                        <SelectItem value="Descartável">Descartável</SelectItem>
                        <SelectItem value="Instrumental">Instrumental</SelectItem>
                        <SelectItem value="Biossegurança">Biossegurança</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estoque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Atual *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Máximo *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="valor_unitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Unitário (R$) *</FormLabel>
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
                {estoque ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

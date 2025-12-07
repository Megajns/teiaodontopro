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
import { type Laboratorio } from "@/hooks/useLaboratorio";

const laboratorioSchema = z.object({
  paciente: z.string().min(1, "Paciente é obrigatório").max(200, "Nome muito longo"),
  procedimento: z.string().min(1, "Procedimento é obrigatório").max(200, "Procedimento muito longo"),
  laboratorio: z.string().min(1, "Laboratório é obrigatório").max(200, "Nome muito longo"),
  data_envio: z.string().min(1, "Data de envio é obrigatória"),
  data_retorno: z.string().min(1, "Data de retorno é obrigatória"),
  status: z.string().min(1, "Status é obrigatório"),
  valor: z.string().min(1, "Valor é obrigatório"),
  observacoes: z.string().optional(),
});

type LaboratorioFormData = z.infer<typeof laboratorioSchema>;

interface LaboratorioFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  laboratorio?: Laboratorio | null;
}

export function LaboratorioForm({
  open,
  onClose,
  onSubmit,
  laboratorio,
}: LaboratorioFormProps) {
  const form = useForm<LaboratorioFormData>({
    resolver: zodResolver(laboratorioSchema),
    defaultValues: {
      paciente: "",
      procedimento: "",
      laboratorio: "",
      data_envio: "",
      data_retorno: "",
      status: "Enviado",
      valor: "",
      observacoes: "",
    },
  });

  // Reset form when laboratorio changes
  useEffect(() => {
    if (open) {
      form.reset({
        paciente: laboratorio?.paciente || "",
        procedimento: laboratorio?.procedimento || "",
        laboratorio: laboratorio?.laboratorio || "",
        data_envio: laboratorio?.data_envio || "",
        data_retorno: laboratorio?.data_retorno || "",
        status: laboratorio?.status || "Enviado",
        valor: laboratorio?.valor?.toString() || "",
        observacoes: laboratorio?.observacoes || "",
      });
    }
  }, [open, laboratorio, form]);

  const handleSubmit = (data: LaboratorioFormData) => {
    onSubmit({
      ...data,
      valor: parseFloat(data.valor),
      ...(laboratorio?.id && { id: laboratorio.id }),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {laboratorio ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paciente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="procedimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedimento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Prótese Total" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laboratorio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratório *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do laboratório" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_envio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Envio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_retorno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Retorno *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="Enviado">Enviado</SelectItem>
                        <SelectItem value="Em Produção">Em Produção</SelectItem>
                        <SelectItem value="Concluído">Concluído</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

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
                {laboratorio ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

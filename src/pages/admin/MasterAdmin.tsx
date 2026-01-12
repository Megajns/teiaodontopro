import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Edit, Trash2, CheckCircle2, XCircle, ShieldAlert, CreditCard, Users2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function MasterAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlanoDialogOpen, setIsPlanoDialogOpen] = useState(false);
  const [editingClinica, setEditingClinica] = useState<any>(null);
  const [editingPlano, setEditingPlano] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome_clinica: "",
    cnpj: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    cep: "",
    endereco: "",
    user_id: "",
    plano_id: "",
  });

  const [planoFormData, setPlanoFormData] = useState({
    nome: "",
    descricao: "",
    valor_mensal: 0,
    limite_pacientes: "",
    limite_usuarios: "",
    ativar_atendimento: false,
  });

  // Buscar configurações globais
  const { data: config, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["configuracoes-globais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_globais")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // Buscar todos os usuários (profiles) para vincular a novas clínicas
  const { data: profiles } = useQuery({
    queryKey: ["master-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, nome_exibicao")
        .order("email");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });

  // Buscar todas as clínicas
  const { data: clinicas, isLoading: isLoadingClinicas, error: clinicasError } = useQuery({
    queryKey: ["master-clinicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("informacoes_clinica")
        .select(`
          *,
          profiles (
            email,
            nome_exibicao
          ),
          planos (
            nome,
            valor_mensal
          )
        `)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Erro ao buscar clínicas:", error);
        throw error;
      }
      return data || [];
    },
    staleTime: 1000 * 60 * 1, // 1 minuto de cache
  });

  // Buscar planos
  const { data: planos } = useQuery({
    queryKey: ["master-planos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("valor_mensal", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  const clinicWithDetails = clinicas?.map(c => ({
    ...c,
    owner_email: c.profiles?.email || c.email || "Sem email"
  })) || [];

  // Filtrar usuários que ainda não têm clínica (para o select de nova clínica)
  const usersWithoutClinicas = profiles?.filter(p => !clinicas?.some(c => c.user_id === p.user_id)) || [];

  // Toggle cadastro público
  const togglePublicRegistration = useMutation({
    mutationFn: async (allow: boolean) => {
      const { error } = await supabase
        .from("configuracoes_globais")
        .update({ permitir_cadastro_publico: allow, updated_at: new Date().toISOString() })
        .eq("id", config?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes-globais"] });
      toast({ title: "Configuração atualizada", description: "O cadastro público foi alterado com sucesso." });
    },
  });

  // Mutation para Criar/Editar clínica
  const saveClinica = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        nome_clinica: data.nome_clinica,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        endereco: data.endereco,
        plano_id: data.plano_id || null,
        updated_at: new Date().toISOString()
      };

      if (editingClinica) {
        const { error } = await supabase
          .from("informacoes_clinica")
          .update(payload)
          .eq("id", editingClinica.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("informacoes_clinica")
          .insert([{
            ...payload,
            user_id: data.user_id,
            active: true
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-clinicas"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ 
        title: editingClinica ? "Clínica atualizada" : "Clínica cadastrada", 
        description: `A clínica foi ${editingClinica ? "atualizada" : "cadastrada"} com sucesso.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  });

  // Mutation para Criar/Editar plano
  const savePlano = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        nome: data.nome,
        descricao: data.descricao,
        valor_mensal: Number(data.valor_mensal),
        limite_pacientes: data.limite_pacientes === "" ? null : Number(data.limite_pacientes),
        limite_usuarios: data.limite_usuarios === "" ? null : Number(data.limite_usuarios),
        ativar_atendimento: data.ativar_atendimento,
        updated_at: new Date().toISOString()
      };

      if (editingPlano) {
        const { error } = await supabase
          .from("planos")
          .update(payload)
          .eq("id", editingPlano.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("planos")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-planos"] });
      setIsPlanoDialogOpen(false);
      resetPlanoForm();
      toast({ 
        title: editingPlano ? "Plano atualizado" : "Plano cadastrado", 
        description: `O plano foi ${editingPlano ? "atualizado" : "cadastrada"} com sucesso.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar plano", description: error.message, variant: "destructive" });
    }
  });

  // Mutation para Deletar clínica
  const deleteClinica = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("informacoes_clinica")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-clinicas"] });
      toast({ title: "Clínica removida", description: "A clínica foi excluída permanentemente." });
    },
  });

  // Mutation para Deletar plano
  const deletePlano = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("planos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-planos"] });
      toast({ title: "Plano removido", description: "O plano foi excluído permanentemente." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir", 
        description: "Não é possível excluir um plano que está sendo usado por alguma clínica.", 
        variant: "destructive" 
      });
    }
  });

  // Toggle status da clínica
  const toggleClinicaStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("informacoes_clinica")
        .update({ active: !active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-clinicas"] });
      toast({ title: "Status atualizado", description: "O status da clínica foi alterado com sucesso." });
    },
  });

  const resetForm = () => {
    setFormData({
      nome_clinica: "",
      cnpj: "",
      email: "",
      telefone: "",
      cidade: "",
      estado: "",
      cep: "",
      endereco: "",
      user_id: "",
      plano_id: "",
    });
    setEditingClinica(null);
  };

  const resetPlanoForm = () => {
    setPlanoFormData({
      nome: "",
      descricao: "",
      valor_mensal: 0,
      limite_pacientes: "",
      limite_usuarios: "",
      ativar_atendimento: false,
    });
    setEditingPlano(null);
  };

  const handleEdit = (clinica: any) => {
    setEditingClinica(clinica);
    setFormData({
      nome_clinica: clinica.nome_clinica,
      cnpj: clinica.cnpj || "",
      email: clinica.email,
      telefone: clinica.telefone,
      cidade: clinica.cidade,
      estado: clinica.estado,
      cep: clinica.cep,
      endereco: clinica.endereco,
      user_id: clinica.user_id,
      plano_id: clinica.plano_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleEditPlano = (plano: any) => {
    setEditingPlano(plano);
    setPlanoFormData({
      nome: plano.nome,
      descricao: plano.descricao || "",
      valor_mensal: plano.valor_mensal,
      limite_pacientes: plano.limite_pacientes?.toString() || "",
      limite_usuarios: plano.limite_usuarios?.toString() || "",
      ativar_atendimento: plano.ativar_atendimento || false,
    });
    setIsPlanoDialogOpen(true);
  };

  const filteredClinicas = clinicWithDetails?.filter(c => 
    (c.nome_clinica?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.owner_email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administração Master</h1>
            <p className="text-muted-foreground">Gerencie o sistema globalmente, planos e controle o acesso de empresas.</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isPlanoDialogOpen} onOpenChange={(open) => {
              setIsPlanoDialogOpen(open);
              if (!open) resetPlanoForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                  <CreditCard className="mr-2 h-4 w-4" /> Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingPlano ? "Editar Plano" : "Cadastrar Novo Plano"}</DialogTitle>
                  <DialogDescription>Defina os valores e limites deste plano.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome_plano">Nome do Plano</Label>
                    <Input id="nome_plano" value={planoFormData.nome} onChange={(e) => setPlanoFormData({...planoFormData, nome: e.target.value})} placeholder="Ex: Básico, Premium..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
                    <Input id="valor_mensal" type="number" step="0.01" value={planoFormData.valor_mensal} onChange={(e) => setPlanoFormData({...planoFormData, valor_mensal: Number(e.target.value)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="limite_pacientes">Limite de Pacientes</Label>
                      <Input id="limite_pacientes" type="number" value={planoFormData.limite_pacientes} onChange={(e) => setPlanoFormData({...planoFormData, limite_pacientes: e.target.value})} placeholder="Vazio para ilimitado" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="limite_usuarios">Limite de Usuários</Label>
                      <Input id="limite_usuarios" type="number" value={planoFormData.limite_usuarios} onChange={(e) => setPlanoFormData({...planoFormData, limite_usuarios: e.target.value})} placeholder="Vazio para ilimitado" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao_plano">Descrição</Label>
                    <Textarea id="descricao_plano" value={planoFormData.descricao} onChange={(e) => setPlanoFormData({...planoFormData, descricao: e.target.value})} />
                  </div>
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="ativar_atendimento">Módulo de Atendimento</Label>
                      <p className="text-sm text-muted-foreground italic">Ativa o chat, filas e tags tipo WhatsApp</p>
                    </div>
                    <Switch
                      id="ativar_atendimento"
                      checked={planoFormData.ativar_atendimento}
                      onCheckedChange={(checked) => setPlanoFormData({ ...planoFormData, ativar_atendimento: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPlanoDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => savePlano.mutate(planoFormData)} disabled={savePlano.isPending}>
                    {savePlano.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Plano"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="mr-2 h-4 w-4" /> Nova Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingClinica ? "Editar Clínica" : "Cadastrar Nova Clínica"}</DialogTitle>
                  <DialogDescription>
                    Preencha as informações abaixo para {editingClinica ? "atualizar a" : "cadastrar uma nova"} clínica no sistema.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                  {!editingClinica && (
                    <div className="grid gap-2">
                      <Label htmlFor="user_id">Usuário Proprietário</Label>
                      <Select 
                        value={formData.user_id} 
                        onValueChange={(val) => {
                          const user = profiles?.find(p => p.user_id === val);
                          setFormData({ ...formData, user_id: val, email: user?.email || "" });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {usersWithoutClinicas.length > 0 ? (
                            usersWithoutClinicas.map(u => (
                              <SelectItem key={u.user_id} value={u.user_id}>
                                {u.email} ({u.nome_exibicao || "S/N"})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">Nenhum usuário disponível</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="plano_id">Plano Selecionado</Label>
                    <Select 
                      value={formData.plano_id} 
                      onValueChange={(val) => setFormData({ ...formData, plano_id: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {planos?.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome} - R$ {p.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome_clinica">Nome da Clínica</Label>
                      <Input id="nome_clinica" value={formData.nome_clinica} onChange={(e) => setFormData({...formData, nome_clinica: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                      <Input id="cnpj" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email de Contato</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2 col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" value={formData.cep} onChange={(e) => setFormData({...formData, cep: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input id="cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estado">Estado (UF)</Label>
                      <Input id="estado" maxLength={2} value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700" 
                    onClick={() => saveClinica.mutate(formData)}
                    disabled={saveClinica.isPending || (!editingClinica && !formData.user_id)}
                  >
                    {saveClinica.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Empresa"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="clinicas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="clinicas">Empresas (Clínicas)</TabsTrigger>
            <TabsTrigger value="planos">Planos e Preços</TabsTrigger>
            <TabsTrigger value="config">Configurações Globais</TabsTrigger>
          </TabsList>

          <TabsContent value="clinicas" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Gestão de Empresas</CardTitle>
                    <CardDescription>Visualize e gerencie o acesso de todas as clínicas e seus planos.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar clínicas..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingClinicas ? (
                  <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div>
                ) : clinicasError ? (
                  <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
                    <p className="font-semibold">Erro ao carregar empresas</p>
                    <p className="text-sm">{(clinicasError as any).message || "Erro desconhecido de banco de dados."}</p>
                    <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["master-clinicas"] })}>Tentar Novamente</Button>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clínica</TableHead>
                          <TableHead>Proprietário</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClinicas?.map((clinica) => (
                          <TableRow key={clinica.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{clinica.nome_clinica}</span>
                                <span className="text-xs text-muted-foreground">{clinica.cnpj || "Sem CNPJ"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{clinica.profiles?.nome_exibicao || "N/A"}</span>
                                <span className="text-xs text-muted-foreground">{clinica.owner_email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {clinica.planos ? (
                                <div className="flex flex-col">
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 font-semibold">
                                    {clinica.planos.nome}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    R$ {clinica.planos.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-slate-400">Sem Plano</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {clinica.active ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ativa</Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Inativa</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEdit(clinica)}
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleClinicaStatus.mutate({ id: clinica.id, active: clinica.active })}
                                  className={`h-8 w-8 ${clinica.active ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                                  title={clinica.active ? "Desativar" : "Ativar"}
                                >
                                  {clinica.active ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir Clínica?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente os dados da clínica <strong>{clinica.nome_clinica}</strong>.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => deleteClinica.mutate(clinica.id)}
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredClinicas?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center p-8 text-muted-foreground">
                              Nenhuma clínica encontrada.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planos" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planos?.map(plano => (
                <Card key={plano.id} className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => handleEditPlano(plano)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Plano?</AlertDialogTitle>
                            <AlertDialogDescription>Deletar o plano <strong>{plano.nome}</strong>?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600" onClick={() => deletePlano.mutate(plano.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plano.nome}
                      <Badge variant="outline" className="ml-2">R$ {plano.valor_mensal}</Badge>
                    </CardTitle>
                    <CardDescription>{plano.descricao || "Sem descrição"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users2 className="h-4 w-4" />
                      <span>{plano.limite_usuarios ? `${plano.limite_usuarios} usuários` : "Usuários ilimitados"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Search className="h-4 w-4" />
                      <span>{plano.limite_pacientes ? `${plano.limite_pacientes} pacientes` : "Pacientes ilimitados"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {planos?.length === 0 && (
                <div className="col-span-full text-center p-12 border rounded-lg border-dashed">
                  Nenhum plano cadastrado.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Ajuste o comportamento global do OdontoPro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 dark:bg-slate-900/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold cursor-pointer" htmlFor="public-reg">
                        Permitir Cadastro Público de Empresas
                      </Label>
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mr-8">
                      Se desativado, o formulário de cadastro na tela de login será ocultado. Apenas o Administrador Master poderá cadastrar novas clínicas através deste painel.
                    </p>
                  </div>
                  <Switch
                    id="public-reg"
                    checked={config?.permitir_cadastro_publico}
                    onCheckedChange={(checked) => togglePublicRegistration.mutate(checked)}
                    disabled={isLoadingConfig}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-primary/5 border-primary/20 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total de Clínicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{clinicas?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-100 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-green-600 font-semibold">Clínicas Ativas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-700">{clinicas?.filter(c => c.active).length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-100 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase tracking-wider text-red-600 font-semibold">Clínicas Inativas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-700">{clinicas?.filter(c => !c.active).length || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

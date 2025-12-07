import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Plus, Trash2, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useInformacoesClinica } from "@/hooks/useInformacoesClinica";
import { useHorariosDisponiveis } from "@/hooks/useHorariosDisponiveis";
import { toast } from "@/hooks/use-toast";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const DIAS_SEMANA_MAP: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export function InformacoesClinica() {
  const { informacoes, isLoading, saveInformacoes, isSaving } = useInformacoesClinica();
  const { horarios, isLoading: isLoadingHorarios, createHorario, updateHorario, deleteHorario } = useHorariosDisponiveis();
  
  const [formData, setFormData] = useState({
    nome_clinica: "",
    cnpj: "",
    cro_clinica: "",
    telefone: "",
    celular: "",
    email: "",
    website: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    logo_base64: "",
    observacoes: "",
  });

  const [novoHorario, setNovoHorario] = useState({
    dia_semana: 1,
    hora: "",
    ativo: true,
  });

  useEffect(() => {
    if (informacoes) {
      setFormData({
        nome_clinica: informacoes.nome_clinica || "",
        cnpj: informacoes.cnpj || "",
        cro_clinica: informacoes.cro_clinica || "",
        telefone: informacoes.telefone || "",
        celular: informacoes.celular || "",
        email: informacoes.email || "",
        website: informacoes.website || "",
        endereco: informacoes.endereco || "",
        numero: informacoes.numero || "",
        complemento: informacoes.complemento || "",
        bairro: informacoes.bairro || "",
        cidade: informacoes.cidade || "",
        estado: informacoes.estado || "",
        cep: informacoes.cep || "",
        logo_base64: informacoes.logo_base64 || "",
        observacoes: informacoes.observacoes || "",
      });
    }
  }, [informacoes]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHorario = () => {
    if (!novoHorario.hora) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o horário",
        variant: "destructive",
      });
      return;
    }
    createHorario(novoHorario);
    setNovoHorario({ dia_semana: 1, hora: "", ativo: true });
  };

  const handleToggleHorario = (id: string, ativo: boolean) => {
    updateHorario({ id, ativo });
  };

  const horariosPorDia = horarios.reduce((acc, horario) => {
    if (!acc[horario.dia_semana]) {
      acc[horario.dia_semana] = [];
    }
    acc[horario.dia_semana].push(horario);
    return acc;
  }, {} as Record<number, typeof horarios>);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("logo_base64", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveInformacoes(formData);
  };

  if (isLoading || isLoadingHorarios) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Informações da Clínica
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure os dados principais da sua clínica odontológica
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
              <CardDescription>Informações principais da clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_clinica">Nome da Clínica*</Label>
                  <Input
                    id="nome_clinica"
                    value={formData.nome_clinica}
                    onChange={(e) => handleChange("nome_clinica", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cro_clinica">CRO da Clínica</Label>
                  <Input
                    id="cro_clinica"
                    value={formData.cro_clinica}
                    onChange={(e) => handleChange("cro_clinica", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone*</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    placeholder="(00) 0000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => handleChange("celular", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.suaclinica.com.br"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Localização da clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço*</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleChange("endereco", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleChange("numero", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => handleChange("complemento", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleChange("bairro", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP*</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade*</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado*</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleChange("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horários de Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Agendamento
              </CardTitle>
              <CardDescription>
                Defina os horários disponíveis para agendamento em cada dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Adicionar novo horário */}
              <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="dia_semana">Dia da Semana</Label>
                  <Select
                    value={novoHorario.dia_semana.toString()}
                    onValueChange={(value) => setNovoHorario({ ...novoHorario, dia_semana: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIAS_SEMANA_MAP).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="hora">Horário</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={novoHorario.hora}
                    onChange={(e) => setNovoHorario({ ...novoHorario, hora: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddHorario} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de horários por dia */}
              <div className="space-y-4">
                {Object.entries(DIAS_SEMANA_MAP).map(([diaNum, diaLabel]) => {
                  const horariosdia = horariosPorDia[parseInt(diaNum)] || [];
                  if (horariosdia.length === 0) return null;

                  return (
                    <div key={diaNum} className="space-y-2">
                      <h4 className="font-semibold text-sm">{diaLabel}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {horariosdia.map((horario) => (
                          <div
                            key={horario.id}
                            className="flex items-center justify-between p-2 border rounded-lg bg-background"
                          >
                            <span className="text-sm font-mono">{horario.hora}</span>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={horario.ativo}
                                onCheckedChange={(checked) => handleToggleHorario(horario.id, checked)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteHorario(horario.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {horarios.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum horário cadastrado. Adicione horários para permitir agendamentos.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Logo e Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Logo e Observações</CardTitle>
              <CardDescription>Adicione a logo da clínica e informações adicionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo da Clínica</Label>
                <div className="flex items-center gap-4">
                  {formData.logo_base64 && (
                    <img
                      src={formData.logo_base64}
                      alt="Logo"
                      className="h-20 w-20 object-contain border rounded"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  rows={4}
                  placeholder="Informações adicionais sobre a clínica..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Informações"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Target } from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useOrtodontia } from "@/hooks/useOrtodontia";
import { useState, useEffect } from "react";

export function Ortodontia() {
  const { pacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const { ortodontia, loading, createOrtodontia, updateOrtodontia } = useOrtodontia(selectedPacienteId);
  
  const [formData, setFormData] = useState({
    data_inicio: "",
    previsao_termino: "",
    tipo_aparelho: "",
    diagnostico: "",
    plano_tratamento: "",
    progresso: "",
    proxima_consulta: "",
    observacoes: "",
    status: "Em Andamento",
  });

  useEffect(() => {
    if (ortodontia) {
      setFormData({
        data_inicio: ortodontia.data_inicio || "",
        previsao_termino: ortodontia.previsao_termino || "",
        tipo_aparelho: ortodontia.tipo_aparelho || "",
        diagnostico: ortodontia.diagnostico || "",
        plano_tratamento: ortodontia.plano_tratamento || "",
        progresso: ortodontia.progresso || "",
        proxima_consulta: ortodontia.proxima_consulta || "",
        observacoes: ortodontia.observacoes || "",
        status: ortodontia.status || "Em Andamento",
      });
    } else {
      setFormData({
        data_inicio: "",
        previsao_termino: "",
        tipo_aparelho: "",
        diagnostico: "",
        plano_tratamento: "",
        progresso: "",
        proxima_consulta: "",
        observacoes: "",
        status: "Em Andamento",
      });
    }
  }, [ortodontia]);

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);

  const handleSave = async () => {
    if (!selectedPacienteId) return;

    try {
      if (ortodontia) {
        await updateOrtodontia(ortodontia.id, formData);
      } else {
        await createOrtodontia({ paciente_id: selectedPacienteId, ...formData });
      }
    } catch (error) {
      console.error("Erro ao salvar ortodontia:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <div className="space-y-6">
      {/* Seletor de Paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paciente">Paciente</Label>
            <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
              <SelectTrigger id="paciente">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((paciente) => (
                  <SelectItem key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPaciente && (
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <p className="text-sm"><strong>Email:</strong> {selectedPaciente.email}</p>
              <p className="text-sm"><strong>Telefone:</strong> {selectedPaciente.telefone}</p>
              {selectedPaciente.cpf && <p className="text-sm"><strong>CPF:</strong> {selectedPaciente.cpf}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPacienteId && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Ortodontia</h2>
              <p className="text-sm text-muted-foreground">
                Planejamento e acompanhamento do tratamento ortodôntico
              </p>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>

          {/* Status do Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Status do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Pausado">Pausado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="progresso">Progresso/Fase Atual</Label>
                  <Input 
                    id="progresso" 
                    value={formData.progresso}
                    onChange={(e) => handleChange("progresso", e.target.value)}
                    placeholder="Ex: Alinhamento inicial, 35% completo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datas e Aparelho */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datas e Aparelho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input 
                    id="data_inicio" 
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => handleChange("data_inicio", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="previsao_termino">Previsão de Término</Label>
                  <Input 
                    id="previsao_termino" 
                    type="date"
                    value={formData.previsao_termino}
                    onChange={(e) => handleChange("previsao_termino", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="proxima_consulta">Próxima Consulta</Label>
                  <Input 
                    id="proxima_consulta" 
                    type="date"
                    value={formData.proxima_consulta}
                    onChange={(e) => handleChange("proxima_consulta", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo_aparelho">Tipo de Aparelho</Label>
                  <Input 
                    id="tipo_aparelho" 
                    value={formData.tipo_aparelho}
                    onChange={(e) => handleChange("tipo_aparelho", e.target.value)}
                    placeholder="Fixo metálico, estético, alinhador..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Diagnóstico */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={formData.diagnostico}
                  onChange={(e) => handleChange("diagnostico", e.target.value)}
                  placeholder="Classificação de Angle, apinhamento, tipo de mordida, desvios..."
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Plano de Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plano de Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={formData.plano_tratamento}
                onChange={(e) => handleChange("plano_tratamento", e.target.value)}
                placeholder="Objetivos, extrações necessárias, controle de ancoragem, sequência de tratamento..."
                className="min-h-[150px]"
              />
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações e Evolução</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Registre aqui a evolução do tratamento, intercorrências, mudanças no plano..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
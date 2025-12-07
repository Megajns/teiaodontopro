import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RotateCcw } from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useOdontograma, DadosDente } from "@/hooks/useOdontograma";
import { useState, useEffect } from "react";

export function Odontograma() {
  const { pacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const { odontograma, loading, createOdontograma, updateOdontograma, refetch } = useOdontograma(selectedPacienteId);
  const [dadosDentes, setDadosDentes] = useState<Record<string, DadosDente>>({});
  const [observacoes, setObservacoes] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("");

  // Dentes (numeração universal)
  const dentesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const dentesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const ferramentas = [
    { nome: "Cárie", cor: "bg-red-500", hoverCor: "hover:bg-red-100" },
    { nome: "Restauração", cor: "bg-blue-500", hoverCor: "hover:bg-blue-100" },
    { nome: "Coroa", cor: "bg-gray-500", hoverCor: "hover:bg-gray-100" },
    { nome: "Obturação", cor: "bg-yellow-500", hoverCor: "hover:bg-yellow-100" },
    { nome: "Implante", cor: "bg-green-500", hoverCor: "hover:bg-green-100" },
    { nome: "Canal", cor: "bg-purple-500", hoverCor: "hover:bg-purple-100" },
    { nome: "Extraído", cor: "bg-black", hoverCor: "hover:bg-black/10" },
  ];

  useEffect(() => {
    if (odontograma) {
      setDadosDentes(odontograma.dados_dentes as Record<string, DadosDente>);
      setObservacoes(odontograma.observacoes || "");
    } else {
      setDadosDentes({});
      setObservacoes("");
    }
  }, [odontograma]);

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);

  const handleDenteClick = (numero: number) => {
    if (!selectedPacienteId) return;

    setDadosDentes((prev) => {
      const key = numero.toString();
      const denteAtual = prev[key] || { numero, procedimentos: [] };
      
      // Se não tem ferramenta selecionada, cicla pelas ferramentas automaticamente
      if (!selectedTool) {
        const procedimentoAtual = denteAtual.procedimentos[0];
        const indexAtual = ferramentas.findIndex((f) => f.nome === procedimentoAtual);
        
        // Se não tem procedimento ou é o último, volta para o primeiro
        if (indexAtual === -1 || indexAtual === ferramentas.length - 1) {
          return {
            ...prev,
            [key]: { numero, procedimentos: [ferramentas[0].nome] },
          };
        }
        
        // Vai para o próximo procedimento
        return {
          ...prev,
          [key]: { numero, procedimentos: [ferramentas[indexAtual + 1].nome] },
        };
      }
      
      // Se tem ferramenta selecionada, aplica ela
      if (denteAtual.procedimentos.includes(selectedTool)) {
        // Se já tem, remove
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      
      // Adiciona o procedimento
      return {
        ...prev,
        [key]: { numero, procedimentos: [selectedTool] },
      };
    });
  };

  const getDenteColor = (numero: number) => {
    const key = numero.toString();
    const dente = dadosDentes[key];
    if (!dente || dente.procedimentos.length === 0) return "bg-background";

    const ferramenta = ferramentas.find((f) => f.nome === dente.procedimentos[0]);
    return ferramenta?.cor || "bg-background";
  };

  const handleSave = async () => {
    if (!selectedPacienteId) {
      return;
    }

    try {
      if (odontograma) {
        await updateOdontograma(odontograma.id, { dados_dentes: dadosDentes, observacoes });
      } else {
        await createOdontograma({ paciente_id: selectedPacienteId, dados_dentes: dadosDentes, observacoes });
      }
    } catch (error) {
      console.error("Erro ao salvar odontograma:", error);
    }
  };

  const handleClear = () => {
    setDadosDentes({});
    setObservacoes("");
  };

  const renderDente = (numero: number) => {
    const key = numero.toString();
    const dente = dadosDentes[key];
    const hasData = dente && dente.procedimentos.length > 0;

    return (
      <div key={numero} className="relative group">
        <div
          onClick={() => handleDenteClick(numero)}
          className={`w-8 h-8 border-2 border-muted-foreground rounded-md ${getDenteColor(numero)} hover:bg-muted/50 cursor-pointer transition-colors`}
        >
          <div className="w-full h-full grid grid-cols-2 gap-0">
            <div className="border-r border-b border-muted-foreground/30"></div>
            <div className="border-b border-muted-foreground/30"></div>
            <div className="border-r border-muted-foreground/30"></div>
            <div></div>
          </div>
        </div>
        <span className="text-xs text-center block mt-1">{numero}</span>
        {hasData && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs p-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {dente.procedimentos.join(", ")}
          </div>
        )}
      </div>
    );
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
              <h2 className="text-xl font-semibold">Odontograma</h2>
              <p className="text-sm text-muted-foreground">
                Mapeamento do estado atual dos dentes do paciente
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClear}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Ferramentas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ferramentas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ferramentas.map((ferramenta) => (
                  <Badge
                    key={ferramenta.nome}
                    variant={selectedTool === ferramenta.nome ? "default" : "outline"}
                    className={`cursor-pointer ${ferramenta.hoverCor}`}
                    onClick={() => setSelectedTool(selectedTool === ferramenta.nome ? "" : ferramenta.nome)}
                  >
                    <div className={`w-3 h-3 ${ferramenta.cor} rounded mr-2`}></div>
                    {ferramenta.nome}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedTool ? (
                  <>Ferramenta selecionada: <strong>{selectedTool}</strong>. Clique nos dentes para aplicar/remover.</>
                ) : (
                  <>Nenhuma ferramenta selecionada. Clique nos dentes para ciclar automaticamente pelos procedimentos.</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Odontograma */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">Odontograma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Arcada Superior */}
              <div className="text-center">
                <p className="text-sm font-medium mb-4">Arcada Superior</p>
                <div className="flex justify-center">
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    {dentesSuperiores.slice(0, 8).map(renderDente)}
                  </div>
                  <div className="w-4"></div>
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    {dentesSuperiores.slice(8).map(renderDente)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Arcada Inferior */}
              <div className="text-center">
                <p className="text-sm font-medium mb-4">Arcada Inferior</p>
                <div className="flex justify-center">
                  <div className="grid grid-cols-8 gap-2">
                    {dentesInferiores.slice(0, 8).map(renderDente)}
                  </div>
                  <div className="w-4"></div>
                  <div className="grid grid-cols-8 gap-2">
                    {dentesInferiores.slice(8).map(renderDente)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações sobre o odontograma..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Legenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legenda de Procedimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Patologias</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Cárie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Doença Periodontal</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Tratamentos</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Restauração</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Tratamento Endodôntico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Implante</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Próteses</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span>Coroa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                    <span>Ponte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded"></div>
                    <span>Dente Ausente</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
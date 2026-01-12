import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Agendados() {
  const agendamentos = [
    { id: 1, paciente: "Roberto Carlos", data: "25/05/2024", hora: "09:00", mensagem: "Lembrete: Sua consulta é amanhã às 09:00.", status: "Agendado" },
    { id: 2, paciente: "Ana Julia", data: "26/05/2024", hora: "14:30", mensagem: "Obrigado pela visita! Como você está se sentindo após o procedimento?", status: "Agendado" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mensagens Agendadas</h1>
            <p className="text-muted-foreground">Programe mensagens para serem enviadas automaticamente.</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
          </Button>
        </div>

        <div className="grid gap-4">
          {agendamentos.map((ag) => (
            <Card key={ag.id}>
              <CardContent className="p-4 grid md:grid-cols-[1fr_200px_100px] items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {ag.paciente}
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{ag.mensagem}"</p>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {ag.data}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {ag.hora}
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {ag.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

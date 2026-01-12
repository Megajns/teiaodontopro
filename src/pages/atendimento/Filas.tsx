import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Plus, Users } from "lucide-react";

export default function Filas() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Filas de Atendimento</h1>
            <p className="text-muted-foreground">Gerencie as filas para os diferentes setores da clínica.</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Fila
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Geral
              </CardTitle>
              <CardDescription>Fila padrão para novos atendimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8 pacientes</div>
              <p className="text-xs text-muted-foreground">Tempo médio de espera: 12 min</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" /> Financeiro
              </CardTitle>
              <CardDescription>Dúvidas sobre pagamentos e orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 pacientes</div>
              <p className="text-xs text-muted-foreground">Tempo médio de espera: 5 min</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" /> Pós-Operatório
              </CardTitle>
              <CardDescription>Acompanhamento de cirurgias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 pacientes</div>
              <p className="text-xs text-muted-foreground">Tempo médio de espera: 2 min</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

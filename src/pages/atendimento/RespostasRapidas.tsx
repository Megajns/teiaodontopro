import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Edit, Trash2 } from "lucide-react";

export default function RespostasRapidas() {
  const respostas = [
    { atalho: "/boasvindas", mensagem: "Olá! Seja bem-vindo ao nosso consultório. Como podemos ajudar hoje?" },
    { atalho: "/local", mensagem: "Estamos localizados na Rua Principal, 123. Próximo ao metrô." },
    { atalho: "/pagamento", mensagem: "Aceitamos todos os cartões de crédito, débito e PIX." },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Respostas Rápidas</h1>
            <p className="text-muted-foreground">Cadastre mensagens frequentes para ganhar agilidade no atendimento.</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Resposta
          </Button>
        </div>

        <div className="grid gap-4">
          {respostas.map((res) => (
            <Card key={res.atalho}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">{res.atalho}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{res.mensagem}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

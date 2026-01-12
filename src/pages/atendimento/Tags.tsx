import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tags as TagsIcon, Plus } from "lucide-react";

export default function Tags() {
  const tags = [
    { name: "Prioridade", color: "bg-red-500" },
    { name: "Novo Paciente", color: "bg-blue-500" },
    { name: "Orçamento Pendente", color: "bg-amber-500" },
    { name: "Cirurgia", color: "bg-purple-500" },
    { name: "Retorno", color: "bg-green-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tags de Atendimento</h1>
            <p className="text-muted-foreground">Utilize tags para categorizar e filtrar suas conversas.</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Tag
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tags Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.name} className={`${tag.color} text-white hover:${tag.color}/80 px-4 py-1.5 text-sm`}>
                <TagsIcon className="w-3 h-3 mr-2" />
                {tag.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

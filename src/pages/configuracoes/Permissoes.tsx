import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfiguracoesRegistro } from "@/hooks/useConfiguracoesRegistro";
import { ShieldCheck, UserPlus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Permissoes() {
  const { configuracoes, isLoading, updateConfiguracoes, isUpdating } = useConfiguracoesRegistro();

  const handleToggleRegistro = (checked: boolean) => {
    updateConfiguracoes(checked);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Permissões do Sistema</h1>
            <p className="text-muted-foreground">Configure as permissões de acesso ao sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Registro de Novos Usuários
              </CardTitle>
              <CardDescription>
                Controle se novos usuários podem se registrar no sistema através da tela de login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="permitir-registro" className="text-base font-medium cursor-pointer">
                        Permitir registro de novos usuários
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Quando ativado, a opção de cadastro estará disponível na tela de login
                      </p>
                    </div>
                    <Switch
                      id="permitir-registro"
                      checked={configuracoes?.permitir_registro ?? true}
                      onCheckedChange={handleToggleRegistro}
                      disabled={isUpdating}
                      className="ml-4"
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {configuracoes?.permitir_registro ? (
                        <>
                          <strong>Status: Ativo</strong>
                          <br />
                          Novos usuários podem criar contas através da tela de login. A aba "Cadastrar" estará visível.
                        </>
                      ) : (
                        <>
                          <strong>Status: Desativado</strong>
                          <br />
                          O registro de novos usuários está bloqueado. Apenas a aba "Entrar" será exibida na tela de login.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <h4 className="font-medium text-foreground">Informações Importantes:</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Esta configuração afeta apenas novos registros</li>
                      <li>Usuários já cadastrados não são afetados</li>
                      <li>Recomendado desativar após criar as contas necessárias</li>
                      <li>A alteração tem efeito imediato na tela de login</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

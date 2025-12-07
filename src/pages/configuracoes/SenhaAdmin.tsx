import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MobileTable } from "@/components/ui/mobile-table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Key, Loader2 } from "lucide-react";

export function SenhaAdmin() {
  const { toast } = useToast();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const verificarForcaSenha = (senha: string) => {
    let pontuacao = 0;
    const criterios = {
      tamanho: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
    };

    Object.values(criterios).forEach(criterio => {
      if (criterio) pontuacao++;
    });

    if (pontuacao < 3) return { nivel: "Fraca", cor: "destructive", pontuacao };
    if (pontuacao < 4) return { nivel: "Média", cor: "secondary", pontuacao };
    return { nivel: "Forte", cor: "default", pontuacao };
  };

  const forcaSenha = verificarForcaSenha(novaSenha);

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (forcaSenha.pontuacao < 3) {
      toast({
        title: "Senha fraca",
        description: "A nova senha deve ser mais forte. Siga as recomendações de segurança.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar senha atual fazendo login
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error("Usuário não encontrado");
      }

      // Tentar fazer login com a senha atual para validá-la
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual,
      });

      if (signInError) {
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual informada está incorreta.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Atualizar para a nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada. Use a nova senha no próximo login.",
      });

      // Limpar campos
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao tentar alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ultimasAlteracoes = [
    { data: "15/01/2024 14:30", usuario: "Admin Principal", ip: "192.168.1.100", status: "Sucesso" },
    { data: "10/01/2024 09:15", usuario: "Admin Principal", ip: "192.168.1.100", status: "Sucesso" },
    { data: "05/01/2024 16:45", usuario: "Admin Secundário", ip: "192.168.1.105", status: "Falhou" },
  ];

  const historicoColumns = [
    { key: 'data', header: 'Data/Hora' },
    { key: 'usuario', header: 'Usuário' },
    { key: 'ip', header: 'IP' },
    { key: 'status', header: 'Status' },
  ];

  const renderHistoricoMobileCard = (item: any) => (
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold">{item.usuario}</h3>
        <Badge variant={item.status === "Sucesso" ? "default" : "destructive"}>
          {item.status}
        </Badge>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data:</span>
          <span>{item.data}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IP:</span>
          <span className="font-mono">{item.ip}</span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Senha do Administrador</h1>
            <p className="text-muted-foreground">Gerencie a senha de acesso administrativo do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <Badge variant="outline">Segurança Ativa</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Alterar Senha */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Alteração de Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Senha Atual */}
                <div className="space-y-2">
                  <Label htmlFor="senha-atual">Senha Atual *</Label>
                  <div className="relative">
                    <Input
                      id="senha-atual"
                      type={mostrarSenhaAtual ? "text" : "password"}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                    >
                      {mostrarSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="nova-senha"
                      type={mostrarNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    >
                      {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {novaSenha && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Força da senha:</span>
                        <Badge variant={forcaSenha.cor as any}>{forcaSenha.nivel}</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            forcaSenha.pontuacao < 3 ? 'bg-red-500' : 
                            forcaSenha.pontuacao < 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(forcaSenha.pontuacao / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmar-senha"
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    >
                      {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {confirmarSenha && (
                    <div className="flex items-center gap-2 text-sm">
                      {novaSenha === confirmarSenha ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Senhas coincidem</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">Senhas não coincidem</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAlterarSenha}
                  className="w-full gap-2"
                  disabled={!senhaAtual || !novaSenha || !confirmarSenha || novaSenha !== confirmarSenha || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Critérios de Segurança:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${novaSenha.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Mínimo 8 caracteres</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(novaSenha) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Letra maiúscula</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(novaSenha) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Letra minúscula</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${/\d/.test(novaSenha) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Número</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(novaSenha) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Caractere especial</span>
                    </li>
                  </ul>
                </div>

                <div className="text-sm">
                  <h4 className="font-medium mb-2">Dicas de Segurança:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Não use informações pessoais</li>
                    <li>• Altere a senha regularmente</li>
                    <li>• Não compartilhe com terceiros</li>
                    <li>• Use senhas diferentes para cada sistema</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
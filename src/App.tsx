import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";
import { Dentistas } from "@/pages/cadastros/Dentistas";
import { OrdemServico } from "@/pages/cadastros/OrdemServico";
import { Funcionarios } from "@/pages/cadastros/Funcionarios";
import { Fornecedores } from "@/pages/cadastros/Fornecedores";
import { Patrimonio } from "@/pages/cadastros/Patrimonio";
import { ControleEstoque } from "@/pages/cadastros/ControleEstoque";
import { Laboratorio } from "@/pages/cadastros/Laboratorio";
import { Convenios } from "@/pages/cadastros/Convenios";
import { TabelaHonorarios } from "@/pages/cadastros/TabelaHonorarios";
import ContasPagar from "@/pages/financeiro/ContasPagar";
import ContasReceber from "@/pages/financeiro/ContasReceber";
import FluxoCaixa from "@/pages/financeiro/FluxoCaixa";
import Comissoes from "@/pages/financeiro/Comissoes";
import ControleCheques from "@/pages/financeiro/ControleCheques";
import GanhoDentista from "@/pages/relatorios/GanhoDentista";
import RelatorioFinanceiro from "@/pages/relatorios/RelatorioFinanceiro";
import RelatorioComissao from "@/pages/relatorios/RelatorioComissao";
import { EfetuarPagamento } from "@/pages/pagamentos/EfetuarPagamento";
import ManuaisCodigos from "@/pages/utilitarios/ManuaisCodigos";
import ContatosUteis from "@/pages/utilitarios/ContatosUteis";
import { SenhaAdmin } from "@/pages/configuracoes/SenhaAdmin";
import { InformacoesClinica } from "@/pages/configuracoes/InformacoesClinica";
import { Permissoes } from "@/pages/configuracoes/Permissoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Cadastro Routes */}
            <Route path="/cadastros/dentistas" element={<ProtectedRoute><Dentistas /></ProtectedRoute>} />
            <Route path="/cadastros/os" element={<ProtectedRoute><OrdemServico /></ProtectedRoute>} />
            <Route path="/cadastros/funcionarios" element={<ProtectedRoute><Funcionarios /></ProtectedRoute>} />
            <Route path="/cadastros/fornecedores" element={<ProtectedRoute><Fornecedores /></ProtectedRoute>} />
            <Route path="/cadastros/patrimonio" element={<ProtectedRoute><Patrimonio /></ProtectedRoute>} />
            <Route path="/cadastros/estoque" element={<ProtectedRoute><ControleEstoque /></ProtectedRoute>} />
            <Route path="/cadastros/laboratorio" element={<ProtectedRoute><Laboratorio /></ProtectedRoute>} />
            <Route path="/cadastros/convenios" element={<ProtectedRoute><Convenios /></ProtectedRoute>} />
            <Route path="/cadastros/honorarios" element={<ProtectedRoute><TabelaHonorarios /></ProtectedRoute>} />
            
            {/* Financeiro Routes */}
            <Route path="/financeiro/contas-pagar" element={<ProtectedRoute><ContasPagar /></ProtectedRoute>} />
            <Route path="/financeiro/contas-receber" element={<ProtectedRoute><ContasReceber /></ProtectedRoute>} />
            <Route path="/financeiro/fluxo-caixa" element={<ProtectedRoute><FluxoCaixa /></ProtectedRoute>} />
            <Route path="/financeiro/comissoes" element={<ProtectedRoute><Comissoes /></ProtectedRoute>} />
            <Route path="/financeiro/cheques" element={<ProtectedRoute><ControleCheques /></ProtectedRoute>} />
            
            {/* Relatórios Routes */}
            <Route path="/relatorios/ganho-dentista" element={<ProtectedRoute><GanhoDentista /></ProtectedRoute>} />
            <Route path="/relatorios/financeiro" element={<ProtectedRoute><RelatorioFinanceiro /></ProtectedRoute>} />
            <Route path="/relatorios/comissao" element={<ProtectedRoute><RelatorioComissao /></ProtectedRoute>} />
            
            {/* Pagamentos Routes */}
            <Route path="/pagamentos/efetuar-pagamento" element={<ProtectedRoute><EfetuarPagamento /></ProtectedRoute>} />
            
            {/* Utilitários Routes */}
            <Route path="/utilitarios/manuais-codigos" element={<ProtectedRoute><ManuaisCodigos /></ProtectedRoute>} />
            <Route path="/utilitarios/contatos-uteis" element={<ProtectedRoute><ContatosUteis /></ProtectedRoute>} />
            
            {/* Configurações Routes */}
            <Route path="/configuracoes/senha-admin" element={<ProtectedRoute><SenhaAdmin /></ProtectedRoute>} />
            <Route path="/configuracoes/informacoes-clinica" element={<ProtectedRoute><InformacoesClinica /></ProtectedRoute>} />
            <Route path="/configuracoes/permissoes" element={<ProtectedRoute><Permissoes /></ProtectedRoute>} />
            
            {/* Other Routes */}
            <Route path="/financial" element={<ProtectedRoute><div className="p-6">Módulo Financeiro em desenvolvimento</div></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><div className="p-6">Módulo de Relatórios em desenvolvimento</div></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><div className="p-6">Módulo de Pagamentos em desenvolvimento</div></ProtectedRoute>} />
            <Route path="/utilities" element={<ProtectedRoute><div className="p-6">Módulo de Utilitários em desenvolvimento</div></ProtectedRoute>} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

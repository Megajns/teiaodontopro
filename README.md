# 🦷 TeiaOdontoPRO

Sistema completo de gestão para clínicas odontológicas desenvolvido com tecnologias modernas e interface intuitiva.

## 📋 Sobre o Projeto

O **TeiaOdontoPRO** é uma solução abrangente para gerenciamento de clínicas odontológicas, oferecendo funcionalidades completas para:

- 👥 **Gestão de Pacientes** - Cadastro, fichas clínicas, odontograma e histórico
- 📅 **Agenda** - Controle de consultas e horários disponíveis
- 💰 **Financeiro** - Contas a pagar/receber, fluxo de caixa e relatórios
- 📦 **Estoque** - Controle de materiais e equipamentos
- 👨‍⚕️ **Recursos Humanos** - Gestão de dentistas e funcionários
- 📊 **Relatórios** - Análises financeiras e operacionais

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface modernos
- **React Router** - Roteamento para SPA
- **React Hook Form** - Gerenciamento de formulários
- **Tanstack Query** - Gerenciamento de estado servidor
- **Recharts** - Biblioteca para gráficos e visualizações

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Autenticação** - Sistema integrado do Supabase

### Ferramentas de Desenvolvimento
- **ESLint** - Linting para qualidade de código
- **Bun** - Gerenciador de pacotes rápido
- **PostCSS** - Processamento de CSS

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes organizados por funcionalidade
│   ├── agenda/         # Agendamentos e consultas
│   ├── pacientes/      # Gestão de pacientes
│   ├── financeiro/     # Módulo financeiro
│   ├── estoque/        # Controle de estoque
│   ├── dentistas/      # Gestão de profissionais
│   ├── funcionarios/   # Recursos humanos
│   ├── convenios/      # Convênios médicos
│   ├── fornecedores/   # Gestão de fornecedores
│   ├── laboratorio/    # Laboratórios parceiros
│   ├── patrimonio/     # Controle patrimonial
│   ├── utilitarios/    # Ferramentas auxiliares
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes base (shadcn/ui)
├── hooks/              # Custom hooks para lógica de negócio
├── pages/              # Páginas da aplicação
├── contexts/           # Contextos React
├── integrations/       # Integrações externas
└── lib/                # Utilitários e helpers
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ ou Bun
- Conta no Supabase

### Passos para instalação

1. **Instale as dependências**
```bash
# Com Bun (recomendado)
bun install

# Ou com npm
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo .env.example para .env
cp .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
```
4. **Inicie o servidor de desenvolvimento**
```bash
# Com Bun
bun dev

# Ou com npm
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 📱 Funcionalidades Principais

### 👥 Gestão de Pacientes
- Cadastro completo com dados pessoais e contato
- Ficha clínica detalhada
- Odontograma interativo
- Controle ortodôntico
- Galeria de fotos e radiografias
- Sistema de receituário

### 📅 Agenda
- Agendamento de consultas
- Visualização por dentista e período
- Controle de horários disponíveis
- Notificações e lembretes

### 💰 Módulo Financeiro
- Contas a pagar e receber
- Controle de cheques
- Fluxo de caixa detalhado
- Gestão de comissões
- Relatórios financeiros completos

### 📦 Controle de Estoque
- Cadastro de produtos e materiais
- Controle de entrada e saída
- Alertas de estoque mínimo
- Relatórios de movimentação

### 👨‍⚕️ Recursos Humanos
- Cadastro de dentistas e funcionários
- Controle de permissões
- Gestão de comissões
- Relatórios de produtividade

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
bun dev          # Inicia servidor de desenvolvimento
npm run dev

# Build
bun run build    # Build para produção
npm run build

# Build para desenvolvimento
bun run build:dev
npm run build:dev

# Linting
bun run lint     # Executa ESLint
npm run lint

# Preview
bun run preview  # Preview da build de produção
npm run preview
```

## 🔒 Segurança

- Autenticação segura via Supabase
- Controle de acesso baseado em roles
- Validação de dados no frontend e backend
- Proteção contra SQL injection
- Criptografia de dados sensíveis

---

**Desenvolvido com ❤️ pelo Club do Software**

🌐 **Site oficial:** https://clubdosoftware.com.br/
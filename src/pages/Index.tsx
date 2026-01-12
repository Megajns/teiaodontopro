import heroImage from "@/assets/dental-hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  <span className="gradient-hero bg-clip-text text-transparent">TeiaOdontoPRO</span>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground">
                  Sistema Completo de Gestão Odontológica
                </p>
                <p className="text-muted-foreground max-w-lg leading-relaxed">
                  Gerencie sua clínica com eficiência: pacientes, agenda, financeiro, estoque e relatórios em uma plataforma moderna e intuitiva.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium transition-all gradient-hero text-white border-0 hover:opacity-90 shadow-medical"
                >
                  Acessar Sistema
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a 
                  href="https://docs.lovable.dev/integrations/supabase/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors text-center"
                >
                  Integração Supabase
                </a>
              </div>

              <div className="bg-card/50 border border-border rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground">
                  <strong>Funcionalidades Backend:</strong> Para implementar autenticação, banco de dados e APIs, 
                  conecte ao Supabase usando nossa integração nativa.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 gradient-hero opacity-20 rounded-2xl blur-xl"></div>
              <img 
                src={heroImage} 
                alt="TeiaOdontoPRO Sistema de Gestão" 
                className="relative w-full h-auto rounded-2xl shadow-strong border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Recursos Principais
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que sua clínica odontológica precisa em uma única plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="medical-card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-xl mb-3 text-primary">Gestão de Pacientes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cadastro completo, histórico médico, odontograma digital e upload de documentos
              </p>
            </div>
            
            <div className="medical-card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-xl mb-3 text-secondary">Sistema de Agenda</h3>
              <p className="text-muted-foreground leading-relaxed">
                Agendamentos inteligentes, lembretes automáticos e controle completo de consultas
              </p>
            </div>
            
            <div className="medical-card group hover:scale-105 transition-transform">
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-xl mb-3 text-success">Controle Financeiro</h3>
              <p className="text-muted-foreground leading-relaxed">
                Faturamento, contas a receber, planos de pagamento e relatórios financeiros detalhados
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

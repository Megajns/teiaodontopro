export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          confirmado: boolean
          convenio_id: string | null
          created_at: string
          data_agendamento: string
          dentista_id: string
          duracao: number
          id: string
          observacoes: string | null
          paciente_id: string
          procedimento: string
          status: string
          tipo_atendimento: string
          updated_at: string
          user_id: string
          valor: number | null
        }
        Insert: {
          confirmado?: boolean
          convenio_id?: string | null
          created_at?: string
          data_agendamento: string
          dentista_id: string
          duracao?: number
          id?: string
          observacoes?: string | null
          paciente_id: string
          procedimento: string
          status?: string
          tipo_atendimento?: string
          updated_at?: string
          user_id: string
          valor?: number | null
        }
        Update: {
          confirmado?: boolean
          convenio_id?: string | null
          created_at?: string
          data_agendamento?: string
          dentista_id?: string
          duracao?: number
          id?: string
          observacoes?: string | null
          paciente_id?: string
          procedimento?: string
          status?: string
          tipo_atendimento?: string
          updated_at?: string
          user_id?: string
          valor?: number | null
        }
        Relationships: []
      }
      cheques: {
        Row: {
          agencia: string
          banco: string
          conta: string
          cpf_cnpj: string | null
          created_at: string
          data_compensacao: string | null
          data_emissao: string
          data_vencimento: string
          emitente: string
          id: string
          numero_cheque: string
          observacoes: string | null
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          agencia: string
          banco: string
          conta: string
          cpf_cnpj?: string | null
          created_at?: string
          data_compensacao?: string | null
          data_emissao: string
          data_vencimento: string
          emitente: string
          id?: string
          numero_cheque: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          agencia?: string
          banco?: string
          conta?: string
          cpf_cnpj?: string | null
          created_at?: string
          data_compensacao?: string | null
          data_emissao?: string
          data_vencimento?: string
          emitente?: string
          id?: string
          numero_cheque?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          data_pagamento: string | null
          dentista_id: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          percentual_comissao: number
          referencia: string
          status: string
          updated_at: string
          user_id: string
          valor_comissao: number
          valor_total_procedimentos: number
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          data_pagamento?: string | null
          dentista_id: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          percentual_comissao: number
          referencia: string
          status?: string
          updated_at?: string
          user_id: string
          valor_comissao: number
          valor_total_procedimentos?: number
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          data_pagamento?: string | null
          dentista_id?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          percentual_comissao?: number
          referencia?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor_comissao?: number
          valor_total_procedimentos?: number
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          created_at: string
          id: string
          permitir_registro: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permitir_registro?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permitir_registro?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          categoria: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          fornecedor_id: string | null
          id: string
          observacoes: string | null
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          categoria: string
          created_at: string
          data_recebimento: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          paciente_id: string | null
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_recebimento?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_recebimento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      contatos_uteis: {
        Row: {
          categoria: string
          created_at: string
          email: string | null
          endereco: string | null
          horario_funcionamento: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string
          tipo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone: string
          tipo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string
          tipo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      convenios: {
        Row: {
          carencia_dias: number
          codigo: string | null
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          percentual_cobertura: number | null
          status: string
          tipo: string
          updated_at: string
          user_id: string
          valor_consulta: number | null
        }
        Insert: {
          carencia_dias?: number
          codigo?: string | null
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          percentual_cobertura?: number | null
          status?: string
          tipo: string
          updated_at?: string
          user_id: string
          valor_consulta?: number | null
        }
        Update: {
          carencia_dias?: number
          codigo?: string | null
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          percentual_cobertura?: number | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor_consulta?: number | null
        }
        Relationships: []
      }
      dentistas: {
        Row: {
          cpf: string
          created_at: string
          cro: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          especialidade: string
          id: string
          nome: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf: string
          created_at?: string
          cro: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          especialidade: string
          id?: string
          nome: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string
          created_at?: string
          cro?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          especialidade?: string
          id?: string
          nome?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          estoque: number
          id: string
          item: string
          maximo: number
          minimo: number
          observacoes: string | null
          updated_at: string
          user_id: string
          valor_unitario: number
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          estoque?: number
          id?: string
          item: string
          maximo?: number
          minimo?: number
          observacoes?: string | null
          updated_at?: string
          user_id: string
          valor_unitario?: number
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          estoque?: number
          id?: string
          item?: string
          maximo?: number
          minimo?: number
          observacoes?: string | null
          updated_at?: string
          user_id?: string
          valor_unitario?: number
        }
        Relationships: []
      }
      ficha_clinica: {
        Row: {
          alergias: string | null
          contato_emergencia_nome: string | null
          contato_emergencia_parentesco: string | null
          contato_emergencia_telefone: string | null
          created_at: string
          diagnostico: string | null
          exame_extraoral: string | null
          exame_intraoral: string | null
          historico_medico: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          peso: string | null
          plano_tratamento: string | null
          pressao_arterial: string | null
          queixa_principal: string | null
          temperatura: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alergias?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_parentesco?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          diagnostico?: string | null
          exame_extraoral?: string | null
          exame_intraoral?: string | null
          historico_medico?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          peso?: string | null
          plano_tratamento?: string | null
          pressao_arterial?: string | null
          queixa_principal?: string | null
          temperatura?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alergias?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_parentesco?: string | null
          contato_emergencia_telefone?: string | null
          created_at?: string
          diagnostico?: string | null
          exame_extraoral?: string | null
          exame_intraoral?: string | null
          historico_medico?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          peso?: string | null
          plano_tratamento?: string | null
          pressao_arterial?: string | null
          queixa_principal?: string | null
          temperatura?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ficha_clinica_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: true
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_caixa: {
        Row: {
          categoria: string
          created_at: string
          data_movimentacao: string
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_movimentacao: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_movimentacao?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          categoria: string
          cnpj: string | null
          contato: string
          created_at: string
          email: string
          endereco: string | null
          id: string
          nome: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          cnpj?: string | null
          contato: string
          created_at?: string
          email: string
          endereco?: string | null
          id?: string
          nome: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          cnpj?: string | null
          contato?: string
          created_at?: string
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fotos: {
        Row: {
          created_at: string
          data_foto: string | null
          id: string
          imagem_base64: string
          observacoes: string | null
          paciente_id: string
          tipo: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_foto?: string | null
          id?: string
          imagem_base64: string
          observacoes?: string | null
          paciente_id: string
          tipo?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_foto?: string | null
          id?: string
          imagem_base64?: string
          observacoes?: string | null
          paciente_id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          cargo: string
          created_at: string
          data_admissao: string | null
          email: string
          id: string
          nome: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cargo: string
          created_at?: string
          data_admissao?: string | null
          email: string
          id?: string
          nome: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cargo?: string
          created_at?: string
          data_admissao?: string | null
          email?: string
          id?: string
          nome?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      honorarios: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          duracao_media: number
          id: string
          observacoes: string | null
          procedimento: string
          status: string
          updated_at: string
          user_id: string
          valor_convenio: number
          valor_particular: number
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          duracao_media?: number
          id?: string
          observacoes?: string | null
          procedimento: string
          status?: string
          updated_at?: string
          user_id: string
          valor_convenio?: number
          valor_particular?: number
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          duracao_media?: number
          id?: string
          observacoes?: string | null
          procedimento?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor_convenio?: number
          valor_particular?: number
        }
        Relationships: []
      }
      horarios_disponiveis: {
        Row: {
          ativo: boolean
          created_at: string
          dia_semana: number
          hora: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dia_semana: number
          hora: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dia_semana?: number
          hora?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      informacoes_clinica: {
        Row: {
          bairro: string | null
          celular: string | null
          cep: string
          cidade: string
          cnpj: string | null
          complemento: string | null
          created_at: string
          cro_clinica: string | null
          email: string
          endereco: string
          estado: string
          id: string
          logo_base64: string | null
          nome_clinica: string
          numero: string | null
          observacoes: string | null
          telefone: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bairro?: string | null
          celular?: string | null
          cep: string
          cidade: string
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          cro_clinica?: string | null
          email: string
          endereco: string
          estado: string
          id?: string
          logo_base64?: string | null
          nome_clinica: string
          numero?: string | null
          observacoes?: string | null
          telefone: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bairro?: string | null
          celular?: string | null
          cep?: string
          cidade?: string
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          cro_clinica?: string | null
          email?: string
          endereco?: string
          estado?: string
          id?: string
          logo_base64?: string | null
          nome_clinica?: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      laboratorio: {
        Row: {
          created_at: string
          data_envio: string
          data_retorno: string
          id: string
          laboratorio: string
          observacoes: string | null
          paciente: string
          procedimento: string
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_envio: string
          data_retorno: string
          id?: string
          laboratorio: string
          observacoes?: string | null
          paciente: string
          procedimento: string
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data_envio?: string
          data_retorno?: string
          id?: string
          laboratorio?: string
          observacoes?: string | null
          paciente?: string
          procedimento?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      manuais_codigos: {
        Row: {
          arquivo_base64: string | null
          categoria: string
          codigo: string | null
          conteudo: string | null
          created_at: string
          descricao: string | null
          id: string
          link_externo: string | null
          tags: string[] | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivo_base64?: string | null
          categoria: string
          codigo?: string | null
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          link_externo?: string | null
          tags?: string[] | null
          tipo: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivo_base64?: string | null
          categoria?: string
          codigo?: string | null
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          link_externo?: string | null
          tags?: string[] | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      odontograma: {
        Row: {
          created_at: string
          dados_dentes: Json | null
          id: string
          observacoes: string | null
          paciente_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dados_dentes?: Json | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dados_dentes?: Json | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "odontograma_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: true
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_servico: {
        Row: {
          created_at: string
          data_abertura: string
          data_conclusao: string | null
          data_prevista: string | null
          dentista_id: string
          id: string
          numero_os: string
          observacoes: string | null
          paciente_id: string
          prioridade: string | null
          procedimentos: Json
          status: string
          updated_at: string
          user_id: string
          valor_total: number | null
        }
        Insert: {
          created_at?: string
          data_abertura?: string
          data_conclusao?: string | null
          data_prevista?: string | null
          dentista_id: string
          id?: string
          numero_os?: string
          observacoes?: string | null
          paciente_id: string
          prioridade?: string | null
          procedimentos?: Json
          status?: string
          updated_at?: string
          user_id: string
          valor_total?: number | null
        }
        Update: {
          created_at?: string
          data_abertura?: string
          data_conclusao?: string | null
          data_prevista?: string | null
          dentista_id?: string
          id?: string
          numero_os?: string
          observacoes?: string | null
          paciente_id?: string
          prioridade?: string | null
          procedimentos?: Json
          status?: string
          updated_at?: string
          user_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_servico_dentista_id_fkey"
            columns: ["dentista_id"]
            isOneToOne: false
            referencedRelation: "dentistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_servico_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ortodontia: {
        Row: {
          created_at: string
          data_inicio: string | null
          diagnostico: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          plano_tratamento: string | null
          previsao_termino: string | null
          progresso: string | null
          proxima_consulta: string | null
          status: string | null
          tipo_aparelho: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_inicio?: string | null
          diagnostico?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          plano_tratamento?: string | null
          previsao_termino?: string | null
          progresso?: string | null
          proxima_consulta?: string | null
          status?: string | null
          tipo_aparelho?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_inicio?: string | null
          diagnostico?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          plano_tratamento?: string | null
          previsao_termino?: string | null
          progresso?: string | null
          proxima_consulta?: string | null
          status?: string | null
          tipo_aparelho?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ortodontia_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: true
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          id: string
          nome: string
          status: string
          telefone: string
          ultima_consulta: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          id?: string
          nome: string
          status?: string
          telefone: string
          ultima_consulta?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string
          ultima_consulta?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patrimonio: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          data_aquisicao: string
          id: string
          item: string
          observacoes: string | null
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          data_aquisicao: string
          id?: string
          item: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          data_aquisicao?: string
          id?: string
          item?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          foto_perfil_base64: string | null
          id: string
          nome_exibicao: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          foto_perfil_base64?: string | null
          id?: string
          nome_exibicao?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          foto_perfil_base64?: string | null
          id?: string
          nome_exibicao?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      radiografias: {
        Row: {
          created_at: string
          data_exame: string | null
          id: string
          imagem_base64: string
          laudo: string | null
          observacoes: string | null
          paciente_id: string
          tipo_exame: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_exame?: string | null
          id?: string
          imagem_base64: string
          laudo?: string | null
          observacoes?: string | null
          paciente_id: string
          tipo_exame?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_exame?: string | null
          id?: string
          imagem_base64?: string
          laudo?: string | null
          observacoes?: string | null
          paciente_id?: string
          tipo_exame?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "radiografias_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      receituario: {
        Row: {
          created_at: string
          data_prescricao: string
          diagnostico: string | null
          id: string
          medicamentos: Json
          observacoes: string | null
          paciente_id: string
          updated_at: string
          user_id: string
          validade: string | null
        }
        Insert: {
          created_at?: string
          data_prescricao: string
          diagnostico?: string | null
          id?: string
          medicamentos?: Json
          observacoes?: string | null
          paciente_id: string
          updated_at?: string
          user_id: string
          validade?: string | null
        }
        Update: {
          created_at?: string
          data_prescricao?: string
          diagnostico?: string | null
          id?: string
          medicamentos?: Json
          observacoes?: string | null
          paciente_id?: string
          updated_at?: string
          user_id?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receituario_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

-- Criação da tabela horarios_disponiveis
CREATE TABLE public.horarios_disponiveis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora time NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_horarios_disponiveis_user_id ON public.horarios_disponiveis(user_id);
CREATE INDEX idx_horarios_disponiveis_dia_semana ON public.horarios_disponiveis(dia_semana);
CREATE INDEX idx_horarios_disponiveis_ativo ON public.horarios_disponiveis(ativo);

-- Índice único para evitar horários duplicados por usuário
CREATE UNIQUE INDEX idx_horarios_disponiveis_unique ON public.horarios_disponiveis(user_id, dia_semana, hora);

-- RLS (Row Level Security)
ALTER TABLE public.horarios_disponiveis ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios horários
CREATE POLICY "Users can view own horarios_disponiveis" ON public.horarios_disponiveis
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios horários
CREATE POLICY "Users can insert own horarios_disponiveis" ON public.horarios_disponiveis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios horários
CREATE POLICY "Users can update own horarios_disponiveis" ON public.horarios_disponiveis
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios horários
CREATE POLICY "Users can delete own horarios_disponiveis" ON public.horarios_disponiveis
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_horarios_disponiveis_updated_at
    BEFORE UPDATE ON public.horarios_disponiveis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
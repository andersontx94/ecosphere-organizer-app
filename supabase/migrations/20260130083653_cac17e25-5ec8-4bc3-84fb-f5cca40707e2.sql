-- Tipos de Processo pré-cadastrados
CREATE TABLE public.process_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_licensing BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT true,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tipos de Licença pré-cadastrados
CREATE TABLE public.license_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Etapas de cada Processo
CREATE TABLE public.process_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.environmental_processes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  responsible TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Receitas por Processo
CREATE TABLE public.process_revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.environmental_processes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'orcado',
  due_date DATE,
  received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custos por Processo
CREATE TABLE public.process_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID NOT NULL REFERENCES public.environmental_processes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'previsto',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos extras ao environmental_processes
ALTER TABLE public.environmental_processes 
ADD COLUMN IF NOT EXISTS license_type_id UUID REFERENCES public.license_types(id),
ADD COLUMN IF NOT EXISTS internal_deadline DATE,
ADD COLUMN IF NOT EXISTS risk_status TEXT DEFAULT 'ok',
ADD COLUMN IF NOT EXISTS total_value NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.process_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view default process types" ON public.process_types
FOR SELECT USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own process types" ON public.process_types
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view license types" ON public.license_types
FOR SELECT USING (true);

CREATE POLICY "Users can view own process stages" ON public.process_stages
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.environmental_processes WHERE id = process_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert own process stages" ON public.process_stages
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.environmental_processes WHERE id = process_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update own process stages" ON public.process_stages
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.environmental_processes WHERE id = process_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete own process stages" ON public.process_stages
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.environmental_processes WHERE id = process_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view own process revenues" ON public.process_revenues
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own process revenues" ON public.process_revenues
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own process revenues" ON public.process_revenues
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own process revenues" ON public.process_revenues
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own process costs" ON public.process_costs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own process costs" ON public.process_costs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own process costs" ON public.process_costs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own process costs" ON public.process_costs
FOR DELETE USING (auth.uid() = user_id);

-- Inserir tipos de processo padrão
INSERT INTO public.process_types (name, description, is_licensing, is_default) VALUES
('Licenciamento Ambiental', 'Processos de licenciamento junto a órgãos ambientais', true, true),
('Assessoria Ambiental', 'Consultoria e assessoria técnica ambiental', false, true),
('Serviços IBAMA', 'Serviços junto ao IBAMA (CTF, DOF, etc)', false, true),
('Relatórios Ambientais', 'Elaboração de estudos e relatórios técnicos', false, true),
('Renovações', 'Renovação de licenças e autorizações', true, true);

-- Inserir tipos de licença padrão
INSERT INTO public.license_types (name, code, description) VALUES
('Licença Prévia', 'LP', 'Concedida na fase preliminar do planejamento'),
('Licença de Instalação', 'LI', 'Autoriza a instalação do empreendimento'),
('Licença de Operação', 'LO', 'Autoriza o funcionamento da atividade'),
('Renovação de LO', 'RLO', 'Renovação da Licença de Operação'),
('Licença Corretiva', 'LC', 'Regularização de atividades já existentes');

-- Triggers para updated_at
CREATE TRIGGER update_process_stages_updated_at
BEFORE UPDATE ON public.process_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_process_revenues_updated_at
BEFORE UPDATE ON public.process_revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_process_costs_updated_at
BEFORE UPDATE ON public.process_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
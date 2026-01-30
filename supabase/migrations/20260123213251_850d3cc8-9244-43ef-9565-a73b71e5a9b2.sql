-- Create enum types for the system
CREATE TYPE public.person_type AS ENUM ('fisica', 'juridica');
CREATE TYPE public.professional_type AS ENUM ('consultor_autonomo', 'profissional_pj', 'empresa_ambiental');
CREATE TYPE public.account_status AS ENUM ('active', 'inactive');
CREATE TYPE public.client_type AS ENUM ('fisica', 'juridica');
CREATE TYPE public.document_type AS ENUM ('licenca', 'relatorio', 'autorizacao', 'certidao', 'outro');
CREATE TYPE public.validity_status AS ENUM ('valido', 'proximo_vencimento', 'vencido');
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta');
CREATE TYPE public.task_status AS ENUM ('pendente', 'em_andamento', 'concluido');
CREATE TYPE public.checklist_status AS ENUM ('pendente', 'em_andamento', 'concluido');
CREATE TYPE public.financial_type AS ENUM ('entrada', 'saida');
CREATE TYPE public.receivable_status AS ENUM ('em_aberto', 'recebido');
CREATE TYPE public.payable_status AS ENUM ('em_aberto', 'pago');

-- Profiles table (stores user profile data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  person_type person_type NOT NULL DEFAULT 'fisica',
  professional_type professional_type NOT NULL DEFAULT 'consultor_autonomo',
  cpf TEXT,
  cnpj TEXT,
  main_activity TEXT,
  account_status account_status NOT NULL DEFAULT 'active',
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  client_type client_type NOT NULL DEFAULT 'fisica',
  cpf TEXT,
  cnpj TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enterprises table (linked to clients)
CREATE TABLE public.enterprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  activity_type TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Environmental services catalog
CREATE TABLE public.environmental_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default environmental services
INSERT INTO public.environmental_services (name, description, is_default) VALUES
  ('Licenciamento Ambiental', 'Processo de obtenção de licenças ambientais', true),
  ('Renovação de Licença Ambiental', 'Renovação de licenças ambientais vigentes', true),
  ('Relatório Ambiental', 'Elaboração de relatórios técnicos ambientais', true),
  ('PGRS', 'Plano de Gerenciamento de Resíduos Sólidos', true),
  ('Inventário de Resíduos', 'Levantamento e inventário de resíduos', true),
  ('CTF/IBAMA', 'Cadastro Técnico Federal junto ao IBAMA', true),
  ('Estudos Ambientais', 'Estudos e análises ambientais diversos', true),
  ('Auditoria Ambiental', 'Auditorias de conformidade ambiental', true),
  ('Monitoramento Ambiental', 'Monitoramento de indicadores ambientais', true),
  ('Educação Ambiental', 'Programas e treinamentos de educação ambiental', true),
  ('Consultoria Ambiental Geral', 'Consultoria técnica ambiental diversa', true);

-- Projects/Services linked to clients
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'em_andamento',
  start_date DATE,
  end_date DATE,
  value DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link projects to services (many-to-many)
CREATE TABLE public.project_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.environmental_services(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  document_type document_type NOT NULL DEFAULT 'outro',
  file_path TEXT,
  file_name TEXT,
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'media',
  status task_status DEFAULT 'pendente',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklists table
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.environmental_services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist items
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status checklist_status DEFAULT 'pendente',
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Financial accounts (internal categories)
CREATE TABLE public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Financial transactions
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  type financial_type NOT NULL,
  category TEXT,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts receivable
CREATE TABLE public.accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status receivable_status DEFAULT 'em_aberto',
  received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts payable
CREATE TABLE public.accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  category TEXT,
  status payable_status DEFAULT 'em_aberto',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for clients
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for enterprises
CREATE POLICY "Users can view own enterprises" ON public.enterprises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enterprises" ON public.enterprises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enterprises" ON public.enterprises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own enterprises" ON public.enterprises FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for environmental_services (allow reading defaults for everyone, custom for owners)
CREATE POLICY "Users can view default services" ON public.environmental_services FOR SELECT USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own services" ON public.environmental_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own services" ON public.environmental_services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own services" ON public.environmental_services FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for project_services
CREATE POLICY "Users can view own project_services" ON public.project_services FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own project_services" ON public.project_services FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own project_services" ON public.project_services FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for documents
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for checklists
CREATE POLICY "Users can view own checklists" ON public.checklists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklists" ON public.checklists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists" ON public.checklists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists" ON public.checklists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for checklist_items
CREATE POLICY "Users can view own checklist_items" ON public.checklist_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own checklist_items" ON public.checklist_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own checklist_items" ON public.checklist_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own checklist_items" ON public.checklist_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id AND user_id = auth.uid()));

-- RLS Policies for financial_accounts
CREATE POLICY "Users can view own accounts" ON public.financial_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.financial_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.financial_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.financial_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view own transactions" ON public.financial_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.financial_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.financial_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.financial_transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for accounts_receivable
CREATE POLICY "Users can view own receivables" ON public.accounts_receivable FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receivables" ON public.accounts_receivable FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receivables" ON public.accounts_receivable FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receivables" ON public.accounts_receivable FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for accounts_payable
CREATE POLICY "Users can view own payables" ON public.accounts_payable FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payables" ON public.accounts_payable FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payables" ON public.accounts_payable FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payables" ON public.accounts_payable FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply update triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_enterprises_updated_at BEFORE UPDATE ON public.enterprises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_receivables_updated_at BEFORE UPDATE ON public.accounts_receivable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payables_updated_at BEFORE UPDATE ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function to check if user account is active
CREATE OR REPLACE FUNCTION public.is_account_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND account_status = 'active'
  )
$$;
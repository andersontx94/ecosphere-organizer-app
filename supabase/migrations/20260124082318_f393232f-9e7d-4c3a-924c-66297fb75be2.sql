-- Add payment_method to projects table for contract/service functionality
ALTER TABLE public.projects 
ADD COLUMN payment_method text DEFAULT 'a_vista';

-- Add initial_balance to financial_accounts for cash control
ALTER TABLE public.financial_accounts 
ADD COLUMN initial_balance numeric DEFAULT 0;

-- Create environmental_processes table for licenses and processes
CREATE TABLE public.environmental_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  process_type text NOT NULL,
  agency text NOT NULL,
  process_number text,
  status text NOT NULL DEFAULT 'em_elaboracao',
  protocol_date date,
  decision_date date,
  expiry_date date,
  notes text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on environmental_processes
ALTER TABLE public.environmental_processes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for environmental_processes
CREATE POLICY "Users can view own processes" 
ON public.environmental_processes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processes" 
ON public.environmental_processes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processes" 
ON public.environmental_processes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own processes" 
ON public.environmental_processes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at on environmental_processes
CREATE TRIGGER update_environmental_processes_updated_at
BEFORE UPDATE ON public.environmental_processes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add category column to accounts_payable if not exists for expense categorization
-- Already has category column, so we skip this

-- Create index for better performance on common queries
CREATE INDEX idx_environmental_processes_user_id ON public.environmental_processes(user_id);
CREATE INDEX idx_environmental_processes_status ON public.environmental_processes(status);
CREATE INDEX idx_environmental_processes_enterprise_id ON public.environmental_processes(enterprise_id);
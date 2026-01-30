import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf, Loader2, Building2, User, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CompleteProfileForm() {
  const { profile, updateProfile } = useAuth();
  const [professionalType, setProfessionalType] = useState<string>('consultor_autonomo');
  const [personType, setPersonType] = useState<string>('fisica');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [mainActivity, setMainActivity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 14);
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile({
      professional_type: professionalType as any,
      person_type: personType as any,
      cpf: personType === 'fisica' ? cpf : null,
      cnpj: personType === 'juridica' ? cnpj : null,
      main_activity: mainActivity,
      profile_completed: true,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar seu perfil. Tente novamente.',
      });
    } else {
      toast({
        title: 'Perfil completo!',
        description: 'Bem-vindo ao EcoGest.',
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">EcoGest</span>
          </div>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Complete seu perfil</CardTitle>
            <CardDescription>Essas informações ajudam a personalizar sua experiência</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Professional Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Tipo de atuação</Label>
                <RadioGroup value={professionalType} onValueChange={setProfessionalType}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="consultor_autonomo" id="consultor" />
                    <User className="h-5 w-5 text-primary" />
                    <Label htmlFor="consultor" className="flex-1 cursor-pointer">
                      <span className="font-medium">Consultor ambiental autônomo</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="profissional_pj" id="profissional" />
                    <Briefcase className="h-5 w-5 text-primary" />
                    <Label htmlFor="profissional" className="flex-1 cursor-pointer">
                      <span className="font-medium">Profissional liberal PJ</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="empresa_ambiental" id="empresa" />
                    <Building2 className="h-5 w-5 text-primary" />
                    <Label htmlFor="empresa" className="flex-1 cursor-pointer">
                      <span className="font-medium">Empresa ambiental</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Person Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Tipo de pessoa</Label>
                <RadioGroup value={personType} onValueChange={setPersonType}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <Label htmlFor="fisica" className="flex-1 cursor-pointer">
                      <span className="font-medium">Pessoa Física (CPF)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <Label htmlFor="juridica" className="flex-1 cursor-pointer">
                      <span className="font-medium">Pessoa Jurídica (CNPJ)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* CPF or CNPJ based on selection */}
              {personType === 'fisica' ? (
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    maxLength={14}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    maxLength={18}
                  />
                </div>
              )}

              {/* Main Activity */}
              <div className="space-y-2">
                <Label htmlFor="activity">Atividade principal</Label>
                <Input
                  id="activity"
                  type="text"
                  placeholder="Ex: Consultoria em licenciamento ambiental"
                  value={mainActivity}
                  onChange={(e) => setMainActivity(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Concluir cadastro'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Leaf, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas nao conferem",
        description: "A senha e a confirmacao devem ser iguais.",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message,
      });
      return;
    }

    await supabase.auth.signOut();
    toast({
      title: "Senha atualizada",
      description: "Entre novamente com sua nova senha.",
    });
    navigate("/login", { replace: true });
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground">
                EcoGest
              </span>
            </div>
          </div>

          <Card className="shadow-card border-border text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="font-display text-2xl">
                Link invalido ou expirado
              </CardTitle>
              <CardDescription>
                Solicite um novo link de recuperacao para continuar.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Link to="/esqueci-senha" className="w-full">
                <Button className="w-full">Solicitar novo link</Button>
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground">
                <ArrowLeft className="inline mr-1 h-4 w-4" />
                Voltar ao login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">
              EcoGest
            </span>
          </div>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              Redefinir senha
            </CardTitle>
            <CardDescription>Crie uma nova senha para sua conta</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </Button>
              <Link to="/login" className="text-sm text-muted-foreground">
                <ArrowLeft className="inline mr-1 h-4 w-4" />
                Voltar ao login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

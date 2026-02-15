import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabaseConfigError } from "@/lib/supabase";
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
import { CheckCircle, Leaf, Loader2, Lock, Mail, User } from "lucide-react";

export default function Signup() {
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error, needsEmailConfirmation } = await signUp(
      email.trim(),
      password,
      name.trim()
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (needsEmailConfirmation) {
      setConfirmationEmail(email.trim());
      setConfirmationSent(true);
      return;
    }

    navigate("/", { replace: true });
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-4">
        <Card className="w-full max-w-md shadow-card border-border text-center">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Configuracao incompleta
            </CardTitle>
            <CardDescription>
              {supabaseConfigError ??
                "As credenciais do Supabase nao estao configuradas."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verifique as variaveis de ambiente no Vercel e tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-4">
        <Card className="w-full max-w-md shadow-card border-border text-center">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Carregando...
            </CardTitle>
            <CardDescription>Verificando sua sessao.</CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmationSent) {
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
                Verifique seu email
              </CardTitle>
              <CardDescription>
                Conta criada. Verifique seu e-mail para confirmar o acesso.
                Se nao chegar, confira o spam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmacao para{" "}
                <strong>{confirmationEmail}</strong>.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/login">
                <Button variant="outline">Ir para o login</Button>
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
            <CardTitle className="font-display text-2xl">Criar conta</CardTitle>
            <CardDescription>
              Comece a organizar sua consultoria ambiental
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Ja tem conta?{" "}
                <Link
                  to="/login"
                  className="text-emerald-700 hover:underline font-medium"
                >
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

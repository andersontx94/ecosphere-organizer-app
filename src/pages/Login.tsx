import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured, supabaseConfigError } from "@/lib/supabase";
import { getAuthRedirectMeta } from "@/lib/authRedirect";
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
import { Leaf, Loader2, Lock, Mail } from "lucide-react";

export default function Login() {
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsConfirmation(false);
    setResendMessage(null);
    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    setLoading(false);

    if (error) {
      console.error("[auth] signIn error", error);
      const message = error.message ?? "Erro ao entrar.";
      if (message.toLowerCase().includes("confirm")) {
        setNeedsConfirmation(true);
        setError(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou clique abaixo para reenviar."
        );
      } else {
        setError(message);
      }
      return;
    }

    navigate(from, { replace: true });
  }

  async function handleResendConfirmation() {
    if (resendLoading) return;
    if (!isSupabaseConfigured) {
      setResendMessage(supabaseConfigError ?? "Supabase nao configurado.");
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setResendMessage("Informe seu e-mail acima para reenviar a confirmação.");
      return;
    }

    setResendLoading(true);
    setResendMessage(null);

    const { origin, redirectTo } = getAuthRedirectMeta();
    console.info("[auth] resendConfirmation origin", origin);
    console.info("[auth] resendConfirmation redirectTo", redirectTo);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setResendLoading(false);

    if (error) {
      console.error("[auth] resendConfirmation error", error);
      setResendMessage("N�o foi poss�vel reenviar agora. Tente novamente.");
      return;
    }

    setResendMessage(
      "Enviamos um novo e-mail de confirmação. Verifique sua caixa de entrada e spam."
    );
    const cooldownMs = 30000;
    setResendCooldownUntil(Date.now() + cooldownMs);
    setTimeout(() => {
      setResendCooldownUntil(0);
    }, cooldownMs);
  }

  if (user) {
    return <Navigate to={from} replace />;
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
            <CardTitle className="font-display text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse sua central de gestao ambiental
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@empresa.com"
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
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {needsConfirmation && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendConfirmation}
                    disabled={
                      resendLoading ||
                      !email.trim() ||
                      (resendCooldownUntil > 0 &&
                        Date.now() < resendCooldownUntil)
                    }
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Reenviar e-mail de confirmação"
                    )}
                  </Button>
                  {resendMessage && (
                    <p className="text-sm text-emerald-700">{resendMessage}</p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
                <Link
                  to="/esqueci-senha"
                  className="hover:text-emerald-700 hover:underline"
                >
                  Esqueci minha senha
                </Link>
                <Link
                  to="/signup"
                  className="text-emerald-700 hover:underline font-medium"
                >
                  Criar conta
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}








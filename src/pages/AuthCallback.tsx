import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  supabase,
  isSupabaseConfigured,
  supabaseConfigError,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [message, setMessage] = useState("Processando confirmacao...");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage(supabaseConfigError ?? "Supabase nao configurado.");
      return;
    }

    async function handleCallback() {
      console.info("[auth] callback origin", window.location.origin);
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
      const errorDescription =
        searchParams.get("error_description") || searchParams.get("error");

      if (errorDescription) {
        console.error("[auth] callback error", errorDescription);
        setStatus("error");
        setMessage(errorDescription);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth] exchangeCodeForSession error", error);
          setStatus("error");
          setMessage(error.message ?? "Falha ao finalizar confirmacao.");
          return;
        }
        setStatus("success");
        setMessage("Conta confirmada. Redirecionando...");
        setTimeout(() => navigate("/", { replace: true }), 800);
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error("[auth] setSession error", error);
          setStatus("error");
          setMessage(error.message ?? "Falha ao iniciar sessao.");
          return;
        }
        setStatus("success");
        setMessage("Sessao iniciada. Redirecionando...");
        setTimeout(() => navigate("/", { replace: true }), 800);
        return;
      }

      setStatus("error");
      setMessage("Link de confirmacao invalido ou expirado.");
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-4">
      <Card className="w-full max-w-md shadow-card border-border text-center">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {status === "loading"
              ? "Confirmando conta"
              : status === "success"
              ? "Tudo certo"
              : "Nao foi possivel confirmar"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/login")}>
              Ir para o login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

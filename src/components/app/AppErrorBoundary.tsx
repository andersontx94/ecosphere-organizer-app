import React from "react";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export default class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Erro inesperado ao carregar a aplicação.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[app] render error", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
          <h1 className="text-lg font-semibold text-foreground">
            Opa, algo deu errado
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nao foi possivel carregar esta tela. Tente recarregar a pagina.
          </p>
          <p className="mt-3 text-xs text-muted-foreground break-words">
            Detalhe: {this.state.message}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}

type AuthRedirectMeta = {
  origin: string;
  redirectTo: string;
};

export function getAuthRedirectPath(): string {
  return "/auth/callback";
}

export function getAuthRedirectMeta(): AuthRedirectMeta {
  const origin = window.location.origin;
  const redirectTo = `${origin}${getAuthRedirectPath()}`;
  return { origin, redirectTo };
}

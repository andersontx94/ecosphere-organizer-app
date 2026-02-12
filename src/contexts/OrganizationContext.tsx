import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ensureDefaultProcessTypes } from "@/lib/processTypes";

type Organization = {
  id: string;
  name: string;
  slug: string | null;
  owner_id?: string | null;
};

type OrganizationContextType = {
  organizations: Organization[];
  activeOrganization: Organization | null;
  activeOrganizationId: string | null;
  loading: boolean;
  setActiveOrganization: (orgId: string) => Promise<void>;
  reloadOrganizations: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] =
    useState<Organization | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const storageKey = "active_org_id";

  const loadOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setActiveOrganizationState(null);
      setActiveOrganizationId(null);
      localStorage.removeItem(storageKey);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug, owner_id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load organizations:", error);
      setOrganizations([]);
      setActiveOrganizationState(null);
      setActiveOrganizationId(null);
      localStorage.removeItem(storageKey);
      setLoading(false);
      return;
    }

    const orgs = (data as Organization[]) ?? [];
    setOrganizations(orgs);

    if (orgs.length === 0) {
      setActiveOrganizationState(null);
      setActiveOrganizationId(null);
      localStorage.removeItem(storageKey);
      setLoading(false);
      return;
    }

    const storedId = localStorage.getItem(storageKey);
    const profileId = profile?.active_organization_id ?? null;
    const storedValid = storedId && orgs.some((o) => o.id === storedId);
    const profileValid = profileId && orgs.some((o) => o.id === profileId);
    const activeId = (profileValid ? profileId : null) ?? (storedValid ? storedId : null) ?? orgs[0].id;
    const active = orgs.find((o) => o.id === activeId) ?? orgs[0];

    setActiveOrganizationState(active);
    setActiveOrganizationId(active?.id ?? null);
    if (active?.id) {
      localStorage.setItem(storageKey, active.id);
      if (profile?.active_organization_id !== active.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ active_organization_id: active.id })
          .eq("user_id", user.id);
        if (profileError) {
          console.error("Failed to sync active organization:", profileError);
        } else {
          await refreshProfile();
        }
      }
    }
    setLoading(false);
  }, [user, profile, refreshProfile]);

  useEffect(() => {
    async function run() {
      await loadOrganizations();
    }
    run();
  }, [loadOrganizations]);

  useEffect(() => {
    if (!activeOrganization || !user) return;
    ensureDefaultProcessTypes(activeOrganization.id, user.id).catch((err) => {
      console.error("Failed to ensure default process types:", err);
    });
  }, [activeOrganization, user]);

  async function setActiveOrganization(orgId: string) {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ active_organization_id: orgId })
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to set active organization:", error);
      localStorage.setItem(storageKey, orgId);
      setActiveOrganizationId(orgId);
      setActiveOrganizationState(
        organizations.find((org) => org.id === orgId) ?? null
      );
      return;
    }

    await refreshProfile();
    localStorage.setItem(storageKey, orgId);
    setActiveOrganizationId(orgId);
    setActiveOrganizationState(
      organizations.find((org) => org.id === orgId) ?? null
    );
  }

  const value = useMemo(
    () => ({
      organizations,
      activeOrganization,
      activeOrganizationId,
      loading,
      setActiveOrganization,
      reloadOrganizations: loadOrganizations,
    }),
    [organizations, activeOrganization, activeOrganizationId, loading, loadOrganizations]
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx)
    throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
}

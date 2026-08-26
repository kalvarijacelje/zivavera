import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (s: Session | null) => {
    if (!s?.user) {
      setProfile(null);
      setFullName("");
      return;
    }
    const user = s.user;
    const email = (user.email || "").toLowerCase().trim();
    const metaName = user.user_metadata?.full_name || user.user_metadata?.name || "";

    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, name, avatar_url, role")
        .or(`email.ilike.${email},id.eq.${user.id},auth_user_id.eq.${user.id}`)
        .maybeSingle();

      setProfile(data || null);
      let name = data?.full_name || data?.name || metaName || email.split("@")[0] || "Uporabnik";
      if (name.includes(".") && !name.includes(" ")) {
        name = name.split(".").map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
      }
      setFullName(name);
    } catch {
      let name = metaName || email.split("@")[0] || "Uporabnik";
      if (name.includes(".") && !name.includes(" ")) {
        name = name.split(".").map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
      }
      setFullName(name);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      fetchProfile(s).then(() => setLoading(false));
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      fetchProfile(data.session).then(() => setLoading(false));
    });
    return () => subscription.unsubscribe();
  }, []);

  return { session, profile, fullName, loading };
}

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId]);
  return isAdmin;
}

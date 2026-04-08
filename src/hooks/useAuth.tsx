import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { migrateLegacyKeys, clearLegacyKeys, clearScopedStorage } from "@/lib/scopedStorage";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        try { migrateLegacyKeys(session.user.id); } catch { /* ignore */ }
        window.dispatchEvent(new Event("auth-changed"));
      }

      if (event === "SIGNED_OUT") {
        try { clearLegacyKeys(); } catch { /* ignore */ }
        window.dispatchEvent(new Event("auth-changed"));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        try { migrateLegacyKeys(session.user.id); } catch { /* ignore */ }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const currentId = user?.id ?? null;
    await supabase.auth.signOut();
    try { clearScopedStorage(currentId); } catch { /* ignore */ }
    try { clearLegacyKeys(); } catch { /* ignore */ }
  };

  return { user, loading, signOut };
};

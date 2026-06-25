import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "pv_session_id";
const SEEN_KEY = "pv_last_path";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    // Dedupe rapid duplicate fires (StrictMode / re-renders)
    if (sessionStorage.getItem(SEEN_KEY) === path) return;
    sessionStorage.setItem(SEEN_KEY, path);

    supabase
      .from("page_views")
      .insert({
        path,
        referrer: document.referrer || null,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
      })
      .then(() => {});
  }, [location.pathname]);
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  const key = "na_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function useAnalytics() {
  const location = useLocation();
  useEffect(() => {
    // Avoid tracking the admin dashboard itself
    if (location.pathname.startsWith("/admin")) return;
    const payload = {
      path: location.pathname,
      referrer: document.referrer || null,
      session_id: getSessionId(),
      user_agent: navigator.userAgent.slice(0, 300),
    };
    supabase.from("page_views").insert(payload).then(({ error }) => {
      if (error) console.warn("analytics insert failed", error.message);
    });
  }, [location.pathname]);
}

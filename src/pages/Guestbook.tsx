import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Reveal } from "@/components/Section";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

type Entry = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
};

export default function Guestbook() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id, user_id, display_name, avatar_url, message, created_at")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setEntries(data as Entry[]);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel("guestbook")
      .on("postgres_changes", { event: "*", schema: "public", table: "guestbook_entries" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function signIn() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    });
    if (result.error) toast.error("Sign-in failed");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function post() {
    const trimmed = message.trim();
    if (!user || !trimmed) return;
    if (trimmed.length > 140) {
      toast.error("Max 140 characters");
      return;
    }
    setPosting(true);
    const display_name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous") as string;
    const avatar_url = (user.user_metadata?.avatar_url || null) as string | null;
    const { error } = await supabase.from("guestbook_entries").insert({
      user_id: user.id, display_name, avatar_url, message: trimmed,
    });
    setPosting(false);
    if (error) {
      toast.error("Couldn't post — try again");
      return;
    }
    setMessage("");
    toast.success("Signed!");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("guestbook_entries").delete().eq("id", id);
    if (error) toast.error("Couldn't delete");
    else load();
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <SEO title="Guestbook" description="Leave a note on Naman Agarwal's portfolio guestbook." path="/#/guestbook" />
      <Reveal>
        <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Guestbook</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="mt-5 font-light text-[#475569]">
          Drop a note. Say hi. Roast my code. (Max 140 chars.)
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 border border-[#1A1A1A]/15 p-5">
          {loading ? (
            <p className="text-sm font-light text-[#475569]">Loading…</p>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                )}
                <div className="text-sm font-light">
                  Signed in as <span className="font-medium">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <button onClick={signOut} className="ml-auto text-xs uppercase tracking-widest font-light text-[#475569] hover:text-[#1A1A1A]">
                  Sign out
                </button>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={140}
                rows={2}
                placeholder="Leave your mark…"
                className="w-full bg-transparent border-b border-[#475569]/30 py-2 text-sm font-light focus:outline-none focus:border-[#1A1A1A] resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-[#475569]">{message.length}/140</span>
                <button
                  onClick={post}
                  disabled={posting || !message.trim()}
                  className="border border-[#1A1A1A] px-5 py-2 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F7F5F2] transition-colors disabled:opacity-40"
                >
                  {posting ? "Signing…" : "Sign"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="border border-[#1A1A1A] px-5 py-3 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F7F5F2] transition-colors"
            >
              Sign in with Google to leave a note
            </button>
          )}
        </div>
      </Reveal>

      <ul className="mt-12 space-y-6">
        <AnimatePresence>
          {entries.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
              className="border-b border-[#475569]/15 pb-5"
            >
              <div className="flex items-start gap-3">
                {e.avatar_url ? (
                  <img src={e.avatar_url} alt="" className="w-8 h-8 rounded-full mt-1" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A]/10 mt-1" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-light text-[#475569]">
                    <span>{e.display_name}</span>
                    <span>·</span>
                    <span>{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 font-light text-[#1A1A1A]">{e.message}</p>
                </div>
                {user?.id === e.user_id && (
                  <button onClick={() => remove(e.id)} className="text-[#475569] hover:text-red-600" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <p className="text-sm font-light text-[#475569]">No entries yet. Be the first.</p>
        )}
      </ul>
    </section>
  );
}

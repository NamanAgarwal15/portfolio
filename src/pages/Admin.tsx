import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

type View = {
  id: string;
  path: string;
  referrer: string | null;
  session_id: string;
  created_at: string;
};

export default function Admin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [views, setViews] = useState<View[]>([]);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setMessages((data as Msg[]) || []));
    supabase
      .from("page_views")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000)
      .then(({ data }) => setViews((data as View[]) || []));
  }, [isAdmin, range]);

  const stats = useMemo(() => {
    const sessions = new Set(views.map((v) => v.session_id));
    const byPath = new Map<string, number>();
    const byDay = new Map<string, number>();
    const byRef = new Map<string, number>();
    for (const v of views) {
      byPath.set(v.path, (byPath.get(v.path) || 0) + 1);
      const day = v.created_at.slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
      const ref = v.referrer ? new URL(v.referrer).hostname : "(direct)";
      byRef.set(ref, (byRef.get(ref) || 0) + 1);
    }
    const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topRefs = [...byRef.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const days = [...byDay.entries()].sort();
    const max = Math.max(1, ...days.map((d) => d[1]));
    return { total: views.length, unique: sessions.size, topPaths, topRefs, days, max };
  }, [views]);

  if (loading || isAdmin === null) {
    return <div className="max-w-6xl mx-auto px-6 py-24 text-sm text-[#475569]">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <SEO title="Admin · Naman Agarwal" description="Admin dashboard" noindex />
        <h1 className="text-2xl font-light mb-4">Admin sign-in required</h1>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}${window.location.pathname}#/admin` },
            })
          }
          className="px-5 py-2 border border-[#1A1A1A] text-sm hover:bg-[#1A1A1A] hover:text-white transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-light mb-2">Not authorized</h1>
        <p className="text-sm text-[#475569]">You're signed in as {user.email}, but you're not an admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <SEO title="Admin · Naman Agarwal" description="Admin dashboard" noindex />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-light mt-1">Admin</h1>
        </div>
        <div className="flex gap-2 text-xs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d as 7 | 30 | 90)}
              className={`px-3 py-1.5 border ${
                range === d ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#475569]/30 text-[#475569]"
              }`}
            >
              Last {d}d
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Page views" value={stats.total} />
        <Stat label="Unique sessions" value={stats.unique} />
        <Stat label="Messages" value={messages.length} />
        <Stat
          label="Avg views / day"
          value={stats.days.length ? Math.round(stats.total / stats.days.length) : 0}
        />
      </div>

      {/* Chart */}
      <section className="mb-12 border border-[#475569]/15 p-6">
        <h2 className="text-sm uppercase tracking-[0.2em] text-[#475569] mb-6">Views per day</h2>
        {stats.days.length === 0 ? (
          <p className="text-sm text-[#475569]">No data yet.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {stats.days.map(([day, count]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] text-[#475569] opacity-0 group-hover:opacity-100 transition">
                  {count}
                </div>
                <div
                  className="w-full bg-[#1A1A1A] hover:bg-[#475569] transition-colors"
                  style={{ height: `${(count / stats.max) * 100}%` }}
                  title={`${day}: ${count}`}
                />
                <div className="text-[9px] text-[#475569] rotate-45 origin-left whitespace-nowrap mt-2">
                  {day.slice(5)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Table title="Top pages" rows={stats.topPaths} />
        <Table title="Top referrers" rows={stats.topRefs} />
      </div>

      {/* Messages */}
      <section>
        <h2 className="text-sm uppercase tracking-[0.2em] text-[#475569] mb-4">
          Contact messages ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-[#475569]">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-[#475569]/15 border border-[#475569]/15">
            {messages.map((m) => (
              <li key={m.id} className="p-5 hover:bg-[#1A1A1A]/[0.02]">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <div>
                    <span className="font-medium">{m.name}</span>{" "}
                    <a href={`mailto:${m.email}`} className="text-sm text-[#475569] underline">
                      {m.email}
                    </a>
                  </div>
                  <time className="text-xs text-[#475569]">
                    {new Date(m.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="text-sm font-medium mb-1">{m.subject}</p>
                <p className="text-sm text-[#1A1A1A]/80 whitespace-pre-wrap">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#475569]/15 p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-[#475569]">{label}</div>
      <div className="text-3xl font-light mt-2">{value.toLocaleString()}</div>
    </div>
  );
}

function Table({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="border border-[#475569]/15 p-6">
      <h3 className="text-sm uppercase tracking-[0.2em] text-[#475569] mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-[#475569]">—</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <li key={k} className="flex justify-between gap-4">
              <span className="truncate">{k}</span>
              <span className="text-[#475569] tabular-nums">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Summary = {
  days: number;
  totals: { views: number; sessions: number; messages: number; guestbook: number; chats: number; chatSessions: number };
  topPaths: { path: string; count: number }[];
  topReferrers: { ref: string; count: number }[];
  daily: { day: string; views: number; sessions: number }[];
  hourly: { hour: number; count: number }[];
  devices: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
  recentViews: { path: string; referrer: string | null; session_id: string; created_at: string; user_agent: string | null }[];
  messages: { id: string; name: string; email: string; subject: string; message: string; created_at: string }[];
  guestbook: { id: string; display_name: string; email: string | null; message: string; created_at: string; hidden: boolean }[];
  chats: { id: string; session_id: string | null; prompt: string; response: string | null; message_count: number; referrer: string | null; user_agent: string | null; created_at: string }[];
  chatStats: { avgPromptLen: number; avgResponseLen: number };
};

const PASS_KEY = "stats_passcode";

async function fetchSummary(passcode: string, days: number): Promise<Summary> {
  const { data, error } = await supabase.functions.invoke(`analytics-summary?days=${days}`, {
    method: "POST",
    headers: { "x-passcode": passcode },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as Summary;
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 bg-[#1A1A1A]/10 w-full overflow-hidden">
      <div className="h-full bg-[#1A1A1A]" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Stats() {
  const [passcode, setPasscode] = useState<string>(() => localStorage.getItem(PASS_KEY) || "");
  const [unlocked, setUnlocked] = useState(false);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(p: string, d: number) {
    setLoading(true);
    setErr(null);
    try {
      const result = await fetchSummary(p, d);
      setData(result);
      setUnlocked(true);
      localStorage.setItem(PASS_KEY, p);
    } catch (e: any) {
      setErr(e.message === "unauthorized" ? "Wrong passcode." : "Couldn't load stats.");
      if (e.message === "unauthorized") {
        localStorage.removeItem(PASS_KEY);
        setUnlocked(false);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (passcode && !unlocked) load(passcode, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (unlocked && passcode) load(passcode, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const maxDaily = useMemo(() => Math.max(1, ...(data?.daily.map((d) => d.views) || [1])), [data]);
  const maxHour = useMemo(() => Math.max(1, ...(data?.hourly.map((d) => d.count) || [1])), [data]);

  if (!unlocked) {
    return (
      <section className="max-w-md mx-auto px-6 py-32">
        <h2 className="text-3xl font-light tracking-tight">Stats</h2>
        <p className="mt-2 text-sm font-light text-[#D97706]">Private dashboard. Enter passcode.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); load(passcode, days); }}
          className="mt-8 space-y-4"
        >
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            autoFocus
            className="w-full bg-transparent border-b border-[#D97706]/40 py-2 text-sm font-light focus:outline-none focus:border-[#1A1A1A]"
          />
          {err && <p className="text-xs text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full border border-[#1A1A1A] px-5 py-2 text-sm font-medium hover:bg-[#1A1A1A] hover:text-[#F5F2EA] transition-colors disabled:opacity-40"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </form>
      </section>
    );
  }

  if (!data) {
    return <section className="max-w-6xl mx-auto px-6 py-20 text-sm font-light text-[#D97706]">Loading…</section>;
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Stats</h2>
          <p className="mt-2 text-sm font-light text-[#D97706]">Live · last {data.days} days</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                days === d ? "border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2EA]" : "border-[#1A1A1A]/30 hover:border-[#1A1A1A]"
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => load(passcode, days)}
            disabled={loading}
            className="text-xs uppercase tracking-widest px-3 py-1.5 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2EA] hover:bg-[#D97706] hover:border-[#D97706] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            title="Pull latest data"
          >
            <span className={loading ? "inline-block animate-spin" : "inline-block"}>↻</span>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
        {[
          { label: "Views", value: data.totals.views },
          { label: "Sessions", value: data.totals.sessions },
          { label: "Messages", value: data.totals.messages },
          { label: "Guestbook", value: data.totals.guestbook },
          { label: "Chats", value: data.totals.chats },
          { label: "Chat Sessions", value: data.totals.chatSessions },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-[#1A1A1A]/15 p-5">
            <div className="text-[10px] uppercase tracking-widest font-light text-[#D97706]">{kpi.label}</div>
            <div className="text-3xl font-light mt-2 tabular-nums">{kpi.value}</div>
          </div>
        ))}
      </div>


      {/* Daily chart */}
      <div className="mt-10 border border-[#1A1A1A]/15 p-5">
        <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Daily views</h3>
        <div className="flex items-end gap-1 mt-5 h-40">
          {data.daily.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className="w-full bg-[#1A1A1A] group-hover:bg-[#D97706] transition-colors"
                style={{ height: `${(d.views / maxDaily) * 100}%`, minHeight: 2 }}
                title={`${d.day}: ${d.views} views, ${d.sessions} sessions`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-light text-[#D97706]">
          <span>{data.daily[0]?.day || ""}</span>
          <span>{data.daily[data.daily.length - 1]?.day || ""}</span>
        </div>
      </div>

      {/* Two-col: pages + referrers */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="border border-[#1A1A1A]/15 p-5">
          <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Top pages</h3>
          <ul className="mt-4 space-y-3">
            {data.topPaths.map((p) => (
              <li key={p.path}>
                <div className="flex justify-between text-sm font-light"><span className="truncate">{p.path}</span><span className="tabular-nums text-[#D97706]">{p.count}</span></div>
                <Bar value={p.count} max={data.topPaths[0]?.count || 1} />
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-[#1A1A1A]/15 p-5">
          <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Top referrers</h3>
          <ul className="mt-4 space-y-3">
            {data.topReferrers.map((r) => (
              <li key={r.ref}>
                <div className="flex justify-between text-sm font-light"><span className="truncate">{r.ref}</span><span className="tabular-nums text-[#D97706]">{r.count}</span></div>
                <Bar value={r.count} max={data.topReferrers[0]?.count || 1} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Devices + Browsers + Hourly */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="border border-[#1A1A1A]/15 p-5">
          <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Devices</h3>
          <ul className="mt-4 space-y-3">
            {data.devices.map((d) => (
              <li key={d.name}>
                <div className="flex justify-between text-sm font-light"><span>{d.name}</span><span className="tabular-nums text-[#D97706]">{d.count}</span></div>
                <Bar value={d.count} max={Math.max(...data.devices.map((x) => x.count), 1)} />
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-[#1A1A1A]/15 p-5">
          <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Browsers</h3>
          <ul className="mt-4 space-y-3">
            {data.browsers.map((b) => (
              <li key={b.name}>
                <div className="flex justify-between text-sm font-light"><span>{b.name}</span><span className="tabular-nums text-[#D97706]">{b.count}</span></div>
                <Bar value={b.count} max={Math.max(...data.browsers.map((x) => x.count), 1)} />
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-[#1A1A1A]/15 p-5">
          <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Hour of day</h3>
          <div className="flex items-end gap-[2px] mt-5 h-28">
            {data.hourly.map((h) => (
              <div key={h.hour} className="flex-1 bg-[#1A1A1A]" style={{ height: `${(h.count / maxHour) * 100}%`, minHeight: 1 }} title={`${h.hour}:00 — ${h.count}`} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-light text-[#D97706]"><span>0</span><span>12</span><span>23</span></div>
        </div>
      </div>

      {/* Messages */}
      <div className="mt-10">
        <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Contact messages ({data.messages.length})</h3>
        <ul className="mt-4 space-y-3">
          {data.messages.length === 0 && <li className="text-sm font-light text-[#D97706]">No messages yet.</li>}
          {data.messages.map((m) => (
            <li key={m.id} className="border border-[#1A1A1A]/15 p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-sm font-medium">{m.name} <span className="text-[#D97706] font-light">· {m.subject}</span></div>
                  <a href={`mailto:${m.email}`} className="text-xs text-[#D97706] hover:text-[#1A1A1A]">{m.email}</a>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-light text-[#D97706] whitespace-nowrap">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm font-light whitespace-pre-wrap">{m.message}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Chatbot logs */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">
            Ask Naman — chats ({data.chats.length})
          </h3>
          <div className="text-[10px] uppercase tracking-widest text-[#D97706]">
            avg prompt {data.chatStats.avgPromptLen} chars · avg reply {data.chatStats.avgResponseLen} chars
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {data.chats.length === 0 && <li className="text-sm font-light text-[#D97706]">No chats yet.</li>}
          {data.chats.map((c) => (
            <li key={c.id} className="border border-[#1A1A1A]/15 p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="text-[10px] uppercase tracking-widest font-light text-[#D97706]">
                  session {c.session_id ? c.session_id.slice(0, 8) : "—"} · turn {c.message_count}
                  {c.referrer && <span> · {c.referrer}</span>}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-light text-[#D97706] whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-widest text-[#D97706]">Prompt</div>
                <p className="text-sm font-light whitespace-pre-wrap mt-1">{c.prompt}</p>
              </div>
              {c.response && (
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#D97706]">Reply</div>
                  <p className="text-sm font-light whitespace-pre-wrap mt-1 text-[#D97706]">{c.response}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>


      {/* Guestbook */}
      <div className="mt-10">
        <h3 className="text-xs uppercase tracking-widest font-light text-[#D97706]">Guestbook entries ({data.guestbook.length})</h3>
        <ul className="mt-4 space-y-3">
          {data.guestbook.length === 0 && <li className="text-sm font-light text-[#D97706]">No entries yet.</li>}
          {data.guestbook.map((g) => (
            <li key={g.id} className="border border-[#1A1A1A]/15 p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-sm font-medium">{g.display_name}{g.hidden && <span className="ml-2 text-[10px] uppercase text-red-600">hidden</span>}</div>
                  {g.email && <span className="text-xs text-[#D97706]">{g.email}</span>}
                </div>
                <span className="text-[10px] uppercase tracking-widest font-light text-[#D97706] whitespace-nowrap">{new Date(g.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm font-light">{g.message}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Raw recent */}
      <details className="mt-10 border border-[#1A1A1A]/15 p-5">
        <summary className="text-xs uppercase tracking-widest font-light text-[#D97706] cursor-pointer">Recent raw views ({data.recentViews.length})</summary>
        <ul className="mt-4 space-y-1 text-xs font-light font-mono">
          {data.recentViews.map((v, i) => (
            <li key={i} className="flex justify-between gap-4 border-b border-[#1A1A1A]/10 py-1">
              <span>{v.path}</span>
              <span className="text-[#D97706] truncate max-w-xs">{v.referrer || "direct"}</span>
              <span className="text-[#D97706] whitespace-nowrap">{new Date(v.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-12 flex justify-end">
        <button
          onClick={() => { localStorage.removeItem(PASS_KEY); setPasscode(""); setUnlocked(false); setData(null); }}
          className="text-xs uppercase tracking-widest text-[#D97706] hover:text-[#1A1A1A]"
        >
          Lock
        </button>
      </div>
    </section>
  );
}

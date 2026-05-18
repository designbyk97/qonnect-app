import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ───────────────────────────────────────────────
const supabase = createClient(
  "https://eozhbqouszbjsewloolg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvemhicW91c3pianNld2xvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjUzNjQsImV4cCI6MjA5NDcwMTM2NH0.yQJ4bGxkDaOlQVZ2AUmIXYgM7d7OeIV4NcAp18Ci0Ek"
);

// ── MOCK FALLBACK DATA ─────────────────────────────────────
const MOCK_POSTS = [
  { id: 1, type: "seek", title: "Projektleiter für Belgien-Projekt gesucht", description: "Suche erfahrenen PM für Remote-Projekt in Brüssel. Kunde hat 8–10 Mitarbeiter, Start Q2.", budget: 4000, duration: "3 Monate", location: "Remote / Brüssel", tags: ["Projektmanagement", "Remote", "Belgien"], author: { name: "Markus K.", trust: 87, verified: true, avatar: "MK" }, time: "vor 12 Min.", replies: 3 },
  { id: 2, type: "offer", title: "Freelance Grafikdesigner – 2 Wochen frei", description: "Spezialisiert auf Corporate Identity & Branding. 8 Jahre Erfahrung, internationale Kunden.", budget: 600, duration: "2 Wochen", location: "Remote", tags: ["Grafikdesign", "Branding", "CI"], author: { name: "Anna K.", trust: 72, verified: true, avatar: "AK" }, time: "vor 28 Min.", replies: 1 },
  { id: 3, type: "seek", title: "2 Azubis Mechatronik bis Sommer", description: "Suche dringend 2 qualifizierte Azubis. Indeed hat nicht geholfen.", budget: 500, duration: "Ausbildung", location: "München", tags: ["Ausbildung", "Mechatronik", "Bayern"], author: { name: "Stefan R.", trust: 61, verified: false, avatar: "SR" }, time: "vor 1 Std.", replies: 0 },
  { id: 4, type: "offer", title: "IT-Recruiter – europäisches Netzwerk", description: "Unsere Agentur vermittelt IT-Fachkräfte europaweit. Schnelle Besetzung.", budget: 1500, duration: "Flexibel", location: "Frankfurt / EU", tags: ["IT", "Recruiting", "Europa"], author: { name: "Thomas M.", trust: 94, verified: true, avatar: "TM" }, time: "vor 2 Std.", replies: 5 },
];

// ── HELPERS ────────────────────────────────────────────────
const Avatar = ({ initials, size = 38, color = "#2a7fff" }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 700, color, flexShrink: 0 }}>
    {initials}
  </div>
);

const Tag = ({ label }) => (
  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#ffffff08", color: "#6b7a9a", border: "1px solid #ffffff10" }}>{label}</span>
);

const TrustBadge = ({ score, verified }) => {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#6b7280";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color }}>
      {verified && <span style={{ background: "#10b981", color: "#fff", borderRadius: "50%", width: 13, height: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>✓</span>}
      Trust {score}
    </span>
  );
};

// ── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [activeTab, setActiveTab] = useState("home");
  const [feedTab, setFeedTab] = useState("seek");
  const [activeChat, setActiveChat] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [postType, setPostType] = useState("seek");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, me: false, text: "Hallo! Ich habe deinen Post gesehen. Budget ca. 4.000€.", time: "09:14" },
    { id: 2, me: true, text: "Klingt interessant! Ich bin remote verfügbar.", time: "09:21" },
    { id: 3, me: false, text: "Perfekt. Morgen um 10 Uhr? Ich schicke dir das Briefing.", time: "09:28" },
  ]);
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "Hallo! Ich bin dein Qonnect KI-Assistent. Ich helfe dir Posts zu optimieren, Matches zu finden und Vertragsvorlagen zu erstellen." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", description: "", budget: "", duration: "", location: "", tags: "" });
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", type: "freelancer" });

  const showToast = (msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Check existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
        setScreen("app");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
        setScreen("app");
      } else {
        setUser(null);
        setProfile(null);
        setScreen("auth");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch posts when feed tab changes
  useEffect(() => {
    if (screen === "app") fetchPosts();
  }, [screen, feedTab]);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(display_name, trust_score, is_verified, account_type)")
      .eq("type", feedTab)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      setPosts(data.map(p => ({
        ...p,
        author: {
          name: p.profiles?.display_name || "Unbekannt",
          trust: p.profiles?.trust_score || 0,
          verified: p.profiles?.is_verified || false,
          avatar: (p.profiles?.display_name || "U").substring(0, 2).toUpperCase()
        }
      })));
    } else {
      setPosts(MOCK_POSTS.filter(p => p.type === feedTab));
    }
  };

  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) { showToast("Bitte alle Felder ausfüllen", "#ef4444"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    if (error) showToast(error.message, "#ef4444");
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!authForm.email || !authForm.password || !authForm.name) { showToast("Bitte alle Felder ausfüllen", "#ef4444"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: authForm.email, password: authForm.password });
    if (error) { showToast(error.message, "#ef4444"); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, account_type: authForm.type, display_name: authForm.name, trust_score: 0, is_verified: false, posts_today: 0 });
      showToast("Account erstellt! Bitte E-Mail bestätigen 📧");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePost = async () => {
    if (!postForm.title || !postForm.description) { showToast("Titel und Beschreibung pflicht", "#ef4444"); return; }
    const postsToday = profile?.posts_today || 0;
    if (postsToday >= 4) { showToast("4 kostenlose Posts erreicht – Stripe Zahlung nötig", "#f59e0b"); return; }
    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id, type: postType, title: postForm.title, description: postForm.description,
      budget: parseFloat(postForm.budget) || null, duration: postForm.duration, location: postForm.location,
      tags: postForm.tags.split(",").map(t => t.trim()).filter(Boolean), status: "active"
    });
    if (error) { showToast(error.message, "#ef4444"); }
    else {
      await supabase.from("profiles").update({ posts_today: postsToday + 1 }).eq("id", user.id);
      setPostForm({ title: "", description: "", budget: "", duration: "", location: "", tags: "" });
      setShowPostForm(false);
      fetchPosts();
      showToast("Post veröffentlicht! ✓");
    }
    setLoading(false);
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput;
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "Du bist ein hilfreicher KI-Assistent für die B2B-Plattform Qonnect. Du hilfst Nutzern: 1) Posts zu optimieren, 2) Matches zu finden, 3) Vertragsvorlagen zu erstellen, 4) DSGVO-Fragen zu beantworten. Antworte auf Deutsch, kurz und professionell.",
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await response.json();
      setAiMessages(prev => [...prev, { role: "assistant", text: data.content?.[0]?.text || "API Key noch nicht konfiguriert." }]);
    } catch {
      setAiMessages(prev => [...prev, { role: "assistant", text: "Verbindungsfehler. Anthropic API Key als Environment Variable setzen." }]);
    }
    setAiLoading(false);
  };

  const sendChatMessage = () => {
    if (!msgInput.trim()) return;
    setChatMessages(prev => [...prev, { id: prev.length + 1, me: true, text: msgInput, time: "Jetzt" }]);
    setMsgInput("");
  };

  // ── STYLES ──────────────────────────────────────────────
  const s = {
    wrap: { background: "#07090f", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "20px 16px 40px" },
    phone: { width: 375, background: "#07090f", borderRadius: 40, border: "2px solid #1a2540", overflow: "hidden", boxShadow: "0 40px 100px #000a", display: "flex", flexDirection: "column", height: 760, position: "relative" },
    topBar: { padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a2540", background: "rgba(7,9,15,0.95)", backdropFilter: "blur(10px)", flexShrink: 0 },
    screen: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", scrollbarWidth: "none" },
    bottomNav: { height: 68, background: "rgba(7,9,15,0.97)", borderTop: "1px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 },
    card: { margin: "0 13px 10px", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 14, padding: 14, flexShrink: 0 },
    btn: (bg = "#2a7fff") => ({ padding: "8px 16px", background: bg, color: "#fff", border: "none", borderRadius: 9, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }),
    input: { width: "100%", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 10, padding: "10px 13px", fontFamily: "inherit", fontSize: 13, color: "#eaf2ff", outline: "none", boxSizing: "border-box" },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a5a7a", marginBottom: 6, display: "block" },
    logo: { fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1.05rem", color: "#eaf2ff" },
  };

  // ── AUTH SCREEN ──────────────────────────────────────────
  if (screen === "auth") return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 22px 24px", display: "flex", flexDirection: "column", scrollbarWidth: "none" }}>
          <div style={{ textAlign: "center", marginBottom: 28, marginTop: 16 }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2rem", color: "#eaf2ff" }}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginTop: 4, letterSpacing: "0.15em", textTransform: "uppercase" }}>Connect · Solve · Grow</div>
          </div>

          <div style={{ display: "flex", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 11, padding: 3, marginBottom: 22 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setAuthMode(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", background: authMode === m ? "#2a7fff" : "none", color: authMode === m ? "#fff" : "#4a5a7a" }}>
                {m === "login" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>

          {authMode === "register" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Name</label>
                <input style={s.input} placeholder="Vollständiger Name" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Account-Typ</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ k: "freelancer", l: "👤 Freelancer" }, { k: "company", l: "🏢 Unternehmen" }].map(({ k, l }) => (
                    <button key={k} onClick={() => setAuthForm(p => ({ ...p, type: k }))} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${authForm.type === k ? "#2a7fff" : "#1a2540"}`, background: authForm.type === k ? "#2a7fff18" : "#0d1120", color: authForm.type === k ? "#2a7fff" : "#4a5a7a", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>E-Mail</label>
            <input style={s.input} type="email" placeholder="name@firma.de" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Passwort</label>
            <input style={s.input} type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} />
          </div>

          <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 14, fontSize: 14, borderRadius: 12, marginBottom: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Laden..." : authMode === "login" ? "Anmelden" : "Account erstellen"}
          </button>

          <div style={{ background: "#2a7fff10", border: "1px solid #2a7fff22", borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "#6a9adf", lineHeight: 1.6 }}>
            🔒 DSGVO-konform · Nur für Business · 18+
          </div>
        </div>
        {toast && <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "9px 18px", borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", zIndex: 200 }}>{toast.msg}</div>}
      </div>
    </div>
  );

  // ── HOME SCREEN ──────────────────────────────────────────
  const renderHome = () => (
    <>
      <div style={s.topBar}>
        <div style={s.logo}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAI(true)} style={{ width: 34, height: 34, borderRadius: 9, background: "#2a7fff18", border: "1px solid #2a7fff44", color: "#2a7fff", fontSize: 15, cursor: "pointer" }}>✦</button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#0d1120", border: "1px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: 15 }}>
            🔔<div style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, background: "#ef4444", borderRadius: "50%" }}></div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", margin: "12px 13px 0", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 11, padding: 3, flexShrink: 0 }}>
        {[{ k: "seek", l: "🔍 Ich suche" }, { k: "offer", l: "💡 Ich biete" }].map(({ k, l }) => (
          <button key={k} onClick={() => setFeedTab(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", background: feedTab === k ? "#2a7fff" : "none", color: feedTab === k ? "#fff" : "#4a5a7a" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 7, padding: "10px 13px", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
        {["Alle", "Design", "IT", "Finanzen", "Logistik", "Personal", "Marketing"].map((f, i) => (
          <span key={f} style={{ padding: "4px 11px", borderRadius: 100, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", background: i === 0 ? "#2a7fff22" : "#0d1120", color: i === 0 ? "#2a7fff" : "#4a5a7a", border: `1px solid ${i === 0 ? "#2a7fff44" : "#1a2540"}`, flexShrink: 0 }}>{f}</span>
        ))}
      </div>

      <div style={{ padding: "0 0 10px" }}>
        {posts.map((post, idx) => (
          <div key={post.id || idx} style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <Avatar initials={post.author?.avatar || "??"} size={36} color={post.author?.verified ? "#10b981" : "#2a7fff"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#eaf2ff" }}>{post.author?.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 1 }}>
                  <TrustBadge score={post.author?.trust || 0} verified={post.author?.verified} />
                  <span style={{ fontSize: 10, color: "#4a5a7a" }}>{post.time || "gerade"}</span>
                </div>
              </div>
              <span style={{ padding: "3px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: post.type === "seek" ? "#2a7fff18" : "#00c8ff15", color: post.type === "seek" ? "#2a7fff" : "#00c8ff", border: `1px solid ${post.type === "seek" ? "#2a7fff44" : "#00c8ff33"}` }}>
                {post.type === "seek" ? "Suche" : "Biete"}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#eaf2ff", marginBottom: 6 }}>{post.title}</div>
            <div style={{ fontSize: 12, color: "#8090aa", lineHeight: 1.5, marginBottom: 10 }}>{post.description}</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {post.budget && <span style={{ fontSize: 11, color: "#10b981" }}>💰 €{post.budget}</span>}
              {post.duration && <span style={{ fontSize: 11, color: "#4a5a7a" }}>⏱ {post.duration}</span>}
              {post.location && <span style={{ fontSize: 11, color: "#4a5a7a" }}>📍 {post.location}</span>}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {(post.tags || []).map(t => <Tag key={t} label={t} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#4a5a7a" }}>{post.replies || 0} Antworten</span>
              <button onClick={() => { setActiveTab("chat"); setActiveChat({ name: post.author?.name, avatar: post.author?.avatar }); }} style={s.btn()}>Connecten →</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ── CHAT SCREEN ──────────────────────────────────────────
  const renderChat = () => (
    <>
      <div style={s.topBar}>
        {activeChat ? (
          <>
            <button onClick={() => setActiveChat(null)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 18, cursor: "pointer" }}>←</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar initials={activeChat.avatar || "??"} size={30} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{activeChat.name}</div>
                <div style={{ fontSize: 10, color: "#10b981" }}>● Online</div>
              </div>
            </div>
            <div></div>
          </>
        ) : (
          <><div style={s.logo}><span style={{ color: "#2a7fff" }}>q</span>onnect</div><span style={{ fontSize: 13, fontWeight: 700 }}>Nachrichten</span><div></div></>
        )}
      </div>

      {!activeChat ? (
        <div style={{ flex: 1 }}>
          {[{ id: 1, name: "Markus K.", avatar: "MK", online: true, unread: 2, preview: "Perfekt. Morgen um 10 Uhr?", time: "09:28" },
            { id: 2, name: "Anna K.", avatar: "AK", online: false, unread: 0, preview: "Super, ich schau mir das an!", time: "Gestern" }
          ].map(chat => (
            <div key={chat.id} onClick={() => setActiveChat(chat)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", borderBottom: "1px solid #ffffff05", cursor: "pointer", background: chat.unread ? "#2a7fff05" : "none" }}>
              <div style={{ position: "relative" }}>
                <Avatar initials={chat.avatar} size={42} />
                {chat.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, background: "#10b981", borderRadius: "50%", border: "2px solid #07090f" }}></div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{chat.name}</div>
                <div style={{ fontSize: 12, color: "#4a5a7a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.preview}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 10, color: "#4a5a7a" }}>{chat.time}</span>
                {chat.unread > 0 && <span style={{ background: "#2a7fff", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100 }}>{chat.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8, scrollbarWidth: "none" }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.me ? "flex-end" : "flex-start" }}>
                <div>
                  <div style={{ maxWidth: 220, padding: "9px 12px", borderRadius: 12, fontSize: 12, lineHeight: 1.5, background: msg.me ? "#2a7fff22" : "#0d1120", border: `1px solid ${msg.me ? "#2a7fff33" : "#1a2540"}`, color: msg.me ? "#c8dcf8" : "#b0c4de", borderBottomRightRadius: msg.me ? 3 : 12, borderBottomLeftRadius: msg.me ? 12 : 3 }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: "#4a5a7a", marginTop: 3, textAlign: msg.me ? "right" : "left" }}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", display: "flex", gap: 8, borderTop: "1px solid #1a2540", flexShrink: 0 }}>
            <input style={{ ...s.input, flex: 1 }} placeholder="Nachricht..." value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage()} />
            <button onClick={sendChatMessage} style={{ ...s.btn(), padding: "0 14px" }}>→</button>
          </div>
        </>
      )}
    </>
  );

  // ── PROFILE SCREEN ───────────────────────────────────────
  const renderProfile = () => (
    <>
      <div style={s.topBar}>
        <div style={s.logo}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
        <button onClick={handleLogout} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Abmelden</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        <div style={{ height: 90, background: "linear-gradient(135deg, #0d1a35, #0d2040)", position: "relative" }}>
          <div style={{ position: "absolute", bottom: -20, left: 18 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "linear-gradient(135deg, #2a7fff, #00c8ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", border: "3px solid #07090f" }}>
              {(profile?.display_name || user?.email || "U").substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ padding: "28px 18px 20px" }}>
          <div style={{ fontSize: "1rem", fontFamily: "'Orbitron', monospace", fontWeight: 900, marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
            {profile?.display_name || user?.email}
            {profile?.is_verified && <span style={{ background: "#10b981", color: "#fff", borderRadius: "50%", width: 15, height: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</span>}
          </div>
          <div style={{ fontSize: 12, color: "#4a5a7a", marginBottom: 16 }}>
            {profile?.account_type === "company" ? "🏢 Unternehmen" : "👤 Freelancer"} · {user?.email}
          </div>

          <div style={{ display: "flex", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 11, overflow: "hidden", marginBottom: 16 }}>
            {[["Trust", profile?.trust_score || 0], ["Projekte", profile?.completed_projects || 0], ["Bewertung", `${profile?.rating_avg || 0}★`]].map(([l, v], i) => (
              <div key={l} style={{ flex: 1, padding: "11px 6px", textAlign: "center", borderRight: i < 2 ? "1px solid #1a2540" : "none" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, color: "#00c8ff" }}>{v}</div>
                <div style={{ fontSize: 10, color: "#4a5a7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#10b98112", border: "1px solid #10b98133", borderRadius: 11, padding: 12, marginBottom: 14, fontSize: 11, color: "#6ee7b7", lineHeight: 1.6 }}>
            🛡️ ✓ E-Mail verifiziert · LinkedIn verknüpfen für +30 Trust<br />
            <span style={{ color: "#f59e0b" }}>⚡ Ausweis-Check: 29€ → Verifiziertes Badge</span>
          </div>

          <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 11, padding: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Posts heute</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= (profile?.posts_today || 0) ? "#2a7fff" : "#1a2540" }}></div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#4a5a7a" }}>{profile?.posts_today || 0}/4 kostenlos · Ab Post 5: Stripe Zahlung</div>
          </div>

          <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 11, padding: 12 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Provisions-Tracking</div>
            {[["Ausstehend", "€0", "#f59e0b"], ["Ausgezahlt", "€0", "#10b981"], ["Aktive Matches", "0", "#2a7fff"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#4a5a7a" }}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ── POST FORM ────────────────────────────────────────────
  const renderPostForm = () => (
    <div style={{ position: "absolute", inset: 0, background: "#07090f", zIndex: 50, display: "flex", flexDirection: "column" }}>
      <div style={{ ...s.topBar, zIndex: 60 }}>
        <button onClick={() => setShowPostForm(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 18, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Post erstellen</span>
        <div></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 20px", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[{ k: "seek", l: "🔍 Ich suche" }, { k: "offer", l: "💡 Ich biete" }].map(({ k, l }) => (
            <button key={k} onClick={() => setPostType(k)} style={{ flex: 1, padding: "11px 8px", borderRadius: 11, border: `2px solid ${postType === k ? "#2a7fff" : "#1a2540"}`, background: postType === k ? "#2a7fff15" : "#0d1120", color: postType === k ? "#2a7fff" : "#4a5a7a", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b33", borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "#fbbf24", marginBottom: 14 }}>
          ⚠️ Nur business-relevante Posts. KI prüft Qualität. Professioneller Ton Pflicht.
        </div>
        {[
          { k: "title", l: "Titel", p: "z.B. Projektleiter für Belgien-Projekt gesucht" },
          { k: "description", l: "Beschreibung", p: "Was genau brauchst du?", ta: true },
          { k: "budget", l: "Budget (€)", p: "z.B. 4000" },
          { k: "duration", l: "Laufzeit", p: "z.B. 3 Monate" },
          { k: "location", l: "Ort / Remote", p: "z.B. Remote, Berlin" },
          { k: "tags", l: "Tags (kommagetrennt)", p: "z.B. Design, Remote" },
        ].map(({ k, l, p, ta }) => (
          <div key={k} style={{ marginBottom: 13 }}>
            <label style={s.label}>{l}</label>
            {ta
              ? <textarea style={{ ...s.input, height: 80, resize: "none", lineHeight: 1.5 }} placeholder={p} value={postForm[k]} onChange={e => setPostForm(prev => ({ ...prev, [k]: e.target.value }))} />
              : <input style={s.input} placeholder={p} value={postForm[k]} onChange={e => setPostForm(prev => ({ ...prev, [k]: e.target.value }))} />
            }
          </div>
        ))}
        <button onClick={handlePost} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 14, fontSize: 14, borderRadius: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Wird veröffentlicht..." : "Post veröffentlichen ✓"}
        </button>
      </div>
    </div>
  );

  // ── AI SCREEN ────────────────────────────────────────────
  const renderAI = () => (
    <div style={{ position: "absolute", inset: 0, background: "#07090f", zIndex: 50, display: "flex", flexDirection: "column" }}>
      <div style={{ ...s.topBar, zIndex: 60 }}>
        <button onClick={() => setShowAI(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 18, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 700 }}>✦ KI-Assistent</span>
        <div></div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 14px 6px", flexWrap: "wrap", flexShrink: 0 }}>
        {["Post optimieren", "Match finden", "Vertrag erstellen", "DSGVO Frage"].map(q => (
          <button key={q} onClick={() => setAiInput(q)} style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "#2a7fff18", color: "#2a7fff", border: "1px solid #2a7fff33", cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8, scrollbarWidth: "none" }}>
        {aiMessages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: 260, padding: "10px 13px", borderRadius: 12, fontSize: 12, lineHeight: 1.6, background: msg.role === "user" ? "#2a7fff22" : "#0d1120", border: `1px solid ${msg.role === "user" ? "#2a7fff33" : "#1a2540"}`, color: msg.role === "user" ? "#c8dcf8" : "#b0c4de", borderBottomRightRadius: msg.role === "user" ? 3 : 12, borderBottomLeftRadius: msg.role === "user" ? 12 : 3 }}>
              {msg.role === "assistant" && <div style={{ fontSize: 10, color: "#2a7fff", fontWeight: 700, marginBottom: 4 }}>✦ KI-Assistent</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {aiLoading && <div style={{ display: "flex", gap: 4, padding: 8 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#2a7fff", opacity: 0.6 }}></div>)}</div>}
      </div>
      <div style={{ padding: "10px 14px", display: "flex", gap: 8, borderTop: "1px solid #1a2540", flexShrink: 0 }}>
        <input style={{ ...s.input, flex: 1 }} placeholder="Frage stellen..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAiMessage()} />
        <button onClick={sendAiMessage} style={{ ...s.btn(), padding: "0 14px", opacity: aiLoading ? 0.5 : 1 }}>→</button>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div style={s.wrap}>
      <div style={s.phone}>
        <div style={{ height: 38, padding: "10px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>9:41</span>
          <span style={{ fontSize: 10 }}>●●● WiFi 100%</span>
        </div>

        <div style={s.screen}>
          {showPostForm && renderPostForm()}
          {showAI && renderAI()}
          {!showPostForm && !showAI && activeTab === "home" && renderHome()}
          {!showPostForm && !showAI && activeTab === "chat" && renderChat()}
          {!showPostForm && !showAI && activeTab === "profile" && renderProfile()}
        </div>

        {!showPostForm && !showAI && (
          <div style={s.bottomNav}>
            {[{ k: "home", icon: "🏠", label: "Feed" }, { k: "chat", icon: "💬", label: "Chats" }].map(({ k, icon, label }) => (
              <button key={k} onClick={() => setActiveTab(k)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "7px 14px", borderRadius: 11, background: activeTab === k ? "#2a7fff15" : "none", border: "none", fontFamily: "inherit" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === k ? "#2a7fff" : "#4a5a7a" }}>{label}</span>
              </button>
            ))}
            <button onClick={() => setShowPostForm(true)} style={{ width: 46, height: 46, background: "#2a7fff", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none", boxShadow: "0 4px 20px #2a7fff44", fontSize: 22 }}>+</button>
            {[{ k: "offer", icon: "💡", label: "Anbieten" }, { k: "profile", icon: "👤", label: "Profil" }].map(({ k, icon, label }) => (
              <button key={k} onClick={() => setActiveTab(k === "offer" ? "home" : k)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "7px 14px", borderRadius: 11, background: "none", border: "none", fontFamily: "inherit" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#4a5a7a" }}>{label}</span>
              </button>
            ))}
          </div>
        )}

        {toast && <div style={{ position: "absolute", bottom: 85, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "9px 18px", borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", zIndex: 200, boxShadow: "0 4px 20px #0008" }}>{toast.msg}</div>}
      </div>
    </div>
  );
}


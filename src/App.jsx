import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eozhbqouszbjsewloolg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvemhicW91c3pianNld2xvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjUzNjQsImV4cCI6MjA5NDcwMTM2NH0.yQJ4bGxkDaOlQVZ2AUmIXYgM7d7OeIV4NcAp18Ci0Ek"
);

const SUPABASE_URL = "https://eozhbqouszbjsewloolg.supabase.co";
const CATEGORIES = ["Alle", "Design", "IT", "Finanzen", "Logistik", "Personal", "Marketing", "Beratung", "Recht"];

const Avatar = ({ url, initials, size = 38, color = "#2a7fff" }) =>
  url ? <img src={url} style={{ width: size, height: size, borderRadius: size * 0.28, objectFit: "cover", flexShrink: 0 }} />
      : <div style={{ width: size, height: size, borderRadius: size * 0.28, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color, flexShrink: 0 }}>
          {(initials || "?").substring(0, 2).toUpperCase()}
        </div>;

const Tag = ({ label }) => (
  <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#ffffff08", color: "#6b7a9a", border: "1px solid #ffffff10" }}>{label}</span>
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

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [onboardingForm, setOnboardingForm] = useState({ name: "", type: "freelancer" });
  const [authMode, setAuthMode] = useState("login");
  const [activeTab, setActiveTab] = useState("home");
  const [feedTab, setFeedTab] = useState("seek");
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [postType, setPostType] = useState("seek");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [ownPosts, setOwnPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({ activeNow: 0, totalMembers: 0, postsToday: 0 });
  const [postForm, setPostForm] = useState({ title: "", description: "", budget: "", duration: "", location: "", tags: "" });
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", type: "freelancer" });
  const [editForm, setEditForm] = useState({ bio: "", linkedin_url: "", skills: "", location: "" });
  const messagesEndRef = useRef(null);
  const realtimeRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const showToast = (msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
      else { setUser(null); setProfile(null); setScreen("auth"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (screen === "app") { fetchPosts(); fetchStats(); } }, [screen, feedTab, activeCategory]);
  useEffect(() => { if (screen === "app" && activeTab === "chat" && !activeChat) fetchChats(); }, [screen, activeTab, activeChat]);
  useEffect(() => { if (screen === "app" && user) fetchUnreadCount(); }, [screen, user, activeChat]);
  useEffect(() => { if (screen === "app" && activeTab === "profile" && user) fetchOwnPosts(); }, [screen, activeTab, user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data && data.display_name) {
      setProfile(data);
      setEditForm({ bio: data.bio || "", linkedin_url: data.linkedin_url || "", skills: (data.skills || []).join(", "), location: data.location || "" });
      setScreen("app");
    } else {
      // No profile yet - show onboarding
      setScreen("onboarding");
    }
  };

  const fetchOtherProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setViewingProfile(data);
  };

  const fetchPosts = async () => {
    let query = supabase.from("posts")
      .select("*, profiles(id, display_name, trust_score, is_verified, account_type, avatar_url)")
      .eq("type", feedTab).eq("status", "active")
      .order("created_at", { ascending: false }).limit(50);
    if (activeCategory !== "Alle") query = query.contains("tags", [activeCategory]);
    const { data } = await query;
    if (data && data.length > 0) {
      setPosts(data.map(p => ({
        ...p,
        author: {
          id: p.profiles?.id,
          name: p.profiles?.display_name || "Unbekannt",
          trust: p.profiles?.trust_score || 0,
          verified: p.profiles?.is_verified || false,
          avatar: (p.profiles?.display_name || "U").substring(0, 2).toUpperCase(),
          avatar_url: p.profiles?.avatar_url || null
        },
        time: timeAgo(p.created_at)
      })));
    } else { setPosts([]); }
  };

  const fetchStats = async () => {
    const { count: totalMembers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: postsToday } = await supabase.from("posts").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
    setStats({ activeNow: Math.max(1, Math.floor((totalMembers || 1) * 0.3)), totalMembers: totalMembers || 0, postsToday: postsToday || 0 });
  };

  const fetchChats = async () => {
    if (!user) return;
    const { data } = await supabase.from("matches")
      .select("*, seeker:profiles!matches_seeker_id_fkey(display_name, avatar_url), provider:profiles!matches_provider_id_fkey(display_name, avatar_url)")
      .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    if (data) setChats(data);
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    const matchIds = await supabase.from("matches").select("id").or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`);
    if (!matchIds.data?.length) return;
    const ids = matchIds.data.map(m => m.id);
    const { count } = await supabase.from("messages").select("*", { count: "exact", head: true })
      .in("match_id", ids).eq("is_read", false).neq("sender_id", user.id);
    setUnreadCount(count || 0);
  };

  const fetchOwnPosts = async () => {
    if (!user) return;
    const { data } = await supabase.from("posts").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    if (data) setOwnPosts(data);
  };

  const fetchMessages = async (matchId) => {
    const { data } = await supabase.from("messages").select("*")
      .eq("match_id", matchId).order("created_at", { ascending: true });
    if (data) {
      setChatMessages(data.map(m => ({ ...m, me: m.sender_id === user.id })));
      // Mark received messages as read
      await supabase.from("messages").update({ is_read: true })
        .eq("match_id", matchId).neq("sender_id", user.id).eq("is_read", false);
    }

    // Unsubscribe previous realtime
    if (realtimeRef.current) { supabase.removeChannel(realtimeRef.current); }

    // Subscribe to realtime
    const channel = supabase.channel(`chat:${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const msg = payload.new;
          // Only add if from other user (own messages shown optimistically)
          if (msg.sender_id === user.id) return;
          setChatMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, { ...msg, me: false }];
          });
          // Mark as read immediately
          supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
        }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          setChatMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, is_read: payload.new.is_read } : m));
        }
      )
      .subscribe();
    realtimeRef.current = channel;
  };

  // ── CONNECT (creates real match) ─────────────────────────
  const handleConnect = async (post) => {
    if (!user) return;
    if (post.author_id === user.id) { showToast("Du kannst dich nicht selbst connecten", "#ef4444"); return; }

    // Check if match already exists
    const { data: existing } = await supabase.from("matches")
      .select("id").or(`and(seeker_id.eq.${user.id},provider_id.eq.${post.author_id}),and(seeker_id.eq.${post.author_id},provider_id.eq.${user.id})`)
      .single();

    if (existing) {
      setActiveTab("chat");
      const { data: match } = await supabase.from("matches").select("*, seeker:profiles!matches_seeker_id_fkey(display_name), provider:profiles!matches_provider_id_fkey(display_name)").eq("id", existing.id).single();
      if (match) { setActiveChat(match); fetchMessages(match.id); }
      return;
    }

    // Create new match
    const seekerId = post.type === "seek" ? post.author_id : user.id;
    const providerId = post.type === "seek" ? user.id : post.author_id;

    const { data: newMatch, error } = await supabase.from("matches").insert({
      post_id: post.id, seeker_id: seekerId, provider_id: providerId, status: "pending"
    }).select("*, seeker:profiles!matches_seeker_id_fkey(display_name), provider:profiles!matches_provider_id_fkey(display_name)").single();

    if (error) { showToast("Fehler beim Verbinden", "#ef4444"); return; }

    showToast("Verbindung hergestellt! ✓");
    setSelectedPost(null);
    setActiveTab("chat");
    setActiveChat(newMatch);
    fetchMessages(newMatch.id);
    fetchChats();
  };

  // ── GOOGLE LOGIN ─────────────────────────────────────────
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  // ── AUTH ─────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) { showToast("Alle Felder ausfüllen", "#ef4444"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    if (error) showToast(error.message, "#ef4444");
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!authForm.email || !authForm.password || !authForm.name) { showToast("Alle Felder ausfüllen", "#ef4444"); return; }
    if (authForm.password.length < 8) { showToast("Passwort: mindestens 8 Zeichen", "#ef4444"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: authForm.email, password: authForm.password });
    if (error) { showToast(error.message, "#ef4444"); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, account_type: authForm.type, display_name: authForm.name, trust_score: 20, is_verified: false, posts_today: 0 });
      showToast("Account erstellt! ✓");
    }
    setLoading(false);
  };

  const handleOnboarding = async () => {
    if (!onboardingForm.name || onboardingForm.name.trim().length < 2) { showToast("Bitte Namen eingeben", "#ef4444"); return; }
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: onboardingForm.name.trim(),
      account_type: onboardingForm.type,
      trust_score: 20,
      is_verified: false,
      posts_today: 0,
      avatar_url: user.user_metadata?.avatar_url || null
    });
    if (error) { showToast("Fehler beim Speichern", "#ef4444"); setLoading(false); return; }
    await fetchProfile(user.id);
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // ── POST ─────────────────────────────────────────────────
  const handlePost = async () => {
    const title = postForm.title.trim();
    const desc = postForm.description.trim();
    if (!title || title.length < 15) { showToast("Titel: mindestens 15 Zeichen", "#ef4444"); return; }
    if (title.split(" ").filter(w => w.length > 2).length < 2) { showToast("Titel: mindestens 2 aussagekräftige Wörter", "#ef4444"); return; }
    if (!desc || desc.length < 50) { showToast("Beschreibung: mindestens 50 Zeichen", "#ef4444"); return; }
    if (desc.split(" ").filter(w => w.length > 2).length < 6) { showToast("Beschreibung: mindestens 6 Wörter", "#ef4444"); return; }
    if (postForm.budget) {
      const b = parseFloat(postForm.budget);
      if (isNaN(b) || b <= 0) { showToast("Budget: nur positive Zahl (z.B. 4000)", "#ef4444"); return; }
      if (b > 10000000) { showToast("Budget: maximaler Wert 10.000.000€", "#ef4444"); return; }
    }
    if (postForm.location && postForm.location.trim().length < 3) { showToast("Ort: mindestens 3 Zeichen", "#ef4444"); return; }
    if (postForm.tags && postForm.tags.split(",").some(t => t.trim().length < 3)) { showToast("Kategorien: jeder Tag mind. 3 Zeichen", "#ef4444"); return; }

    const trust = profile?.trust_score || 0;
    const postsToday = profile?.posts_today || 0;
    const limit = trust <= 30 ? 3 : trust <= 60 ? 10 : Infinity;
    if (postsToday >= limit) { showToast(`Post-Limit erreicht (Trust ${trust}: max. ${limit}/Tag)`, "#f59e0b"); return; }

    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id, type: postType, title, description: desc,
      budget: parseFloat(postForm.budget) || null, duration: postForm.duration,
      location: postForm.location, tags: postForm.tags.split(",").map(t => t.trim()).filter(Boolean), status: "active"
    });
    if (error) { showToast(error.message, "#ef4444"); }
    else {
      await supabase.from("profiles").update({ posts_today: postsToday + 1 }).eq("id", user.id);
      setPostForm({ title: "", description: "", budget: "", duration: "", location: "", tags: "" });
      setShowPostForm(false); fetchPosts(); fetchOwnPosts(); showToast("Post veröffentlicht! ✓");
    }
    setLoading(false);
  };

  const deletePost = async (postId) => {
    await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setOwnPosts(prev => prev.filter(p => p.id !== postId));
    showToast("Post gelöscht ✓");
  };

  // ── PROFILE SAVE ─────────────────────────────────────────
  const saveProfile = async () => {
    const skills = editForm.skills.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({
      bio: editForm.bio, linkedin_url: editForm.linkedin_url,
      skills, location: editForm.location
    }).eq("id", user.id);
    if (error) { showToast("Fehler beim Speichern", "#ef4444"); return; }
    setProfile(prev => ({ ...prev, bio: editForm.bio, linkedin_url: editForm.linkedin_url, skills, location: editForm.location }));
    setShowEditProfile(false);
    showToast("Profil gespeichert ✓");
  };

  // ── UPLOAD ───────────────────────────────────────────────
  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 2 * 1024 * 1024) { showToast("Max. 2MB", "#ef4444"); return; }
    setUploadingAvatar(true);
    const path = `${user.id}/avatar.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setProfile(prev => ({ ...prev, avatar_url: url }));
    showToast("Profilbild gespeichert ✓");
    setUploadingAvatar(false);
  };

  const uploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) { showToast("Max. 5MB", "#ef4444"); return; }
    setUploadingCover(true);
    const path = `${user.id}/cover.${file.name.split(".").pop()}`;
    await supabase.storage.from("covers").upload(path, file, { upsert: true });
    const url = `${SUPABASE_URL}/storage/v1/object/public/covers/${path}?t=${Date.now()}`;
    await supabase.from("profiles").update({ cover_url: url }).eq("id", user.id);
    setProfile(prev => ({ ...prev, cover_url: url }));
    showToast("Titelbild gespeichert ✓");
    setUploadingCover(false);
  };

  // ── CHAT ─────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChat) return;
    const content = msgInput;
    const tempId = `temp_${Date.now()}`;
    setMsgInput("");
    // Optimistic update - show immediately
    setChatMessages(prev => [...prev, { id: tempId, me: true, content, is_read: false, created_at: new Date().toISOString(), temp: true }]);
    const { data } = await supabase.from("messages").insert({ match_id: activeChat.id, sender_id: user.id, content, is_read: false }).select().single();
    // Replace temp with real message
    if (data) setChatMessages(prev => prev.map(m => m.id === tempId ? { ...data, me: true } : m));
  };

  // ── HELPERS ──────────────────────────────────────────────
  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "gerade eben";
    if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
    if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
    return `vor ${Math.floor(diff / 86400)} Tagen`;
  };

  const getChatPartner = (chat) => {
    if (!chat || !user) return "?";
    return chat.seeker_id === user.id ? (chat.provider?.display_name || "Anbieter") : (chat.seeker?.display_name || "Sucher");
  };

  const filteredPosts = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)) || p.location?.toLowerCase().includes(q);
  });

  // ── STYLES ───────────────────────────────────────────────
  const s = {
    page: { background: "#07090f", minHeight: "100vh", color: "#eaf2ff", fontFamily: "'Sora', sans-serif", display: "flex", flexDirection: "column" },
    topBar: { position: "sticky", top: 0, zIndex: 50, background: "rgba(7,9,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1a2540", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 },
    logo: { fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1.15rem", color: "#eaf2ff" },
    content: { flex: 1, paddingBottom: 72, maxWidth: 640, margin: "0 auto", width: "100%" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, height: 64, background: "rgba(7,9,15,0.97)", borderTop: "1px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "space-around", maxWidth: 640, margin: "0 auto" },
    card: { margin: "0 16px 12px", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 14, padding: 16 },
    input: { width: "100%", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 10, padding: "11px 14px", fontFamily: "inherit", fontSize: 14, color: "#eaf2ff", outline: "none", boxSizing: "border-box" },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a5a7a", marginBottom: 6, display: "block" },
    btn: (bg = "#2a7fff") => ({ padding: "10px 20px", background: bg, color: "#fff", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }),
    overlay: { position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 640, height: "100vh", background: "#07090f", zIndex: 100, display: "flex", flexDirection: "column", overflowY: "auto" },
  };

  // ── AUTH SCREEN ──────────────────────────────────────────
  if (screen === "auth") return (
    <div style={{ ...s.page, alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2.4rem", color: "#eaf2ff" }}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
          <div style={{ fontSize: 12, color: "#4a5a7a", marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>Connect · Solve · Grow</div>
        </div>

        {/* Google Login */}
        <button onClick={handleGoogleLogin} style={{ width: "100%", padding: "12px 20px", background: "#fff", color: "#1a1a1a", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Mit Google anmelden
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#1a2540" }}></div>
          <span style={{ fontSize: 12, color: "#4a5a7a" }}>oder</span>
          <div style={{ flex: 1, height: 1, background: "#1a2540" }}></div>
        </div>

        <div style={{ display: "flex", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => setAuthMode(m)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", background: authMode === m ? "#2a7fff" : "none", color: authMode === m ? "#fff" : "#4a5a7a", transition: "all 0.2s" }}>
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
              <div style={{ display: "flex", gap: 10 }}>
                {[{ k: "freelancer", l: "👤 Freelancer" }, { k: "company", l: "🏢 Unternehmen" }].map(({ k, l }) => (
                  <button key={k} onClick={() => setAuthForm(p => ({ ...p, type: k }))} style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${authForm.type === k ? "#2a7fff" : "#1a2540"}`, background: authForm.type === k ? "#2a7fff18" : "#0d1120", color: authForm.type === k ? "#2a7fff" : "#4a5a7a", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>E-Mail</label>
          <input style={s.input} type="email" placeholder="name@firma.de" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Passwort</label>
          <input style={s.input} type="password" placeholder="Mindestens 8 Zeichen" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())} />
        </div>

        <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 14, fontSize: 15, borderRadius: 12, marginBottom: 14, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Laden..." : authMode === "login" ? "Anmelden" : "Account erstellen"}
        </button>
        <div style={{ background: "#2a7fff10", border: "1px solid #2a7fff22", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#6a9adf", lineHeight: 1.6, textAlign: "center" }}>
          🔒 DSGVO-konform · Nur für Business · 18+
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap" }}>{toast.msg}</div>}
    </div>
  );

  // ── HOME ─────────────────────────────────────────────────
  const renderHome = () => (
    <>
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ background: "linear-gradient(135deg, #0d1a35, #0d2040)", border: "1px solid #1a3060", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-around" }}>
          {[["🟢", stats.activeNow, "Aktiv"], ["👥", stats.totalMembers, "Mitglieder"], ["📝", stats.postsToday, "Posts heute"]].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#eaf2ff", fontFamily: "'Orbitron', monospace" }}>{icon} {val}</div>
              <div style={{ fontSize: 10, color: "#4a5a7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 16px 0" }}>
        <input style={{ ...s.input, paddingLeft: 40, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%234a5a7a' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8' stroke='%234a5a7a' stroke-width='2' fill='none'/%3E%3Cpath d='m21 21-4.35-4.35' stroke='%234a5a7a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "14px center" }}
          placeholder="Suchen nach Titel, Tags, Ort..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Feed Tabs */}
      <div style={{ padding: "10px 16px 0" }}>
        <div style={{ display: "flex", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 3 }}>
          {[{ k: "seek", l: "🔍 Ich suche" }, { k: "offer", l: "💡 Ich biete" }].map(({ k, l }) => (
            <button key={k} onClick={() => { setFeedTab(k); setSearchQuery(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", background: feedTab === k ? "#2a7fff" : "none", color: feedTab === k ? "#fff" : "#4a5a7a", transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 7, padding: "10px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", border: "none", background: activeCategory === cat ? "#2a7fff" : "#0d1120", color: activeCategory === cat ? "#fff" : "#4a5a7a", outline: `1px solid ${activeCategory === cat ? "#2a7fff" : "#1a2540"}`, flexShrink: 0, fontFamily: "inherit", transition: "all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{searchQuery ? "Keine Ergebnisse" : "Noch keine Posts"}</div>
          <div style={{ fontSize: 13 }}>{searchQuery ? "Andere Suchbegriffe versuchen" : "Sei der Erste – erstelle einen Post!"}</div>
        </div>
      ) : filteredPosts.map(post => (
        <div key={post.id} style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div onClick={() => { if (post.author?.id && post.author.id !== user?.id) fetchOtherProfile(post.author.id); }} style={{ cursor: post.author?.id !== user?.id ? "pointer" : "default" }}>
              <Avatar url={post.author?.avatar_url} initials={post.author?.avatar} size={40} color={post.author?.verified ? "#10b981" : "#2a7fff"} />
            </div>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setSelectedPost(post)}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{post.author?.name}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                <TrustBadge score={post.author?.trust} verified={post.author?.verified} />
                <span style={{ fontSize: 11, color: "#4a5a7a" }}>{post.time}</span>
              </div>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: post.type === "seek" ? "#2a7fff18" : "#00c8ff15", color: post.type === "seek" ? "#2a7fff" : "#00c8ff", border: `1px solid ${post.type === "seek" ? "#2a7fff44" : "#00c8ff33"}` }}>
              {post.type === "seek" ? "Suche" : "Biete"}
            </span>
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => setSelectedPost(post)}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 7 }}>{post.title}</div>
            <div style={{ fontSize: 13, color: "#8090aa", lineHeight: 1.6, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</div>
          </div>
          <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
            {post.budget && <span style={{ fontSize: 12, color: "#10b981" }}>💰 €{post.budget}</span>}
            {post.duration && <span style={{ fontSize: 12, color: "#4a5a7a" }}>⏱ {post.duration}</span>}
            {post.location && <span style={{ fontSize: 12, color: "#4a5a7a" }}>📍 {post.location}</span>}
          </div>
          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {post.tags.map(t => <Tag key={t} label={t} />)}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {post.author_id === user?.id
              ? <button onClick={() => deletePost(post.id)} style={{ ...s.btn("#ef444418"), color: "#ef4444", border: "1px solid #ef444433", padding: "8px 14px", fontSize: 12 }}>🗑 Löschen</button>
              : <button onClick={() => setSelectedPost(post)} style={{ ...s.btn("#ffffff08"), color: "#8090aa", border: "1px solid #1a2540", padding: "8px 14px", fontSize: 12 }}>Details →</button>
            }
            {post.author_id !== user?.id && (
              <button onClick={() => handleConnect(post)} style={s.btn()}>Connecten →</button>
            )}
          </div>
        </div>
      ))}
    </>
  );

  // ── POST DETAIL ──────────────────────────────────────────
  const renderPostDetail = () => {
    if (!selectedPost) return null;
    return (
      <div style={s.overlay}>
        <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
          <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Post Details</span>
          <div style={{ width: 32 }}></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }} onClick={() => { if (selectedPost.author?.id !== user?.id) { fetchOtherProfile(selectedPost.author?.id); setSelectedPost(null); } }}>
            <Avatar url={selectedPost.author?.avatar_url} initials={selectedPost.author?.avatar} size={48} color={selectedPost.author?.verified ? "#10b981" : "#2a7fff"} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedPost.author?.name}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                <TrustBadge score={selectedPost.author?.trust} verified={selectedPost.author?.verified} />
                <span style={{ fontSize: 12, color: "#4a5a7a" }}>{selectedPost.time}</span>
              </div>
            </div>
          </div>

          <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: "uppercase", background: selectedPost.type === "seek" ? "#2a7fff18" : "#00c8ff15", color: selectedPost.type === "seek" ? "#2a7fff" : "#00c8ff", border: `1px solid ${selectedPost.type === "seek" ? "#2a7fff44" : "#00c8ff33"}`, display: "inline-block", marginBottom: 16 }}>
            {selectedPost.type === "seek" ? "🔍 Suche" : "💡 Biete"}
          </span>

          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{selectedPost.title}</div>
          <div style={{ fontSize: 14, color: "#8090aa", lineHeight: 1.7, marginBottom: 20 }}>{selectedPost.description}</div>

          <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            {[
              selectedPost.budget && ["💰 Budget", `€${selectedPost.budget}`],
              selectedPost.duration && ["⏱ Laufzeit", selectedPost.duration],
              selectedPost.location && ["📍 Ort", selectedPost.location],
            ].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#4a5a7a" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#eaf2ff" }}>{v}</span>
              </div>
            ))}
          </div>

          {selectedPost.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
              {selectedPost.tags.map(t => <Tag key={t} label={t} />)}
            </div>
          )}

          {selectedPost.author_id !== user?.id && (
            <button onClick={() => handleConnect(selectedPost)} style={{ ...s.btn(), width: "100%", padding: 15, fontSize: 15, borderRadius: 12 }}>
              Jetzt Connecten →
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── OTHER PROFILE ─────────────────────────────────────────
  const renderOtherProfile = () => {
    if (!viewingProfile) return null;
    return (
      <div style={s.overlay}>
        <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
          <button onClick={() => setViewingProfile(null)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Profil</span>
          <div style={{ width: 32 }}></div>
        </div>
        <div style={{ overflowY: "auto", scrollbarWidth: "none" }}>
          <div style={{ height: 100, background: viewingProfile.cover_url ? `url(${viewingProfile.cover_url}) center/cover` : "linear-gradient(135deg, #0d1a35, #0d2040)" }}></div>
          <div style={{ padding: "0 16px", marginTop: -28 }}>
            <div style={{ marginBottom: 16 }}>
              {viewingProfile.avatar_url
                ? <img src={viewingProfile.avatar_url} style={{ width: 64, height: 64, borderRadius: 18, objectFit: "cover", border: "3px solid #07090f" }} />
                : <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #2a7fff, #00c8ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", border: "3px solid #07090f" }}>
                    {(viewingProfile.display_name || "U").substring(0, 2).toUpperCase()}
                  </div>
              }
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", fontWeight: 900 }}>{viewingProfile.display_name}</span>
              {viewingProfile.is_verified && <span style={{ background: "#10b981", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</span>}
            </div>
            <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 14 }}>
              {viewingProfile.account_type === "company" ? "🏢 Unternehmen" : "👤 Freelancer"}
              {viewingProfile.location && ` · 📍 ${viewingProfile.location}`}
            </div>

            <div style={{ display: "flex", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              {[["Trust", viewingProfile.trust_score || 0], ["Projekte", viewingProfile.completed_projects || 0], ["Bewertung", `${viewingProfile.rating_avg || 0}★`]].map(([l, v], i) => (
                <div key={l} style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: i < 2 ? "1px solid #1a2540" : "none" }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, color: "#00c8ff" }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#4a5a7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                </div>
              ))}
            </div>

            {viewingProfile.bio && (
              <div style={{ fontSize: 13, color: "#8090aa", lineHeight: 1.7, marginBottom: 16, background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 14 }}>
                {viewingProfile.bio}
              </div>
            )}

            {viewingProfile.skills?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Skills</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {viewingProfile.skills.map(s => <span key={s} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#2a7fff15", color: "#2a7fff", border: "1px solid #2a7fff33" }}>{s}</span>)}
                </div>
              </div>
            )}

            {viewingProfile.linkedin_url && (
              <a href={viewingProfile.linkedin_url} target="_blank" rel="noreferrer" style={{ ...s.btn("#0077b5"), display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 16, fontSize: 13 }}>
                LinkedIn Profil →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── CHAT ─────────────────────────────────────────────────
  const renderChat = () => (
    <>
      {activeChat ? (
        <>
          <div style={s.topBar}>
            <button onClick={() => { setActiveChat(null); setChatMessages([]); }} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={getChatPartner(activeChat)} size={32} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{getChatPartner(activeChat)}</div>
                <div style={{ fontSize: 11, color: "#10b981" }}>● Aktiv</div>
              </div>
            </div>
            <div style={{ width: 32 }}></div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 140px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.length === 0 && <div style={{ textAlign: "center", color: "#4a5a7a", fontSize: 13, marginTop: 40 }}>Noch keine Nachrichten.</div>}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.me ? "flex-end" : "flex-start" }}>
                <div>
                  <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: msg.me ? "#2a7fff22" : "#0d1120", border: `1px solid ${msg.me ? "#2a7fff33" : "#1a2540"}`, color: msg.me ? "#c8dcf8" : "#b0c4de", borderBottomRightRadius: msg.me ? 4 : 14, borderBottomLeftRadius: msg.me ? 14 : 4 }}>
                    {msg.content}
                  </div>
                  {msg.me && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2, paddingRight: 2 }}>
                      {msg.is_read
                        ? <span style={{ fontSize: 11, color: "#2a7fff", fontWeight: 700 }}>✓✓</span>
                        : <span style={{ fontSize: 11, color: "#4a5a7a" }}>✓</span>
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ position: "fixed", bottom: 64, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 640, padding: "10px 16px", display: "flex", gap: 10, background: "rgba(7,9,15,0.97)", borderTop: "1px solid #1a2540", boxSizing: "border-box", alignItems: "center" }}>
            <input style={{ ...s.input, flex: 1, fontSize: 16, minHeight: 44 }} placeholder="Nachricht..." value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <button onClick={sendMessage} style={{ ...s.btn(), padding: "0", width: 44, height: 44, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>→</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: "12px 16px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a5a7a" }}>Deine Gespräche</div>
          {chats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Noch keine Chats</div>
              <div style={{ fontSize: 13 }}>Connecte dich mit jemandem im Feed!</div>
            </div>
          ) : chats.map(chat => (
            <div key={chat.id} onClick={() => { setActiveChat(chat); fetchMessages(chat.id); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #ffffff05", cursor: "pointer" }}>
              <Avatar initials={getChatPartner(chat)} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{getChatPartner(chat)}</div>
                <div style={{ fontSize: 12, color: "#4a5a7a" }}>{chat.status === "pending" ? "Verbindungsanfrage" : "Aktives Gespräch"}</div>
              </div>
              <span style={{ fontSize: 11, color: "#4a5a7a" }}>{timeAgo(chat.created_at)}</span>
            </div>
          ))}
        </>
      )}
    </>
  );

  // ── PROFILE ──────────────────────────────────────────────
  const renderProfile = () => {
    const trust = profile?.trust_score || 0;
    const limit = trust <= 30 ? 3 : trust <= 60 ? 10 : 99;
    const used = profile?.posts_today || 0;
    return (
      <>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadAvatar} />
        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadCover} />

        <div onClick={() => coverInputRef.current.click()} style={{ height: 120, background: profile?.cover_url ? `url(${profile.cover_url}) center/cover` : "linear-gradient(135deg, #0d1a35, #0d2040)", position: "relative", cursor: "pointer" }}>
          {!profile?.cover_url && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a3a5a", fontSize: 12, fontWeight: 600 }}>{uploadingCover ? "Wird hochgeladen..." : "📷 Titelbild hinzufügen"}</div>}
          {profile?.cover_url && <div style={{ position: "absolute", bottom: 8, right: 12, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#fff" }}>✏️ Ändern</div>}
          <button onClick={e => { e.stopPropagation(); handleLogout(); }} style={{ position: "absolute", top: 12, right: 16, fontSize: 12, color: "#ef4444", background: "rgba(0,0,0,0.5)", border: "1px solid #ef444433", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Abmelden</button>
        </div>

        <div style={{ padding: "0 16px", marginTop: -28 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => avatarInputRef.current.click()}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: 72, height: 72, borderRadius: 20, objectFit: "cover", border: "3px solid #07090f" }} />
                : <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #2a7fff, #00c8ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", border: "3px solid #07090f" }}>
                    {(profile?.display_name || "U").substring(0, 2).toUpperCase()}
                  </div>
              }
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, background: "#2a7fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #07090f" }}>{uploadingAvatar ? "⏳" : "📷"}</div>
            </div>
            <button onClick={() => setShowEditProfile(true)} style={{ ...s.btn("#0d1120"), border: "1px solid #1a2540", color: "#eaf2ff", padding: "8px 16px", fontSize: 13 }}>✏️ Bearbeiten</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", fontWeight: 900 }}>{profile?.display_name || "Nutzer"}</span>
            {profile?.is_verified && <span style={{ background: "#10b981", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</span>}
          </div>
          <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 4 }}>{profile?.account_type === "company" ? "🏢 Unternehmen" : "👤 Freelancer"}</div>
          {profile?.location && <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 10 }}>📍 {profile.location}</div>}

          {profile?.bio && (
            <div style={{ fontSize: 13, color: "#8090aa", lineHeight: 1.7, marginBottom: 14, background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 14 }}>{profile.bio}</div>
          )}

          {profile?.skills?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {profile.skills.map(sk => <span key={sk} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#2a7fff15", color: "#2a7fff", border: "1px solid #2a7fff33" }}>{sk}</span>)}
            </div>
          )}

          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ ...s.btn("#0077b5"), display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 14, fontSize: 13 }}>LinkedIn →</a>
          )}

          <div style={{ display: "flex", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
            {[["Trust", trust], ["Projekte", profile?.completed_projects || 0], ["Bewertung", `${profile?.rating_avg || 0}★`]].map(([l, v], i) => (
              <div key={l} style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: i < 2 ? "1px solid #1a2540" : "none" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, color: "#00c8ff" }}>{v}</div>
                <div style={{ fontSize: 10, color: "#4a5a7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Post-Limit heute</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              {Array.from({ length: Math.min(limit === 99 ? 10 : limit, 10) }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < used ? "#2a7fff" : "#1a2540" }}></div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#4a5a7a" }}>{used}/{limit === 99 ? "∞" : limit} Posts · Trust {trust}</div>
          </div>

          <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Provisions-Tracking</div>
            {[["Ausstehend", "€0", "#f59e0b"], ["Ausgezahlt", "€0", "#10b981"], ["Aktive Matches", chats.length, "#2a7fff"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#4a5a7a" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Meine Posts ({ownPosts.length})</div>
            {ownPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 20px", color: "#4a5a7a", background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 13 }}>Noch keine Posts</div>
              </div>
            ) : ownPosts.map(post => (
              <div key={post.id} style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: post.type === "seek" ? "#2a7fff18" : "#00c8ff15", color: post.type === "seek" ? "#2a7fff" : "#00c8ff", border: `1px solid ${post.type === "seek" ? "#2a7fff44" : "#00c8ff33"}` }}>
                    {post.type === "seek" ? "Suche" : "Biete"}
                  </span>
                  <span style={{ fontSize: 11, color: "#4a5a7a" }}>{timeAgo(post.created_at)}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: "#8090aa", lineHeight: 1.5, marginBottom: 10 }}>{post.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: post.status === "active" ? "#10b981" : "#4a5a7a", fontWeight: 600 }}>{post.status === "active" ? "● Aktiv" : "● Geschlossen"}</span>
                  <button onClick={() => deletePost(post.id)} style={{ ...s.btn("#ef444418"), color: "#ef4444", border: "1px solid #ef444433", padding: "6px 12px", fontSize: 12 }}>🗑 Löschen</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ── EDIT PROFILE ─────────────────────────────────────────
  const renderEditProfile = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowEditProfile(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Profil bearbeiten</span>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "none" }}>
        {[
          { k: "bio", l: "Bio", p: "Beschreibe dich kurz – wer du bist, was du machst...", ta: true },
          { k: "location", l: "Standort", p: "z.B. Duisburg, Deutschland" },
          { k: "linkedin_url", l: "LinkedIn URL", p: "https://linkedin.com/in/deinname" },
          { k: "skills", l: "Skills (kommagetrennt)", p: "z.B. Projektmanagement, Design, IT" },
        ].map(({ k, l, p, ta }) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <label style={s.label}>{l}</label>
            {ta
              ? <textarea style={{ ...s.input, height: 110, resize: "none", lineHeight: 1.6 }} placeholder={p} value={editForm[k]} onChange={e => setEditForm(prev => ({ ...prev, [k]: e.target.value }))} maxLength={500} />
              : <input style={s.input} placeholder={p} value={editForm[k]} onChange={e => setEditForm(prev => ({ ...prev, [k]: e.target.value }))} />
            }
          </div>
        ))}
        <button onClick={saveProfile} style={{ ...s.btn(), width: "100%", padding: 14, fontSize: 15, borderRadius: 12 }}>Speichern ✓</button>
      </div>
    </div>
  );

  // ── POST FORM ─────────────────────────────────────────────
  const renderPostForm = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowPostForm(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Post erstellen</span>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {[{ k: "seek", l: "🔍 Ich suche" }, { k: "offer", l: "💡 Ich biete" }].map(({ k, l }) => (
            <button key={k} onClick={() => setPostType(k)} style={{ flex: 1, padding: "12px 8px", borderRadius: 11, border: `2px solid ${postType === k ? "#2a7fff" : "#1a2540"}`, background: postType === k ? "#2a7fff15" : "#0d1120", color: postType === k ? "#2a7fff" : "#4a5a7a", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b33", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fbbf24", marginBottom: 16 }}>
          ⚠️ Nur business-relevante Posts. Professioneller Ton Pflicht.
        </div>
        {[
          { k: "title", l: "Titel *", p: "Mind. 15 Zeichen, 2 Wörter" },
          { k: "description", l: "Beschreibung *", p: "Mind. 50 Zeichen, 6 Wörter – was genau brauchst du?", ta: true },
          { k: "budget", l: "Budget (€) – nur Zahl", p: "z.B. 4000" },
          { k: "duration", l: "Laufzeit", p: "z.B. 3 Monate" },
          { k: "location", l: "Ort / Remote", p: "z.B. Remote, Berlin, EU-weit" },
          { k: "tags", l: "Kategorien (kommagetrennt)", p: "z.B. Design, IT, Marketing" },
        ].map(({ k, l, p, ta }) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={s.label}>{l}</label>
            {ta ? <textarea style={{ ...s.input, height: 90, resize: "none", lineHeight: 1.5 }} placeholder={p} value={postForm[k]} onChange={e => setPostForm(prev => ({ ...prev, [k]: e.target.value }))} />
              : <input style={s.input} placeholder={p} value={postForm[k]} onChange={e => setPostForm(prev => ({ ...prev, [k]: e.target.value }))} />}
          </div>
        ))}
        <button onClick={handlePost} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 15, fontSize: 15, borderRadius: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Wird veröffentlicht..." : "Post veröffentlichen ✓"}
        </button>
      </div>
    </div>
  );

  // ── NOTIFICATIONS ─────────────────────────────────────────
  const renderNotifications = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Benachrichtigungen</span>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#4a5a7a" }}>
        <div style={{ fontSize: 48 }}>🔔</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Keine neuen Benachrichtigungen</div>
      </div>
    </div>
  );

  // ── AI ────────────────────────────────────────────────────
  const renderAI = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowAI(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>✦ KI-Assistent</span>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, color: "#4a5a7a", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>✦</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#eaf2ff" }}>KI-Assistent</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 300 }}>Hilft dir Posts zu optimieren, Matches zu finden und Vertragsvorlagen zu erstellen.</div>
        <div style={{ background: "#2a7fff15", border: "1px solid #2a7fff33", borderRadius: 10, padding: "10px 20px", fontSize: 13, color: "#2a7fff", fontWeight: 600 }}>🚀 Coming Soon</div>
      </div>
    </div>
  );

  // ── MAIN RENDER ───────────────────────────────────────────
  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {showPostForm && renderPostForm()}
      {showNotifications && renderNotifications()}
      {showAI && renderAI()}
      {showEditProfile && renderEditProfile()}
      {selectedPost && renderPostDetail()}
      {viewingProfile && renderOtherProfile()}

      {!showPostForm && !showNotifications && !showAI && !showEditProfile && !selectedPost && !viewingProfile && (
        <>
          <div style={s.topBar}>
            <div style={s.logo}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAI(true)} style={{ width: 36, height: 36, borderRadius: 10, background: "#2a7fff18", border: "1px solid #2a7fff44", color: "#2a7fff", fontSize: 16, cursor: "pointer" }}>✦</button>
              <button onClick={() => setShowNotifications(true)} style={{ width: 36, height: 36, borderRadius: 10, background: "#0d1120", border: "1px solid #1a2540", fontSize: 16, cursor: "pointer" }}>🔔</button>
            </div>
          </div>

          <div style={s.content}>
            {activeTab === "home" && renderHome()}
            {activeTab === "chat" && renderChat()}
            {activeTab === "profile" && renderProfile()}
          </div>

          <div style={s.bottomNav}>
            {[{ k: "home", icon: "🏠", label: "Feed" }, { k: "chat", icon: "💬", label: "Chats" }].map(({ k, icon, label }) => (
              <button key={k} onClick={() => { setActiveTab(k); if (k === "chat") setUnreadCount(0); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "6px 18px", borderRadius: 10, background: activeTab === k ? "#2a7fff15" : "none", border: "none", fontFamily: "inherit", position: "relative" }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                {k === "chat" && unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 10, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
                <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === k ? "#2a7fff" : "#4a5a7a" }}>{label}</span>
              </button>
            ))}
            <button onClick={() => setShowPostForm(true)} style={{ width: 50, height: 50, background: "#2a7fff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none", boxShadow: "0 4px 20px #2a7fff55", fontSize: 24, color: "#fff" }}>+</button>
            {[{ k: "offer", icon: "💡", label: "Anbieten" }, { k: "profile", icon: "👤", label: "Profil" }].map(({ k, icon, label }) => (
              <button key={k} onClick={() => { if (k === "offer") { setPostType("offer"); setShowPostForm(true); } else setActiveTab(k); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "6px 18px", borderRadius: 10, background: activeTab === k ? "#2a7fff15" : "none", border: "none", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === k ? "#2a7fff" : "#4a5a7a" }}>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {toast && <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", zIndex: 300, boxShadow: "0 4px 20px #0008" }}>{toast.msg}</div>}
    </div>
  );
}

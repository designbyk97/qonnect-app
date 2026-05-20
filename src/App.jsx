import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eozhbqouszbjsewloolg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvemhicW91c3pianNld2xvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjUzNjQsImV4cCI6MjA5NDcwMTM2NH0.yQJ4bGxkDaOlQVZ2AUmIXYgM7d7OeIV4NcAp18Ci0Ek"
);

const SUPABASE_URL = "https://eozhbqouszbjsewloolg.supabase.co";
const CATEGORIES = ["Alle", "Design", "IT", "Finanzen", "Logistik", "Personal", "Marketing", "Beratung", "Recht", "Vertrieb", "Buchhaltung", "Bildung", "PR & Kommunikation"];

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
  const [registeredWithEmail, setRegisteredWithEmail] = useState(false);
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [feedTab, setFeedTab] = useState("seek");
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showDatenschutz, setShowDatenschutz] = useState(false);
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
  const [showOfferForm, setShowOfferForm] = useState(null);
  const [showOfferDetail, setShowOfferDetail] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offerForm, setOfferForm] = useState({ proposal: "", price: "", timeline: "", refLinks: "" });
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [navVariant, setNavVariant] = useState(7);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [viewingProfilePosts, setViewingProfilePosts] = useState([]);
  const [editProjects, setEditProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", url: "", desc: "" });
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("reports");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPosts, setAdminPosts] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [trustInput, setTrustInput] = useState({});
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [savedPostsList, setSavedPostsList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [homeTab, setHomeTab] = useState("feed");
  const [realNotifications, setRealNotifications] = useState([]);
  const [showRatingForm, setShowRatingForm] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const messagesEndRef = useRef(null);
  const realtimeRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const categoryScrollRef = useRef(null);

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
  useEffect(() => {
    if (screen === "app" && activeTab === "chat" && !activeChat) {
      fetchChats();
      fetchOffers();
    }
  }, [screen, activeTab, activeChat]);
  useEffect(() => { if (screen === "app" && user) fetchUnreadCount(); }, [screen, user, activeChat]);

  const activeChatRef = useRef(null);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  useEffect(() => {
    if (!user || screen !== "app") return;
    const channel = supabase.channel("global_messages_badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id !== user.id) {
            if (!activeChatRef.current || activeChatRef.current.id !== msg.match_id) {
              setUnreadCount(prev => prev + 1);
            }
            setChats(prev => prev.map(c => c.id === msg.match_id
              ? { ...c, last_message: msg.content, last_message_at: msg.created_at, has_unread: true }
              : c
            ));
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, screen]);

  useEffect(() => { if (screen === "app" && activeTab === "profile" && user) { fetchOwnPosts(); fetchSavedPosts(); } }, [screen, activeTab, user]);
  useEffect(() => { if (screen === "app" && user) fetchNotifications(); }, [screen, user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data?.is_banned) {
      setUser(null);
      setProfile(null);
      setScreen("auth");
      await supabase.auth.signOut();
      setTimeout(() => showToast("Dein Account wurde gesperrt.", "#ef4444"), 100);
      return;
    }
    if (data && data.display_name) {
      setProfile(data);
      setEditForm({ bio: data.bio || "", linkedin_url: data.linkedin_url || "", skills: (data.skills || []).join(", "), location: data.location || "" });
      setEditProjects(data.projects || []);
      setScreen("app");
    } else {
      setScreen("onboarding");
    }
  };

  const fetchOtherProfile = async (userId) => {
    const [{ data: profileData }, { data: postsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("posts").select("*").eq("author_id", userId).eq("status", "active").order("created_at", { ascending: false })
    ]);
    if (profileData) setViewingProfile(profileData);
    setViewingProfilePosts(postsData || []);
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
    if (!data) return;

    const chatsWithMessages = await Promise.all(data.map(async (chat) => {
      const { data: msgs } = await supabase.from("messages")
        .select("content, created_at, sender_id, is_read")
        .eq("match_id", chat.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const lastMsg = msgs?.[0];
      const has_unread = lastMsg && lastMsg.sender_id !== user.id && !lastMsg.is_read;
      return { ...chat, last_message: lastMsg?.content || null, last_message_at: lastMsg?.created_at || chat.created_at, has_unread };
    }));
    setChats(chatsWithMessages.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)));
  };

  const fetchOffers = async () => {
    if (!user) return;
    const { data } = await supabase.from("offers")
      .select("*, sender:profiles!offers_sender_id_fkey(display_name, avatar_url, trust_score, is_verified), receiver:profiles!offers_receiver_id_fkey(display_name, avatar_url), posts(title, type)")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setOffers(data);
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
      await supabase.from("messages").update({ is_read: true })
        .eq("match_id", matchId).neq("sender_id", user.id).eq("is_read", false);
    }

    if (realtimeRef.current) { supabase.removeChannel(realtimeRef.current); }

    const channel = supabase.channel(`chat:${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id === user.id) return;
          setChatMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, { ...msg, me: false }];
          });
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

  // ── CONNECT → zeigt Angebot-Formular ─────────────────────
  const handleConnect = async (post) => {
    if (!user) return;
    if (post.author_id === user.id) { showToast("Du kannst dich nicht selbst connecten", "#ef4444"); return; }

    const { data: existingMatch } = await supabase.from("matches")
      .select("id").or(`and(seeker_id.eq.${user.id},provider_id.eq.${post.author_id}),and(seeker_id.eq.${post.author_id},provider_id.eq.${user.id})`)
      .eq("status", "active").single();

    if (existingMatch) {
      setActiveTab("chat");
      const { data: match } = await supabase.from("matches").select("*, seeker:profiles!matches_seeker_id_fkey(display_name), provider:profiles!matches_provider_id_fkey(display_name)").eq("id", existingMatch.id).single();
      if (match) { setActiveChat(match); fetchMessages(match.id); }
      return;
    }

    const { data: existingOffer } = await supabase.from("offers")
      .select("id").eq("post_id", post.id).eq("sender_id", user.id).eq("status", "pending").single();

    if (existingOffer) {
      showToast("Du hast bereits ein Angebot gesendet", "#f59e0b");
      setActiveTab("chat");
      return;
    }

    setSelectedPost(null);
    setShowOfferForm({ type: "new", post });
    setOfferForm({ proposal: "", price: post.budget?.toString() || "", timeline: post.duration || "", refLinks: "" });
  };

  const handleSendOffer = async () => {
    if (!offerForm.proposal.trim()) { showToast("Bitte Vorschlag eingeben", "#ef4444"); return; }
    if (offerForm.proposal.trim().length < 30) { showToast("Vorschlag: mindestens 30 Zeichen", "#ef4444"); return; }
    const isCounter = showOfferForm?.type === "counter";
    const postId = isCounter ? showOfferForm.postId : showOfferForm?.post?.id;
    const receiverId = isCounter ? showOfferForm.receiverId : showOfferForm?.post?.author_id;
    setLoading(true);
    const { error } = await supabase.from("offers").insert({
      post_id: postId,
      sender_id: user.id,
      receiver_id: receiverId,
      proposal: offerForm.proposal.trim(),
      price: offerForm.price ? parseFloat(offerForm.price) : null,
      timeline: offerForm.timeline.trim() || null,
      ref_links: offerForm.refLinks.trim() || null,
      parent_offer_id: isCounter ? showOfferForm.parentOfferId : null,
      status: "pending"
    });
    if (error) { showToast("Fehler: " + error.message, "#ef4444"); }
    else {
      setShowOfferForm(null);
      showToast(isCounter ? "Gegenangebot gesendet! ✓" : "Angebot gesendet! ✓");
      sendNotification(receiverId, "offer_received", isCounter ? "Gegenangebot erhalten" : "Neues Angebot", `${profile?.display_name} hat dir ein Angebot geschickt`, null);
      setActiveTab("chat");
      fetchOffers();
    }
    setLoading(false);
  };

  const handleOfferResponse = async (offer, action) => {
    if (action === "accept") {
      const postType = offer.posts?.type;
      const seekerId = postType === "seek" ? offer.receiver_id : offer.sender_id;
      const providerId = postType === "seek" ? offer.sender_id : offer.receiver_id;
      const { data: newMatch, error } = await supabase.from("matches").insert({
        post_id: offer.post_id,
        seeker_id: seekerId,
        provider_id: providerId,
        status: "active"
      }).select("*, seeker:profiles!matches_seeker_id_fkey(display_name), provider:profiles!matches_provider_id_fkey(display_name)").single();
      if (error) { showToast("Fehler beim Annehmen", "#ef4444"); return; }
      await supabase.from("offers").update({ status: "accepted", match_id: newMatch.id }).eq("id", offer.id);
      setOffers(prev => prev.filter(o => o.id !== offer.id));
      setShowOfferDetail(null);
      showToast("Angebot angenommen! Chat geöffnet ✓");
      sendNotification(offer.sender_id, "offer_accepted", "Angebot angenommen! 🎉", `${profile?.display_name} hat dein Angebot angenommen`, newMatch.id);
      setActiveChat(newMatch);
      fetchMessages(newMatch.id);
      fetchChats();
    } else if (action === "decline") {
      await supabase.from("offers").update({ status: "declined" }).eq("id", offer.id);
      setOffers(prev => prev.filter(o => o.id !== offer.id));
      setShowOfferDetail(null);
      sendNotification(offer.sender_id, "offer_declined", "Angebot abgelehnt", `${profile?.display_name} hat dein Angebot abgelehnt`, null);
      showToast("Angebot abgelehnt");
    } else if (action === "counter") {
      await supabase.from("offers").update({ status: "countered" }).eq("id", offer.id);
      setOffers(prev => prev.filter(o => o.id !== offer.id));
      setShowOfferDetail(null);
      setShowOfferForm({
        type: "counter",
        parentOfferId: offer.id,
        postId: offer.post_id,
        receiverId: offer.sender_id,
        receiverName: offer.sender?.display_name || "Unbekannt",
        postTitle: offer.posts?.title || ""
      });
      setOfferForm({
        proposal: "",
        price: offer.price?.toString() || "",
        timeline: offer.timeline || "",
        refLinks: offer.ref_links || ""
      });
    }
  };

  const deleteChat = async (chatId) => {
    await supabase.from("messages").delete().eq("match_id", chatId);
    await supabase.from("matches").delete().eq("id", chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    setDeletingChatId(null);
    if (activeChat?.id === chatId) { setActiveChat(null); setChatMessages([]); }
    showToast("Chat gelöscht ✓");
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
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    if (error) { showToast(error.message, "#ef4444"); setLoading(false); return; }
    if (signInData?.user) {
      const { data: profileData } = await supabase.from("profiles").select("is_banned").eq("id", signInData.user.id).single();
      if (profileData?.is_banned) {
        await supabase.auth.signOut();
        showToast("Dein Account wurde gesperrt.", "#ef4444");
        setLoading(false);
        return;
      }
    }
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
      setOnboardingForm({ name: authForm.name, type: authForm.type });
      setRegisteredWithEmail(true);
      setAwaitingEmailConfirm(authForm.email);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!authForm.email) { showToast("Bitte E-Mail eingeben", "#ef4444"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(authForm.email, { redirectTo: window.location.origin });
    setLoading(false);
    if (error) { showToast("Fehler: " + error.message, "#ef4444"); return; }
    showToast("Reset-Mail gesendet ✓", "#10b981");
    setShowForgotPw(false);
  };

  const requestPushPermission = () => {
    if (window.OneSignal) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.Notifications.requestPermission();
      });
    }
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
    requestPushPermission();
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

  // ── ADMIN ────────────────────────────────────────────────
  const fetchAdminData = async () => {
    const [{ data: users }, { data: posts }, { data: reports }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("posts").select("*, profiles(display_name)").order("created_at", { ascending: false }).limit(100),
      supabase.from("reports").select("*, reporter:profiles!reports_reporter_id_fkey(display_name), post:posts(title), reported_user:profiles!reports_reported_user_id_fkey(display_name)").eq("resolved", false).order("created_at", { ascending: false })
    ]);
    setAdminUsers(users || []);
    setAdminPosts(posts || []);
    setAdminReports(reports || []);
  };

  const banUser = async (userId, ban) => {
    await supabase.from("profiles").update({ is_banned: ban }).eq("id", userId);
    setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: ban } : u));
    showToast(ban ? "Nutzer gesperrt 🚫" : "Nutzer entsperrt ✓");
  };

  const verifyUser = async (userId, verify) => {
    await supabase.from("profiles").update({ is_verified: verify }).eq("id", userId);
    setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: verify } : u));
    showToast(verify ? "Nutzer verifiziert ✓" : "Verifizierung entfernt");
  };

  const setTrustAdmin = async (userId, score) => {
    const s = Math.min(100, Math.max(0, parseInt(score) || 0));
    await supabase.from("profiles").update({ trust_score: s }).eq("id", userId);
    setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, trust_score: s } : u));
    showToast(`Trust auf ${s} gesetzt ✓`);
  };

  const deletePostAdmin = async (postId) => {
    await supabase.from("posts").delete().eq("id", postId);
    setAdminPosts(prev => prev.filter(p => p.id !== postId));
    showToast("Post gelöscht ✓");
  };

  const resolveReport = async (reportId) => {
    await supabase.from("reports").update({ resolved: true }).eq("id", reportId);
    setAdminReports(prev => prev.filter(r => r.id !== reportId));
    showToast("Meldung erledigt ✓");
  };

  const submitReport = async () => {
    if (!reportReason.trim()) { showToast("Bitte Grund angeben", "#ef4444"); return; }
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_post_id: showReportForm?.type === "post" ? showReportForm.id : null,
      reported_user_id: showReportForm?.type === "user" ? showReportForm.id : null,
      reason: reportReason.trim()
    });
    setShowReportForm(null); setReportReason("");
    showToast("Meldung gesendet ✓");
  };

  // ── SAVED POSTS ───────────────────────────────────────────
  const fetchSavedPosts = async () => {
    const { data } = await supabase.from("saved_posts").select("post_id, posts(*, profiles(id, display_name, trust_score, is_verified, avatar_url))").eq("user_id", user.id);
    if (data) {
      setSavedPostIds(new Set(data.map(d => d.post_id)));
      setSavedPostsList(data.map(d => d.posts).filter(Boolean).map(p => ({
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
    }
  };

  const toggleSavePost = async (post) => {
    if (savedPostIds.has(post.id)) {
      await supabase.from("saved_posts").delete().eq("user_id", user.id).eq("post_id", post.id);
      setSavedPostIds(prev => { const s = new Set(prev); s.delete(post.id); return s; });
      setSavedPostsList(prev => prev.filter(p => p.id !== post.id));
      showToast("Gespeichert entfernt");
    } else {
      await supabase.from("saved_posts").insert({ user_id: user.id, post_id: post.id });
      setSavedPostIds(prev => new Set([...prev, post.id]));
      setSavedPostsList(prev => [...prev, post]);
      showToast("Post gespeichert 🔖");
    }
  };

  // ── USER SEARCH ────────────────────────────────────────────
  const searchUsers = async (q) => {
    if (!q.trim()) { setUserSearchResults([]); return; }
    const { data } = await supabase.from("profiles").select("*")
      .or(`display_name.ilike.%${q}%,skills.cs.{${q}}`)
      .neq("id", user.id).limit(20);
    setUserSearchResults(data || []);
  };

  // ── NOTIFICATIONS ─────────────────────────────────────────
  const fetchNotifications = async () => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    if (data) setRealNotifications(data);
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setRealNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const sendNotification = async (userId, type, title, body, relatedId) => {
    await supabase.from("notifications").insert({ user_id: userId, type, title, body, related_id: relatedId });
  };

  // ── RATINGS ───────────────────────────────────────────────
  const submitRating = async () => {
    if (!ratingScore) { showToast("Bitte Sterne auswählen", "#ef4444"); return; }
    const { error } = await supabase.from("ratings").insert({
      rater_id: user.id, rated_id: showRatingForm.ratedId,
      match_id: showRatingForm.matchId, score: ratingScore, comment: ratingComment.trim() || null
    });
    if (error) { showToast("Bereits bewertet oder Fehler", "#ef4444"); return; }
    const { data: allRatings } = await supabase.from("ratings").select("score").eq("rated_id", showRatingForm.ratedId);
    if (allRatings?.length) {
      const avg = (allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length).toFixed(1);
      await supabase.from("profiles").update({ rating_avg: parseFloat(avg) }).eq("id", showRatingForm.ratedId);
    }
    setShowRatingForm(null); setRatingScore(0); setRatingComment("");
    showToast("Bewertung abgegeben ✓");
  };

  // ── PROFILE SAVE ─────────────────────────────────────────
  const saveProfile = async () => {
    const skills = editForm.skills.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({
      bio: editForm.bio, linkedin_url: editForm.linkedin_url,
      skills, location: editForm.location, projects: editProjects
    }).eq("id", user.id);
    if (error) { showToast("Fehler beim Speichern", "#ef4444"); return; }
    setProfile(prev => ({ ...prev, bio: editForm.bio, linkedin_url: editForm.linkedin_url, skills, location: editForm.location, projects: editProjects }));
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
    setChatMessages(prev => [...prev, { id: tempId, me: true, content, is_read: false, created_at: new Date().toISOString(), temp: true }]);
    const { data } = await supabase.from("messages").insert({ match_id: activeChat.id, sender_id: user.id, content, is_read: false }).select().single();
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

  const incomingOffersCount = offers.filter(o => o.receiver_id === user?.id).length;

  // ── STYLES ───────────────────────────────────────────────
  const s = {
    page: { background: "#ccdff5", minHeight: "100vh", color: "#0f1f3d", fontFamily: "'Sora', sans-serif", display: "flex", flexDirection: "column" },
    topBar: { position: "sticky", top: 0, zIndex: 50, background: "rgba(230,243,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #c0d8f0", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 },
    logo: { fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1.15rem", color: "#0f1f3d" },
    content: { flex: 1, paddingBottom: 72, maxWidth: 640, margin: "0 auto", width: "100%" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, height: 64, background: "rgba(232,242,255,0.97)", borderTop: "1px solid #c0d8f0", display: "flex", alignItems: "center", justifyContent: "space-around", maxWidth: 640, margin: "0 auto" },
    card: { margin: "0 16px 12px", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 14, padding: 16 },
    input: { width: "100%", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 10, padding: "11px 14px", fontFamily: "inherit", fontSize: 14, color: "#000000", outline: "none", boxSizing: "border-box" },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a6a8a", marginBottom: 6, display: "block" },
    btn: (bg = "#2a7fff") => ({ padding: "10px 20px", background: bg, color: "#fff", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }),
    overlay: { position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 640, height: "100vh", background: "#e6f3ff", zIndex: 100, display: "flex", flexDirection: "column", overflowY: "auto" },
  };

  // ── EMAIL CONFIRM SCREEN ─────────────────────────────────
  if (screen === "auth" && awaitingEmailConfirm) return (
    <div style={{ ...s.page, alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>📧</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1.4rem", color: "#0f1f3d", marginBottom: 12 }}>E-Mail bestätigen</div>
        <div style={{ fontSize: 14, color: "#1a3a6a", lineHeight: 1.7, marginBottom: 8 }}>
          Wir haben eine Bestätigungs-Mail an
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#2a7fff", marginBottom: 20 }}>{awaitingEmailConfirm}</div>
        <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.7, marginBottom: 28, background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 16 }}>
          Klicke auf den Link in der Mail um deinen Account zu aktivieren. Danach kannst du dich einloggen.
        </div>
        <button onClick={() => setAwaitingEmailConfirm(null)} style={{ ...s.btn("#e8f2ff"), color: "#2a7fff", border: "1px solid #c0d8f0", width: "100%", padding: 14, fontSize: 14, borderRadius: 12 }}>
          Zurück zum Login
        </button>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap" }}>{toast.msg}</div>}
    </div>
  );

  // ── AUTH SCREEN ──────────────────────────────────────────
  if (screen === "auth") return (
    <div style={{ ...s.page, alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2.4rem", color: "#ffffff" }}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
          <div style={{ fontSize: 12, color: "#1a3a6a", marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Connect · Solve · Grow</div>
        </div>

        <button onClick={handleGoogleLogin} style={{ width: "100%", padding: "12px 20px", background: "#fff", color: "#1a1a1a", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Mit Google anmelden
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#c0d8f0" }}></div>
          <span style={{ fontSize: 12, color: "#4a6a9a" }}>oder</span>
          <div style={{ flex: 1, height: 1, background: "#c0d8f0" }}></div>
        </div>

        <div style={{ display: "flex", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => setAuthMode(m)} style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", background: authMode === m ? "#2a7fff" : "none", color: authMode === m ? "#fff" : "#4a6a9a", transition: "all 0.2s" }}>
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
                {[{ k: "freelancer", l: "👤 Freelancer" }, { k: "sideprojekt", l: "💼 Side-Projekt" }, { k: "company", l: "🏢 Unternehmen" }].map(({ k, l }) => (
                  <button key={k} onClick={() => setAuthForm(p => ({ ...p, type: k }))} style={{ flex: 1, padding: "12px 6px", borderRadius: 10, border: `2px solid ${authForm.type === k ? "#2a7fff" : "#c0d8f0"}`, background: authForm.type === k ? "#2a7fff18" : "#e8f2ff", color: authForm.type === k ? "#2a7fff" : "#4a6a9a", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
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

        {authMode === "login" && !showForgotPw && (
          <button onClick={() => setShowForgotPw(true)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "center", marginBottom: 14, padding: "4px 0" }}>
            Passwort vergessen?
          </button>
        )}

        {showForgotPw && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 10, textAlign: "center" }}>E-Mail eingeben — wir schicken dir einen Reset-Link</div>
            <input style={{ ...s.input, marginBottom: 10 }} type="email" placeholder="Deine E-Mail" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowForgotPw(false)} style={{ flex: 1, padding: 11, borderRadius: 10, border: "1px solid #c0d8f0", background: "#ccdff5", color: "#4a5a7a", fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Abbrechen</button>
              <button onClick={handleForgotPassword} disabled={loading} style={{ flex: 2, ...s.btn(), padding: 11, fontSize: 13, borderRadius: 10, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sende..." : "Reset-Link senden"}
              </button>
            </div>
          </div>
        )}

        <div style={{ background: "#2a7fff10", border: "1px solid #2a7fff22", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#6a9adf", lineHeight: 1.6, textAlign: "center" }}>
          🔒 DSGVO-konform · Nur für Business · 18+
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap" }}>{toast.msg}</div>}
    </div>
  );

  // ── ONBOARDING ───────────────────────────────────────────
  if (screen === "onboarding") return (
    <div style={{ ...s.page, alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2rem", color: "#eaf2ff" }}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
          <div style={{ fontSize: 14, color: "#4a5a7a", marginTop: 8 }}>Profil einrichten</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Dein Name</label>
          <input style={s.input} placeholder="Vollständiger Name oder Firmenname" value={onboardingForm.name} onChange={e => setOnboardingForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        {!registeredWithEmail && (
          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>Account-Typ</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ k: "freelancer", l: "👤 Freelancer" }, { k: "sideprojekt", l: "💼 Side-Projekt" }, { k: "company", l: "🏢 Unternehmen" }].map(({ k, l }) => (
                <button key={k} onClick={() => setOnboardingForm(p => ({ ...p, type: k }))} style={{ flex: 1, padding: "14px 6px", borderRadius: 10, border: `2px solid ${onboardingForm.type === k ? "#2a7fff" : "#c0d8f0"}`, background: onboardingForm.type === k ? "#2a7fff18" : "#e8f2ff", color: onboardingForm.type === k ? "#2a7fff" : "#4a6a9a", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleOnboarding} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 14, fontSize: 15, borderRadius: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Speichern..." : "Loslegen →"}
        </button>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap" }}>{toast.msg}</div>}
    </div>
  );

  // ── POST CARD ─────────────────────────────────────────────
  const renderPostCard = (post) => (
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
        <div style={{ display: "flex", gap: 6 }}>
          {post.author_id === user?.id
            ? <button onClick={() => deletePost(post.id)} style={{ ...s.btn("#ef444418"), color: "#ef4444", border: "1px solid #ef444433", padding: "8px 14px", fontSize: 12 }}>🗑 Löschen</button>
            : <button onClick={() => setShowReportForm({ type: "post", id: post.id, name: post.title })} style={{ background: "none", border: "none", color: "#8090aa", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "8px 4px" }}>⚑ Melden</button>
          }
          {post.author_id !== user?.id && (
            <button onClick={() => toggleSavePost(post)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: "4px", opacity: savedPostIds.has(post.id) ? 1 : 0.35 }} title={savedPostIds.has(post.id) ? "Gespeichert" : "Speichern"}>🔖</button>
          )}
        </div>
        {post.author_id !== user?.id && (
          <button onClick={() => handleConnect(post)} style={s.btn()}>Angebot senden →</button>
        )}
      </div>
    </div>
  );

  // ── HOME ─────────────────────────────────────────────────
  const renderHome = () => (
    <>
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-around" }}>
          {[["🟢", stats.activeNow, "Aktiv"], ["👥", stats.totalMembers, "Mitglieder"], ["📝", stats.postsToday, "Posts heute"]].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#000000", fontFamily: "'Orbitron', monospace" }}>{icon} {val}</div>
              <div style={{ fontSize: 10, color: "#4a5a7a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 16px 0" }}>
        <div style={{ display: "flex", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 3 }}>
          {[{ k: "feed", l: "📋 Feed" }, { k: "personen", l: "👥 Personen" }, { k: "gespeichert", l: "🔖 Gespeichert" }].map(({ k, l }) => (
            <button key={k} onClick={() => setHomeTab(k)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", background: homeTab === k ? "#2a7fff" : "none", color: homeTab === k ? "#fff" : "#1a3a5a", transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>
      </div>

      {homeTab === "feed" && <>
        <div style={{ padding: "10px 16px 0" }}>
          <input style={{ ...s.input, paddingLeft: 40, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%234a5a7a' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8' stroke='%234a5a7a' stroke-width='2' fill='none'/%3E%3Cpath d='m21 21-4.35-4.35' stroke='%234a5a7a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "14px center" }}
            placeholder="Suchen nach Titel, Tags, Ort..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ padding: "10px 16px 0" }}>
          <div style={{ display: "flex", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 3 }}>
            {[{ k: "seek", l: "🔍 Ich suche" }, { k: "offer", l: "💡 Ich biete" }].map(({ k, l }) => (
              <button key={k} onClick={() => { setFeedTab(k); setSearchQuery(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", background: feedTab === k ? "#2a7fff" : "none", color: feedTab === k ? "#fff" : "#1a3a5a", transition: "all 0.2s" }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "10px 0" }}>
          <button onClick={() => categoryScrollRef.current?.scrollBy({ left: -120, behavior: "smooth" })} style={{ position: "absolute", left: 4, zIndex: 2, width: 28, height: 28, borderRadius: 8, background: "#e8f2ff", border: "1px solid #c0d8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#2a7fff", flexShrink: 0, boxShadow: "2px 0 8px #ccdff5" }}>‹</button>
          <div ref={categoryScrollRef} style={{ display: "flex", gap: 7, padding: "0 40px", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", border: "none", background: activeCategory === cat ? "#2a7fff" : "#e8f2ff", color: activeCategory === cat ? "#fff" : "#1a3a5a", outline: `1px solid ${activeCategory === cat ? "#2a7fff" : "#c0d8f0"}`, flexShrink: 0, fontFamily: "inherit", transition: "all 0.2s" }}>
                {cat}
              </button>
            ))}
          </div>
          <button onClick={() => categoryScrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })} style={{ position: "absolute", right: 4, zIndex: 2, width: 28, height: 28, borderRadius: 8, background: "#e8f2ff", border: "1px solid #c0d8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#2a7fff", flexShrink: 0, boxShadow: "-2px 0 8px #ccdff5" }}>›</button>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{searchQuery ? "Keine Ergebnisse" : "Noch keine Posts"}</div>
            <div style={{ fontSize: 13 }}>{searchQuery ? "Andere Suchbegriffe versuchen" : "Sei der Erste – erstelle einen Post!"}</div>
          </div>
        ) : filteredPosts.map(post => renderPostCard(post))}
      </>}

      {homeTab === "personen" && <>
        <div style={{ padding: "10px 16px 0" }}>
          <input style={{ ...s.input, paddingLeft: 40, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%234a5a7a' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8' stroke='%234a5a7a' stroke-width='2' fill='none'/%3E%3Cpath d='m21 21-4.35-4.35' stroke='%234a5a7a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "14px center" }}
            placeholder="Name oder Skills suchen..."
            value={userSearchQuery}
            onChange={e => { setUserSearchQuery(e.target.value); searchUsers(e.target.value); }}
          />
        </div>
        {userSearchResults.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{userSearchQuery ? "🔍" : "👥"}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{userSearchQuery ? "Keine Nutzer gefunden" : "Nutzer suchen"}</div>
            {!userSearchQuery && <div style={{ fontSize: 13, marginTop: 6 }}>Suche nach Namen oder Skills</div>}
          </div>
        ) : userSearchResults.map(u => (
          <div key={u.id} onClick={() => fetchOtherProfile(u.id)} style={{ ...s.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar url={u.avatar_url} initials={(u.display_name || "?").substring(0, 2).toUpperCase()} size={48} color={u.is_verified ? "#10b981" : "#2a7fff"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f1f3d" }}>{u.display_name}</div>
              <div style={{ fontSize: 12, color: "#4a5a7a", marginTop: 2 }}>
                {u.account_type === "freelancer" ? "👤 Freelancer" : u.account_type === "side_project" ? "💼 Side-Projekt" : "🏢 Unternehmen"}
              </div>
              {u.skills?.length > 0 && <div style={{ fontSize: 12, color: "#8090aa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.skills.slice(0, 4).join(" · ")}</div>}
            </div>
            {u.rating_avg ? (
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 14, color: "#f59e0b" }}>⭐</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{Number(u.rating_avg).toFixed(1)}</div>
              </div>
            ) : null}
          </div>
        ))}
      </>}

      {homeTab === "gespeichert" && (
        savedPostsList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Keine gespeicherten Posts</div>
            <div style={{ fontSize: 13 }}>Bookmarke Posts im Feed um sie hier zu finden</div>
          </div>
        ) : savedPostsList.map(post => renderPostCard(post))
      )}
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
              Angebot senden →
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
              {viewingProfile.account_type === "company" ? "🏢 Unternehmen" : viewingProfile.account_type === "sideprojekt" ? "💼 Side-Projekt" : "👤 Freelancer"}
              {viewingProfile.location && ` · 📍 ${viewingProfile.location}`}
            </div>

            <div style={{ display: "flex", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              {[["Trust", viewingProfile.trust_score || 0], ["Bewertung", `${viewingProfile.rating_avg || 0}★`], ["Posts", viewingProfilePosts.length]].map(([l, v], i) => (
                <div key={l} style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: i < 2 ? "1px solid #c0d8f0" : "none" }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, color: "#2a7fff" }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#4a6a8a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                </div>
              ))}
            </div>

            {viewingProfile.bio && (
              <div style={{ fontSize: 13, color: "#1a3a5a", lineHeight: 1.7, marginBottom: 16, background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14 }}>
                {viewingProfile.bio}
              </div>
            )}

            {viewingProfile.skills?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Skills</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {viewingProfile.skills.map(sk => <span key={sk} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#2a7fff15", color: "#2a7fff", border: "1px solid #2a7fff33" }}>{sk}</span>)}
                </div>
              </div>
            )}

            {viewingProfile.projects?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Projekte</div>
                {viewingProfile.projects.map((p, i) => (
                  <a key={i} href={p.url || undefined} target="_blank" rel="noreferrer" style={{ display: "block", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 10, padding: 12, marginBottom: 8, textDecoration: "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1f3d" }}>{p.name}</div>
                    {p.desc && <div style={{ fontSize: 12, color: "#4a6a8a", marginTop: 2 }}>{p.desc}</div>}
                    {p.url && <div style={{ fontSize: 11, color: "#2a7fff", marginTop: 3 }}>🔗 {p.url}</div>}
                  </a>
                ))}
              </div>
            )}

            {viewingProfile.linkedin_url && (
              <a href={viewingProfile.linkedin_url} target="_blank" rel="noreferrer" style={{ ...s.btn("#0077b5"), display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 16, fontSize: 13 }}>
                LinkedIn Profil →
              </a>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Posts ({viewingProfilePosts.length})</div>
              {viewingProfilePosts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#4a6a8a", fontSize: 13, background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12 }}>Keine aktiven Posts</div>
              ) : viewingProfilePosts.map(post => (
                <div key={post.id} style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: post.type === "seek" ? "#2a7fff18" : "#00c8ff15", color: post.type === "seek" ? "#2a7fff" : "#0099cc", border: `1px solid ${post.type === "seek" ? "#2a7fff44" : "#00c8ff33"}` }}>
                      {post.type === "seek" ? "Suche" : "Biete"}
                    </span>
                    <span style={{ fontSize: 11, color: "#4a6a8a" }}>{timeAgo(post.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5, color: "#0f1f3d" }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: "#4a6a8a", lineHeight: 1.5, marginBottom: 8 }}>{post.description}</div>
                  {post.budget && <div style={{ fontSize: 12, color: "#10b981", marginBottom: 8 }}>💰 €{post.budget}</div>}
                  {viewingProfile.id !== user?.id && (
                    <button onClick={() => { handleConnect({ ...post, author: { id: viewingProfile.id, name: viewingProfile.display_name }, author_id: viewingProfile.id }); setViewingProfile(null); }} style={{ ...s.btn(), padding: "8px 16px", fontSize: 13, width: "100%", borderRadius: 8 }}>Angebot senden →</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── OFFER FORM ────────────────────────────────────────────
  const renderOfferForm = () => {
    if (!showOfferForm) return null;
    const isCounter = showOfferForm.type === "counter";
    const receiverName = isCounter ? showOfferForm.receiverName : (showOfferForm.post?.author?.name || "");
    const postTitle = isCounter ? showOfferForm.postTitle : showOfferForm.post?.title;
    return (
      <div style={s.overlay}>
        <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
          <button onClick={() => setShowOfferForm(null)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{isCounter ? "Gegenangebot" : "Angebot senden"}</span>
          <div style={{ width: 32 }}></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "none" }}>
          <div style={{ background: "#2a7fff10", border: "1px solid #2a7fff22", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              {isCounter ? "Gegenangebot an" : "Angebot an"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eaf2ff" }}>{receiverName}</div>
            {postTitle && <div style={{ fontSize: 12, color: "#4a5a7a", marginTop: 4 }}>Post: {postTitle}</div>}
          </div>

          {isCounter && (
            <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b33", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fbbf24", marginBottom: 16 }}>
              ↔ Du machst ein Gegenangebot. Das ursprüngliche Angebot wurde zurückgezogen.
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Vorschlag * <span style={{ color: "#4a5a7a", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(mind. 30 Zeichen)</span></label>
            <textarea
              style={{ ...s.input, height: 110, resize: "none", lineHeight: 1.6 }}
              placeholder="Beschreibe konkret, was du anbietest, wie du vorgehst und welchen Mehrwert du lieferst..."
              value={offerForm.proposal}
              onChange={e => setOfferForm(p => ({ ...p, proposal: e.target.value }))}
              maxLength={1000}
            />
            <div style={{ fontSize: 11, color: "#4a5a7a", marginTop: 4, textAlign: "right" }}>{offerForm.proposal.length}/1000</div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Preis (€)</label>
              <input
                style={s.input}
                type="number"
                placeholder="z.B. 2500"
                value={offerForm.price}
                onChange={e => setOfferForm(p => ({ ...p, price: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Zeitplan</label>
              <input
                style={s.input}
                placeholder="z.B. 4 Wochen"
                value={offerForm.timeline}
                onChange={e => setOfferForm(p => ({ ...p, timeline: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>Referenzen / Nachweise</label>
            <textarea
              style={{ ...s.input, height: 80, resize: "none", lineHeight: 1.6 }}
              placeholder="Links, Portfolios, bisherige Projekte, Case Studies..."
              value={offerForm.refLinks}
              onChange={e => setOfferForm(p => ({ ...p, refLinks: e.target.value }))}
              maxLength={500}
            />
          </div>

          <button onClick={handleSendOffer} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 15, fontSize: 15, borderRadius: 12, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Wird gesendet..." : isCounter ? "Gegenangebot senden →" : "Angebot senden →"}
          </button>
        </div>
      </div>
    );
  };

  // ── OFFER DETAIL ──────────────────────────────────────────
  const renderOfferDetail = () => {
    if (!showOfferDetail) return null;
    const offer = showOfferDetail;
    const isReceiver = offer.receiver_id === user?.id;
    const partner = isReceiver ? offer.sender : offer.receiver;
    return (
      <div style={s.overlay}>
        <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
          <button onClick={() => setShowOfferDetail(null)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{isReceiver ? "Eingehendes Angebot" : "Gesendetes Angebot"}</span>
          <div style={{ width: 32 }}></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Avatar url={partner?.avatar_url} initials={(partner?.display_name || "?").substring(0, 2)} size={52} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{partner?.display_name || "Unbekannt"}</div>
              <div style={{ fontSize: 12, color: "#4a5a7a", marginTop: 3 }}>{timeAgo(offer.created_at)}</div>
              {offer.posts?.title && <div style={{ fontSize: 12, color: "#4a5a7a", marginTop: 2 }}>Post: {offer.posts.title}</div>}
            </div>
          </div>

          {offer.parent_offer_id && (
            <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b33", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#fbbf24", marginBottom: 16 }}>
              ↔ Dies ist ein Gegenangebot
            </div>
          )}

          <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Vorschlag</div>
            <div style={{ fontSize: 14, color: "#eaf2ff", lineHeight: 1.7 }}>{offer.proposal}</div>
          </div>

          {(offer.price || offer.timeline) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {offer.price && (
                <div style={{ flex: 1, background: "#10b98110", border: "1px solid #10b98133", borderRadius: 12, padding: "14px" }}>
                  <div style={{ fontSize: 11, color: "#4a5a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Preis</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", fontFamily: "'Orbitron', monospace" }}>€{offer.price}</div>
                </div>
              )}
              {offer.timeline && (
                <div style={{ flex: 1, background: "#2a7fff10", border: "1px solid #2a7fff33", borderRadius: 12, padding: "14px" }}>
                  <div style={{ fontSize: 11, color: "#4a5a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Zeitplan</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2a7fff" }}>{offer.timeline}</div>
                </div>
              )}
            </div>
          )}

          {offer.ref_links && (
            <div style={{ background: "#0d1120", border: "1px solid #1a2540", borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#4a5a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Referenzen</div>
              <div style={{ fontSize: 13, color: "#8090aa", lineHeight: 1.7, wordBreak: "break-word" }}>{offer.ref_links}</div>
            </div>
          )}

          {isReceiver ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => handleOfferResponse(offer, "accept")} style={{ ...s.btn("#10b981"), width: "100%", padding: 15, fontSize: 15, borderRadius: 12 }}>
                ✓ Annehmen → Chat öffnen
              </button>
              <button onClick={() => handleOfferResponse(offer, "counter")} style={{ ...s.btn("#2a7fff"), width: "100%", padding: 14, fontSize: 14, borderRadius: 12 }}>
                ↔ Gegenangebot machen
              </button>
              <button onClick={() => handleOfferResponse(offer, "decline")} style={{ ...s.btn("#ef444415"), color: "#ef4444", border: "1px solid #ef444433", width: "100%", padding: 13, fontSize: 13, borderRadius: 12 }}>
                ✕ Angebot ablehnen
              </button>
            </div>
          ) : (
            <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b33", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 14, color: "#fbbf24", fontWeight: 600, marginBottom: 6 }}>Warte auf Antwort</div>
              <div style={{ fontSize: 12, color: "#4a5a7a", lineHeight: 1.6 }}>Dein Angebot wurde gesendet. Du erhältst eine Antwort, sobald die andere Seite reagiert.</div>
            </div>
          )}
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
            <button onClick={() => { setActiveChat(null); setChatMessages([]); setDeletingChatId(null); }} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={getChatPartner(activeChat)} size={32} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{getChatPartner(activeChat)}</div>
                <div style={{ fontSize: 11, color: "#10b981" }}>● Aktiv</div>
              </div>
            </div>
            {deletingChatId === activeChat?.id ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => deleteChat(activeChat.id)} style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "#ef444418", border: "1px solid #ef444433", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>Ja</button>
                <button onClick={() => setDeletingChatId(null)} style={{ fontSize: 11, color: "#4a5a7a", background: "none", border: "1px solid #1a2540", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>Nein</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { const partnerId = activeChat.seeker_id === user.id ? activeChat.provider_id : activeChat.seeker_id; setRatingScore(0); setRatingComment(""); setShowRatingForm({ matchId: activeChat.id, ratedId: partnerId, name: getChatPartner(activeChat) }); }} style={{ width: 32, height: 32, borderRadius: 8, background: "#f59e0b18", border: "1px solid #f59e0b44", color: "#f59e0b", fontSize: 15, cursor: "pointer" }}>⭐</button>
                <button onClick={() => setDeletingChatId(activeChat?.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "#ef444415", border: "1px solid #ef444430", color: "#ef4444", fontSize: 14, cursor: "pointer" }}>🗑</button>
              </div>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 140px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", color: "#4a5a7a", fontSize: 13, marginTop: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🤝</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Verbindung hergestellt</div>
                <div>Schreib die erste Nachricht!</div>
              </div>
            )}
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
          <div style={{ padding: "14px 16px 6px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a5a7a" }}>Postfach</div>

          {offers.length > 0 && (
            <>
              <div style={{ padding: "6px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2a7fff" }}>Angebote</span>
                <span style={{ background: "#2a7fff", color: "#fff", borderRadius: 100, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{offers.length}</span>
              </div>
              {offers.map(offer => {
                const isRec = offer.receiver_id === user?.id;
                const partner = isRec ? offer.sender : offer.receiver;
                return (
                  <div key={offer.id} onClick={() => setShowOfferDetail(offer)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid #ffffff05", cursor: "pointer", background: isRec ? "#2a7fff06" : "none" }}>
                    <Avatar url={partner?.avatar_url} initials={(partner?.display_name || "?").substring(0, 2)} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{partner?.display_name || "Unbekannt"}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: isRec ? "#2a7fff" : "#f59e0b15", color: isRec ? "#fff" : "#f59e0b", border: isRec ? "none" : "1px solid #f59e0b44", fontWeight: 700, flexShrink: 0 }}>
                          {isRec ? "Eingehend" : "Gesendet"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#8090aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{offer.proposal}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        {offer.price && <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>€{offer.price}</span>}
                        {offer.timeline && <span style={{ fontSize: 11, color: "#4a5a7a" }}>⏱ {offer.timeline}</span>}
                        {offer.parent_offer_id && <span style={{ fontSize: 11, color: "#f59e0b" }}>↔ Gegenangebot</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {chats.length > 0 && (
            <div style={{ padding: "10px 16px 6px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4a5a7a" }}>Gespräche</span>
            </div>
          )}

          {chats.length === 0 && offers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Noch keine Aktivität</div>
              <div style={{ fontSize: 13 }}>Sende ein Angebot an jemanden im Feed!</div>
            </div>
          ) : chats.map(chat => (
            <div key={chat.id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ffffff05", background: chat.has_unread ? "#2a7fff06" : "none" }}>
              <div onClick={() => { setActiveChat(chat); fetchMessages(chat.id); setDeletingChatId(null); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", flex: 1, minWidth: 0, cursor: "pointer" }}>
                <Avatar initials={getChatPartner(chat)} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: chat.has_unread ? 700 : 600, marginBottom: 3 }}>{getChatPartner(chat)}</div>
                  <div style={{ fontSize: 12, color: chat.has_unread ? "#eaf2ff" : "#4a5a7a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {chat.last_message || "Aktives Gespräch"}
                  </div>
                  <span style={{ fontSize: 11, color: "#4a5a7a" }}>{timeAgo(chat.last_message_at || chat.created_at)}</span>
                </div>
                {chat.has_unread && <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "block", flexShrink: 0 }}></span>}
              </div>
              <div style={{ padding: "0 12px 0 0", flexShrink: 0 }}>
                {deletingChatId === chat.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <button onClick={e => { e.stopPropagation(); deleteChat(chat.id); }} style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "#ef444418", border: "1px solid #ef444433", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>Löschen</button>
                    <button onClick={e => { e.stopPropagation(); setDeletingChatId(null); }} style={{ fontSize: 11, color: "#4a5a7a", background: "none", border: "1px solid #1a2540", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>Abbrechen</button>
                  </div>
                ) : (
                  <button onClick={e => { e.stopPropagation(); setDeletingChatId(chat.id); }} style={{ width: 30, height: 30, borderRadius: 8, background: "none", border: "1px solid #1a2540", color: "#4a5a7a", fontSize: 13, cursor: "pointer" }}>🗑</button>
                )}
              </div>
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

        <div onClick={() => coverInputRef.current.click()} style={{ height: 120, background: profile?.cover_url ? `url(${profile.cover_url}) center/cover` : "linear-gradient(135deg, #b8d4f0, #90bce8)", position: "relative", cursor: "pointer" }}>
          {!profile?.cover_url && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a3a5a", fontSize: 12, fontWeight: 600 }}>{uploadingCover ? "Wird hochgeladen..." : "📷 Titelbild hinzufügen"}</div>}
          {profile?.cover_url && <div style={{ position: "absolute", bottom: 8, right: 12, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#fff" }}>✏️ Ändern</div>}
          <button onClick={e => { e.stopPropagation(); handleLogout(); }} style={{ position: "absolute", top: 12, right: 16, fontSize: 12, color: "#ef4444", background: "rgba(0,0,0,0.5)", border: "1px solid #ef444433", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Abmelden</button>
        </div>

        <div style={{ padding: "0 16px", marginTop: -28 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => avatarInputRef.current.click()}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: 72, height: 72, borderRadius: 20, objectFit: "cover", border: "3px solid #ccdff5" }} />
                : <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #2a7fff, #00c8ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", border: "3px solid #ccdff5" }}>
                    {(profile?.display_name || "U").substring(0, 2).toUpperCase()}
                  </div>
              }
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, background: "#2a7fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #ccdff5" }}>{uploadingAvatar ? "⏳" : "📷"}</div>
            </div>
            <button onClick={() => setShowEditProfile(true)} style={{ ...s.btn("#e8f2ff"), border: "1px solid #c0d8f0", color: "#0f1f3d", padding: "8px 16px", fontSize: 13 }}>✏️ Bearbeiten</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", fontWeight: 900 }}>{profile?.display_name || "Nutzer"}</span>
            {profile?.is_verified && <span style={{ background: "#10b981", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</span>}
          </div>
          <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 4 }}>{profile?.account_type === "company" ? "🏢 Unternehmen" : profile?.account_type === "sideprojekt" ? "💼 Side-Projekt" : "👤 Freelancer"}</div>
          {profile?.location && <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 10 }}>📍 {profile.location}</div>}

          {profile?.bio && (
            <div style={{ fontSize: 13, color: "#1a3a5a", lineHeight: 1.7, marginBottom: 14, background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14 }}>{profile.bio}</div>
          )}

          {profile?.skills?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {profile.skills.map(sk => <span key={sk} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#2a7fff15", color: "#2a7fff", border: "1px solid #2a7fff33" }}>{sk}</span>)}
            </div>
          )}

          {profile?.projects?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Projekte</div>
              {profile.projects.map((p, i) => (
                <a key={i} href={p.url || undefined} target="_blank" rel="noreferrer" style={{ display: "block", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 10, padding: 12, marginBottom: 8, textDecoration: "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1f3d" }}>{p.name}</div>
                  {p.desc && <div style={{ fontSize: 12, color: "#4a6a8a", marginTop: 2 }}>{p.desc}</div>}
                  {p.url && <div style={{ fontSize: 11, color: "#2a7fff", marginTop: 3 }}>🔗 {p.url}</div>}
                </a>
              ))}
            </div>
          )}

          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ ...s.btn("#0077b5"), display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 14, fontSize: 13 }}>LinkedIn →</a>
          )}

          <div style={{ display: "flex", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
            {[["Trust", trust], ["Projekte", profile?.completed_projects || 0], ["Bewertung", `${profile?.rating_avg || 0}★`]].map(([l, v], i) => (
              <div key={l} style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: i < 2 ? "1px solid #c0d8f0" : "none" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, color: "#2a7fff" }}>{v}</div>
                <div style={{ fontSize: 10, color: "#4a6a8a", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Post-Limit heute</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              {Array.from({ length: Math.min(limit === 99 ? 10 : limit, 10) }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < used ? "#2a7fff" : "#c0d8f0" }}></div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#4a6a8a" }}>{used}/{limit === 99 ? "∞" : limit} Posts · Trust {trust}</div>
          </div>

          <div style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Provisions-Tracking</div>
            {[["Ausstehend", "€0", "#d97706"], ["Ausgezahlt", "€0", "#059669"], ["Aktive Matches", chats.length, "#2a7fff"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#4a6a8a" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 20, paddingTop: 4 }}>
            <button onClick={() => setShowImpressum(true)} style={{ background: "none", border: "none", color: "#4a5a7a", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>Impressum</button>
            <button onClick={() => setShowDatenschutz(true)} style={{ background: "none", border: "none", color: "#4a5a7a", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>Datenschutz</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Meine Posts ({ownPosts.length})</div>
            {ownPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 20px", color: "#4a6a8a", background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 13 }}>Noch keine Posts</div>
              </div>
            ) : ownPosts.map(post => (
              <div key={post.id} style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: post.type === "seek" ? "#2a7fff18" : "#00c8ff15", color: post.type === "seek" ? "#2a7fff" : "#0099cc", border: `1px solid ${post.type === "seek" ? "#2a7fff44" : "#00c8ff33"}` }}>
                    {post.type === "seek" ? "Suche" : "Biete"}
                  </span>
                  <span style={{ fontSize: 11, color: "#4a6a8a" }}>{timeAgo(post.created_at)}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5, color: "#000" }}>{post.title}</div>
                <div style={{ fontSize: 12, color: "#2a4a6a", lineHeight: 1.5, marginBottom: 10 }}>{post.description}</div>
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
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Projekte / Portfolio</label>
          {editProjects.map((p, i) => (
            <div key={i} style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1f3d" }}>{p.name}</div>
                {p.desc && <div style={{ fontSize: 12, color: "#4a6a8a", marginTop: 2 }}>{p.desc}</div>}
                {p.url && <div style={{ fontSize: 11, color: "#2a7fff", marginTop: 2, wordBreak: "break-all" }}>🔗 {p.url}</div>}
              </div>
              <button onClick={() => setEditProjects(prev => prev.filter((_, j) => j !== i))} style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 10 }}>✕</button>
            </div>
          ))}
          <div style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 10, padding: 12 }}>
            <input style={{ ...s.input, marginBottom: 8 }} placeholder="Projektname *" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
            <input style={{ ...s.input, marginBottom: 8 }} placeholder="Link (https://...)" value={newProject.url} onChange={e => setNewProject(p => ({ ...p, url: e.target.value }))} />
            <input style={{ ...s.input, marginBottom: 10 }} placeholder="Kurzbeschreibung (optional)" value={newProject.desc} onChange={e => setNewProject(p => ({ ...p, desc: e.target.value }))} />
            <button onClick={() => {
              if (!newProject.name.trim()) { showToast("Projektname eingeben", "#ef4444"); return; }
              setEditProjects(prev => [...prev, { name: newProject.name.trim(), url: newProject.url.trim(), desc: newProject.desc.trim() }]);
              setNewProject({ name: "", url: "", desc: "" });
            }} style={{ ...s.btn(), padding: "9px 16px", fontSize: 13, width: "100%", borderRadius: 8 }}>+ Projekt hinzufügen</button>
          </div>
        </div>
        <button onClick={saveProfile} style={{ ...s.btn(), width: "100%", padding: 14, fontSize: 15, borderRadius: 12 }}>Speichern ✓</button>
      </div>
    </div>
  );

  // ── REPORT FORM ───────────────────────────────────────────
  const renderReportForm = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 640, background: "#e6f3ff", borderRadius: "20px 20px 0 0", padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>⚑ Melden</div>
        <div style={{ fontSize: 12, color: "#4a6a8a", marginBottom: 16 }}>{showReportForm?.name}</div>
        <textarea style={{ ...s.input, height: 90, resize: "none", lineHeight: 1.5, marginBottom: 14 }} placeholder="Warum meldest du das? (Spam, Betrug, unangemessen...)" value={reportReason} onChange={e => setReportReason(e.target.value)} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setShowReportForm(null); setReportReason(""); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #c0d8f0", background: "#e8f2ff", color: "#4a6a8a", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Abbrechen</button>
          <button onClick={submitReport} style={{ ...s.btn("#ef4444"), flex: 1, padding: 12, borderRadius: 10 }}>Melden</button>
        </div>
      </div>
    </div>
  );

  // ── ADMIN PANEL ───────────────────────────────────────────
  const renderAdmin = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>⚙️ Admin Panel</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ display: "flex", gap: 0, background: "#e8f2ff", borderBottom: "1px solid #c0d8f0", flexShrink: 0 }}>
        {[["reports", "⚑ Meldungen", adminReports.length], ["users", "👥 Nutzer", adminUsers.length], ["posts", "📝 Posts", adminPosts.length], ["stats", "📊 Stats", null]].map(([k, l, count]) => (
          <button key={k} onClick={() => setAdminTab(k)} style={{ flex: 1, padding: "10px 4px", border: "none", borderBottom: adminTab === k ? "2px solid #2a7fff" : "2px solid transparent", background: "none", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: adminTab === k ? "#2a7fff" : "#4a6a8a", cursor: "pointer", position: "relative" }}>
            {l}{count > 0 && <span style={{ marginLeft: 4, background: "#ef4444", color: "#fff", borderRadius: 100, fontSize: 9, padding: "1px 5px", fontWeight: 700 }}>{count}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "none" }}>

        {/* MELDUNGEN */}
        {adminTab === "reports" && (adminReports.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "#4a6a8a" }}><div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>Keine offenen Meldungen</div>
          : adminReports.map(r => (
            <div key={r.id} style={{ background: "#e8f2ff", border: "1px solid #ef444433", borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase" }}>⚑ {r.reported_post_id ? "Post" : "Nutzer"}</span>
                <span style={{ fontSize: 11, color: "#4a6a8a" }}>{timeAgo(r.created_at)}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{r.post?.title || r.reported_user?.display_name || "Unbekannt"}</div>
              <div style={{ fontSize: 12, color: "#4a6a8a", marginBottom: 4 }}>Gemeldet von: {r.reporter?.display_name}</div>
              <div style={{ fontSize: 13, color: "#1a3a5a", background: "#fff", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{r.reason}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => resolveReport(r.id)} style={{ ...s.btn("#10b981"), padding: "7px 14px", fontSize: 12, borderRadius: 8 }}>✓ Erledigt</button>
                {r.reported_user_id && <button onClick={() => banUser(r.reported_user_id, true)} style={{ ...s.btn("#ef4444"), padding: "7px 14px", fontSize: 12, borderRadius: 8 }}>🚫 Sperren</button>}
                {r.reported_post_id && <button onClick={() => { deletePostAdmin(r.reported_post_id); resolveReport(r.id); }} style={{ ...s.btn("#ef4444"), padding: "7px 14px", fontSize: 12, borderRadius: 8 }}>🗑 Post löschen</button>}
              </div>
            </div>
          ))
        )}

        {/* NUTZER */}
        {adminTab === "users" && adminUsers.map(u => (
          <div key={u.id} style={{ background: "#e8f2ff", border: `1px solid ${u.is_banned ? "#ef444444" : "#c0d8f0"}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: u.is_banned ? "#ef4444" : "#0f1f3d" }}>
                  {u.display_name} {u.is_verified && "✓"} {u.is_admin && "⚙️"} {u.is_banned && "🚫"}
                </div>
                <div style={{ fontSize: 11, color: "#4a6a8a", marginTop: 2 }}>{u.account_type} · Trust {u.trust_score}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => verifyUser(u.id, !u.is_verified)} style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${u.is_verified ? "#10b981" : "#c0d8f0"}`, background: u.is_verified ? "#10b98120" : "#e8f2ff", color: u.is_verified ? "#10b981" : "#4a6a8a", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {u.is_verified ? "✓ Verifiziert" : "Verifizieren"}
                </button>
                {u.id !== user?.id && !u.is_admin && (
                  <button onClick={() => banUser(u.id, !u.is_banned)} style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${u.is_banned ? "#10b981" : "#ef4444"}`, background: u.is_banned ? "#10b98120" : "#ef444415", color: u.is_banned ? "#10b981" : "#ef4444", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {u.is_banned ? "Entsperren" : "Sperren"}
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#4a6a8a" }}>Trust:</span>
              <input type="number" min="0" max="100" value={trustInput[u.id] ?? u.trust_score} onChange={e => setTrustInput(p => ({ ...p, [u.id]: e.target.value }))} style={{ ...s.input, width: 70, padding: "5px 10px", fontSize: 13 }} />
              <button onClick={() => setTrustAdmin(u.id, trustInput[u.id] ?? u.trust_score)} style={{ ...s.btn(), padding: "6px 12px", fontSize: 12, borderRadius: 8 }}>Setzen</button>
            </div>
          </div>
        ))}

        {/* POSTS */}
        {adminTab === "posts" && adminPosts.map(p => (
          <div key={p.id} style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.type === "seek" ? "#2a7fff" : "#0099cc", textTransform: "uppercase" }}>{p.type === "seek" ? "Suche" : "Biete"}</span>
              <span style={{ fontSize: 11, color: "#4a6a8a" }}>{timeAgo(p.created_at)}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: "#4a6a8a", marginBottom: 8 }}>von {p.profiles?.display_name}</div>
            <button onClick={() => deletePostAdmin(p.id)} style={{ ...s.btn("#ef4444"), padding: "7px 14px", fontSize: 12, borderRadius: 8 }}>🗑 Löschen</button>
          </div>
        ))}

        {/* STATS */}
        {adminTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["👥 Nutzer gesamt", adminUsers.length, "#2a7fff"],
              ["📝 Posts gesamt", adminPosts.length, "#10b981"],
              ["⚑ Offene Meldungen", adminReports.length, "#ef4444"],
              ["🚫 Gesperrte Nutzer", adminUsers.filter(u => u.is_banned).length, "#f59e0b"],
              ["✓ Verifizierte Nutzer", adminUsers.filter(u => u.is_verified).length, "#10b981"],
              ["👤 Freelancer", adminUsers.filter(u => u.account_type === "freelancer").length, "#4a6a8a"],
              ["💼 Side-Projekte", adminUsers.filter(u => u.account_type === "sideprojekt").length, "#4a6a8a"],
              ["🏢 Unternehmen", adminUsers.filter(u => u.account_type === "company").length, "#4a6a8a"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: "#e8f2ff", border: "1px solid #c0d8f0", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#1a3a5a" }}>{l}</span>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        )}
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
            <button key={k} onClick={() => setPostType(k)} style={{ flex: 1, padding: "12px 8px", borderRadius: 11, border: `2px solid ${postType === k ? "#2a7fff" : "#c0d8f0"}`, background: postType === k ? "#2a7fff" : "#e8f2ff", color: postType === k ? "#fff" : "#1a3a5a", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l}</button>
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
        ].map(({ k, l, p, ta }) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={s.label}>{l}</label>
            {ta ? <textarea style={{ ...s.input, height: 90, resize: "none", lineHeight: 1.5 }} placeholder={p} value={postForm[k]} onChange={e => setPostForm(prev => ({ ...prev, [k]: e.target.value }))} />
              : <input style={s.input} placeholder={p} value={postForm[k]} onChange={e => setPostForm(prev => ({ ...prev, [k]: e.target.value }))} />}
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Kategorien</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {CATEGORIES.filter(c => c !== "Alle").map(cat => {
              const selected = postForm.tags.split(",").map(t => t.trim()).filter(Boolean).includes(cat);
              return (
                <button key={cat} type="button" onClick={() => {
                  const current = postForm.tags.split(",").map(t => t.trim()).filter(Boolean);
                  const next = selected ? current.filter(t => t !== cat) : [...current, cat];
                  setPostForm(prev => ({ ...prev, tags: next.join(", ") }));
                }} style={{ padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", border: "none", background: selected ? "#2a7fff" : "#e8f2ff", color: selected ? "#fff" : "#1a3a5a", outline: `1px solid ${selected ? "#2a7fff" : "#c0d8f0"}`, fontFamily: "inherit", transition: "all 0.2s" }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={handlePost} disabled={loading} style={{ ...s.btn(), width: "100%", padding: 15, fontSize: 15, borderRadius: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Wird veröffentlicht..." : "Post veröffentlichen ✓"}
        </button>
      </div>
    </div>
  );

  // ── NOTIFICATIONS ─────────────────────────────────────────
  const renderNotifications = () => {
    const unread = realNotifications.filter(n => !n.is_read).length;
    const icons = { offer_received: "📨", offer_accepted: "🎉", offer_declined: "❌" };
    return (
      <div style={s.overlay}>
        <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
          <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Benachrichtigungen</span>
          {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Alle lesen</button>}
          {unread === 0 && <div style={{ width: 60 }} />}
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          {realNotifications.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a5a7a" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Keine Benachrichtigungen</div>
              </div>
            : realNotifications.map(n => (
              <div key={n.id} style={{ padding: "14px 16px", borderBottom: "1px solid #c0d8f0", background: n.is_read ? "none" : "#2a7fff08", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{icons[n.type] || "🔔"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: n.is_read ? 500 : 700, color: "#0f1f3d", marginBottom: 2 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 12, color: "#4a6a8a", marginBottom: 3 }}>{n.body}</div>}
                  <div style={{ fontSize: 11, color: "#8090aa" }}>{timeAgo(n.created_at)}</div>
                </div>
                {!n.is_read && <div style={{ width: 8, height: 8, background: "#2a7fff", borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  // ── RATING FORM ───────────────────────────────────────────
  const renderRatingForm = () => {
    if (!showRatingForm) return null;
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) { setShowRatingForm(null); setRatingScore(0); setRatingComment(""); } }}>
        <div style={{ background: "#e8f2ff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640, padding: 24, paddingBottom: 36 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: "#0f1f3d" }}>⭐ Bewerten</div>
          <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 20 }}>{showRatingForm.name} bewerten</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRatingScore(n)} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer", opacity: n <= ratingScore ? 1 : 0.25, transition: "all 0.15s", padding: 0 }}>⭐</button>
            ))}
          </div>
          <textarea
            style={{ ...s.input, width: "100%", minHeight: 80, resize: "none", marginBottom: 16, boxSizing: "border-box" }}
            placeholder="Kommentar (optional)..."
            value={ratingComment}
            onChange={e => setRatingComment(e.target.value)}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setShowRatingForm(null); setRatingScore(0); setRatingComment(""); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #c0d8f0", background: "#ccdff5", color: "#4a5a7a", fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Abbrechen</button>
            <button onClick={submitRating} style={{ flex: 2, ...s.btn(), padding: 12, fontSize: 14, borderRadius: 10 }}>Bewertung absenden</button>
          </div>
        </div>
      </div>
    );
  };

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

  // ── IMPRESSUM ─────────────────────────────────────────────
  const renderImpressum = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowImpressum(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Impressum</span>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24, scrollbarWidth: "none" }}>
        <div style={{ fontSize: 14, color: "#8090aa", lineHeight: 1.9 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#eaf2ff", marginBottom: 16 }}>Qonnect</div>
          <p>Plattform für B2B-Networking</p>
          <p>Web: startqonnect.com</p>
          <p>E-Mail: contact@startqonnect.com</p>
          <p style={{ marginTop: 16, fontSize: 13, color: "#4a5a7a" }}>Für vollständige Impressumsinformationen wende dich bitte per E-Mail an uns.</p>
        </div>
      </div>
    </div>
  );

  // ── DATENSCHUTZ ───────────────────────────────────────────
  const renderDatenschutz = () => (
    <div style={s.overlay}>
      <div style={{ ...s.topBar, position: "sticky", flexShrink: 0 }}>
        <button onClick={() => setShowDatenschutz(false)} style={{ background: "none", border: "none", color: "#2a7fff", fontSize: 20, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Datenschutz</span>
        <div style={{ width: 32 }}></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24, scrollbarWidth: "none" }}>
        <div style={{ fontSize: 14, color: "#8090aa", lineHeight: 1.9 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#eaf2ff", marginBottom: 16 }}>Datenschutzerklärung</div>
          <p>Wir verarbeiten deine Daten gemäß DSGVO ausschließlich zur Bereitstellung der Plattform.</p>
          <p style={{ marginTop: 12 }}>Gespeicherte Daten: E-Mail, Name, Profilbild, Posts und Nachrichten auf der Plattform. Daten werden nicht an Dritte weitergegeben.</p>
          <p style={{ marginTop: 12 }}>Zum Löschen deines Kontos oder für Auskunftsanfragen: contact@startqonnect.com</p>
        </div>
      </div>
    </div>
  );

  // ── MAIN RENDER ───────────────────────────────────────────
  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {showAdmin && renderAdmin()}
      {showRatingForm && renderRatingForm()}
      {showReportForm && renderReportForm()}
      {showOfferForm && renderOfferForm()}
      {showOfferDetail && renderOfferDetail()}
      {showPostForm && renderPostForm()}
      {showNotifications && renderNotifications()}
      {showAI && renderAI()}
      {showEditProfile && renderEditProfile()}
      {selectedPost && renderPostDetail()}
      {viewingProfile && renderOtherProfile()}
      {showImpressum && renderImpressum()}
      {showDatenschutz && renderDatenschutz()}

      {!showOfferForm && !showOfferDetail && !showPostForm && !showNotifications && !showAI && !showEditProfile && !selectedPost && !viewingProfile && !showImpressum && !showDatenschutz && (
        <>
          <div style={s.topBar}>
            <div style={{ ...s.logo, cursor: "pointer" }} onClick={() => { setActiveTab("home"); setHomeTab("feed"); setSelectedPost(null); setViewingProfile(null); setSearchQuery(""); }}><span style={{ color: "#2a7fff" }}>q</span>onnect</div>
            <div style={{ display: "flex", gap: 10 }}>
              {profile?.is_admin && <button onClick={() => { setShowAdmin(true); fetchAdminData(); }} style={{ width: 36, height: 36, borderRadius: 10, background: "#ef444418", border: "1px solid #ef444444", color: "#ef4444", fontSize: 16, cursor: "pointer" }}>⚙️</button>}
              <button onClick={() => setShowAI(true)} style={{ width: 36, height: 36, borderRadius: 10, background: "#2a7fff18", border: "1px solid #2a7fff44", color: "#2a7fff", fontSize: 16, cursor: "pointer" }}>✦</button>
              <button onClick={() => { setShowNotifications(true); markAllRead(); }} style={{ width: 36, height: 36, borderRadius: 10, background: "#2a7fff18", border: "1px solid #2a7fff44", fontSize: 16, cursor: "pointer", position: "relative" }}>
                🔔
                {realNotifications.filter(n => !n.is_read).length > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: "50%", fontSize: 9, fontWeight: 700, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{realNotifications.filter(n => !n.is_read).length}</span>}
              </button>
            </div>
          </div>

          <div style={s.content}>
            {activeTab === "home" && renderHome()}
            {activeTab === "chat" && renderChat()}
            {activeTab === "profile" && renderProfile()}
          </div>
        </>
      )}

      {!showOfferForm && !showOfferDetail && !showNotifications && !showAI && !showEditProfile && !selectedPost && !viewingProfile && !showImpressum && !showDatenschutz && (
        <>
          {/* MOBIL – Instagram-Style Bottom Nav */}
          {isMobile && (
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 110, background: "#fff", borderTop: "1px solid #c0d8f0", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 12px", boxShadow: "0 -4px 20px #1a3a6a12" }}>
              {[{ k: "home", icon: "🏠", label: "Feed" }, { k: "chat", icon: "💬", label: "Chat" }].map(({ k, icon, label }) => (
                <button key={k} onClick={() => { setShowPostForm(false); setActiveTab(k); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: activeTab === k && !showPostForm ? "#2a7fff" : "#8090aa", fontFamily: "inherit" }}>{label}</span>
                </button>
              ))}
              <button onClick={() => setShowPostForm(true)} style={{ width: 48, height: 48, borderRadius: 16, background: "#2a7fff", border: "none", fontSize: 24, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px #2a7fff50", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
              {[{ k: "profile", icon: "👤", label: "Profil" }].map(({ k, icon, label }) => (
                <button key={k} onClick={() => { setShowPostForm(false); setActiveTab(k); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: activeTab === k && !showPostForm ? "#2a7fff" : "#8090aa", fontFamily: "inherit" }}>{label}</span>
                </button>
              ))}
              <button onClick={() => { setShowPostForm(false); setActiveTab("home"); setHomeTab("gespeichert"); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                <span style={{ fontSize: 22 }}>🔖</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: activeTab === "home" && homeTab === "gespeichert" && !showPostForm ? "#2a7fff" : "#8090aa", fontFamily: "inherit" }}>Gespeichert</span>
              </button>
            </div>
          )}

          {/* DESKTOP – Variante 7 & 8 mit Switcher */}
          {!isMobile && <>
            <button
              onClick={() => setNavVariant(v => v === 7 ? 8 : 7)}
              style={{ position: "fixed", bottom: 28, right: 12, zIndex: 120, width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid #c0d8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px #1a3a6a18" }}>
              <span style={{ fontSize: 18, color: "#2a7fff" }}>⇄</span>
            </button>

            {navVariant === 7 && <div style={{ position: "fixed", bottom: 16, left: 16, zIndex: 110, display: "flex", flexDirection: "column", gap: 6, background: "#fff", borderRadius: 20, padding: 10, boxShadow: "0 8px 32px #2a7fff28", border: "1px solid #c0d8f0" }}>
              {[{ k: "home", icon: "🏠", label: "Feed" }, { k: "chat", icon: "💬", label: "Chat" }].map(({ k, icon, label }) => (
                <button key={k} onClick={() => { setShowPostForm(false); setActiveTab(k); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, border: "none", background: activeTab === k && !showPostForm ? "#2a7fff" : "#e8f2ff", cursor: "pointer", minWidth: 110 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: activeTab === k && !showPostForm ? "#fff" : "#1a3a5a" }}>{label}</span>
                </button>
              ))}
              <button onClick={() => setShowPostForm(true)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, border: "none", background: "#2a7fff", cursor: "pointer", boxShadow: "0 4px 12px #2a7fff50" }}>
                <span style={{ fontSize: 18, color: "#fff" }}>✚</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Neu</span>
              </button>
              {[{ k: "offer", icon: "💡", label: "Anbieten" }, { k: "profile", icon: "👤", label: "Profil" }].map(({ k, icon, label }) => (
                <button key={k} onClick={() => { if (k === "offer") { setPostType("offer"); setShowPostForm(true); } else { setShowPostForm(false); setActiveTab(k); } }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, border: "none", background: activeTab === k && !showPostForm ? "#2a7fff" : "#e8f2ff", cursor: "pointer", minWidth: 110 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: activeTab === k && !showPostForm ? "#fff" : "#1a3a5a" }}>{label}</span>
                </button>
              ))}
            </div>}

            {navVariant === 8 && <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 620, zIndex: 110, display: "flex", justifyContent: "center", gap: 8, padding: "0 16px" }}>
              {[{ k: "home", icon: "🏠" }, { k: "chat", icon: "💬" }].map(({ k, icon }) => (
                <button key={k} onClick={() => { setShowPostForm(false); setActiveTab(k); }} style={{ flex: 1, height: 52, borderRadius: 16, border: `2px solid ${activeTab === k && !showPostForm ? "#2a7fff" : "#c0d8f0"}`, background: activeTab === k && !showPostForm ? "#2a7fff" : "#fff", cursor: "pointer", fontSize: 22, boxShadow: "0 4px 16px #1a3a6a15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ filter: activeTab === k && !showPostForm ? "brightness(10)" : "none" }}>{icon}</span>
                </button>
              ))}
              <button onClick={() => setShowPostForm(true)} style={{ flex: 1.4, height: 52, background: "#2a7fff", borderRadius: 16, border: "none", fontSize: 26, color: "#fff", cursor: "pointer", boxShadow: "0 6px 20px #2a7fff50", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              {[{ k: "offer", icon: "💡" }, { k: "profile", icon: "👤" }].map(({ k, icon }) => (
                <button key={k} onClick={() => { if (k === "offer") { setPostType("offer"); setShowPostForm(true); } else { setShowPostForm(false); setActiveTab(k); } }} style={{ flex: 1, height: 52, borderRadius: 16, border: `2px solid ${activeTab === k && !showPostForm ? "#2a7fff" : "#c0d8f0"}`, background: activeTab === k && !showPostForm ? "#2a7fff" : "#fff", cursor: "pointer", fontSize: 22, boxShadow: "0 4px 16px #1a3a6a15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ filter: activeTab === k && !showPostForm ? "brightness(10)" : "none" }}>{icon}</span>
                </button>
              ))}
            </div>}
          </>}
        </>
      )}

{toast && <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", zIndex: 300, boxShadow: "0 4px 20px #0008" }}>{toast.msg}</div>}
    </div>
  );
}

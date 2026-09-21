import {
  BookmarkCheck,
  FileText,
  Heart,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Pin,
  PinOff,
  Save,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import PostCard from "../components/Post/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// NOTE: sesuaikan path endpoint berikut dengan postRoutes.js kamu jika berbeda.
const ENDPOINTS = {
  me: "/auth/me",
  changeUsername: "/auth/me/username",
  changeEmail: "/auth/me/email",
  changePassword: "/auth/me/password",
  myGuides: "/posts/mine",
  myBookmarks: "posts/users/me/bookmarks",
  myLikes: "/posts/me/likes",
  togglePin: (id) => `/posts/${id}/pin`,
  deletePost: (id) => `/posts/${id}`,
  toggleBookmark: (id) => `/posts/${id}/bookmark`,
};

const TABS = [
  { key: "overview", label: "Overview", icon: UserIcon },
  { key: "guides", label: "My Guides", icon: FileText },
  { key: "saved", label: "Saved", icon: BookmarkCheck },
  { key: "liked", label: "Liked", icon: Heart },
  { key: "account", label: "Account", icon: Lock },
];

// --- Small building blocks ---------------------------------------------------
const TabButton = ({ active, icon: Icon, label, onClick, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-control px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-fluid ${
      active
        ? "bg-gradient-to-br from-blue-400 to-blue-100 text-slate-900"
        : "text-gray-600 hover:bg-black/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.06]"
    }`}
  >
    <Icon size={16} />
    {label}
    {typeof count === "number" && (
      <span
        className={`rounded-xl px-1.5 py-0.5 text-[11px] font-semibold ${
          active
            ? "bg-white/20 text-white"
            : "bg-black/[0.06] text-gray-500 dark:bg-white/[0.08] dark:text-gray-400"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const FieldLabel = ({ children }) => (
  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
    {children}
  </label>
);

const EmptyState = ({ text }) => (
  <div className="surface-card flex flex-col items-center justify-center gap-1 rounded-xl border border-border-light bg-white py-14 text-center dark:border-border-dark">
    <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
  </div>
);

const PostGrid = ({ posts, loading, emptyText }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-xl border border-border-light bg-gray-100 dark:border-border-dark dark:bg-gray-800/60"
          />
        ))}
      </div>
    );
  }
  if (!posts || posts.length === 0) return <EmptyState text={emptyText} />;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

// --- Overview tab: intro/biodata ---------------------------------------------
const OverviewTab = ({ profile, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    title: profile?.title || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      title: profile?.title || "",
      bio: profile?.bio || "",
      avatar: profile?.avatar || "",
    });
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(ENDPOINTS.me, form);
      onSaved(data.user);
      setEditing(false);
      toast.success("Biodata berhasil diperbarui");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui biodata");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface-card rounded-xl border border-border-light bg-white p-3 md:p-6 dark:border-border-dark">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Intro & Biodata</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-4">
          <div>
            <FieldLabel>Nama</FieldLabel>
            <p className="text-sm text-gray-800 dark:text-gray-200">{profile?.name || "-"}</p>
          </div>
          <div>
            <FieldLabel>Jabatan / Role</FieldLabel>
            <p className="text-sm text-gray-800 dark:text-gray-200">{profile?.title || "-"}</p>
          </div>
          <div>
            <FieldLabel>Intro</FieldLabel>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {profile?.bio || "Belum ada intro. Klik Edit untuk menambahkan."}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <FieldLabel>Nama</FieldLabel>
            <input
              className="input-field w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <FieldLabel>Jabatan / Role</FieldLabel>
            <input
              className="input-field w-full"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="mis. Network Engineer"
            />
          </div>
          <div>
            <FieldLabel>Avatar URL</FieldLabel>
            <input
              className="input-field w-full"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <FieldLabel>Intro</FieldLabel>
            <textarea
              className="input-field w-full resize-none"
              rows={4}
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
            <p className="mt-1 text-right text-xs text-gray-400">{form.bio.length}/500</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-control border border-border-light px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-black/[0.04] dark:border-border-dark dark:text-gray-300 dark:hover:bg-white/[0.06]"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// --- My Guides tab ------------------------------------------------------------
const GuidesTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get(ENDPOINTS.myGuides)
      .then(({ data }) => setPosts(data.posts || []))
      .catch(() => toast.error("Gagal memuat guide kamu"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePin = async (post) => {
    setBusyId(post._id);
    try {
      const { data } = await api.patch(ENDPOINTS.togglePin(post._id));
      setPosts((prev) => prev.map((p) => (p._id === post._id ? data.post : p)));
      toast.success(data.post.isPinned ? "Guide dipin" : "Guide di-unpin");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengubah status pin");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Hapus guide "${post.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusyId(post._id);
    try {
      await api.delete(ENDPOINTS.deletePost(post._id));
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("Guide berhasil dihapus");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus guide");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <PostGrid posts={[]} loading emptyText="" />;
  }

  if (posts.length === 0) return <EmptyState text="Kamu belum membuat guide apa pun." />;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <div key={post._id} className="relative">
          <PostCard post={post} />
          <div className="absolute right-3 top-3 flex gap-1.5">
            <button
              onClick={() => handlePin(post)}
              disabled={busyId === post._id}
              title={post.isPinned ? "Unpin" : "Pin"}
              className="rounded-xl bg-white/90 p-1.5 text-gray-600 shadow-sm backdrop-blur transition hover:text-accent disabled:opacity-50/90 dark:text-gray-300"
            >
              {post.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              onClick={() => handleDelete(post)}
              disabled={busyId === post._id}
              title="Hapus"
              className="rounded-xl bg-white/90 p-1.5 text-gray-600 shadow-sm backdrop-blur transition hover:text-red-500 disabled:opacity-50/90 dark:text-gray-300"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Saved tab -----------------------------------------------------------------
const SavedTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(ENDPOINTS.myBookmarks)
      .then(({ data }) => setPosts(data.posts || []))
      .catch(() => toast.error("Gagal memuat guide tersimpan"))
      .finally(() => setLoading(false));
  }, []);

  return <PostGrid posts={posts} loading={loading} emptyText="Belum ada guide yang kamu simpan." />;
};

// --- Liked tab -------------------------------------------------------------------
const LikedTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(ENDPOINTS.myLikes)
      .then(({ data }) => setPosts(data.posts || []))
      .catch(() => toast.error("Gagal memuat guide yang disukai"))
      .finally(() => setLoading(false));
  }, []);

  return <PostGrid posts={posts} loading={loading} emptyText="Belum ada guide yang kamu sukai." />;
};

// --- Account settings tab: username / email / password -------------------------
const AccountTab = ({ profile, onSaved }) => {
  const [username, setUsername] = useState(profile?.username || "");
  const [savingUsername, setSavingUsername] = useState(false);

  const [emailForm, setEmailForm] = useState({ email: profile?.email || "", currentPassword: "" });
  const [savingEmail, setSavingEmail] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);

  const submitUsername = async (e) => {
    e.preventDefault();
    setSavingUsername(true);
    try {
      const { data } = await api.put(ENDPOINTS.changeUsername, { username });
      onSaved(data.user);
      toast.success("Username berhasil diperbarui");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui username");
    } finally {
      setSavingUsername(false);
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      const { data } = await api.put(ENDPOINTS.changeEmail, emailForm);
      onSaved(data.user);
      setEmailForm((f) => ({ ...f, currentPassword: "" }));
      toast.success("Email berhasil diperbarui");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui email");
    } finally {
      setSavingEmail(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }
    setSavingPw(true);
    try {
      await api.put(ENDPOINTS.changePassword, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password berhasil diperbarui");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Username */}
      <form
        onSubmit={submitUsername}
        className="surface-card rounded-xl border border-border-light bg-white p-6 dark:border-border-dark"
      >
        <div className="mb-4 flex items-center gap-2">
          <UserIcon size={16} className="text-accent" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Username</h3>
        </div>
        <FieldLabel>Username</FieldLabel>
        <input
          className="input-field w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={30}
          placeholder="mis. jaringan_hebat"
          required
        />
        <button
          type="submit"
          disabled={savingUsername}
          className="btn-primary mt-4 flex items-center gap-1.5 disabled:opacity-60"
        >
          {savingUsername ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan Username
        </button>
      </form>

      {/* Email */}
      <form
        onSubmit={submitEmail}
        className="surface-card rounded-xl border border-border-light bg-white p-6 dark:border-border-dark"
      >
        <div className="mb-4 flex items-center gap-2">
          <Mail size={16} className="text-accent" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email</h3>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>Email baru</FieldLabel>
            <input
              type="email"
              className="input-field w-full"
              value={emailForm.email}
              onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <FieldLabel>Password saat ini</FieldLabel>
            <input
              type="password"
              className="input-field w-full"
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm((f) => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Konfirmasi dengan password kamu"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingEmail}
          className="btn-primary mt-4 flex items-center gap-1.5 disabled:opacity-60"
        >
          {savingEmail ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan Email
        </button>
      </form>

      {/* Password */}
      <form
        onSubmit={submitPassword}
        className="surface-card rounded-xl border border-border-light bg-white p-6 dark:border-border-dark"
      >
        <div className="mb-4 flex items-center gap-2">
          <Lock size={16} className="text-accent" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Password</h3>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>Password saat ini</FieldLabel>
            <input
              type="password"
              className="input-field w-full"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <FieldLabel>Password baru</FieldLabel>
            <input
              type="password"
              className="input-field w-full"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>
          <div>
            <FieldLabel>Konfirmasi password baru</FieldLabel>
            <input
              type="password"
              className="input-field w-full"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingPw}
          className="btn-primary mt-4 flex items-center gap-1.5 disabled:opacity-60"
        >
          {savingPw ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan Password
        </button>
      </form>
    </div>
  );
};

// --- Main Profile Page ---------------------------------------------------------
const Profile = () => {
  const { user, setUser } = useAuth() || {};
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!user);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    api
      .get(ENDPOINTS.me)
      .then(({ data }) => setProfile(data.user))
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setProfile(updatedUser);
    // Sinkronkan ke AuthContext jika context menyediakan setter
    setUser?.(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl md:p-6">
      {/* Header */}
      <div className="surface-card mb-6 flex flex-col gap-4 rounded-xl border border-border-light bg-white p-3 md:p-6 sm:flex-row sm:items-center sm:justify-between dark:border-border-dark">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-blue-100 text-xl font-semibold text-accent">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              profile?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {profile?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile?.username ? `@${profile.username} · ` : ""}
              {profile?.title}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <TabButton key={t.key} active={tab === t.key} icon={t.icon} label={t.label} onClick={() => setTab(t.key)} />
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab profile={profile} onSaved={handleProfileUpdate} />}
      {tab === "guides" && <GuidesTab />}
      {tab === "saved" && <SavedTab />}
      {tab === "liked" && <LikedTab />}
      {tab === "account" && <AccountTab profile={profile} onSaved={handleProfileUpdate} />}
    </div>
  );
};

export default Profile;
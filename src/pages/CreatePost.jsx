

import { Check, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import RichTextEditor from "../components/Editor/RichTextEditor.jsx";
import TopologyCanvas from "./TopologyCanvas.jsx";
import { TOPOLOGY_TEMPLATES } from "../components/Topology/Templates.jsx";

const CATEGORIES = ["Topology", "Maintenance", "Fixing", "Installation", "Hardware"];

// Ganti dengan Access Key Unsplash kamu
const UNSPLASH_ACCESS_KEY = "sxI6Npxjt6SwcASInWmW7S8qsTsp4iHRSyGDw589FJA";

const CreatePost = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  
  const [topology, setTopology] = useState({ nodes: [], edges: [] });
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Topology",
    tags: "",
  });
  const [gallery, setGallery] = useState([]); // gambar tambahan dari Unsplash
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Similar images state
  const [similarImages, setSimilarImages] = useState([]);
  const [searchingSimilar, setSearchingSimilar] = useState(false);

  // Load data saat edit
  useEffect(() => {
    if (!isEditing) return;
    api.get(`/posts/mine`).then(({ data }) => {
      const post = data.posts.find((p) => p._id === id);
      if (post) {
        setForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          category: post.category,
          tags: post.tags.join(", "),
        });
        setTopology(post.topology || { nodes: [], edges: [] });
        setGallery(post.gallery || []);
      }
    });
  }, [id, isEditing]);

 // Cari similar images berdasarkan Title / Category / Tags
  useEffect(() => {
    // Hanya search kalau title sudah diisi minimal 3 karakter
    if (form.title.trim().length < 3) {
      setSimilarImages([]);
      setSearchingSimilar(false);
      return;
    }

    // Debounce supaya tidak spam API setiap ketikan
    const timer = setTimeout(() => {
      searchSimilarImages();
    }, 600); // delay 600ms setelah user berhenti mengetik

    return () => clearTimeout(timer);
  }, [form.title, form.category, form.tags]);

  const searchSimilarImages = async () => {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("Unsplash Access Key belum diisi");
      return;
    }

    setSearchingSimilar(true);

    try {
      // Buat query dari category + tags + title
      const keywords = [
        form.title.split(" ").slice(0, 3).join(" "),
      ]
        .filter(Boolean)
        .join(" ");

      const query = encodeURIComponent(keywords || "network equipment");

      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      const data = await res.json();

      if (data.results) {
        setSimilarImages(
          data.results.map((img) => ({
            id: img.id,
            url: img.urls.regular,
            thumb: img.urls.small,
            alt: img.alt_description || img.description || "Similar hardware",
            photographer: img.user.name,
            photographerUrl: img.user.links.html,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to search similar images:", err);
    } finally {
      setSearchingSimilar(false);
    }
  };

  const toggleSelect = (img) => {
    const alreadyInGallery = gallery.some((g) => g.url === img.url);

    if (alreadyInGallery) {
      // Sudah ada di gallery → hapus
      setGallery((prev) => prev.filter((g) => g.url !== img.url));
    } else {
      // Belum ada → langsung tambahkan
      setGallery((prev) => [
        ...prev,
        {
          url: img.url,
          alt: img.alt,
          photographer: img.photographer,
          photographerUrl: img.photographerUrl,
          source: "unsplash",
        },
      ]);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, coverImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (tagsArray.length > 4) {
      setError("Maksimal 4 tags saja.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: tagsArray,
        gallery,
        topology,
      };
      const res = isEditing
        ? await api.put(`/posts/${id}`, payload)
        : await api.post("/posts", payload);
      navigate(`/posts/${res.data.post.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save this guide.");
    } finally {
      setSaving(false);
    }
  };

  const loadTemplate = (template) => {
    if (topology.nodes?.length > 0 && !confirm("Ganti topology saat ini dengan template?")) {
      return;
    }
    setTopology(template.data);
  };

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {isEditing ? "Edit Guide" : "Publish a New Guide"}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Share a maintenance walkthrough, a fix, an install checklist, or a topology / hardware breakdown.
      </p>

      {error && (
        <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== Basic Info ===== */}
        <div className="surface-card space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title item</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Diagnosing intermittent packet loss on a VLAN trunk"
            />
          </div>

          <div>

            {/* Similar Images Section */}
            {(searchingSimilar || similarImages.length > 0) && (
              <div>

                <div className="mb-4">
                  {/* <h3 className="text-sm font-medium">Similar Images (from Unsplash)</h3> */}
                  <p className="text-xs mt-1.5 text-gray-500">
                    Klik gambar untuk menambah / menghapus dari gallery.
                  </p>
                </div>

                {searchingSimilar ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                    <Loader2 size={18} className="animate-spin" />
                    Searching similar images...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {similarImages.map((img) => {
                      const isSelected = gallery.some((g) => g.url === img.url);

                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => toggleSelect(img)}
                          className={`group relative overflow-hidden rounded-lg border-2 transition ${
                            isSelected
                              ? "border-accent ring-2 ring-accent/30"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={img.thumb}
                            alt={img.alt}
                            className="aspect-video w-full object-cover"
                          />

                          {/* Checkbox indicator */}
                          <div
                            className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                              isSelected
                                ? "border-accent bg-accent text-white"
                                : "border-white/80 bg-black/40 text-transparent"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                            <p className="truncate text-[10px] text-white">
                              {img.photographer}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="dark:text-black">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Tags (maksimal 4, pisahkan dengan koma)
              </label>
              <input
                className="input-field"
                value={form.tags}
                onChange={(e) => {
                  const value = e.target.value;
                  // Hitung jumlah tag saat ini
                  const currentTags = value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);

                  // Kalau sudah 4 tag dan user masih mengetik koma baru → tolak
                  if (currentTags.length > 4) return;

                  setForm({ ...form, tags: value });
                }}
                placeholder="vlan, mikrotik, switch, wifi"
              />
              <p className="mt-1 text-xs text-gray-400">
                {form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean).length}
                /4 tags
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
            <input
              className="input-field"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="One-line summary shown on guide cards"
              maxLength={240}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Cover image</label>
            <div className="flex items-center gap-3">
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt=""
                  className="h-14 w-20 rounded-control object-cover"
                />
              )}
              <label className="btn-secondary cursor-pointer">
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ===== Content ===== */}
        <div className="surface-card p-6">
          <label className="mb-2 block text-sm font-medium">Content</label>
          <RichTextEditor
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
          />
        </div>

        {/* ===== Topology Canvas ===== */}
        <div className="surface-card p-6">
          <label className="mb-2 block text-sm font-medium">
            Network Topology
          </label>
          <p className="mb-3 text-xs text-gray-500">
            Drag & drop hardware, hubungkan dengan kabel, dan tambahkan note pada setiap perangkat.
          </p>
            <div className="flex mb-2 flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Template:</span>
              {TOPOLOGY_TEMPLATES.map((t) => (
                  <button
                  key={t.id}
                  type="button"
                  onClick={() => loadTemplate(t)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs hover:border-accent hover:text-accent dark:border-white/10 dark:bg-white/5"
                  title={t.description}
                  >
                  {t.name}
                  </button>
              ))}
            </div>
          <TopologyCanvas
            value={topology}
            onChange={setTopology}
          />
        </div>

        {/* ===== Actions ===== */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? "Save Changes" : "Publish Guide"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
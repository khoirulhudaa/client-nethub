

import { Check, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import RichTextEditor from "../components/Editor/RichTextEditor.jsx";
import FlowchartCanvas from "./FlowchartCanvas.jsx";
import TopologyCanvas from "./TopologyCanvas.jsx";

const CATEGORIES = ["Topology", "Maintenance", "Installation", "Hardware"];

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
  const [customTables, setCustomTables] = useState([]); // tables
  const [flowchart, setFlowchart] = useState({ nodes: [], edges: [] });
  const [steps, setSteps] = useState([]);
  // Similar images state
  const [similarImages, setSimilarImages] = useState([]);
  const [searchingSimilar, setSearchingSimilar] = useState(false);
  const [referencesImages, setReferencesImages] = useState([]); // max 4

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
        setSteps(post.steps || []);
        setCustomTables(post.customTables || []);
        setFlowchart(post.flowchart || { nodes: [], edges: [] });
        setReferencesImages(post.referencesImages || []); // ← tambah
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

    const handleReferenceUpload = (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const remaining = 4 - referencesImages.length;
      if (remaining <= 0) {
        setError("Maksimal 4 reference images");
        return;
      }

      const filesToProcess = files.slice(0, remaining);

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => {
          setReferencesImages((prev) => {
            if (prev.length >= 4) return prev;
            return [
              ...prev,
              {
                url: reader.result,
                name: file.name,
              },
            ];
          });
        };
        reader.readAsDataURL(file);
      });

      // reset input supaya bisa pilih file yang sama lagi
      e.target.value = "";
    };

    const removeReferenceImage = (index) => {
      setReferencesImages((prev) => prev.filter((_, i) => i !== index));
    };

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
        referencesImages,
        steps,
        customTables,
        flowchart,
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
                Tags (max: 4)
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

          {/* ===== Cover Image (Drag & Drop) ===== */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Cover image</label>

            {form.coverImage ? (
              <div className="relative group inline-block">
                <img
                  src={form.coverImage}
                  alt="Cover"
                  className="h-40 w-64 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ) : (
              <label
                className="flex h-40 w-full max-w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed surface-card border-gray-600 text-gray-400 transition hover:border-accent hover:text-accent"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-accent", "text-accent");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("border-accent", "text-accent");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-accent", "text-accent");
                  const file = e.dataTransfer.files?.[0];
                  if (!file || !file.type.startsWith("image/")) return;

                  const reader = new FileReader();
                  reader.onload = () =>
                    setForm((f) => ({ ...f, coverImage: reader.result }));
                  reader.readAsDataURL(file);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-2 h-8 w-8 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="mt-1 text-xs opacity-70">SVG, PNG, JPG or GIF</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
            )}
        </div>

        {/* ===== Reference Images (Drag & Drop) ===== */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Reference Images ({referencesImages.length}/4)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-3">
            {/* Render 4 slot tetap */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const img = referencesImages[idx];

              // Slot sudah terisi
              if (img) {
                return (
                  <div key={idx} className="group relative">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-24 w-full rounded-lg object-contain border border-gray-200 dark:border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(idx)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <p className="mt-1 max-w-[8rem] truncate text-[10px] text-gray-400">
                      {img.name}
                    </p>
                  </div>
                );
              }

              // Slot kosong → tampilkan dropzone
              return (
                <label
                  key={idx}
                  className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 text-gray-400 transition hover:border-accent hover:text-accent"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-accent", "text-accent");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("border-accent", "text-accent");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-accent", "text-accent");

                    const files = Array.from(e.dataTransfer.files || []);
                    if (!files.length) return;

                    const remaining = 4 - referencesImages.length;
                    const filesToProcess = files
                      .filter((f) => f.type.startsWith("image/"))
                      .slice(0, remaining);

                    filesToProcess.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setReferencesImages((prev) => {
                          if (prev.length >= 4) return prev;
                          return [
                            ...prev,
                            {
                              url: reader.result,
                              name: file.name,
                            },
                          ];
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-1 h-6 w-6 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                  <span className="text-[10px]">Drop / Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReferenceUpload}
                  />
                </label>
              );
            })}
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
            {/* <div className="flex mb-2 flex-wrap items-center gap-2">
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
            </div> */}
          <TopologyCanvas
            value={topology}
            onChange={setTopology}
          />
        </div>

        {/* ===== Custom Tables ===== */}
        <div className="surface-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Custom Table</label>
              <p className="text-xs text-gray-500">
                Jumlah baris & kolom fleksibel, isi langsung di tempat.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setCustomTables((prev) => [
                  ...prev,
                  {
                    title: "",
                    rows: 3,
                    cols: 3,
                    data: Array.from({ length: 3 }, () => Array(3).fill("")),
                  },
                ])
              }
              className="btn-secondary text-xs"
            >
              + Tambah Table
            </button>
          </div>

          <div className="space-y-6">
            {customTables.map((table, tIdx) => (
              <div
                key={tIdx}
                className="rounded-2xl border border-gray-200 p-4 dark:border-white/10"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <input
                    className="input-field max-w-xs"
                    value={table.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTables((prev) =>
                        prev.map((t, i) =>
                          i === tIdx ? { ...t, title: val } : t
                        )
                      );
                    }}
                    placeholder="Judul tabel (opsional)"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTables((prev) =>
                          prev.map((t, i) => {
                            if (i !== tIdx) return t;
                            const newRows = t.rows + 1;
                            const newData = [...t.data, Array(t.cols).fill("")];
                            return { ...t, rows: newRows, data: newData };
                          })
                        );
                      }}
                      className="rounded-lg border px-2.5 py-1 text-xs"
                    >
                      + Row
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTables((prev) =>
                          prev.map((t, i) => {
                            if (i !== tIdx || t.rows <= 1) return t;
                            return {
                              ...t,
                              rows: t.rows - 1,
                              data: t.data.slice(0, -1),
                            };
                          })
                        );
                      }}
                      className="rounded-lg border px-2.5 py-1 text-xs"
                    >
                      − Row
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTables((prev) =>
                          prev.map((t, i) => {
                            if (i !== tIdx) return t;
                            const newCols = t.cols + 1;
                            const newData = t.data.map((row) => [...row, ""]);
                            return { ...t, cols: newCols, data: newData };
                          })
                        );
                      }}
                      className="rounded-lg border px-2.5 py-1 text-xs"
                    >
                      + Col
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTables((prev) =>
                          prev.map((t, i) => {
                            if (i !== tIdx || t.cols <= 1) return t;
                            return {
                              ...t,
                              cols: t.cols - 1,
                              data: t.data.map((row) => row.slice(0, -1)),
                            };
                          })
                        );
                      }}
                      className="rounded-lg border px-2.5 py-1 text-xs"
                    >
                      − Col
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomTables((prev) => prev.filter((_, i) => i !== tIdx))
                      }
                      className="text-xs text-red-500 hover:underline"
                    >
                      Hapus Tabel
                    </button>
                  </div>
                </div>

                {/* Table dengan sudut rounded */}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {table.data.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="border border-gray-200 dark:border-white/10 p-0"
                            >
                              <input
                                className="w-full border-0 bg-transparent px-3 py-2.5 outline-none focus:bg-accent/5"
                                value={cell}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomTables((prev) =>
                                    prev.map((t, i) => {
                                      if (i !== tIdx) return t;
                                      const newData = t.data.map((r, ri) =>
                                        ri === rIdx
                                          ? r.map((c, ci) => (ci === cIdx ? val : c))
                                          : r
                                      );
                                      return { ...t, data: newData };
                                    })
                                  );
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {customTables.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                Belum ada tabel. Klik “+ Tambah Table”.
              </p>
            )}
          </div>
        </div>

        {/* ===== Flowchart Canvas ===== */}
        <div className="surface-card p-6">
          <label className="mb-2 block text-sm font-medium">Flowchart</label>
          <p className="mb-3 text-xs text-gray-500">
            Drag shape dari palette, hubungkan dengan garis, lalu edit label.
          </p>
          <FlowchartCanvas value={flowchart} onChange={setFlowchart} />
        </div>

        {/* ===== Step-by-step Wizard (Upload Image) ===== */}
        <div className="surface-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Step-by-step Wizard</label>
              <p className="text-xs text-gray-500">
                Upload gambar untuk setiap langkah + judul & deskripsi.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSteps((prev) => [...prev, { title: "", description: "", image: "" }])
              }
              className="btn-secondary text-xs"
            >
              + Tambah Step
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 p-4 dark:border-white/10"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Step {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>

                {/* Judul */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Judul</label>
                  <input
                    className="input-field"
                    value={step.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSteps((prev) =>
                        prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                      );
                    }}
                    placeholder="Judul langkah"
                  />
                </div>

                {/* ===== Drag & Drop Image Zone ===== */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium">Gambar</label>

                  {step.image ? (
                    <div className="relative group">
                      <img
                        src={step.image}
                        alt=""
                        className="h-40 w-full rounded-xl object-cover border border-gray-200 dark:border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSteps((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, image: "" } : s))
                          )
                        }
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label
                      className="surface-card flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 text-gray-400 transition hover:border-accent hover:text-accent"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("border-accent", "text-accent");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("border-accent", "text-accent");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-accent", "text-accent");
                        const file = e.dataTransfer.files?.[0];
                        if (!file || !file.type.startsWith("image/")) return;

                        const reader = new FileReader();
                        reader.onload = () => {
                          setSteps((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, image: reader.result } : s
                            )
                          );
                        };
                        reader.readAsDataURL(file);
                      }}
                    >
                      {/* Cloud Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mb-2 h-8 w-8 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                        />
                      </svg>
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="mt-1 text-xs opacity-70">
                        SVG, PNG, JPG or GIF (MAX. 800×400px)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setSteps((prev) =>
                              prev.map((s, i) =>
                                i === idx ? { ...s, image: reader.result } : s
                              )
                            );
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="mb-1 block text-xs font-medium">Deskripsi</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    value={step.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSteps((prev) =>
                        prev.map((s, i) =>
                          i === idx ? { ...s, description: val } : s
                        )
                      );
                    }}
                    placeholder="Penjelasan langkah ini..."
                  />
                </div>
              </div>
            ))}

            {steps.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                Belum ada step. Klik “+ Tambah Step”.
              </p>
            )}
          </div>
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
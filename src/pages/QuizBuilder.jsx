import {
  ArrowLeft,
  CheckSquare,
  Hash,
  ImagePlus,
  Network,
  Plus,
  Save,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TopologyCanvas from "./TopologyCanvas";

const CATEGORIES = ["Topology", "Maintenance", "Fixing", "Installation", "Hardware"];

const emptyQuestion = () => ({
  type: "multiple_choice",
  questionText: "",
  explanation: "",
  points: 10,
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  allowMultiple: false,
  correctTopology: { nodes: [], edges: [] },
  allowedHardware: [],
  allowedCables: [],
  matchThreshold: 0.85,
});

export default function QuizBuilder() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Topology");
  const [coverImage, setCoverImage] = useState("");
  const [tagList, setTagList] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing quiz jika edit
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/quizzes/${id}`)
      .then(({ data }) => {
        const q = data.quiz;
        setTitle(q.title);
        setDescription(q.description || "");
        setCategory(q.category);
        setCoverImage(q.coverImage || "");
        setTagList(q.tags || []);
        setIsPublished(q.isPublished);
        setQuestions(q.questions.length ? q.questions : [emptyQuestion()]);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat quiz");
      });
  }, [id, isEdit]);

  const current = questions[activeIndex];

  const updateQuestion = (index, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const addQuestion = () => {
    if (questions.length >= 20) {
      alert("Maksimal 20 soal per quiz");
      return;
    }
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setActiveIndex(questions.length);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    const next = questions.filter((_, i) => i !== index);
    setQuestions(next);
    setActiveIndex(Math.max(0, index - 1));
  };

  const addOption = () => {
    if (current.options.length >= 6) return;
    updateQuestion(activeIndex, {
      options: [...current.options, { text: "", isCorrect: false }],
    });
  };

  const removeOption = (optIdx) => {
    if (current.options.length <= 2) return;
    updateQuestion(activeIndex, {
      options: current.options.filter((_, i) => i !== optIdx),
    });
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCover = () => setCoverImage("");

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
        setError("Judul wajib diisi");
        return;
    }
    if (questions.length < 5) {
        setError("Minimal 5 soal");
        return;
    }
    if (questions.length > 15) {
        setError("Maksimal 15 soal");
        return;
    }

    // Validasi dasar
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
        setError(`Soal #${i + 1} belum diisi teks pertanyaan`);
        setActiveIndex(i);
        return;
        }

        if (q.type === "multiple_choice") {
        // Cek apakah ada opsi yang masih kosong
        const emptyOption = q.options.some((o) => !o.text.trim());
        if (emptyOption) {
            setError(`Soal #${i + 1}: semua opsi jawaban harus diisi`);
            setActiveIndex(i);
            return;
        }

        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
            setError(`Soal #${i + 1} (Pilihan Ganda) belum punya jawaban benar`);
            setActiveIndex(i);
            return;
        }
        }

        if (q.type === "topology") {
        if (!q.correctTopology?.nodes?.length) {
            setError(`Soal #${i + 1} (Topology) belum punya kunci jawaban`);
            setActiveIndex(i);
            return;
        }
        }
    }

    setSaving(true);
    setError("");

    // ===== SANITASI DATA SEBELUM KIRIM =====
    const cleanedQuestions = questions.map((q) => {
        if (q.type === "multiple_choice") {
        return {
            type: q.type,
            questionText: q.questionText.trim(),
            explanation: q.explanation || "",
            points: q.points || 10,
            allowMultiple: Boolean(q.allowMultiple),
            options: q.options.map((o) => ({
            text: o.text.trim(),
            isCorrect: Boolean(o.isCorrect),
            })),
            // hapus field topology yang tidak perlu
            correctTopology: undefined,
            allowedHardware: undefined,
            allowedCables: undefined,
            matchThreshold: undefined,
        };
        }

        // type === "topology"
        return {
        type: q.type,
        questionText: q.questionText.trim(),
        explanation: q.explanation || "",
        points: q.points || 10,
        correctTopology: q.correctTopology || { nodes: [], edges: [] },
        allowedHardware: q.allowedHardware || [],
        allowedCables: q.allowedCables || [],
        matchThreshold: q.matchThreshold || 0.85,
        // hapus options supaya tidak kena validasi required
        options: undefined,
        allowMultiple: undefined,
        };
    });

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tagList,
      coverImage: coverImage || "",
      questions: cleanedQuestions,
      isPublished: publish || isPublished,
    };

    try {
        if (isEdit) {
        await api.put(`/quizzes/${id}`, payload);
        } else {
        await api.post("/quizzes", payload);
        }
        navigate("/quizzes");
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Gagal menyimpan quiz");
    } finally {
        setSaving(false);
    }
    };

    const addTag = () => {
      const raw = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (!raw) return;
      if (tagList.length >= 4) {
        alert("Maksimal 4 hashtag");
        return;
      }
      if (tagList.includes(raw)) {
        setTagInput("");
        return;
      }
      setTagList((prev) => [...prev, raw]);
      setTagInput("");
    };

    const removeTag = (tag) => {
      setTagList((prev) => prev.filter((t) => t !== tag));
    };

    const handleTagKeyDown = (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag();
      }
    };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16 px-0 py-0 md:py-6 md:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/quizzes")}
            className="rounded-lg py-2 text-black dark:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-md w-max md:text-xl font-semibold">
              {isEdit ? "Edit Quiz" : "Quiz Baru"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-secondary py-2 md:py-3 inline-flex items-center gap-1.5 text-sm"
          >
            <Save size={15} />
              Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-primary py-2 md:py-3 inline-flex items-center gap-1.5 text-sm"
          >
            <Save size={15} />
            {saving ? "Menyimpan..." : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      

      {/* Meta */}
      <div className="gap-4 border border-gray-200 p-3 md:py-7 md:px-4 w-full sm:py-4 relative dark:border-white/5 bg-slate-200 dark:bg-white/5 rounded-xl">
        
        {/* Thumbnail */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
            Thumbnail
          </label>
          {coverImage ? (
            <div className="w-full relative active:scale-[0.99] h-[280px] duration-100 overflow-hidden rounded-xl border border-black/[0.06] dark:!bg-[#0c0c18] dark:border-white/10">
              <img
                src={coverImage}
                alt="Cover"
                className="aspect-[16/9] w-full hover:scale-[1.1] duration-300 ease-out object-cover"
              />
              <button
                type="button"
                onClick={removeCover}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex active:scale-[0.99] hover:brightness-75 duration-100 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white/50 py-8 text-gray-500 transition hover:border-gray-400 dark:border-white/15 dark:!bg-[#0c0c18]"
            >
              <ImagePlus size={22} />
              <span className="text-sm">Upload thumbnail</span>
              <span className="text-xs text-gray-400">Max 2MB · base64</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        <div className="col-span-2 w-full flex flex-col items-center gap-3">
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Judul Quiz
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Topology Dasar Kantor"
              className="input-field dark:!bg-[#0c0c18]"
            />
          </div>
          {/* Hashtags */}
          <div className="w-full mb-2.5">
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Hashtag{" "}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="input-field w-full pl-8 dark:!bg-[#0c0c18]"
                  placeholder={`Ketik lalu Enter`}
                  disabled={tagList.length >= 4}
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tagList.length >= 4}
                className="rounded-xl bg-gray-100 px-3 text-sm font-medium text-gray-700 disabled:opacity-40 dark:bg-white/10 dark:text-gray-200"
              >
                Tambah
              </button>
            </div>
            {tagList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
            Deskripsi singkat
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="input-field resize-none dark:!bg-[#0c0c18]"
            placeholder="Apa yang akan dipelajari di quiz ini?"
          />
        </div>

        <div className="w-full flex gap-3.5"> 
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field !w-full dark:!bg-[#0c0c18]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="dark:text-black">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
              Tags (pisahkan koma)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="mikrotik, switch, utp"
              className="input-field !w-full dark:!bg-[#0c0c18]"
            />
          </div>
        </div>
      </div>

        {/* Question List + Editor */}
        <div className="space-y-5">
        {/* ===== Daftar Soal (horizontal) ===== */}
        <div className="rounded-xl border border-gray-200 w-full relative dark:border-white/5 bg-slate-200 dark:bg-white/5 p-1 md:p-3">
            <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-sm md:text-xs font-semibold uppercase tracking-wide dark:text-gray-400">
                Soal ({questions.length}/15)
            </p>
            <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= 15}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-2.5 py-1 text-sm md:text-xs text-gray-500 transition hover:border-accent hover:text-accent disabled:opacity-40"
            >
                <Plus size={13} />
                Tambah
            </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 px-2 scrollbar-thin">
            {questions.map((q, i) => (
                <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`group relative flex w-max shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    activeIndex === i
                    ? "border-accent bg-accent/10 text-accent shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5"
                }`}
                >
                {/* Nomor */}
                <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm md:text-xs font-semibold ${
                    activeIndex === i
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                    }`}
                >
                    {i + 1}
                </span>

                {/* Icon tipe */}
                <span className="shrink-0">
                    {q.type === "topology" ? (
                    <Network size={13} className="text-blue-500" />
                    ) : (
                    <CheckSquare size={13} className="text-emerald-500" />
                    )}
                </span>
                </button>
            ))}
            </div>
        </div>

        {/* ===== Editor Soal Aktif ===== */}
        <div className="flex-1 space-y-5 rounded-xl border border-gray-200 dark:border-white/5 bg-slate-200 dark:bg-white/5 p-3 md:p-5">
            <div className="flex items-center justify-between">
            <h3 className="font-medium">Soal #{activeIndex + 1}</h3>
            <button
                type="button"
                onClick={() => removeQuestion(activeIndex)}
                disabled={questions.length <= 1}
                className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                title="Hapus soal ini"
            >
                <Trash2 size={16} />
            </button>
            </div>

            {/* Tipe soal */}
            <div className="flex gap-3">
            <button
                type="button"
                onClick={() => updateQuestion(activeIndex, { type: "multiple_choice" })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                current.type === "multiple_choice"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-gray-200 hover:border-gray-300"
                }`}
            >
                <CheckSquare size={16} /> Pilihan Ganda
            </button>
            <button
                type="button"
                onClick={() => updateQuestion(activeIndex, { type: "topology" })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                current.type === "topology"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-gray-200 hover:border-gray-300"
                }`}
            >
                <Network size={16} /> Praktek Topology
            </button>
            </div>

            {/* Teks pertanyaan */}
            <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                Pertanyaan
            </label>
            <textarea
                value={current.questionText}
                onChange={(e) =>
                updateQuestion(activeIndex, { questionText: e.target.value })
                }
                rows={3}
                className="input-field resize-none dark:!bg-[#0c0c18]"
                placeholder="Tuliskan pertanyaan di sini..."
            />
            </div>

            {/* Points */}
            <div className="w-32">
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                Poin
            </label>
            <input
                type="number"
                min={1}
                max={100}
                value={current.points}
                onChange={(e) =>
                updateQuestion(activeIndex, {
                    points: Number(e.target.value) || 10,
                })
                }
                className="input-field dark:!bg-[#0c0c18]"
            />
            </div>

            {/* ===== MULTIPLE CHOICE ===== */}
            {current.type === "multiple_choice" && (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                <label className="text-sm md:text-xs font-medium text-black dark:text-white">
                    Opsi Jawaban
                </label>
                <label className="flex items-center gap-2 text-sm md:text-xs">
                    <input
                    type="checkbox"
                    checked={current.allowMultiple}
                    onChange={(e) =>
                        updateQuestion(activeIndex, {
                        allowMultiple: e.target.checked,
                        })
                    }
                    />
                    Boleh pilih lebih dari 1
                </label>
                </div>

                {current.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                    <input
                    type={current.allowMultiple ? "checkbox" : "radio"}
                    name={`correct-${activeIndex}`}
                    checked={opt.isCorrect}
                    onChange={() => {
                        const newOpts = current.options.map((o, i) => ({
                        ...o,
                        isCorrect: current.allowMultiple
                            ? i === oi
                            ? !o.isCorrect
                            : o.isCorrect
                            : i === oi,
                        }));
                        updateQuestion(activeIndex, { options: newOpts });
                    }}
                    />
                    <input
                    value={opt.text}
                    onChange={(e) => {
                        const newOpts = [...current.options];
                        newOpts[oi] = { ...newOpts[oi], text: e.target.value };
                        updateQuestion(activeIndex, { options: newOpts });
                    }}
                    placeholder={`Opsi ${oi + 1}`}
                    className="input-field flex-1 text-sm dark:!bg-[#0c0c18]"
                    />
                    <button
                    type="button"
                    onClick={() => removeOption(oi)}
                    className="rounded p-1 text-gray-400 hover:text-red-500"
                    >
                    <Trash2 size={14} />
                    </button>
                </div>
                ))}

                <button
                type="button"
                onClick={addOption}
                className="text-sm md:text-xs text-accent hover:underline"
                >
                + Tambah opsi
                </button>
            </div>
            )}

            {/* ===== TOPOLOGY ===== */}
            {current.type === "topology" && (
            <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
                <p className="font-medium">Kunci Jawaban Topology</p>
                <p className="mt-1 text-sm md:text-xs">
                    Susun topology yang benar di bawah. User harus meniru susunan
                    hardware + jenis kabel yang sama.
                </p>
                </div>

                {/* Canvas kunci jawaban */}
                <TopologyCanvas
                value={current.correctTopology}
                onChange={(topo) =>
                    updateQuestion(activeIndex, { correctTopology: topo })
                }
                mode="editor"
                allowedHardware={
                    current.allowedHardware?.length
                    ? current.allowedHardware
                    : null
                }
                allowedCables={
                    current.allowedCables?.length ? current.allowedCables : null
                }
                height={380}
                />
            </div>
            )}

            {/* Explanation */}
            <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                Penjelasan (ditampilkan setelah submit)
            </label>
            <textarea
                value={current.explanation}
                onChange={(e) =>
                updateQuestion(activeIndex, { explanation: e.target.value })
                }
                rows={2}
                className="input-field resize-none dark:!bg-[#0c0c18]"
                placeholder="Opsional – penjelasan jawaban benar"
            />
            </div>
        </div>
        </div>
    </div>
  );
}
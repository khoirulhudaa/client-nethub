import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Copy,
  CopyIcon,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from 'react-router-dom';

const TYPES = ["NVR", "DVR", "Camera"];
const ENTITIES = [
  { value: "pintex", label: "Pintex" },
  { value: "tfi", label: "TFI" },
  { value: "umum", label: "Umum" },
];
const EMPTY_FORM = {
  deviceType: "NVR",
  name: "",
  ipAddress: "",
  username: "",
  password: "",
  entity: "pintex",
};

const errMsg = (err) => err?.response?.data?.message || "Terjadi kesalahan, coba lagi";

const inputCls =
  "w-full rounded-lg border border-white/20 bg-white/10 text-white border-gray-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500";

  
// --- Tombol copy -------------------------------------------------------------
const CopyButton = ({ getText, title = "Copy" }) => {
  const [done, setDone] = useState(false);

  const handle = async () => {
    try {
      const text = await getText();
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* diabaikan */
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      title={title}
      className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-300 active:scale-95 dark:text-gray-400 dark:hover:bg-white/10"
    >
      {done ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
};

// --- Password: baru diambil dari server saat diklik ---------------------------
const PasswordCell = ({ id }) => {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const fetchPassword = async () => {
    if (value !== null) return value;
    const { data } = await api.get(`/cameras/${id}/password`);
    setValue(data.password);
    return data.password;
  };

  const toggle = async () => {
    if (visible) return setVisible(false);
    setLoading(true);
    try {
      await fetchPassword();
      setVisible(true);
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="min-w-[88px] font-mono text-sm">{visible ? value : "••••••••"}</span>
      <button
        type="button"
        onClick={toggle}
        title={visible ? "Sembunyikan password" : "Lihat password"}
        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-300 dark:text-gray-400 dark:hover:bg-white/10"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : visible ? (
          <EyeOff size={14} />
        ) : (
          <Eye size={14} />
        )}
      </button>
      <CopyButton getText={fetchPassword} title="Copy password" />
    </div>
  );
};

// --- Badge -------------------------------------------------------------------
const TypeBadge = ({ type }) => {
  const color =
    type === "NVR"
      ? "bg-blue-600"
      : type === "DVR"
      ? "bg-orange-600"
      : "bg-emerald-600";
  return (
    <div className={`rounded-full w-max px-2.5 py-0.5 text-xs font-medium text-white ${color}`}>
      {type}
    </div>
  );
};

const EntityBadge = ({ entity }) => (
  <span className="rounded-full border border-slate-400 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:border-white/20 dark:text-gray-200">
    {ENTITIES.find((e) => e.value === entity)?.label || entity}
  </span>
);

const Drawer = ({ title, onClose, busy = false, footer, width = "max-w-xl", children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-[999999]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      <aside
        className={`absolute right-0 bottom-0 flex h-[91.5vh] w-full ${width} flex-col border-l border-white bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex gap-3 border-t border-slate-200 px-5 py-4 dark:border-white/10">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
};

const CancelBtn = ({ onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
  >
    Batal
  </button>
);

const CameraFormModal = ({ initial, onClose, onSaved }) => {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    isEdit ? { ...EMPTY_FORM, ...initial, password: "" } : EMPTY_FORM
  );
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        deviceType: form.deviceType,
        name: form.name,
        ipAddress: form.ipAddress,
        username: form.username,
        password: form.password,
        entity: form.entity,
      };
      const { data } = isEdit
        ? await api.put(`/cameras/${initial._id}`, payload)
        : await api.post("/cameras", payload);
      onSaved(data.camera, isEdit);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const nameLabel = form.deviceType === "Camera" ? "Nama kamera" : `Nama ${form.deviceType}`;

  return (
    <Drawer
      title={isEdit ? "Edit perangkat" : "Tambah perangkat"}
      onClose={onClose}
      busy={saving}
      width="max-w-md"
      footer={
        <>
          <CancelBtn onClick={onClose} disabled={saving} />
          <button
            type="submit"
            form="camera-form"
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Menyimpan...
              </span>
            ) : (
              "Simpan"
            )}
          </button>
        </>
      }
    >
      <form id="camera-form" onSubmit={submit} className="grid grid-cols-1 gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Jenis hardware</span>
          <select value={form.deviceType} onChange={set("deviceType")} className={inputCls}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Entitas</span>
          <select value={form.entity} onChange={set("entity")} className={inputCls}>
            {ENTITIES.map((en) => (
              <option key={en.value} value={en.value}>{en.label}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">{nameLabel}</span>
          <input
            required
            maxLength={100}
            value={form.name}
            onChange={set("name")}
            placeholder="contoh: NVR Gudang A"
            className={inputCls}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">IP address</span>
          <input
            required
            value={form.ipAddress}
            onChange={set("ipAddress")}
            placeholder="192.168.1.100 atau 192.168.1.100:8000"
            className={`${inputCls} font-mono`}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Username</span>
          <input
            required
            autoComplete="off"
            value={form.username}
            onChange={set("username")}
            className={inputCls}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <div className="relative">
            <input
              required={!isEdit}
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder={isEdit ? "Kosongkan jika tidak diubah" : ""}
              className={`${inputCls} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        {error && (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-300">
            {error}
          </p>
        )}
      </form>
    </Drawer>
  );
};

// --- Modal hapus -------------------------------------------------------------
const DeleteModal = ({ camera, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/cameras/${camera._id}`);
      onDeleted(camera._id);
    } catch (err) {
      setError(errMsg(err));
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !deleting && onClose()}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <Trash2 size={22} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold">Hapus perangkat?</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <strong>{camera.name}</strong> ({camera.ipAddress}) akan dihapus permanen.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex gap-3 border-t border-white bg-gray-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.99] disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={confirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.99] disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : "Ya, hapus"}
          </button>
        </div>
      </div>
    </div>
  );
};

const COLS = ["deviceType", "name", "ipAddress", "username", "password", "entity"];

const TEMPLATE = `Nama : OFFICE PINTEX
IP : 192.168.1.41
Pass: HikVision1269
Entitas: PINTEX
Jenis: NVR
Username: admin

Nama : GUDANG A
IP : 192.168.1.42
Pass: abc12345
Entitas: TFI
Jenis: Camera
Username: admin`;

const TABLE_TEMPLATE = `Jenis\tNama\tIP\tUsername\tPassword\tEntitas
NVR\tOFFICE PINTEX\t192.168.1.41\tadmin\tHikVision1269\tPINTEX
DVR\tGUDANG A\t192.168.1.42\tadmin\tabc12345\tTFI`;

const normalize = (key, val) => {
  val = (val || "").trim();
  if (key === "deviceType") return TYPE_MAP[val.toLowerCase()] || val;
  if (key === "entity") return val.toLowerCase();
  return val;
};

const LABEL_RE = /^\s*([^:=|\t,]+?)\s*[:=]\s*(.*)$/;

// Format berlabel: "Nama : xxx", blok dipisah baris kosong
const parseLabeled = (lines) => {
  const rows = [];
  let cur = null;
  const flush = () => {
    if (cur && Object.keys(cur).length) rows.push(newRow(cur));
    cur = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const m = line.match(LABEL_RE);
    const key = m && KEY_MAP[m[1].trim().toLowerCase()];
    if (!key) continue;
    if (cur && key in cur) flush(); // label berulang = perangkat baru
    if (!cur) cur = {};
    cur[key] = normalize(key, m[2]);
  }
  flush();
  return rows;
};

// Format tabel: tab / | / koma, header opsional
const parseTable = (lines) => {
  const first = lines[0];
  const sep = first.includes("\t") ? "\t" : first.includes("|") ? "|" : ",";
  const split = (l) => l.split(sep).map((c) => c.trim());

  let cols = COLS;
  let body = lines;
  const head = split(first).map((h) => KEY_MAP[h.toLowerCase()]);
  if (head.every(Boolean)) {
    cols = head;
    body = lines.slice(1);
  }
  return body.map((l) => {
    const cells = split(l);
    const data = {};
    cols.forEach((key, i) => {
      if (cells[i] !== undefined && cells[i] !== "") data[key] = normalize(key, cells[i]);
    });
    return newRow(data);
  });
};

const parseBulk = (text) => {
  const lines = text.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim());
  if (nonEmpty.length === 0) return [];
  const labeled = nonEmpty.some((l) => {
    const m = l.match(LABEL_RE);
    return m && KEY_MAP[m[1].trim().toLowerCase()];
  });
  return labeled ? parseLabeled(lines) : parseTable(nonEmpty);
};

const isBlank = (r) => !r.name.trim() && !r.ipAddress.trim() && !r.password;

// --- Parser teks massal ------------------------------------------------------
const KEY_MAP = {
  nama: "name", name: "name",
  ip: "ipAddress", "ip address": "ipAddress", ipaddress: "ipAddress",
  pass: "password", password: "password",
  entitas: "entity", entity: "entity",
  jenis: "deviceType", tipe: "deviceType", type: "deviceType",
  user: "username", username: "username",
};
const TYPE_MAP = { nvr: "NVR", dvr: "DVR", camera: "Camera", kamera: "Camera", cam: "Camera" };
const HOST_RE = /^[a-zA-Z0-9.\-]+(:\d{1,5})?$/;
const EMPTY_ROW = { deviceType: "NVR", name: "", ipAddress: "", username: "admin", password: "", entity: "pintex" };

let rowSeq = 0;
const newRow = (data = {}) => ({ ...EMPTY_ROW, ...data, _k: ++rowSeq });

const validateRow = (r) => {
  if (!TYPES.includes(r.deviceType)) return "Jenis tidak valid";
  if (!ENTITIES.some((e) => e.value === r.entity)) return "Entitas tidak valid";
  if (!r.name.trim()) return "Nama kosong";
  if (!r.ipAddress.trim() || !HOST_RE.test(r.ipAddress.trim())) return "IP tidak valid";
  if (!r.username.trim()) return "Username kosong";
  if (!r.password) return "Password kosong";
  return "";
};

const cellCls =
  "w-full rounded-lg border border-white/20 bg-white/10 text-white border-gray-200 bg-white px-2 py-1.5 text-sm text-black outline-none focus:border-blue-500";
const BulkImportModal = ({ onClose, onSaved }) => {
  const [rows, setRows] = useState(() => [newRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showFormat, setShowFormat] = useState(false);
  const fileRef = useRef(null);

  const addParsed = useCallback((parsed) => {
    setRows((list) => [...list.filter((r) => !isBlank(r)), ...parsed]);
    setError("");
    setNotice(`${parsed.length} perangkat ditambahkan dari paste`);
  }, []);

  // Paste di kolom mana saja: kalau multi-baris / dari Excel, otomatis jadi banyak baris
  const handlePaste = (e) => {
    const t = (e.clipboardData?.getData("text") || "").trim();
    if (!t.includes("\n") && !t.includes("\t")) return; // paste biasa (1 baris)
    const parsed = parseBulk(t);
    if (!parsed.length) return;
    e.preventDefault();
    addParsed(parsed);
  };

  // Paste di area drawer saat tidak sedang fokus di kolom input
  useEffect(() => {
    const onDocPaste = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      const parsed = parseBulk(e.clipboardData?.getData("text") || "");
      if (!parsed.length) return;
      e.preventDefault();
      addParsed(parsed);
    };
    document.addEventListener("paste", onDocPaste);
    return () => document.removeEventListener("paste", onDocPaste);
  }, [addParsed]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const parsed = parseBulk(await file.text());
    if (!parsed.length) return setError("Isi file tidak bisa dibaca. Cek formatnya.");
    addParsed(parsed);
  };

  const update = (k, key, value) =>
    setRows((list) => list.map((r) => (r._k === k ? { ...r, [key]: value } : r)));
  const remove = (k) =>
    setRows((list) => (list.length > 1 ? list.filter((r) => r._k !== k) : [newRow()]));

  const filled = rows.filter((r) => !isBlank(r));
  const invalidCount = filled.filter((r) => validateRow(r)).length;

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const items = filled.map(({ _k, ...r }) => ({
        ...r,
        name: r.name.trim(),
        ipAddress: r.ipAddress.trim(),
        username: r.username.trim(),
      }));
      const { data } = await api.post("/cameras/bulk", { items });
      onSaved(data.cameras);
    } catch (err) {
      const list = err?.response?.data?.errors;
      setError(
        list?.length ? list.map((e) => `Baris ${e.row}: ${e.message}`).join("\n") : errMsg(err)
      );
      setSaving(false);
    }
  };

  const textCls = (extra = "") => `${cellCls} ${extra}`;

  return (
    <Drawer
      title="Tambah perangkat"
      onClose={onClose}
      busy={saving}
      width="max-w-xl"
      footer={
        <>
          <CancelBtn onClick={onClose} disabled={saving} />
          <button
            type="button"
            disabled={saving || filled.length === 0 || invalidCount > 0}
            onClick={submit}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Menyimpan...
              </span>
            ) : (
              `Simpan ${filled.length || ""} perangkat`
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Hint */}
        <div className="flex items-center gap-2">
          <CopyIcon size={14} />
          <p className="text-slate-600 dark:text-gray-300 text-sm">
            <strong>Langsung ctrl + v</strong> di kolom mana
            saja dan  data akan terisi otomatis
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 px-3 pt-2 pb-2.5 text-sm dark:border-white/30">
          <button
            type="button"
            onClick={() => setShowFormat((s) => !s)}
            className="mt-0 text-xs font-medium text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            {showFormat ? "Sembunyikan format ▲" : "Lihat format yang didukung ▼"}
          </button>

          {showFormat && (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">1. Berlabel (pisahkan dengan baris kosong)</span>
                  <CopyButton getText={async () => TEMPLATE} title="Salin template" />
                </div>
                <pre className="overflow-x-auto rounded-lg bg-slate-100 p-2 font-mono dark:bg-black/30">{TEMPLATE}</pre>
              </div>
            </div>
          )}
        </div>

        {notice && (
          <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            {notice}
          </p>
        )}

        {/* Daftar baris */}
        <div className="space-y-3">
          {rows.map((r, i) => {
            const msg = !isBlank(r) ? validateRow(r) : "";
            return (
              <div
                key={r._k}
                className={`rounded-xl border p-3 ${
                  msg
                    ? "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10"
                    : "border-slate-200 dark:border-white/10"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    #{i + 1}
                    {msg && <span className="ml-2 text-red-600">{msg}</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(r._k)}
                    className="rounded-md p-1 bg-red-500/40 text-white hover:bg-red-500 dark:hover:bg-red-500"
                    title="Hapus baris"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select value={r.deviceType} onChange={(e) => update(r._k, "deviceType", e.target.value)} className={cellCls}>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <select value={r.entity} onChange={(e) => update(r._k, "entity", e.target.value)} className={cellCls}>
                    {!ENTITIES.some((en) => en.value === r.entity) && (
                      <option value={r.entity}>{r.entity || "—"}</option>
                    )}
                    {ENTITIES.map((en) => (
                      <option key={en.value} value={en.value}>{en.label}</option>
                    ))}
                  </select>

                  <input placeholder="Nama (contoh: NVR Gudang A)" value={r.name} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "name", e.target.value)} className={textCls("col-span-2")} />
                  <input placeholder="IP address" value={r.ipAddress} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "ipAddress", e.target.value)} className={textCls("col-span-2 font-mono")} />
                  <input placeholder="Username" value={r.username} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "username", e.target.value)} className={textCls()} />
                  <input placeholder="Password" value={r.password} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "password", e.target.value)} className={textCls("font-mono")} />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setRows((r) => [...r, newRow()])}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
        >
          <Plus size={15} /> Tambah perangkat lain
        </button>

        {error && (
          <p className="whitespace-pre-line rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </Drawer>
  );
};

// --- Checkbox (mendukung indeterminate) --------------------------------------
const Checkbox = ({ checked, indeterminate = false, onChange, title }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      title={title}
      className="h-4 w-4 cursor-pointer rounded border-slate-400 accent-blue-600"
    />
  );
};

// --- Pagination --------------------------------------------------------------
const PAGE_SIZES = [10, 25, 50, 100];

const getPages = (page, count) => {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (page >= count - 2) [count - 3, count - 2, count - 1].forEach((n) => set.add(n));
  const arr = [...set].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out = [];
  arr.forEach((n, i) => {
    if (i > 0 && n - arr[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
};

const Pagination = ({ page, pageCount, total, pageSize, onPage, onPageSize }) => {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition disabled:opacity-40";

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center">
      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
        <label className="inline-flex items-center gap-1.5">
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="rounded-md border border-gray-200 bg-white px-1.5 py-1 h-8 mr-1 text-xs text-gray-700 outline-none dark:bg-slate-200"
            >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className={`${btn} hover:bg-slate-300 dark:hover:bg-white/10`}
            title="Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          {getPages(page, pageCount).map((p) =>
            typeof p === "string" ? (
              <span key={p} className="px-1 text-slate-500">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPage(p)}
                className={`${btn} ${
                  p === page
                    ? "bg-blue-600 font-medium text-white"
                    : "hover:bg-slate-300 dark:hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
            className={`${btn} hover:bg-slate-300 dark:hover:bg-white/10`}
            title="Berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- Modal hapus massal ------------------------------------------------------
const BulkDeleteModal = ({ cameras, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setDeleting(true);
    setError("");
    try {
      const { data } = await api.delete("/cameras/bulk", {
        data: { ids: cameras.map((c) => c._id) },
      });
      onDeleted(data.deletedIds);
    } catch (err) {
      setError(errMsg(err));
      setDeleting(false);
    }
  };

  const preview = cameras.slice(0, 5);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !deleting && onClose()}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <Trash2 size={22} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold">Hapus {cameras.length} perangkat?</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Semua perangkat terpilih akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
          <ul className="mt-3 space-y-0.5 text-left text-sm">
            {preview.map((c) => (
              <li key={c._id} className="truncate rounded-md bg-slate-100 px-2 py-1 dark:bg-white/5">
                {c.name} <span className="font-mono text-xs text-slate-500">({c.ipAddress})</span>
              </li>
            ))}
            {cameras.length > preview.length && (
              <li className="px-2 py-1 text-xs text-slate-500">
                + {cameras.length - preview.length} perangkat lainnya
              </li>
            )}
          </ul>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex gap-3 border-t border-white bg-gray-50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={confirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : `Ya, hapus ${cameras.length}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const Cameras = () => {
  const { user } = useAuth();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState(() => new Set());

  const [formState, setFormState] = useState(null); // null | {} (baru) | camera (edit)
  const [toDelete, setToDelete] = useState(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/cameras");
      setItems(data.cameras || []);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) load();
    else setLoading(false);
  }, [isGuest, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (typeFilter !== "all" && c.deviceType !== typeFilter) return false;
      if (entityFilter !== "all" && c.entity !== entityFilter) return false;
      if (!q) return true;
      return [c.name, c.ipAddress, c.username].some((v) => v?.toLowerCase().includes(q));
    });
  }, [items, search, typeFilter, entityFilter]);

  // Filter / pencarian / ukuran halaman berubah → balik ke halaman 1 & reset seleksi
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, typeFilter, entityFilter, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  // ---- Seleksi ----
  const pageIds = paged.map((c) => c._id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));
  const allFilteredSelected = filtered.length > 0 && selected.size === filtered.length;

  const toggleOne = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const togglePage = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allPageSelected) pageIds.forEach((id) => n.delete(id));
      else pageIds.forEach((id) => n.add(id));
      return n;
    });

  const selectAllFiltered = () => setSelected(new Set(filtered.map((c) => c._id)));
  const clearSelection = () => setSelected(new Set());

  const selectedCameras = useMemo(
    () => items.filter((c) => selected.has(c._id)),
    [items, selected]
  );

  // ---- Handler hasil ----
  const handleBulkSaved = (cameras) => {
    setItems((list) => [...cameras, ...list]);
    setShowBulk(false);
  };

  const handleSaved = (camera, isEdit) => {
    setItems((list) =>
      isEdit ? list.map((c) => (c._id === camera._id ? camera : c)) : [camera, ...list]
    );
    setFormState(null);
  };

  const handleDeleted = (id) => {
    setItems((list) => list.filter((c) => c._id !== id));
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    setToDelete(null);
  };

  const handleBulkDeleted = (ids) => {
    const gone = new Set(ids);
    setItems((list) => list.filter((c) => !gone.has(c._id)));
    setSelected(new Set());
    setShowBulkDelete(false);
  };

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-white">
        <Video size={32} />
        <p className="font-medium">Halaman ini khusus akun terdaftar</p>
        <p className="text-sm text-gray-300">Login untuk melihat data kamera dan NVR/DVR.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full pr-0 md:border-x border-white shadow-none dark:border-white/10">
      <div className="flex w-full gap-2 pb-3.5 md:p-6 justify-start">
        <div className="w-full md:w-max flex items-center gap-2">
          <button
            onClick={() => setShowBulk(true)}
            className="flex w-max md:flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:opacity-90 active:scale-[0.99] dark:bg-transparent dark:text-white md:px-4"
          >
            <ClipboardPaste size={16} /> Import banyak
          </button>
          <button
            onClick={() => setFormState({})}
            className="flex w-max md:flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:opacity-90 active:scale-[0.99] dark:bg-transparent dark:text-white md:px-4"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
        <Link to={'192.168.1.58:8000'}>
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 shadow-none bg-slate-200 px-2 py-2 h-full text-sm font-medium text-slate-900 transition hover:opacity-90 active:scale-[0.99] dark:bg-transparent dark:text-white md:flex-none md:px-3"
          >
            <Camera size={16} className="relative top-[-0.5px]" /> 
          </button>
        </Link>
      </div>

      <div className="pb-6 md:px-6">
        <div className="rounded-xl bg-slate-200 px-3 py-3 dark:bg-white/5 md:p-4">
          {/* Filter */}
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 shadow-sm dark:bg-slate-200 md:flex-1">
              <Search size={16} className="shrink-0 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, IP, atau username..."
                className="h-[24.5px] w-full px-1 py-2 text-sm font-medium text-black outline-none dark:bg-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none dark:bg-slate-200 md:w-44"
            >
              <option value="all">Semua jenis</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none dark:bg-slate-200 md:w-44"
            >
              <option value="all">Semua entitas</option>
              {ENTITIES.map((en) => (
                <option key={en.value} value={en.value}>{en.label}</option>
              ))}
            </select>
          </div>

          {/* Bar aksi seleksi */}
          {selected.size > 0 && (
            <div className="mb-3 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{selected.size} dipilih</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-md px-2.5 py-1 hover:bg-white/15"
                  >
                    Batal pilih
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkDelete(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 font-medium hover:bg-red-700"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>

              {allPageSelected && filtered.length > pageIds.length && (
                <p className="mt-1.5 border-t border-white/20 pt-1.5 text-xs">
                  {allFilteredSelected ? (
                    <>Semua {filtered.length} perangkat hasil filter dipilih.</>
                  ) : (
                    <>
                      {pageIds.length} perangkat di halaman ini dipilih.{" "}
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="font-semibold underline"
                      >
                        Pilih semua {filtered.length} hasil
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Konten */}
          {loading ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-lg bg-slate-300 dark:bg-white/10"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={load}
                className="rounded-lg border border-slate-400 px-3 py-1.5 text-sm hover:bg-slate-300 dark:border-white/20 dark:hover:bg-white/10"
              >
                Coba lagi
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Video size={28} className="text-slate-500" />
              <p className="font-medium">
                {items.length === 0 ? "Belum ada perangkat" : "Tidak ada hasil"}
              </p>
              <p className="text-sm text-gray-500">
                {items.length === 0
                  ? "Klik “Tambah perangkat” untuk menyimpan NVR, DVR, atau kamera pertama."
                  : "Ubah kata kunci atau filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: tabel */}
              <div className="hidden overflow-x-auto rounded-lg md:block">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-slate-300 text-xs text-slate-600 dark:border-white/10 dark:text-gray-400">
                    <tr>
                      <th className="w-10 px-3 py-2">
                        <Checkbox
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={togglePage}
                          title="Pilih semua di halaman ini"
                        />
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="relative bottom-[1.6px]">
                          Jenis
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="relative bottom-[1.6px]">
                          Nama
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">  
                        <span className="relative bottom-[1.6px]">
                          IP address
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="relative bottom-[1.6px]">
                          Username
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="relative bottom-[1.6px]">
                          Password
                        </span>
                      </th>
                      <th className="px-3 py-2 font-medium">
                        <span className="relative bottom-[1.6px]">
                          Entitas
                        </span>
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        <span className="relative bottom-[1.6px]">
                          Aksi
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((c) => {
                      const checked = selected.has(c._id);
                      return (
                        <tr
                          key={c._id}
                          className={`border-b border-slate-300/70 last:border-b-0 dark:border-white/5 ${
                            checked
                              ? "bg-blue-100/70 dark:bg-blue-500/10"
                              : "hover:bg-slate-300/40 dark:hover:bg-white/5"
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <Checkbox checked={checked} onChange={() => toggleOne(c._id)} />
                          </td>
                          <td className="px-3 py-2.5">
                            <TypeBadge type={c.deviceType} />
                          </td>
                          <td className="px-3 py-2.5 font-medium">{c.name}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1 font-mono">
                              {c.ipAddress}
                              <CopyButton getText={async () => c.ipAddress} title="Copy IP" />
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1">
                              {c.username}
                              <CopyButton getText={async () => c.username} title="Copy username" />
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <PasswordCell id={c._id} />
                          </td>
                          <td className="px-3 py-2.5">
                            <EntityBadge entity={c.entity} />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setFormState(c)}
                                title="Edit"
                                className="rounded-md p-2 text-slate-600 transition hover:bg-slate-300 active:scale-95 dark:text-gray-300 dark:hover:bg-white/10"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => setToDelete(c)}
                                title="Hapus"
                                className="rounded-md p-2 text-red-600 transition hover:bg-red-100 active:scale-95 dark:hover:bg-red-500/20"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: kartu */}
              <div className="flex flex-col gap-3 md:hidden">
                <label className="flex items-center gap-2 px-1 text-sm text-slate-600 dark:text-gray-300">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onChange={togglePage}
                  />
                  Pilih semua di halaman ini
                </label>

                {paged.map((c) => {
                  const checked = selected.has(c._id);
                  return (
                    <div
                      key={c._id}
                      className={`rounded-xl border p-3 ${
                        checked
                          ? "border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10"
                          : "border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-slate-950"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div className="pt-1">
                            <Checkbox checked={checked} onChange={() => toggleOne(c._id)} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{c.name}</p>
                            <div className="mt-1 flex gap-1.5">
                              <TypeBadge type={c.deviceType} />
                              <EntityBadge entity={c.entity} />
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0">
                          <button
                            onClick={() => setFormState(c)}
                            className="rounded-md p-2 text-slate-600 dark:text-gray-300"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setToDelete(c)}
                            className="rounded-md p-2 text-red-600"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <dl className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <dt className="text-slate-500">IP</dt>
                          <dd className="inline-flex items-center gap-1 font-mono">
                            {c.ipAddress}
                            <CopyButton getText={async () => c.ipAddress} title="Copy IP" />
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-slate-500">Username</dt>
                          <dd className="inline-flex items-center gap-1">
                            {c.username}
                            <CopyButton getText={async () => c.username} title="Copy username" />
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-slate-500">Password</dt>
                          <dd>
                            <PasswordCell id={c._id} />
                          </dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>

              <Pagination
                page={currentPage}
                pageCount={pageCount}
                total={filtered.length}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={setPageSize}
              />
            </>
          )}
        </div>
      </div>

      {formState && (
        <CameraFormModal
          initial={formState}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
      {showBulk && <BulkImportModal onClose={() => setShowBulk(false)} onSaved={handleBulkSaved} />}
      {toDelete && (
        <DeleteModal
          camera={toDelete}
          onClose={() => setToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
      {showBulkDelete && (
        <BulkDeleteModal
          cameras={selectedCameras}
          onClose={() => setShowBulkDelete(false)}
          onDeleted={handleBulkDeleted}
        />
      )}
    </div>
  );
};

export default Cameras;
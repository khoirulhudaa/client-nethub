import {
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Copy,
  CopyIcon,
  Eye,
  EyeOff,
  FolderMinus,
  FolderPlus,
  Layers,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from 'react-router-dom';

const TYPES = ["NVR", "DVR", "Camera"];
const ENTITIES = [
  { value: "pintex", label: "Pintex" },
  { value: "tfi", label: "TFI" },
  { value: "umum", label: "General" },
];
const EMPTY_FORM = {
  deviceType: "NVR",
  name: "",
  ipAddress: "",
  username: "",
  password: "",
  entity: "pintex",
  group: "",
};

const errMsg = (err) => err?.response?.data?.message || "Something went wrong, please try again";

const inputCls =
  "w-full rounded-lg border border-white/20 bg-white/10 text-white border-gray-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500";

  
// --- Copy button -------------------------------------------------------------
const CopyButton = ({ getText, title = "Copy" }) => {
  const [done, setDone] = useState(false);

  const handle = async () => {
    try {
      const text = await getText();
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* ignored */
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

// --- Password: only fetched from the server when clicked ---------------------
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
        title={visible ? "Hide password" : "Show password"}
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
    Cancel
  </button>
);

const CameraFormModal = ({ initial, groups = [], onClose, onSaved }) => {
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
        group: form.group || "",
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

  const nameLabel = form.deviceType === "Camera" ? "Camera name" : `${form.deviceType} name`;

  return (
    <Drawer
      title={isEdit ? "Edit device" : "Add device"}
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
                <Loader2 size={15} className="animate-spin" /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </>
      }
    >
      <form id="camera-form" onSubmit={submit} className="grid grid-cols-1 gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Hardware type</span>
          <select value={form.deviceType} onChange={set("deviceType")} className={inputCls}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Entity</span>
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
            placeholder="e.g. NVR Warehouse A"
            className={inputCls}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">IP address</span>
          <input
            required
            value={form.ipAddress}
            onChange={set("ipAddress")}
            placeholder="192.168.1.100 or 192.168.1.100:8000"
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
              placeholder={isEdit ? "Leave blank to keep unchanged" : ""}
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

        <label className="text-sm">
          <span className="mb-1 block font-medium">Group (optional)</span>
          <input
            list="group-list"
            value={form.group || ""}
            onChange={set("group")}
            maxLength={100}
            placeholder="e.g. OFFICE PINTEX"
            className={inputCls}
          />
          <datalist id="group-list">
            {groups.map((g) => <option key={g} value={g} />)}
          </datalist>
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

// --- Delete modal ------------------------------------------------------------
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
          <h3 className="text-lg font-semibold">Delete device?</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <strong>{camera.name}</strong> ({camera.ipAddress}) will be permanently deleted.
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
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={confirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.99] disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const COLS = ["deviceType", "name", "ipAddress", "username", "password", "entity"];

const TEMPLATE = `Name : OFFICE PINTEX
IP : 192.168.1.41
Pass: HikVision1269
Entity: PINTEX
Type: NVR
Group: OFFICE PINTEX
Username: admin

Name : WAREHOUSE A
IP : 192.168.1.42
Pass: abc12345
Entity: TFI
Type: Camera
Group: OFFICE PINTEX
Username: admin`;

const TABLE_TEMPLATE = `Type\tName\tIP\tUsername\tPassword\tEntity
NVR\tOFFICE PINTEX\t192.168.1.41\tadmin\tHikVision1269\tPINTEX
DVR\tWAREHOUSE A\t192.168.1.42\tadmin\tabc12345\tTFI`;

const normalize = (key, val) => {
  val = (val || "").trim();
  if (key === "deviceType") return TYPE_MAP[val.toLowerCase()] || val;
  if (key === "entity") {
    const v = val.toLowerCase();
    return v === "general" ? "umum" : v; // "General" label maps to the stored "umum" value
  }
  return val;
};

const LABEL_RE = /^\s*([^:=|\t,]+?)\s*[:=]\s*(.*)$/;

// Labeled format: "Name : xxx", blocks separated by blank lines
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
    if (cur && key in cur) flush(); // repeated label = new device
    if (!cur) cur = {};
    cur[key] = normalize(key, m[2]);
  }
  flush();
  return rows;
};

// Table format: tab / | / comma, optional header
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

// --- Bulk text parser --------------------------------------------------------
// NOTE: the Indonesian aliases (nama, pass, entitas, grup, jenis, tipe, user, kamera)
// are kept on purpose so previously formatted pasted data still works.
const KEY_MAP = {
  nama: "name", name: "name",
  ip: "ipAddress", "ip address": "ipAddress", ipaddress: "ipAddress",
  pass: "password", password: "password",
  entitas: "entity", entity: "entity",
  group: "group", grup: "group",
  jenis: "deviceType", tipe: "deviceType", type: "deviceType",
  user: "username", username: "username",
};
const TYPE_MAP = { nvr: "NVR", dvr: "DVR", camera: "Camera", kamera: "Camera", cam: "Camera" };
const HOST_RE = /^[a-zA-Z0-9.\-]+(:\d{1,5})?$/;
const EMPTY_ROW = { deviceType: "NVR", name: "", ipAddress: "", username: "admin", password: "", entity: "pintex" };

let rowSeq = 0;
const newRow = (data = {}) => ({ ...EMPTY_ROW, ...data, _k: ++rowSeq });

const validateRow = (r) => {
  if (!TYPES.includes(r.deviceType)) return "Invalid type";
  if (!ENTITIES.some((e) => e.value === r.entity)) return "Invalid entity";
  if (!r.name.trim()) return "Name is empty";
  if (!r.ipAddress.trim() || !HOST_RE.test(r.ipAddress.trim())) return "Invalid IP";
  if (!r.username.trim()) return "Username is empty";
  if (!r.password) return "Password is empty";
  return "";
};

const cellCls =
  "w-full rounded-lg border border-white/20 bg-white/10 text-white border-gray-200 bg-white px-2 py-1.5 text-sm text-black outline-none focus:border-blue-500";
const BulkImportModal = ({ onClose, onSaved, groups = [] }) => {
  const [rows, setRows] = useState(() => [newRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showFormat, setShowFormat] = useState(false);
  const fileRef = useRef(null);

  const addParsed = useCallback((parsed) => {
    setRows((list) => [...list.filter((r) => !isBlank(r)), ...parsed]);
    setError("");
    setNotice(`${parsed.length} devices added from paste`);
  }, []);

  // Paste in any field: if multi-line / from Excel, it automatically becomes multiple rows
  const handlePaste = (e) => {
    const t = (e.clipboardData?.getData("text") || "").trim();
    if (!t.includes("\n") && !t.includes("\t")) return; // normal paste (single line)
    const parsed = parseBulk(t);
    if (!parsed.length) return;
    e.preventDefault();
    addParsed(parsed);
  };

  // Paste anywhere in the drawer when no input field is focused
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
    if (!parsed.length) return setError("Couldn't read the file contents. Check the format.");
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
        list?.length ? list.map((e) => `Row ${e.row}: ${e.message}`).join("\n") : errMsg(err)
      );
      setSaving(false);
    }
  };

  const textCls = (extra = "") => `${cellCls} ${extra}`;

  return (
    <Drawer
      title="Add devices"
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
                <Loader2 size={15} className="animate-spin" /> Saving...
              </span>
            ) : (
              `Save ${filled.length || ""} devices`
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
            <strong>Just press Ctrl + V</strong> in any field
            and the data will be filled in automatically
          </p>
        </div>
        <datalist id="group-list-bulk">
          {groups.map((g) => <option key={g} value={g} />)}
        </datalist>
        <div className="rounded-lg border border-dashed border-slate-300 px-3 pt-2 pb-2.5 text-sm dark:border-white/30">
          <button
            type="button"
            onClick={() => setShowFormat((s) => !s)}
            className="mt-0 text-xs font-medium text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            {showFormat ? "Hide format ▲" : "View supported formats ▼"}
          </button>


          {showFormat && (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">1. Labeled (separate with blank lines)</span>
                  <CopyButton getText={async () => TEMPLATE} title="Copy template" />
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

        {/* Row list */}
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
                    title="Delete row"
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

                  <input placeholder="Name (e.g. NVR Warehouse A)" value={r.name} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "name", e.target.value)} className={textCls("col-span-2")} />
                  <input placeholder="IP address" value={r.ipAddress} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "ipAddress", e.target.value)} className={textCls("col-span-2 font-mono")} />
                  <input placeholder="Username" value={r.username} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "username", e.target.value)} className={textCls()} />
                  <input placeholder="Password" value={r.password} onPaste={handlePaste}
                    onChange={(e) => update(r._k, "password", e.target.value)} className={textCls("font-mono")} />
                  <input
                    list="group-list-bulk"
                    placeholder="Group (optional)"
                    value={r.group || ""}
                    onPaste={handlePaste}
                    onChange={(e) => update(r._k, "group", e.target.value)}
                    className={textCls("col-span-2")}
                  />
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
          <Plus size={15} /> Add another device
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

// --- Checkbox (supports indeterminate) ---------------------------------------
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
            title="Previous"
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
            title="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- Bulk delete modal -------------------------------------------------------
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
          <h3 className="text-lg font-semibold">Delete {cameras.length} devices?</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            All selected devices will be permanently deleted and cannot be restored.
          </p>
          <ul className="mt-3 space-y-0.5 text-left text-sm">
            {preview.map((c) => (
              <li key={c._id} className="truncate rounded-md bg-slate-100 px-2 py-1 dark:bg-white/5">
                {c.name} <span className="font-mono text-xs text-slate-500">({c.ipAddress})</span>
              </li>
            ))}
            {cameras.length > preview.length && (
              <li className="px-2 py-1 text-xs text-slate-500">
                + {cameras.length - preview.length} more devices
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
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={confirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : `Yes, delete ${cameras.length}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const GROUP_COLORS = [
  "#7c3aed", "#2563eb", "#0891b2", "#059669",
  "#ca8a04", "#ea580c", "#dc2626", "#db2777",
];
const DEFAULT_GROUP_COLOR = GROUP_COLORS[0];

const ColorPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    {GROUP_COLORS.map((c) => (
      <button
        key={c}
        type="button"
        onClick={() => onChange(c)}
        title={c}
        style={{ backgroundColor: c }}
        className={`h-7 w-7 rounded-md transition hover:scale-110 ${
          value?.toLowerCase() === c ? "ring-none border border-white ring-offset-0 ring-slate-500 dark:ring-offset-gray-900" : ""
        }`}
      />
    ))}
    <label
      title="Other color"
      className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-dashed border-slate-400"
      style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
    >
      <input
        type="color"
        value={value || DEFAULT_GROUP_COLOR}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  </div>
);

const GroupBadge = ({ pre=false, group, color }) => {
  if (!group) return <span className="text-xs text-slate-400">—</span>;
  const c = color || DEFAULT_GROUP_COLOR;
  return (
    <span
      className={`inline-flex ${pre ? 'w-max' : 'w-full'} text-center items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium text-white`}
      style={{ backgroundColor: c }}
    >
      {group}
    </span>
  );
};

const Th = ({ children, className = "" }) => (
  <th className={`px-3 py-2 font-medium ${className}`}>
    <span className="relative bottom-[1.6px]">{children}</span>
  </th>
);

const GroupModal = ({ title, ids, initialName = "", initialColor = "", groups, colors, onClose, onSaved }) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || DEFAULT_GROUP_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Choosing an existing group name automatically adopts its color
  const changeName = (value) => {
    setName(value);
    const existing = groups.find((g) => g.toLowerCase() === value.trim().toLowerCase());
    if (existing && colors.get(existing)) setColor(colors.get(existing));
  };

  const submit = async (e) => {
    e.preventDefault();
    const typed = name.trim().replace(/\s+/g, " ");
    if (!typed) return setError("Group name is required");
    const group = groups.find((g) => g.toLowerCase() === typed.toLowerCase()) || typed;
    setSaving(true);
    setError("");
    try {
      await api.patch("/cameras/group", { ids, group, color });
      onSaved(ids, group, color);
    } catch (err) {
      setError(errMsg(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-2xl border border-white bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-gray-900"
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {ids.length} devices will be added to this group.
        </p>

        <label className="mb-1 block text-sm font-medium">Group name</label>
        <input
          autoFocus
          list="group-list-modal"
          value={name}
          onChange={(e) => changeName(e.target.value)}
          maxLength={100}
          placeholder="e.g. OFFICE PINTEX"
          className={inputCls}
        />
        <datalist id="group-list-modal">
          {groups.map((g) => <option key={g} value={g} />)}
        </datalist>

        {groups.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {groups.slice(0, 12).map((g) => (
              <button key={g} type="button" onClick={() => changeName(g)}>
                <GroupBadge group={g} color={colors.get(g)} />
              </button>
            ))}
          </div>
        )}

        <label className="mb-2 mt-4 block text-sm font-medium">Group color</label>
        <ColorPicker value={color} onChange={setColor} />

        <div className="mt-3 text-sm">
          Preview: <GroupBadge pre={true} group={name.trim() || "Group name"} color={color} />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <CancelBtn onClick={onClose} disabled={saving} />
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Device list (desktop table + mobile cards), used by List & Group views ---
const DeviceList = ({ rows, selected, onToggle, onToggleMany, onEdit, onDelete, showGroup = true }) => {
  const ids = rows.map((c) => c._id);
  const all = ids.length > 0 && ids.every((id) => selected.has(id));
  const some = ids.some((id) => selected.has(id));

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-lg md:block">
        <table className={`w-full ${showGroup ? "min-w-[980px]" : "min-w-[860px]"} text-left text-sm`}>
          <thead className="border-b border-slate-300 text-xs text-slate-600 dark:border-white/10 dark:text-gray-400">
            <tr>
              <th className="w-10 px-3 py-2">
                <Checkbox checked={all} indeterminate={some} onChange={() => onToggleMany(ids)} title="Select all" />
              </th>
              <Th>Type</Th>
              <Th>Name</Th>
              {showGroup && <Th>Group</Th>}
              <Th>IP address</Th>
              <Th>Username</Th>
              <Th>Password</Th>
              <Th>Entity</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const checked = selected.has(c._id);
              return (
                <tr
                  key={c._id}
                  className={`border-b border-slate-300/70 last:border-b-0 dark:border-white/5 ${
                    checked ? "bg-blue-100/70 dark:bg-blue-500/10" : "hover:bg-slate-300/40 dark:hover:bg-white/5"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <Checkbox checked={checked} onChange={() => onToggle(c._id)} />
                  </td>
                  <td className="px-3 py-2.5"><TypeBadge type={c.deviceType} /></td>
                  <td className="px-3 py-2.5 font-medium">{c.name}</td>
                  {showGroup && <td className="px-3 py-2.5"><GroupBadge group={c.group} color={c.groupColor} /></td>}
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
                  <td className="px-3 py-2.5"><PasswordCell id={c._id} /></td>
                  <td className="px-3 py-2.5"><EntityBadge entity={c.entity} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(c)}
                        title="Edit"
                        className="rounded-md p-2 text-slate-600 transition hover:bg-slate-300 active:scale-95 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        title="Delete"
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

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {showGroup && (
          <label className="flex items-center gap-2 px-1 text-sm text-slate-600 dark:text-gray-300">
            <Checkbox checked={all} indeterminate={some} onChange={() => onToggleMany(ids)} />
            Select all on this page
          </label>
        )}
        {rows.map((c) => {
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
                    <Checkbox checked={checked} onChange={() => onToggle(c._id)} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <TypeBadge type={c.deviceType} />
                      <EntityBadge entity={c.entity} />
                      {showGroup && c.group && <GroupBadge group={c.group} color={c.groupColor} />}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0">
                  <button onClick={() => onEdit(c)} className="rounded-md p-2 text-slate-600 dark:text-gray-300" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(c)} className="rounded-md p-2 text-red-600" title="Delete">
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
                  <dd><PasswordCell id={c._id} /></dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
};

// --- A single group section (collapsible) ------------------------------------
const GroupSection = ({
  name, color, rows, collapsed, onCollapse, selected, onToggle, onToggleMany,
  onEdit, onDelete, onRename, onUngroup,
}) => {
  const c = color || DEFAULT_GROUP_COLOR;
  const ids = rows.map((c) => c._id);
  const all = ids.length > 0 && ids.every((id) => selected.has(id));
  const some = ids.some((id) => selected.has(id));
  const hubs = rows.filter((c) => c.deviceType !== "Camera").length;
  const cams = rows.length - hubs;

  return (
      <section
        className="overflow-hidden rounded-xl border border-slate-300 dark:border-white/10"
        style={name ? { borderLeft: `4px solid ${c}` } : undefined}
      >
      <div
          className="flex items-center gap-2 bg-slate-300/50 px-3 py-2 dark:bg-white/5"
          style={name ? { backgroundColor: `${c}1f` } : undefined}
        >
        <Checkbox checked={all} indeterminate={some} onChange={() => onToggleMany(ids)} title="Select all in this group" />
        <button type="button" onClick={onCollapse} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <ChevronDown size={16} className={`shrink-0 transition ${collapsed ? "-rotate-90" : ""}`} />
          <span className="truncate font-semibold">{name ?? "No group"}</span>
          <span className="shrink-0 text-xs text-slate-500 dark:text-gray-400">
            {hubs > 0 && `${hubs} NVR/DVR`}
            {hubs > 0 && cams > 0 && " · "}
            {cams > 0 && `${cams} cameras`}
          </span>
        </button>
        {name && (
          <div className="flex shrink-0 gap-0.5">
            <button
              type="button"
              onClick={onRename}
              title="Rename group"
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-300 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onUngroup}
              title="Disband group"
              className="rounded-md p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20"
            >
              <FolderMinus size={14} />
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-2">
          <DeviceList
            rows={rows}
            selected={selected}
            onToggle={onToggle}
            onToggleMany={onToggleMany}
            onEdit={onEdit}
            onDelete={onDelete}
            showGroup={false}
          />
        </div>
      )}
    </section>
  );
};

const Cameras = () => {
  const { user } = useAuth();
  const isGuest = user?.isGuest || user?.role === "guest";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [groupFilter, setGroupFilter] = useState("all"); // all | __none | group name
  const [viewMode, setViewMode] = useState("list"); // list | group
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [groupModal, setGroupModal] = useState(null); // { title, ids, initialName }

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState(() => new Set());

  const [formState, setFormState] = useState(null); // null | {} (new) | camera (edit)
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

  const groupNames = useMemo(
    () => [...new Set(items.map((c) => c.group).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const groupColors = useMemo(() => {
    const m = new Map();
    items.forEach((c) => {
      if (c.group && c.groupColor && !m.has(c.group)) m.set(c.group, c.groupColor);
    });
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (typeFilter !== "all" && c.deviceType !== typeFilter) return false;
      if (entityFilter !== "all" && c.entity !== entityFilter) return false;
      if (groupFilter === "__none") {
        if (c.group) return false;
      } else if (groupFilter !== "all" && c.group !== groupFilter) return false;
      if (!q) return true;
      return [c.name, c.ipAddress, c.username, c.group].some((v) => v?.toLowerCase().includes(q));
    });
  }, [items, search, typeFilter, entityFilter, groupFilter]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, typeFilter, entityFilter, groupFilter, pageSize]);

  // For Group view: NVR/DVR first, then cameras
  const grouped = useMemo(() => {
    const order = { NVR: 0, DVR: 1, Camera: 2 };
    const map = new Map();
    filtered.forEach((c) => {
      const g = c.group || "";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(c);
    });
    const sortRows = (rows) =>
      rows.slice().sort((a, b) => order[a.deviceType] - order[b.deviceType] || a.name.localeCompare(b.name));
    const named = [...map.entries()]
      .filter(([g]) => g)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([g, rows]) => [g, sortRows(rows)]);
    return { named, none: sortRows(map.get("") || []) };
  }, [filtered]);

  // Filter / search / page size changes → back to page 1 & reset selection
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

  // ---- Selection ----
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

  const toggleMany = (ids) =>
  setSelected((s) => {
    const n = new Set(s);
    const all = ids.every((id) => n.has(id));
    ids.forEach((id) => (all ? n.delete(id) : n.add(id)));
    return n;
  });
  
  const togglePage = () => toggleMany(pageIds);

  const toggleCollapse = (key) =>
    setCollapsed((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const applyGroup = (ids, group, color = "") => {
    const set = new Set(ids);
    setItems((list) =>
      list.map((c) => {
        if (set.has(c._id)) return { ...c, group, groupColor: group ? color : "" };
        // other members with the same group name get the same color
        if (group && c.group === group) return { ...c, groupColor: color };
        return c;
      })
    );
  };

  const handleGroupSaved = (ids, group, color) => {
    applyGroup(ids, group, color);
    setSelected(new Set());
    setGroupModal(null);
  };

  const ungroup = async (ids, label) => {
    if (label && !window.confirm(`Disband group "${label}"? The devices won't be deleted.`)) return;
    try {
      await api.patch("/cameras/group", { ids, group: "" });
      applyGroup(ids, "");
      setSelected(new Set());
    } catch (err) {
      alert(errMsg(err));
    }
  };

  const selectAllFiltered = () => setSelected(new Set(filtered.map((c) => c._id)));
  const clearSelection = () => setSelected(new Set());

  const selectedCameras = useMemo(
    () => items.filter((c) => selected.has(c._id)),
    [items, selected]
  );

  // ---- Result handlers ----
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
        <p className="font-medium">This page is for registered accounts only</p>
        <p className="text-sm text-gray-300">Log in to view camera and NVR/DVR data.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full pr-0 md:border-x border-white shadow-none dark:border-white/10">
      <div className="flex w-full gap-2 pb-3.5 md:p-6 justify-start">
        <div className="w-max flex items-center gap-2">
          <button
            onClick={() => setShowBulk(true)}
            className="flex md: w-max items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:opacity-90 active:scale-[0.99] dark:bg-transparent dark:text-white md:px-4"
          >
            <ClipboardPaste size={16} /> Bulk import
          </button>
          <button
            onClick={() => setFormState({})}
            className="flex md: w-max items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:opacity-90 active:scale-[0.99] dark:bg-transparent dark:text-white md:px-4"
          >
            <Plus size={16} /> Add
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
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 shadow-sm dark:bg-slate-200 md:flex-1">
              <Search size={16} className="shrink-0 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, IP, or username..."
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

            <div className="w-full md:w-max flex items-center gap-x-1.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none dark:bg-slate-200 md:w-44"
              >
                <option value="all">All types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none dark:bg-slate-200 md:w-44"
              >
                <option value="all">All entities</option>
                {ENTITIES.map((en) => (
                  <option key={en.value} value={en.value}>{en.label}</option>
                ))}
              </select>

              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none dark:bg-slate-200 md:w-44"
              >
                <option value="all">All groups</option>
                <option value="__none">No group</option>
                {groupNames.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <div className="flex shrink-0 overflow-hidden rounded-lg h-[40px] border border-gray-200 bg-white dark:bg-slate-200">
                {[
                  ["list", List, "List view"],
                  ["group", Layers, "Group view"],
                ].map(([mode, Icon, title]) => (
                  <button
                    key={mode}
                    type="button"
                    title={title}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2.5 ${viewMode === mode ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selection action bar */}
          {selected.size > 0 && (
            <div className="mb-3 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{selected.size} selected</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-md px-2.5 py-1 hover:bg-white/15"
                  >
                    Deselect
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGroupModal({
                        title: "Add to group",
                        ids: [...selected],
                        initialName: groupFilter !== "all" && groupFilter !== "__none" ? groupFilter : "",
                        initialColor: groupColors.get(groupFilter) || "",
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 font-medium hover:bg-white/25"
                  >
                    <FolderPlus size={14} /> Add to group
                  </button>
                  {selectedCameras.some((c) => c.group) && (
                    <button
                      type="button"
                      onClick={() => ungroup([...selected])}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 hover:bg-white/15"
                    >
                      <FolderMinus size={14} /> Remove from group
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowBulkDelete(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 font-medium hover:bg-red-700"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {allPageSelected && filtered.length > pageIds.length && (
                <p className="mt-1.5 border-t border-white/20 pt-1.5 text-xs">
                  {allFilteredSelected ? (
                    <>All {filtered.length} filtered devices are selected.</>
                  ) : (
                    <>
                      {pageIds.length} devices on this page are selected.{" "}
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="font-semibold underline"
                      >
                        Select all {filtered.length} results
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Content */}
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
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Video size={28} className="text-slate-500" />
              <p className="font-medium">
                {items.length === 0 ? "No devices yet" : "No results"}
              </p>
              <p className="text-sm text-gray-500">
                {items.length === 0
                  ? "Click “Add” to save your first NVR, DVR, or camera."
                  : "Change your keywords or filters."}
              </p>
            </div>
          ) : viewMode === "group" ? (
            <div className="space-y-3">
              {grouped.named.map(([name, rows]) => (
                <GroupSection
                  key={name}
                  name={name}
                  rows={rows}
                  color={groupColors.get(name)}
                  collapsed={collapsed.has(name)}
                  onCollapse={() => toggleCollapse(name)}
                  selected={selected}
                  onToggle={toggleOne}
                  onToggleMany={toggleMany}
                  onEdit={setFormState}
                  onDelete={setToDelete}
                  onRename={() =>
                    setGroupModal({
                      title: "Edit group",
                      ids: rows.map((c) => c._id),
                      initialName: name,
                      initialColor: groupColors.get(name) || "",
                    })
                  }
                  onUngroup={() => ungroup(rows.map((c) => c._id), name)}
                />
              ))}
              {grouped.none.length > 0 && (
                <GroupSection
                  name={null}
                  rows={grouped.none}
                  collapsed={collapsed.has("__none")}
                  onCollapse={() => toggleCollapse("__none")}
                  selected={selected}
                  onToggle={toggleOne}
                  onToggleMany={toggleMany}
                  onEdit={setFormState}
                  onDelete={setToDelete}
                />
              )}
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Showing {filtered.length} of {items.length} devices in {grouped.named.length} groups
              </p>
            </div>
          ) : (
            <>
              <DeviceList
                rows={paged}
                selected={selected}
                onToggle={toggleOne}
                onToggleMany={toggleMany}
                onEdit={setFormState}
                onDelete={setToDelete}
              />
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
          groups={groupNames}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
      {showBulk && (
        <BulkImportModal groups={groupNames} onClose={() => setShowBulk(false)} onSaved={handleBulkSaved} />
      )}
      {groupModal && (
        <GroupModal
          title={groupModal.title}
          ids={groupModal.ids}
          initialName={groupModal.initialName}
          initialColor={groupModal.initialColor}
          groups={groupNames}
          colors={groupColors}
          onClose={() => setGroupModal(null)}
          onSaved={handleGroupSaved}
        />
      )}
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
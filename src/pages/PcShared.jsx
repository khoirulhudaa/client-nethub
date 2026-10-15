import toast from "react-hot-toast";

// Konstanta bersama untuk Pcs.jsx dan PcForm.jsx

export const OS_LIST = [
  { value: "windows", label: "Windows" },
  { value: "linux", label: "Linux" },
  { value: "mac", label: "macOS" },
];

export const osOf = (value) => OS_LIST.find((o) => o.value === value);

// 123456789 -> "123 456 789" (format tampilan seperti di aplikasi AnyDesk)
export const formatAnydesk = (id = "") => {
  if (!/^\d+$/.test(id)) return id;
  return id.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
};

export const copyText = async (e, text, label = "Teks") => {
  e?.stopPropagation();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  } catch {
    toast.error("Gagal menyalin");
  }
};
// Konstanta & komponen kecil yang dipakai Contacts.jsx dan ContactForm.jsx

export const CATEGORIES = ["Internal", "Vendor", "Client", "Supplier", "Support", "Emergency", "Family", "Other"];
export const PHONE_LABELS = ["Mobile", "Work", "Home", "WhatsApp", "Extension", "Fax", "Other"];
export const PLATFORMS = ["WhatsApp", "Telegram", "Instagram", "Facebook", "LinkedIn", "X", "TikTok", "Website", "Other"];
export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const CATEGORY_STYLE = {
  Internal: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Vendor: "bg-purple-500/15 text-purple-600 dark:text-purple-300",
  Client: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  Supplier: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  Support: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
  Emergency: "bg-red-500/15 text-red-600 dark:text-red-300",
  Family: "bg-pink-500/15 text-pink-600 dark:text-pink-300",
  Other: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

export const waLink = (p) => `https://wa.me/${p.normalized || String(p.number).replace(/\D/g, "")}`;
export const telLink = (p) => `tel:${p.normalized ? "+" + p.normalized : p.number}`;
export const primaryOf = (list = []) => list.find((x) => x.isPrimary) || list[0];

export const Avatar = ({ contact, size = 48 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-sm font-semibold text-white dark:!bg-[#111122] dark:text-accent border border-white/20"
  >
    {contact.photo ? (
      <img src={contact.photo} alt={contact.name} className="h-full w-full object-cover" />
    ) : (
      contact.name?.[0]?.toUpperCase() || "?"
    )}
  </div>
);

export const CategoryBadge = ({ category }) => (
  <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${CATEGORY_STYLE[category] || CATEGORY_STYLE.Other}`}>
    {category}
  </span>
);
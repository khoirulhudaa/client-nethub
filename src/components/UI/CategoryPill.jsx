import { Network, Wrench, ShieldAlert, HardDrive, Boxes, FileText, Utensils, Users, LayoutGrid, Code2, Shield } from "lucide-react";

const CATEGORY_STYLES = {
  Topology: {
    icon: Network,
    className:
      "bg-blue-500 text-white dark:!bg-blue-500/10 md:dark:!bg-blue-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  Maintenance: {
    icon: Wrench,
    className:
      "bg-amber-500 text-white dark:bg-amber-500/10 md:dark:!bg-amber-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  Installation: {
    icon: Boxes,
    className:
      "bg-purple-500 text-white dark:bg-purple-500/10 md:dark:!bg-purple-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  Hardware: {
    icon: HardDrive,
    className:
      "bg-emerald-500 text-white dark:bg-emerald-500/10 md:dark:!bg-emerald-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  Eproc: {
    icon: FileText,
    className:
      "bg-sky-500 text-white dark:!bg-sky-500/10 md:dark:!bg-sky-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  "E-kantin": {
    icon: Utensils,
    className:
      "bg-orange-500 text-white dark:!bg-orange-500/10 md:dark:!bg-orange-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  EHRD: {
    icon: Users,
    className:
      "bg-indigo-500 text-white dark:!bg-indigo-500/10 md:dark:!bg-indigo-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  General: {
    icon: LayoutGrid,
    className:
      "bg-slate-500 text-white dark:!bg-slate-500/10 md:dark:!bg-slate-800 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  Pemrograman: {
    icon: Code2,
    className:
      "bg-cyan-500 text-white dark:!bg-cyan-500/10 md:dark:!bg-cyan-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
  Security: {
    icon: Shield,
    className:
      "bg-rose-500 text-white dark:!bg-rose-500/10 md:dark:!bg-rose-950 md:dark:!text-slate-300 dark:!text-slate-300",
  },
};

const CATEGORY_STYLES_NON_SOLID = {
  Topology: {
    icon: Network,
    className: "bg-blue-500 text-white dark:bg-blue-500/10 dark:text-slate-300",
  },
  Maintenance: {
    icon: Wrench,
    className: "bg-amber-500 text-white dark:bg-amber-500/10 dark:text-slate-300",
  },
  Fixing: {
    icon: ShieldAlert,
    className: "bg-red-500 text-white dark:bg-red-500/10 dark:text-slate-300",
  },
  Installation: {
    icon: Boxes,
    className: "bg-purple-500 text-white dark:bg-purple-500/10 dark:text-slate-300",
  },
  Hardware: {
    icon: HardDrive,
    className: "bg-emerald-500 text-white dark:bg-emerald-500/10 dark:text-slate-300",
  },
  Eproc: {
    icon: FileText,
    className: "bg-sky-500 text-white dark:bg-sky-500/10 dark:text-slate-300",
  },
  "E-kantin": {
    icon: Utensils,
    className: "bg-orange-500 text-white dark:bg-orange-500/10 dark:text-slate-300",
  },
  EHRD: {
    icon: Users,
    className: "bg-indigo-500 text-white dark:bg-indigo-500/10 dark:text-slate-300",
  },
  General: {
    icon: LayoutGrid,
    className: "bg-slate-500 text-white dark:bg-slate-500/10 dark:text-slate-300",
  },
  Pemrograman: {
    icon: Code2,
    className: "bg-cyan-500 text-white dark:bg-cyan-500/10 dark:text-slate-300",
  },
  Security: {
    icon: Shield,
    className: "bg-rose-500 text-white dark:bg-rose-500/10 dark:text-slate-300",
  },
};

const CategoryPill = ({ category, border = false, solid = true }) => {
  const styles = solid ? CATEGORY_STYLES : CATEGORY_STYLES_NON_SOLID;
  const style = styles[category] || styles.Topology; // or a safer default
  const Icon = style.icon;

  return (
    <span
      className={`pill rounded-lg gap-1 ${border ? "border border-white/20" : ""} ${style.className}`}
    >
      <Icon size={12} />
      {category}
    </span>
  );
};

export default CategoryPill;

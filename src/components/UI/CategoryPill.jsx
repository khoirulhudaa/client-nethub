import { Network, Wrench, ShieldAlert, HardDrive, Boxes } from "lucide-react";

const CATEGORY_STYLES = {
  Topology: { icon: Network, className: "bg-blue-500 text-white dark:!bg-blue-500/10 md:dark:!bg-blue-950 md:dark:!text-slate-300 dark:!text-slate-300" },
  Maintenance: { icon: Wrench, className: "bg-amber-500 text-white dark:bg-amber-500/10 md:dark:!bg-amber-950 md:dark:!text-slate-300 dark:!text-slate-300" },
  Installation: { icon: Boxes, className: "bg-purple-500 text-white dark:bg-purple-500/10 md:dark:!bg-purple-950 md:dark:!text-slate-300 dark:!text-slate-300" },
  Hardware: { icon: HardDrive, className: "bg-emerald-500 text-white dark:bg-emerald-500/10 md:dark:!bg-emerald-950 md:dark:!text-slate-300 dark:!text-slate-300" },
};

const CATEGORY_STYLES_NON_SOLID = {
  Topology: { icon: Network, className: "bg-blue-500 text-white dark:bg-blue-500/10 dark:text-slate-300" },
  Maintenance: { icon: Wrench, className: "bg-amber-500 text-white dark:bg-amber-500/10 dark:text-slate-300" },
  Fixing: { icon: ShieldAlert, className: "bg-red-500 text-white dark:bg-red-500/10 dark:text-slate-300" },
  Installation: { icon: Boxes, className: "bg-purple-500 text-white dark:bg-purple-500/10 dark:text-slate-300" },
  Hardware: { icon: HardDrive, className: "bg-emerald-500 text-white dark:bg-emerald-500/10 dark:text-slate-300" },
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

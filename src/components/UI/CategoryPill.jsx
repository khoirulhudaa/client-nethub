import { Network, Wrench, ShieldAlert, HardDrive, Boxes } from "lucide-react";

const CATEGORY_STYLES = {
  Topology: { icon: Network, className: "bg-blue-500 text-white dark:bg-blue-500/10 dark:text-slate-300" },
  Maintenance: { icon: Wrench, className: "bg-amber-500 text-white dark:bg-amber-500/10 dark:text-slate-300" },
  Fixing: { icon: ShieldAlert, className: "bg-red-500 text-white dark:bg-red-500/10 dark:text-slate-300" },
  Installation: { icon: Boxes, className: "bg-purple-500 text-white dark:bg-purple-500/10 dark:text-slate-300" },
  Hardware: { icon: HardDrive, className: "bg-emerald-500 text-white dark:bg-emerald-500/10 dark:text-slate-300" },
};

const CategoryPill = ({ category, border=false }) => {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Topology;
  const Icon = style.icon;
  return (
    <span className={`pill rounded-lg gap-1 ${border ? 'border border-white/20' : ''} ${style.className}`}>
      <Icon size={12} />
      {category}
    </span>
  );
};

export default CategoryPill;

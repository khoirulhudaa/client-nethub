import { Network, Wrench, ShieldAlert, HardDrive, Boxes } from "lucide-react";

const CATEGORY_STYLES = {
  Topology: { icon: Network, className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  Maintenance: { icon: Wrench, className: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  Fixing: { icon: ShieldAlert, className: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  Installation: { icon: Boxes, className: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
  Hardware: { icon: HardDrive, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
};

const CategoryPill = ({ category }) => {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Topology;
  const Icon = style.icon;
  return (
    <span className={`pill gap-1 ${style.className}`}>
      <Icon size={12} />
      {category}
    </span>
  );
};

export default CategoryPill;

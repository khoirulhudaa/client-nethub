import { Check, Copy, ChevronDown, Network, Hash, Globe, Radio, Shield, Users } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

// --- Helper functions (tetap sama) -------------------------------------------
function ipToInt(ip) {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

function intToIp(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

function cidrToMask(cidr) {
  if (cidr === 0) return 0;
  return (~0 << (32 - cidr)) >>> 0;
}

function isValidIp(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return Number.isInteger(n) && n >= 0 && n <= 255 && String(n) === p.trim();
  });
}

function calcSubnet(ip, cidr) {
  if (!isValidIp(ip) || cidr < 0 || cidr > 32) return null;

  const ipInt = ipToInt(ip);
  const mask = cidrToMask(cidr);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalHosts = cidr === 32 ? 1 : cidr === 31 ? 2 : 2 ** (32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;
  const firstHost = cidr >= 31 ? network : network + 1;
  const lastHost = cidr >= 31 ? broadcast : broadcast - 1;
  const wildcard = ~mask >>> 0;

  return {
    ip,
    cidr,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    netmask: intToIp(mask),
    wildcard: intToIp(wildcard),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts,
    usableHosts,
  };
}

const InfoCard = ({ icon: Icon, label, value, mono = true, accent = false }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`group relative flex flex-col gap-2 rounded-xl border p-4 transition-all hover:shadow-md ${
        accent
          ? "border-accent/30 bg-accent/5 dark:border-accent/20 dark:bg-accent/10"
          : "border-gray-100 bg-white dark:border-white/5 dark:bg-[#0c0c18]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              accent
                ? "bg-accent/15 text-accent"
                : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
            }`}
          >
            <Icon size={14} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={copy}
          className="rounded-md p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-accent dark:hover:bg-white/10"
          aria-label="Copy"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>

      <p
        className={`text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const SubnetCalculator = () => {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);

  const result = useMemo(() => calcSubnet(ip.trim(), Number(cidr)), [ip, cidr]);

  return (
    <div className="mx-auto max-w-full md:border-x border-white dark:border-white/10 px-0 py-0 md:py-6 md:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-accent">
          <span className="text-xs font-semibold uppercase tracking-wider">Tools</span>
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
          Subnet Calculator
        </h1>
      </div>

      {/* Main Card — tetap bg-slate-200 / dark:bg-white/[0.03] */}
      <div className="surface-card rounded-2xl border-none bg-slate-200 p-4 md:p-5 dark:border-white/10 dark:bg-white/5">
        {/* Input */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Network size={13} />
              IP Address
            </label>
            <input
              className="input-field w-full rounded-xl border-0 bg-white font-mono text-sm shadow-sm ring-1 ring-gray-200/70 transition focus:ring-2 focus:ring-accent/40 dark:!bg-[#0c0c18] dark:ring-white/10"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.0"
              spellCheck={false}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Hash size={13} />
              CIDR / Prefix
            </label>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <select
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="input-field w-full appearance-none rounded-xl border-0 bg-white pr-9 font-mono text-sm shadow-sm ring-1 ring-gray-200/70 transition focus:ring-2 focus:ring-accent/40 dark:!bg-[#0c0c18] dark:ring-white/10"
                >
                  {Array.from({ length: 33 }, (_, i) => (
                    <option key={i} value={i} className="text-black">
                      /{i}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              <input
                type="number"
                min={0}
                max={32}
                value={cidr}
                onChange={(e) =>
                  setCidr(Math.min(32, Math.max(0, Number(e.target.value) || 0)))
                }
                className="input-field w-[72px] rounded-xl border-0 bg-white text-center font-mono text-sm shadow-sm ring-1 ring-gray-200/70 transition focus:ring-2 focus:ring-accent/40 dark:!bg-[#0c0c18] dark:ring-white/10"
              />
            </div>
          </div>
        </div>

        {/* Results — Card Grid (bukan list) */}
        {!result ? (
          <div className="rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            Invalid IP address
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Network (accent) */}
            <InfoCard
              icon={Globe}
              label="Network Address"
              value={`${result.network}/${result.cidr}`}
              accent
            />

            {/* Broadcast */}
            <InfoCard icon={Radio} label="Broadcast Address" value={result.broadcast} />

            {/* Subnet Mask */}
            <InfoCard icon={Shield} label="Subnet Mask" value={result.netmask} />

            {/* Wildcard */}
            <InfoCard icon={Shield} label="Wildcard Mask" value={result.wildcard} />

            {/* First Host */}
            <InfoCard icon={Users} label="First Host" value={result.firstHost} />

            {/* Last Host */}
            <InfoCard icon={Users} label="Last Host" value={result.lastHost} />

            {/* Total Hosts */}
            <InfoCard
              icon={Users}
              label="Total Hosts"
              value={result.totalHosts.toLocaleString()}
              mono={false}
            />

            {/* Usable Hosts */}
            <InfoCard
              icon={Users}
              label="Usable Hosts"
              value={result.usableHosts.toLocaleString()}
              mono={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubnetCalculator;
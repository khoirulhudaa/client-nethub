import { Check, Copy, ChevronDown } from "lucide-react";
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
    binaryMask: mask.toString(2).padStart(32, "0").match(/.{8}/g).join("."),
  };
}

const ResultRow = ({ label, value, mono = true }) => {
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
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 last:border-0 dark:border-white/5">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-accent dark:hover:bg-white/10"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};

const SubnetCalculator = () => {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);

  const result = useMemo(() => calcSubnet(ip.trim(), Number(cidr)), [ip, cidr]);

  return (
    <div className="mx-auto max-w-7xl px-0 py-0 md:py-6 md:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-accent">
          <span className="text-xs font-semibold uppercase tracking-wide">Tools</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Subnet Calculator</h1>
      </div>

      <div className="surface-card rounded-2xl border border-gray-200 bg-white p-3 md:p-5 dark:border-white/10 dark:bg-white/[0.03]">
        {/* Input */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* IP Address */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
              IP Address
            </label>
            <input
              className="input-field w-full font-mono"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.0"
            />
          </div>

          {/* CIDR / Prefix */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
              CIDR / Prefix
            </label>

            <div className="flex items-center gap-2">
              {/* Select dropdown */}
              <div className="relative flex-1">
                <select
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="input-field w-full appearance-none pr-9 font-mono"
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

              {/* Manual number input */}
              <input
                type="number"
                min={0}
                max={32}
                value={cidr}
                onChange={(e) =>
                  setCidr(Math.min(32, Math.max(0, Number(e.target.value) || 0)))
                }
                className="input-field w-20 text-center font-mono"
              />
            </div>

          </div>
        </div>

        {/* Result */}
        {!result ? (
          <p className="text-sm text-red-500">Invalid IP address</p>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2 dark:border-white/5 dark:bg-white/[0.02]">
            <ResultRow label="Network Address" value={`${result.network}/${result.cidr}`} />
            <ResultRow label="Broadcast Address" value={result.broadcast} />
            <ResultRow label="Subnet Mask" value={result.netmask} />
            <ResultRow label="Wildcard Mask" value={result.wildcard} />
            <ResultRow label="First Host" value={result.firstHost} />
            <ResultRow label="Last Host" value={result.lastHost} />
            <ResultRow label="Total Hosts" value={result.totalHosts} mono={false} />
            <ResultRow label="Usable Hosts" value={result.usableHosts} mono={false} />
            {/* <ResultRow label="Binary Mask" value={result.binaryMask} /> */}
          </div>
        )}
      </div>

      {/* Quick examples */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { ip: "192.168.1.0", cidr: 24 },
          { ip: "10.0.0.0", cidr: 8 },
          { ip: "172.16.0.0", cidr: 12 },
          { ip: "192.168.0.0", cidr: 16 },
        ].map((ex) => (
          <button
            key={`${ex.ip}/${ex.cidr}`}
            type="button"
            onClick={() => {
              setIp(ex.ip);
              setCidr(ex.cidr);
            }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-mono text-gray-600 transition hover:border-accent hover:text-accent dark:border-white/10 dark:text-gray-300"
          >
            {ex.ip}/{ex.cidr}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubnetCalculator;
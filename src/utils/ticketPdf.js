const STATUS_RGB = {
  Baru: [37, 99, 235],
  "Sedang Dikerjakan": [217, 119, 6],
  "Menunggu Info": [147, 51, 234],
  Selesai: [5, 150, 105],
  Ditutup: [107, 114, 128],
};

// Standard PDF fonts only support Latin characters, so anything else becomes "?"
const clean = (s) =>
  String(s ?? "").replace(/[^\x09\x0A\x20-\x7E\u00A0-\u00FF]/g, "?");

// Same algorithm as the on-screen <Barcode />, so the barcode matches the website
const barcodeBars = (value = "") => {
  const out = [];
  for (let i = 0; i < 70; i++) {
    const c = value.charCodeAt(i % Math.max(value.length, 1)) || 7;
    out.push({ w: 1 + ((c + i) % 3), gap: 1 + ((c * (i + 1)) % 2) });
  }
  return out;
};

// Cuts a single line of text so it never overflows its column
const fit = (doc, text, maxW) => {
  let t = clean(text) || "-";
  if (doc.getTextWidth(t) <= maxW) return t;
  while (t.length > 1 && doc.getTextWidth(`${t}...`) > maxW) t = t.slice(0, -1);
  return `${t}...`;
};

const buildDoc = async (ticket, { statusLabel = {}, locale = "en-US", siteUrl = "" } = {}) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" }); // 210 x 148

  const id = String(ticket._id || "");
  const shortCode = id.slice(-8).toUpperCase();

  // Ticket geometry
  const X = 10;
  const Y = 10;
  const W = 190;
  const H = 128;
  const STUB = 55;
  const DIV = X + W - STUB; // x of the tear line
  const BX = X + 8; // body content left
  const BR = DIV - 8; // body content right
  const BW = BR - BX;
  const SX = DIV + 7; // stub content left
  const SW = STUB - 14;

  const GRAY = [110, 118, 130];
  const DARK = [20, 24, 33];
  const LINE = [160, 165, 175];

  const label = (text, x, y, align = "left") => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(clean(text), x, y, { align });
  };

  // ---- Paper + band ----
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(X, Y, W, H, 3, 3, "F");

  doc.setFillColor(232, 240, 254);
  doc.roundedRect(X, Y, DIV - X, 12, 3, 3, "F");
  doc.rect(X, Y + 6, DIV - X, 6, "F");
  doc.rect(DIV - 4, Y, 4, 6, "F");

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("IT Helpdesk Ticket", BX, Y + 7.6);
  doc.text(`#${shortCode}`, BR, Y + 7.6, { align: "right" });

  // ---- Title + category ----
  let y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(clean(ticket.title) || "-", BW).slice(0, 2);
  doc.text(titleLines, BX, y);
  y += (titleLines.length - 1) * 6.2 + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(fit(doc, ticket.category, BW), BX, y);

  // ---- Route: reporter -> location ----
  y += 9;
  label("Reporter", BX, y);
  label("Location", BR, y, "right");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  const reporter = fit(doc, ticket.requesterName || ticket.createdBy?.name, 45);
  const location = fit(doc, ticket.location, 45);
  doc.text(reporter, BX, y + 5);
  doc.text(location, BR, y + 5, { align: "right" });

  const x1 = BX + doc.getTextWidth(reporter) + 4;
  const x2 = BR - doc.getTextWidth(location) - 4;
  const ry = y + 3.8;
  if (x2 - x1 > 20) {
    const mid = (x1 + x2) / 2;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([0.8, 1.2], 0);
    doc.line(x1, ry, mid - 6, ry);
    doc.line(mid + 6, ry, x2, ry);
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(...GRAY);
    doc.roundedRect(mid - 3, ry - 2.6, 6, 4, 0.6, 0.6, "S"); // monitor icon
    doc.line(mid - 1.5, ry + 2.4, mid + 1.5, ry + 2.4);
  }

  // ---- Tear line (horizontal) ----
  y += 11;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(X, y, DIV, y);
  doc.setLineDashPattern([], 0);

  // ---- Details grid (3 columns) ----
  const created = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
    : "";

  const items = [
    ["PC owner", ticket.pcOwner],
    ["Priority", ticket.priority],
    ["Since when", ticket.sinceWhenLabel || ticket.sinceWhen],
    ["Computer name / IP", ticket.computerName],
    ["Created", created],
    ["AnyDesk number", ticket.anydeskNumber],
  ].filter(([, v]) => v);

  const colW = BW / 3;
  y += 6;
  items.forEach(([name, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = BX + col * colW;
    const cy = y + row * 11;
    label(name, cx, cy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(fit(doc, value, colW - 3), cx, cy + 4.6);
  });

  // ---- Description ----
  y += Math.ceil(items.length / 3) * 11 + 3;
  label("Problem description", BX, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 66, 78);
  const maxLines = Math.max(1, Math.floor((Y + H - 8 - y) / 4.4));
  let lines = doc.splitTextToSize(clean(ticket.description) || "-", BW);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, "")}...`;
  }
  doc.text(lines, BX, y, { lineHeightFactor: 1.35 });

  // ---- Stub ----
  label("Status", SX, Y + 18);
  const rgb = STATUS_RGB[ticket.status] || STATUS_RGB.Ditutup;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...rgb);
  doc.text(fit(doc, statusLabel[ticket.status] || ticket.status, SW), SX, Y + 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(
    doc.splitTextToSize("Keep this code to track the progress of your ticket.", SW),
    SX,
    Y + H - 40
  );

  // Barcode
  const bars = barcodeBars(id);
  const total = bars.reduce((s, b) => s + b.w + b.gap, 0) - bars[bars.length - 1].gap;
  const unit = SW / total;
  const by = Y + H - 32;
  doc.setFillColor(...DARK);
  let bx = SX;
  bars.forEach((b) => {
    doc.rect(bx, by, b.w * unit, 14, "F");
    bx += (b.w + b.gap) * unit;
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...DARK);
  doc.text(id, SX, by + 19);

  // ---- Outline, tear line (vertical) and notches ----
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.roundedRect(X, Y, W, H, 3, 3, "S");

  doc.setLineDashPattern([2, 2], 0);
  doc.line(DIV, Y + 4, DIV, Y + H - 4);
  doc.setLineDashPattern([], 0);

  doc.setFillColor(255, 255, 255);
  doc.circle(DIV, Y, 4, "FD");
  doc.circle(DIV, Y + H, 4, "FD");

  // ---- Footer ----
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const site = siteUrl ? ` - ${siteUrl.replace(/^https?:\/\//, "")}` : "";
  doc.text(`TEXNet Helpdesk${site}`, 105, 144, { align: "center" });

  return { doc, shortCode };
};

export const downloadTicketPdf = async (ticket, options) => {
  const { doc, shortCode } = await buildDoc(ticket, options);
  doc.save(`TEXNet-Ticket-${shortCode}.pdf`);
};

export const printTicketPdf = async (ticket, options) => {
  const { doc } = await buildDoc(ticket, options);
  doc.autoPrint();
  const url = doc.output("bloburl");

  // iOS Safari can't print from a hidden iframe, so open the PDF in a new tab instead
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) {
    window.open(url, "_blank");
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      window.open(url, "_blank"); // fallback: the PDF viewer has its own print button
    }
  };
  document.body.appendChild(iframe);

  setTimeout(() => {
    URL.revokeObjectURL(url);
    iframe.remove();
  }, 5 * 60 * 1000);
};
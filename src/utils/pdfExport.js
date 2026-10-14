// Export guide ke PDF. Dipakai oleh PostDetail dan PostCard.

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildPdfHtml = (post, contentHtml, url) => {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const codeBlocks = (post.codeBlocks || [])
    .map(
      (b) => `
      <div class="avoid">
        <div class="label">${escapeHtml(b.language || "code")}${b.title ? " / " + escapeHtml(b.title) : ""}</div>
        <pre>${escapeHtml(b.code)}</pre>
      </div>`
    )
    .join("");

  const steps = (post.steps || [])
    .map(
      (s, i) => `
      <div class="step avoid">
        <div class="step-title">Step ${String(i + 1).padStart(2, "0")}${s.title ? " — " + escapeHtml(s.title) : ""}</div>
        ${s.image ? `<img src="${s.image}" class="step-img" data-maxh="260" crossorigin="anonymous" />` : ""}
        ${s.description ? `<p class="pre-line">${escapeHtml(s.description)}</p>` : ""}
      </div>`
    )
    .join("");

  const tables = (post.customTables || [])
    .map(
      (t) => `
      <div class="avoid">
        ${t.title ? `<h4>${escapeHtml(t.title)}</h4>` : ""}
        <table>
          ${(t.data || [])
            .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c || "—")}</td>`).join("")}</tr>`)
            .join("")}
        </table>
      </div>`
    )
    .join("");

  const refs = (post.referencesImages || [])
    .map(
      (img) => `
      <div class="ref avoid">
        <img src="${img.url}" data-maxh="240" crossorigin="anonymous" />
        ${img.name ? `<span>${escapeHtml(img.name)}</span>` : ""}
      </div>`
    )
    .join("");

  return `
  <style>
    #pdf-root { width: 794px; padding: 40px 44px; background: #fff; color: #111827;
      font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.6; box-sizing: border-box; }
    #pdf-root * { box-sizing: border-box; }
    #pdf-root h1 { font-size: 26px; margin: 0 0 6px; line-height: 1.25; }
    #pdf-root h2 { font-size: 13px; letter-spacing: .12em; text-transform: uppercase;
      border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin: 26px 0 12px; }
    #pdf-root h3, #pdf-root h4 { margin: 12px 0 6px; }
    #pdf-root .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
    #pdf-root .cover { display: block; margin: 0 0 8px; border-radius: 8px; }
    #pdf-root .content img { display: block; margin: 8px 0; }
    #pdf-root table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    #pdf-root td, #pdf-root th { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; vertical-align: top; }
    #pdf-root pre { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px;
      font-family: Consolas, "Courier New", monospace; font-size: 11.5px; white-space: pre-wrap; word-break: break-word; margin: 0 0 12px; }
    #pdf-root .content pre { margin: 8px 0; }
    #pdf-root .label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
    #pdf-root .step { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    #pdf-root .step-title { font-weight: bold; margin-bottom: 6px; }
    #pdf-root .step-img { display: block; margin: 0 0 6px; border-radius: 6px; }
    #pdf-root .pre-line { white-space: pre-line; margin: 0; }
    #pdf-root .ref { display: inline-block; width: 48%; margin: 0 1% 12px 0; vertical-align: top; text-align: left; }
    #pdf-root .ref img { display: block; margin: 0; border-radius: 6px; }
    #pdf-root .ref span { display: block; font-size: 11px; color: #6b7280; margin-top: 2px; }
    #pdf-root .tags { margin-top: 20px; color: #2563eb; font-size: 12px; }
    #pdf-root .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; }
  </style>

  <div id="pdf-root">
    <h1>${escapeHtml(post.title)}</h1>
    <div class="meta">
      ${post.author?.name ? `Oleh ${escapeHtml(post.author.name)}` : ""}
      ${post.category ? ` · ${escapeHtml(post.category)}` : ""}
      ${date ? ` · ${date}` : ""}
    </div>

    ${post.coverImage ? `<img class="cover" data-maxh="320" crossorigin="anonymous" src="${post.coverImage}" />` : ""}

    <h2>Description</h2>
    <div class="content">${contentHtml || ""}</div>

    ${codeBlocks ? `<h2>Commands &amp; Code</h2>${codeBlocks}` : ""}
    ${steps ? `<h2>Step-by-step Guide</h2>${steps}` : ""}
    ${tables ? `<h2>Tables</h2>${tables}` : ""}
    ${refs ? `<h2>Reference Images</h2>${refs}` : ""}

    ${
      post.tags?.length
        ? `<div class="tags">${post.tags.map((t) => "#" + escapeHtml(t)).join("  ")}</div>`
        : ""
    }
    <div class="footer">Sumber: ${escapeHtml(url)}</div>
  </div>`;
};

const slugifyName = (title) =>
  (title || "guide")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "guide";

// Guide yang isinya upload PDF: unduh file aslinya (data URL base64)
const downloadUploadedPdf = (pdfFile) => {
  const b64 = pdfFile.url.split(",")[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = pdfFile.name || "guide.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

const waitForImage = (img) =>
  new Promise((resolve) => {
    if (img.complete && img.naturalWidth) return resolve();
    img.onload = img.onerror = () => resolve();
  });

// Beri tiap gambar ukuran piksel eksplisit dengan rasio asli (tidak gepeng)
const fitImages = async (root) => {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(imgs.map(waitForImage));

  imgs.forEach((img) => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) {
      img.remove(); // gagal dimuat, buang agar tidak jadi kotak kosong
      return;
    }

    const maxW = img.parentElement?.clientWidth || 700;
    const maxH = Number(img.dataset.maxh) || 700;
    const scale = Math.min(1, maxW / nw, maxH / nh);

    img.removeAttribute("width");
    img.removeAttribute("height");
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";
    img.style.width = `${Math.round(nw * scale)}px`;
    img.style.height = `${Math.round(nh * scale)}px`;
  });
};

/**
 * Unduh guide sebagai PDF.
 * @param {object} post
 * @param {{ contentHtml?: string }} [opts]  contentHtml: HTML deskripsi kustom (mis. dengan stabilo)
 * Melempar error kalau gagal, supaya pemanggil bisa menampilkan toast.
 */
export const downloadPostPdf = async (post, { contentHtml } = {}) => {
  if (post.pdfFile?.url) {
    downloadUploadedPdf(post.pdfFile);
    return;
  }

  const html2pdf = (await import("html2pdf.js")).default;
  let host;

  try {
    host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;";
    host.innerHTML = buildPdfHtml(
      post,
      contentHtml ?? post.content,
      `${window.location.origin}/posts/${post.slug}`
    );
    document.body.appendChild(host);

    await fitImages(host);

    await html2pdf()
      .set({
        margin: [10, 0, 10, 0],
        filename: `${slugifyName(post.title)}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".avoid", "img", "pre", "tr", "h2"] },
      })
      .from(host.querySelector("#pdf-root"))
      .save();
  } finally {
    host?.remove();
  }
};

// --- Ticket PDF --------------------------------------------------------------
const buildTicketHtml = (ticket, { statusLabel = {}, includeInternal = false } = {}) => {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const shortCode = String(ticket._id).slice(-8).toUpperCase();
  const reporter = ticket.requesterName || ticket.createdBy?.name || "-";
  const status = statusLabel[ticket.status] || ticket.status || "-";

  const field = (label, value) => `
    <div class="field avoid">
      <div class="f-label">${escapeHtml(label)}</div>
      <div class="f-value">${escapeHtml(value || "-")}</div>
    </div>`;

  const comments = (ticket.comments || [])
    .filter((c) => includeInternal || !c.isInternal)
    .map(
      (c) => `
      <div class="comment avoid">
        <div class="c-head">
          <b>${escapeHtml(c.user?.name || "User")}</b>
          <span>${escapeHtml(fmt(c.createdAt))}</span>
          ${c.isInternal ? `<em>Internal</em>` : ""}
        </div>
        <div class="c-body">${escapeHtml(c.content)}</div>
      </div>`
    )
    .join("");

  return `
  <style>
    #pdf-root { width: 794px; padding: 40px 44px; background: #fff; color: #111827;
      font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.6; box-sizing: border-box; }
    #pdf-root * { box-sizing: border-box; }
    #pdf-root .kicker { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
    #pdf-root h1 { font-size: 24px; margin: 0 0 4px; line-height: 1.25; }
    #pdf-root .code { font-family: Consolas, "Courier New", monospace; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
    #pdf-root h1 { font-size: 24px; margin: 0 0 4px; }
    #pdf-root h2 { font-size: 13px; letter-spacing: .12em; text-transform: uppercase;
      border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin: 24px 0 12px; }
    #pdf-root .grid { display: flex; flex-wrap: wrap; }
    #pdf-root .field { width: 33.33%; padding: 0 12px 12px 0; vertical-align: top; }
    #pdf-root .f-label { font-size: 11px; font-weight: bold; color: #6b7280; }
    #pdf-root .f-value { font-size: 13px; word-break: break-word; }
    #pdf-root .desc { white-space: pre-wrap; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; }
    #pdf-root .comment { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
    #pdf-root .c-head { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    #pdf-root .c-head b { color: #111827; margin-right: 8px; }
    #pdf-root .c-head em { margin-left: 8px; color: #b45309; font-style: normal; font-size: 11px; }
    #pdf-root .c-body { white-space: pre-wrap; }
    #pdf-root .footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; }
  </style>

  <div id="pdf-root">
    <div class="kicker">IT Helpdesk Ticket</div>
    <h1>${escapeHtml(ticket.category || "Ticket")}</h1>
    <div class="code">#${escapeHtml(shortCode)}</div>

    <h2>Ringkasan</h2>
    <div class="grid">
      ${field("Status", status)}
      ${field("Priority", ticket.priority)}
      ${field("Reported at", fmt(ticket.createdAt))}
      ${field("Reporter", reporter)}
      ${field("Location", ticket.location)}
      ${field("Since when", ticket.sinceWhen)}
      ${field("PC owner", ticket.pcOwner)}
      ${field("Computer name / IP", ticket.computerName)}
      ${ticket.anydeskNumber ? field("AnyDesk number", ticket.anydeskNumber) : ""}
      ${field("Reported by", ticket.createdBy?.name)}
    </div>

    <h2>Problem description</h2>
    <div class="desc">${escapeHtml(ticket.description || "-")}</div>

    ${comments ? `<h2>Discussion</h2>${comments}` : ""}

    <div class="footer">Ticket ID: ${escapeHtml(String(ticket._id))} · Dicetak ${escapeHtml(fmt(new Date()))}</div>
  </div>`;
};

/**
 * Unduh tiket sebagai PDF.
 * @param {object} ticket
 * @param {{ statusLabel?: object, includeInternal?: boolean }} [opts]
 */
export const downloadTicketPdf = async (ticket, opts = {}) => {
  const html2pdf = (await import("html2pdf.js")).default;
  let host;

  try {
    host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;";
    host.innerHTML = buildTicketHtml(ticket, opts);
    document.body.appendChild(host);

    const code = String(ticket._id).slice(-8).toLowerCase();

    await html2pdf()
      .set({
        margin: [10, 0, 10, 0],
        filename: `ticket-${slugifyName(ticket.category)}-${code}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".avoid", "h2"] },
      })
      .from(host.querySelector("#pdf-root"))
      .save();
  } finally {
    host?.remove();
  }
};
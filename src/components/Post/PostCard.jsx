import { BookLock, BookPlus, Check, ChevronRight, Download, Link2, Link2Icon, Loader2, Pin, PinOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { downloadPostPdf } from "../../utils/pdfExport.js";
import CategoryPill from "../UI/CategoryPill.jsx";

const useIsMobile = (query = "(max-width: 767px)") => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return isMobile;
};

const PostCard = ({
  post,
  roundedNormal = false,
  featured = false,
  onPinChange,
  hideImage = false,
}) => {
 const { user } = useAuth();
  
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const isMobile = useIsMobile();
  const Wrapper = isMobile ? Link : "div";
  const wrapperProps = isMobile ? { to: `/posts/${post.slug}` } : {};

  const isGuest = user?.isGuest || user?.role === "guest";
  const canPin = !!user && !isGuest;

  const [pinned, setPinned] = useState(!!post.isPinned);
  const [pinning, setPinning] = useState(false);

  const postUrl = `${window.location.origin}/posts/${post?.slug}?ref=share`;

  const createShareText = () => {
    const title = post?.title || "Guide";
    const category = post?.category || "";
    const author = post?.author?.name || "";
    const tags = post?.tags?.length
      ? post.tags.map((t) => `#${t}`).join(" ")
      : "";

    let excerpt = "";
    if (post?.content) {
      const plain = post.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      excerpt = plain.length > 140 ? plain.slice(0, 140).trim() + "..." : plain;
    } else if (post?.excerpt) {
      excerpt = post.excerpt;
    }

    let text = `*${title}*\n`;
    if (category) text += `Kategori: ${category}\n`;
    if (author) text += `Oleh: ${author}\n`;
    if (tags) text += `\n${tags}\n`;
    text += `\n${postUrl}`;

    return text;
  };

  const shareText = encodeURIComponent(createShareText());

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${shareText}`,
  };

  const copyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link berhasil disalin");

      setTimeout(() => {
        setCopied(false);
        setShowShare(false);
      }, 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const requestPin = async (replace = false) => {
    setPinning(true);
    try {
      const { data } = await api.patch(`/posts/${post._id}/pin`, { replace });
      setPinned(data.isPinned);
      onPinChange?.(post, data.isPinned, data.unpinnedIds || []);
      toast.success(data.isPinned ? "Guide dipin" : "Guide di-unpin");
    } catch (err) {
      if (err?.response?.status === 409 && err.response.data?.code === "PIN_LIMIT") {
        confirmReplace(err.response.data.oldest);
      } else {
        toast.error(err?.response?.data?.message || "Gagal mengubah status pin");
      }
    } finally {
      setPinning(false);
    }
  };

  const renderHighlightedContent = (html) => {
    if (!html) return "";

    let result = html;

    highlights.forEach(({ text, color, occurrence = 0 }) => {
      // Pisah tag dan teks, indeks ganjil = tag (jangan disentuh)
      const parts = result.split(/(<[^>]+>)/);
      let count = 0;

      for (let p = 0; p < parts.length; p += 2) {
        const seg = parts[p];
        if (!seg) continue;

        let out = "";
        let pos = 0;
        let idx;
        while ((idx = seg.indexOf(text, pos)) !== -1) {
          out += seg.slice(pos, idx);
          if (count === occurrence) {
            out += `<mark style="background-color: ${color}; padding: 1px 2px; border-radius: 3px;">${text}</mark>`;
          } else {
            out += text;
          }
          count++;
          pos = idx + text.length;
        }
        parts[p] = out + seg.slice(pos);
      }

      result = parts.join("");
    });

    return result;
  };

  const handleDownloadPdf = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!post || pdfLoading) return;

    setPdfLoading(true);
    const toastId = toast.loading("Menyiapkan PDF...");
    try {
      await downloadPostPdf(post); // tanpa stabilo, pakai post.content apa adanya
      toast.success("PDF berhasil diunduh", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat PDF", { id: toastId });
    } finally {
      setPdfLoading(false);
    }
  };

  const confirmReplace = (oldest) => {
    toast(
      (t) => (
        <div className="flex w-full flex-col rounded-2xl gap-3 text-sm">
          <div>
            <p className="font-semibold">Pinned sudah penuh (maks. 4)</p>
            <p className="mt-1 text-slate-300 break-words">
              Lepas pin “{oldest.title}” dan ganti dengan “{post.title}”?
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                requestPin(true);
              }}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500"
            >
              Lanjutkan
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-xs font-medium text-white hover:bg-slate-500"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        icon: "📌",
        style: {
          maxWidth: "none",
          width: "min(480px, 92vw)",
          padding: "16px 18px",
          marginRight: "30px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      }
    );
  };

  const handlePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPin) return toast.error("Login dulu untuk pin guide");
    if (pinning) return;
    requestPin(false);
  };

const handleAddToReadingList = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (isGuest) {
    toast.error("Login dulu untuk menambahkan ke Reading List");
    return;
  }

  // Sudah ditambahkan → tanya dulu mau dihapus atau tidak
  if (added) {
    setShowRemoveModal(true);
    return;
  }

  try {
    setAdding(true);
    await api.post("/auth/me/reading-list", { postId: post._id });
    setAdded(true);
  } catch (err) {
    if (err.response?.status === 400) {
      setAdded(true);
    } else {
      console.error("Gagal menambahkan ke Reading List:", err);
      toast.error("Gagal menambahkan ke Reading List");
    }
  } finally {
    setAdding(false);
  }
};

const handleRemoveFromReadingList = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    setRemoving(true);
    await api.delete(`/auth/me/reading-list/${post._id}`);
    setAdded(false);
    setShowRemoveModal(false);
    toast.success("Dihapus dari Reading List");
  } catch (err) {
    console.error("Gagal menghapus dari Reading List:", err);
    toast.error("Gagal menghapus dari Reading List");
  } finally {
    setRemoving(false);
  }
};

  // Category + Add button (dipakai di 2 tempat berbeda tergantung hideImage)
  const CategoryAndAdd = (
    <div className="group-hover:md:hidden flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="md:flex hidden">
          <CategoryPill category={post.category} />
        </div>
        {!isGuest && (
          <button
            onClick={handleAddToReadingList}
            disabled={adding || removing}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
              added
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-600 dark:text-white"
                : "bg-gray-100 text-gray-600 hover:bg-accent hover:text-white dark:bg-white dark:text-slate-900 dark:hover:text-white dark:hover:bg-accent"
            }`}
            title={added ? "Klik untuk hapus dari Reading List" : "Tambah ke Reading List"}
          >
            {adding ? (
              <Loader2 size={11} className="animate-spin" />
            ) : added ? (
              <>
                <Check size={11} />
                Added
              </>
            ) : (
              <>
                <BookPlus size={11} />
                Add
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

return (
    <Wrapper
      {...wrapperProps}
      className={`
        block
        flex-1
        min-w-0
        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        hover:flex-[2.2]
        ${isMobile ? 'active:scale-[0.99]' : ''}
      `}
    >
      <div
        className={`group hover:dark:!border-blue-300/50 relative p-3.5 bg-slate-300 rounded-[24px] dark:!bg-[#0c0c18] border dark:!border-white/20 flex flex-col overflow-hidden ${
          hideImage
            ? "h-[130px]"
            : featured
              ? "h-full"
              : "h-auto md:h-[300px]"
        }`}
      >
        {/* Cover image — hanya tampil di md ke atas & saat !hideImage */}
        {!hideImage && (
          <div
            className={`relative md:mb-0 mb-3 flex md:flex bg-white/30 dark:bg-slate-900/40 overflow-hidden ${
              featured
                ? "h-56"
                : `${roundedNormal ? "rounded-[16px]" : "rounded-[14px]"} h-[100%]`
            }`}
          >
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="!h-[200px] md:mb-0 md:!h-full w-full brightness-[80%] object-cover border-none transition-transform ease-fluid scale-[1.03] group-hover:scale-[1.07]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/10" />
            )}
          </div>
        )}

        <div
          className={`${
            hideImage
              ? "relative flex flex-1 flex-col gap-3 pt-1"
              : `relative md:absolute md:bottom-0 pt-1 md:pt-6 left-0 w-full 
                md:group-hover:h-[100%] ease-out animation-height duration-500 
                h-auto md:h-[35%] z-[33] flex flex-1 flex-col gap-3 md:p-3.5 pb-1 md:py-4
                bg-transparent md:bg-black/30 dark:md:!bg-black/40 md:backdrop-blur-lg
                border-white/20 dark:border-white/10
                shadow-none md:shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
                transition-all md:group-hover:bg-black/40 md:group-hover:duration-700 md:group-hover:ease-out`
          }`}
        >
        <div
            className={`${
              hideImage
                ? "group-hover:md:hidden"
                : "md:hidden" // mobile only saat ada cover
            } flex items-center justify-between gap-2`}
          >
            {CategoryAndAdd}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold text-slate-900 dark:text-white md:text-white bg-transparent md:bg-blue-900/90 truncate w-max max-w-[90%] leading-snug tracking-tight ${
              featured ? "text-xl" : "text-base"
            }`}
          >
            {post.title}
          </h3>

          {/* Tags + Add (desktop, hideImage=false) */}
          <div
            className={`${
              hideImage ? "md:group-hover:hidden" : ""
            } flex items-center gap-1.5 min-w-0 overflow-hidden`}
          >
            <div className={`relative z-20 ${!pinned ? 'md:flex hidden' : 'hidden'}`}>
              <CategoryPill category={post.category} />
            </div>

            {post.tags?.length > 0
              ? post.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`shrink-0 text-xs font-medium !text-slate-600 dark:text-gray-200 md:text-gray-200 !bg-white dark:bg-white/10 md:bg-white/10 whitespace-nowrap ${
                      hideImage
                        ? "px-2 py-0.5 rounded-md"
                        : "px-2 py-1 rounded-lg"
                    }`}
                  >
                    #{tag}
                  </span>
                ))
              : null}
          </div>

          {/* Overlay khusus pinned card */}
          {hideImage && (
            <div
              className="
                absolute inset-0 z-20
                bg-black/0
                transition-colors ease-out
                pointer-events-none
                rounded-2xl
              "
            />
          )}

          {/* Action buttons (Share / Pin / Read) — hanya muncul di desktop saat hover */}
          <div
            className={`
              absolute ${hideImage ? "bottom-[4%]" : "bottom-[5.1%]"} left-[2%]
              ${hideImage ? "!left-[0%]" : ""}
              hidden md:grid grid-flow-col items-center justify-center
              transition-opacity ease-in-out
              opacity-0 group-hover:opacity-100
              z-30
              ${featured ? "mt-3" : "mt-2"}
            `}
          >
            <div className="relative w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowShare((v) => !v);
                }}
                className={`justify-center w-full flex mt-auto hover:brightness-75 h-max gap-x-2 hover:gap-x-5 pl-2 active:scale-[0.98] items-center px-2 py-1 rounded-tl-2xl rounded-bl-2xl overflow-hidden border dark:!border-white bg-white text-sm font-medium text-slate-950 transition-all ease-in-out hover:bg-accent-dark ${
                  featured ? "mt-3" : "mt-2"
                }`}
              >
                {/* <p>Share</p> */}
                <div className="rounded-full active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[32px] w-[30px]">
                  <Link2Icon size={19} className="relative rotate-45" />
                </div>
              </button>

              {showShare && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowShare(false);
                    }}
                  />

                  <div className={`absolute bottom-full left-[105%] ${pinned ? 'md:left-[217%]' : 'md:left-[217%]'} -translate-x-1/2 mb-3 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/15 dark:bg-gray-900`}>
                    {
                      !pinned && (
                        <button
                          onClick={copyLink}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                            copied
                              ? "bg-emerald-500 text-white"
                              : "text-gray-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check size={16} />
                              Disalin!
                            </>
                          ) : (
                            <>
                              <Link2 size={16} />
                              Salin Link
                            </>
                          )}
                        </button>
                      )
                    }

                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShare(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-slate-800"
                    >
                      <span className="flex h-4 w-4 items-center justify-center text-[13px] font-bold text-green-600">
                        WA
                      </span>
                      WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>

            {canPin && (
              <button
                type="button"
                onClick={handlePin}
                disabled={pinning}
                className="flex h-max justify-center w-full items-center gap-x-2 bg-white border px-2 py-1 text-sm font-medium text-slate-950 transition-all ease-in-out hover:gap-x-5 hover:brightness-75 active:scale-[0.98]"
              >
                <div className="active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[32px] w-[30px]">
                  {pinning ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : pinned ? (
                    <PinOffIcon size={18} className="fill-white" />
                  ) : (
                    <Pin size={18} />
                  )}
                </div>
              </button>
            )}
            <button
              type="button"
              onClick={handleAddToReadingList}
              disabled={adding || added}
              className="flex h-max justify-center w-full items-center gap-x-2 bg-white border px-2 py-1 text-sm font-medium text-slate-950 transition-all ease-in-out hover:gap-x-5 hover:brightness-75 active:scale-[0.98]"
            >
              <div className={`active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center h-[32px] w-[30px] ${added ? 'bg-green-200' : 'bg-white'}`}>
                {pinning ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : adding || added ? (
                  <BookLock size={17.5} className="fill-white" />
                ) : (
                  <BookPlus size={17.5} />
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              title="Download PDF"
              className="flex h-max justify-center w-full items-center gap-x-2 bg-white border px-2 py-1 text-sm font-medium text-slate-950 transition-all ease-in-out hover:gap-x-5 hover:brightness-75 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="text-slate-900 flex items-center justify-center bg-white h-[32px] w-[30px]">
                {pdfLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
              </div>
            </button>

            <Link
              to={`/posts/${post.slug}`}
              className={`justify-center w-max pr-1 flex mt-auto hover:brightness-75 h-max gap-x-2 hover:gap-x-5 active:scale-[0.98] border dark:!border-white items-center px-2 py-1 rounded-tr-2xl rounded-br-2xl overflow-hidden bg-white text-sm font-medium text-slate-950 transition-all ease-in-out hover:bg-accent-dark ${
                featured ? "mt-3" : "mt-2"
              }`}
            >
              <div className="w-max gap-x-2 active:scale-[0.98] duration-100 text-slate-900 flex items-center justify-center bg-white h-[32px]">
                <p>Read</p>
                <ChevronRight size={21} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {showRemoveModal &&
      createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!removing) setShowRemoveModal(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-white p-5 shadow-xl dark:bg-slate-900"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={18} />
            </div>
            <h4 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
              Hapus dari Reading List?
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-400 break-words">
              “{post.title}” akan dihapus dari Reading List kamu.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={removing}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRemoveModal(false);
                }}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 active:scale-[0.98] duration-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={handleRemoveFromReadingList}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 active:scale-[0.98] duration-100 disabled:opacity-60"
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Wrapper>
  );
};

export default PostCard;
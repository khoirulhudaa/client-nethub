// src/utils/searchGuides.js
import Fuse from "fuse.js";

const STOP_WORDS = new Set([
  "cara", "yang", "di", "ke", "dari", "dan", "atau", "untuk", "pada", "dengan",
  "saat", "ketika", "akan", "itu", "ini", "ada", "adalah", "agar", "jika",
  "kalau", "bisa", "apa", "bagaimana", "kenapa", "mengapa", "the", "a", "of", "to",
]);

const normalizeToken = (t) => t.replace(/(nya|lah|kah|ku|mu)$/i, "");

export const tokenize = (query) => {
  const all = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map(normalizeToken)
    .filter((t) => t.length >= 2);

  const meaningful = all.filter((t) => !STOP_WORDS.has(t));
  return Array.from(new Set(meaningful.length ? meaningful : all));
};

export const createGuideFuse = (posts) => {
  if (!posts?.length) return null;
  return new Fuse(posts, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "excerpt", weight: 0.2 },
      { name: "tags", weight: 0.1 },
      { name: "category", weight: 0.1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
};

export const searchGuides = (fuse, query) => {
  if (!fuse || !query.trim()) return [];

  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const board = new Map();
  tokens.forEach((token) => {
    fuse.search(token).forEach(({ item, score }) => {
      const id = String(item._id);
      const entry = board.get(id) || { item, matched: 0, score: 0 };
      entry.matched += 1;
      entry.score += 1 - (score ?? 0);
      board.set(id, entry);
    });
  });

  const minMatch = Math.max(1, Math.ceil(tokens.length / 2));

  return Array.from(board.values())
    .filter((e) => e.matched >= minMatch)
    .sort((a, b) => b.matched - a.matched || b.score - a.score)
    .map((e) => e.item);
};
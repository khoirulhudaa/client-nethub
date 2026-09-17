export const protectWrite = async (req, res, next) => {
  // Guest tidak boleh create/edit/delete/like/comment
  if (req.user?.role === "guest" || req.user?.isGuest) {
    return res.status(403).json({ message: "Guest hanya bisa membaca. Silakan daftar untuk berinteraksi." });
  }
  next();
};
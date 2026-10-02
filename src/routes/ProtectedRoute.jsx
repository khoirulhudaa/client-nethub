// // import { Navigate } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext.jsx";

// // const ProtectedRoute = ({ children }) => {
// //   const { user, loading } = useAuth();

// //   if (loading) {
// //     return (
// //       <div className="flex h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
// //         <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
// //       </div>
// //     );
// //   }

// //   if (!user) return <Navigate to="/login" replace />;
// //   return children;
// // };

// // export default ProtectedRoute;


// import { useEffect, useRef, useState } from "react";
// import { Navigate, useLocation, useSearchParams } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

// const Spinner = () => (
//   <div className="flex h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
//     <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
//   </div>
// );

// const ProtectedRoute = ({ children }) => {
//   const { user, loading, loginAsGuest } = useAuth();
//   const location = useLocation();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const isShare = searchParams.get("ref") === "share";
//   const tried = useRef(false);
//   const [guestFailed, setGuestFailed] = useState(false);

//   // Belum login + datang dari link share -> jadikan guest
//   useEffect(() => {
//     if (loading || user || !isShare || tried.current) return;
//     tried.current = true;
//     loginAsGuest().catch(() => setGuestFailed(true));
//   }, [loading, user, isShare]);

//   // Setelah sesi ada, bersihkan ?ref=share dari URL
//   useEffect(() => {
//     if (user && isShare) {
//       const next = new URLSearchParams(searchParams);
//       next.delete("ref");
//       setSearchParams(next, { replace: true });
//     }
//   }, [user, isShare]);

//   if (loading) return <Spinner />;

//   if (!user) {
//     // Link share: tunggu guest terbentuk, jangan lempar ke login
//     if (isShare && !guestFailed) return <Spinner />;
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Spinner = () => (
  <div className="flex h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
  </div>
);

// Halaman yang boleh diakses tanpa login
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/legal",
  "/about",
  "/content-policy",
  // tambah path lain kalau perlu
];

const ProtectedRoute = ({ children }) => {
  const { user, loading, loginAsGuest } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isShare = searchParams.get("ref") === "share";
  const tried = useRef(false);
  const [guestFailed, setGuestFailed] = useState(false);

  // Cek apakah path saat ini termasuk public
  const isPublicPath = PUBLIC_PATHS.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(path + "/")
  );

  // Belum login + datang dari link share -> jadikan guest
  useEffect(() => {
    if (loading || user || !isShare || tried.current || isPublicPath) return;
    tried.current = true;
    loginAsGuest().catch(() => setGuestFailed(true));
  }, [loading, user, isShare, isPublicPath]);

  // Setelah sesi ada, bersihkan ?ref=share dari URL
  useEffect(() => {
    if (user && isShare) {
      const next = new URLSearchParams(searchParams);
      next.delete("ref");
      setSearchParams(next, { replace: true });
    }
  }, [user, isShare]);

  if (loading) return <Spinner />;

  // === PUBLIC PATH → langsung izinkan, tidak peduli login atau tidak ===
  if (isPublicPath) {
    return children;
  }

  // Belum login
  if (!user) {
    // Link share: tunggu guest terbentuk, jangan lempar ke login
    if (isShare && !guestFailed) return <Spinner />;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
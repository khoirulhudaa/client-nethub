// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../api/axios.js";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const stored = localStorage.getItem("nethub_user");
//     return stored ? JSON.parse(stored) : null;
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("nethub_token");
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     api
//       .get("/auth/me")
//       .then(({ data }) => {
//         setUser(data.user);
//         console.log(data.user)
//         localStorage.setItem("nethub_user", JSON.stringify(data.user));
//       })
//       .catch(() => {
//         setUser(null);
//         localStorage.removeItem("nethub_token");
//         localStorage.removeItem("nethub_user");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const persistSession = (token, user) => {
//     localStorage.setItem("nethub_token", token);
//     localStorage.setItem("nethub_user", JSON.stringify(user));
//     setUser(user);
//   };

//   const register = async (payload) => {
//     const { data } = await api.post("/auth/register", payload);
//     persistSession(data.token, data.user);
//     return data.user;
//   };

//   const login = async (payload) => {
//     const { data } = await api.post("/auth/login", payload);
//     persistSession(data.token, data.user);
//     return data.user;
//   };

//   // ===== GUEST LOGIN =====
//   const loginAsGuest = async () => {
//     const { data } = await api.post("/auth/guest");
//     persistSession(data.token, data.user);
//     return data.user;
//   };

//   const logout = () => {
//     localStorage.removeItem("nethub_token");
//     localStorage.removeItem("nethub_user");
//     setUser(null);
//   };

//   const updateProfile = async (payload) => {
//     const { data } = await api.put("/auth/me", payload);
//     localStorage.setItem("nethub_user", JSON.stringify(data.user));
//     setUser(data.user);
//     return data.user;
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         register,
//         login,
//         loginAsGuest,   // ← export ini
//         logout,
//         updateProfile,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("nethub_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nethub_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("nethub_user", JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("nethub_token");
        localStorage.removeItem("nethub_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem("nethub_token", token);
    localStorage.setItem("nethub_user", JSON.stringify(userData));
    setUser(userData);
  };

  // ===== UPDATE USER (untuk Profile / Account) =====
  const updateUser = useCallback((userData) => {
    if (!userData) return;
    localStorage.setItem("nethub_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data.token, data.user);
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistSession(data.token, data.user);
    return data.user;
  };

  const loginAsGuest = async () => {
    const { data } = await api.post("/auth/guest");
    persistSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("nethub_token");
    localStorage.removeItem("nethub_user");
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    updateUser(data.user); // pakai helper yang sama
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginAsGuest,
        logout,
        updateProfile,
        updateUser, // ← penting: diekspos
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
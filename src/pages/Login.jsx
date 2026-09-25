import { Eye, EyeOff, Loader2, Network } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


const Login = () => {
  const { login, loginAsGuest } = useAuth();  // ← tambahkan loginAsGuest
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <img src="/hero.jpg" alt="hero" className="w-screen h-screen absolute z-[1] opacity-20" />
      <div className="bg-white w-full rounded-2xl max-w-xl p-8 z-[22]">
        <div className="mb-6 flex flex-col items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
            <img src="/icons/icon-192x192.png" alt="logo" className="w-[85%] relative top-[1px] left-[-0.3px]" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-600">Sign in to keep sharing networking know-how.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-950">Email</label>
            <input
              type="email"
              required
              className="input-field-auth text-slate-900 !bg-blue-100 outline outline-blue-200"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-950">Password</label>
            <div className="relative">
              <input
                type={`${showPass ? 'text' : 'password'}`}
                required
                className="input-field-auth text-slate-900 !bg-blue-100 outline outline-blue-200"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
              {
                showPass ? (
                  <EyeOff onClick={() => setShowPass(!showPass)} size={16} className="absolute top-[27%] right-4 z-[3] text-slate-900 cursor-pointer active:scale-[0.99] duration-100 hover:brightness-[90%]" /> 
                ):
                  <Eye onClick={() => setShowPass(!showPass)} size={16} className="absolute top-[27%] right-4 z-[3] text-slate-900 cursor-pointer active:scale-[0.99] duration-100 hover:brightness-[90%]" /> 
              }
            </div>
          </div>
          <div className="w-full flex items-center gap-3.5">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign In
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError("");
                setLoading(true);
                try {
                  await loginAsGuest();
                  navigate("/");
                } catch (err) {
                  console.log('error', err)
                  setError(err.response?.data?.message || "Gagal masuk sebagai guest");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-250 active:scale-[0.99] dark:border-slate-500 dark:text-slate-950"
            >
              Guest - read only
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New here?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

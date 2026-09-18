import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Network, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <img src="/hero.jpg" alt="hero" className="w-screen h-screen absolute z-[1] opacity-15" />
      <div className="bg-white w-full rounded-2xl max-w-xl p-8 z-[22]">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
            <Network size={22} />
          </div>
          <h1 className="text-xl font-semibold text-slate-950 tracking-tight">Join NetHub</h1>
          <p className="text-sm text-gray-500">Share fixes, topologies, and hardware guides.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-950">Full name</label>
            <input
              required
              className="input-field text-slate-900 !bg-blue-100 outline outline-blue-200"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-950">Email</label>
            <input
              type="email"
              required
              className="input-field text-slate-900 !bg-blue-100 outline outline-blue-200"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-950">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field text-slate-900 !bg-blue-100 outline outline-blue-200"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="w-full grid grid-cols-1 items-center gap-3.5">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

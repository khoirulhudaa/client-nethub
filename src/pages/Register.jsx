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
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
            <Network size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Join NetHub</h1>
          <p className="text-sm text-gray-500">Share fixes, topologies, and hardware guides.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-control bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full name</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="w-full flex items-center gap-2.5">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
            <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    // Panggil API guest
                    const { data } = await api.post("/auth/guest");
                    // Simpan token & user ke AuthContext (sesuaikan dengan cara login biasa)
                    localStorage.setItem("token", data.token);
                    // Atau panggil fungsi dari AuthContext
                    // await loginAsGuest(data);
                    navigate("/");
                  } catch {
                    setError("Gagal masuk sebagai guest");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-900 dark:border-white/10 dark:text-gray-300"
              >
                Guest (hanya baca)
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

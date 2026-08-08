import api from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldUser, LockKeyhole, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo.png";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    if (password !== confirm) {
      setErrMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { username, password, displayName });
      login(res.data.token, res.data.user);
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request ? "No response from server" : "Registration failed");
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0C0C0E] px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-8">
          <img className="h-28 w-auto object-contain" src={logo} alt="Atlas logo" />
          <h1 className="text-white text-2xl font-extrabold tracking-tight mt-2">
            Create an account
          </h1>
          <p className="text-[#9BA1A6] text-sm mt-2 max-w-[280px]">
            Start tracking your workouts today.
          </p>
        </div>

        {errMsg && (
          <div className="mb-4 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-red-400 text-sm">
            {errMsg}
          </div>
        )}

        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] tracking-wide text-[#9BA1A6] uppercase">
                Username
              </label>
              <div className="relative flex items-center">
                <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-[#9BA1A6]" />
                <input
                  className="w-full rounded border border-[#2C2C31] bg-[#1C1C21] py-2.5 pl-10 pr-3 text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all"
                  placeholder="Choose a username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] tracking-wide text-[#9BA1A6] uppercase">
                Display Name
              </label>
              <div className="relative flex items-center">
                <UserRound className="pointer-events-none absolute left-3 h-5 w-5 text-[#9BA1A6]" />
                <input
                  className="w-full rounded border border-[#2C2C31] bg-[#1C1C21] py-2.5 pl-10 pr-3 text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all"
                  placeholder="Optional"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] tracking-wide text-[#9BA1A6] uppercase">
                Password
              </label>
              <div className="relative flex items-center">
                <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-[#9BA1A6]" />
                <input
                  className="w-full rounded border border-[#2C2C31] bg-[#1C1C21] py-2.5 pl-10 pr-3 text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] tracking-wide text-[#9BA1A6] uppercase">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-[#9BA1A6]" />
                <input
                  className="w-full rounded border border-[#2C2C31] bg-[#1C1C21] py-2.5 pl-10 pr-3 text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D3131B] hover:bg-[#b01016] text-white font-bold rounded-lg py-3 cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full border border-[#2C2C31] hover:border-white text-white font-bold rounded-lg py-3 cursor-pointer transition-all active:scale-[0.98]"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

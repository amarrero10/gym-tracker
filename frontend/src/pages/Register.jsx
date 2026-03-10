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
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col w-screen h-screen items-center">
        <img className="h-27.5 mt-10" src={logo} alt="Atlas logo" />
        <p className="text-[12px] text-[#9AA0AA]">Track lifts. Hit PRs. Stay consistent.</p>
        <hr className="w-87.5 h-px border-0 my-4 bg-[#2A2A33]" />

        {errMsg && (
          <div className="w-full px-4 mb-3">
            <div className="rounded-xl border border-red-400 bg-red-400/10 px-3 py-2 text-red-400 text-sm">
              {errMsg}
            </div>
          </div>
        )}

        <div className="w-screen px-4">
          <form className="flex flex-col gap-5 pt-2 pb-6" onSubmit={handleSubmit}>
            <div className="bg-[#14141A] rounded-2xl p-4">
              <p className="text-[#F5F6F7] text-[12px] pb-2">Create an account</p>
              <p className="text-[#9AA0AA] text-[12px] pb-4">
                Start tracking your workouts today.
              </p>

              <div className="relative flex items-center pb-4">
                <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-[#9AA0AA]" />
                <input
                  className="rounded-xl border border-[#9AA0AA] bg-[#121216] py-2 pl-10 pr-3 text-[#9AA0AA] shadow-sm focus:border-[#7A1218] sm:text-md w-full outline-none"
                  placeholder="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative flex items-center pb-4">
                <UserRound className="pointer-events-none absolute left-3 h-5 w-5 text-[#9AA0AA]" />
                <input
                  className="rounded-xl border border-[#9AA0AA] bg-[#121216] py-2 pl-10 pr-3 text-[#9AA0AA] shadow-sm focus:border-[#7A1218] sm:text-md w-full outline-none"
                  placeholder="display name (optional)"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="relative flex items-center pb-4">
                <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-[#9AA0AA]" />
                <input
                  className="rounded-xl border border-[#9AA0AA] bg-[#121216] py-2 pl-10 pr-3 text-[#9AA0AA] shadow-sm focus:border-[#7A1218] sm:text-md w-full outline-none"
                  placeholder="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              <div className="relative flex items-center">
                <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-[#9AA0AA]" />
                <input
                  className="rounded-xl border border-[#9AA0AA] bg-[#121216] py-2 pl-10 pr-3 text-[#9AA0AA] shadow-sm focus:border-[#7A1218] sm:text-md w-full outline-none"
                  placeholder="confirm password"
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
              className="bg-[#7A1218] text-[#FFFFFF] text-[12px] px-10 py-4 rounded-2xl cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="px-4 w-screen">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="border-[#2A2A33] border-2 w-full text-[#FFFFFF] text-[12px] px-10 py-4 rounded-2xl cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

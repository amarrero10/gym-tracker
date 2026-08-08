import api from "../api/axios"; // if you created it (recommended)
import { LockKeyhole, ShieldUser, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    try {
      const response = await api.post("/auth/login", { username, password });
      // If you are NOT using api baseURL="/api", use axios.post("/api/auth/login", ...)

      // Update auth state + store token
      login(response.data.token, response.data.user);

      // Go to dashboard (or previous page)
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request ? "No response from server" : "Login failed");
      setErrMsg(message);
      console.log("Error trying to sign in:", error);
    }
  };

  const handleRegister = () => {
    navigate("/register", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0C0C0E] px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-8">
          <img className="h-28 w-auto object-contain" src={logo} alt="Atlas logo" />
          <h1 className="text-white text-2xl font-extrabold tracking-tight mt-2">Welcome back</h1>
          <p className="text-[#9BA1A6] text-sm mt-2 max-w-[280px]">
            Track lifts. Hit PRs. Stay consistent.
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
              <label
                htmlFor="username"
                className="block font-mono text-[11px] tracking-wide text-[#9BA1A6] uppercase"
              >
                Username
              </label>
              <div className="relative flex items-center">
                <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-[#9BA1A6]" />
                <input
                  id="username"
                  className="w-full rounded border border-[#2C2C31] bg-[#1C1C21] py-2.5 pl-10 pr-3 text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all"
                  placeholder="Enter your username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block font-mono text-[11px] tracking-wide text-[#9BA1A6] uppercase"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-[#9BA1A6]" />
                <input
                  id="password"
                  className="w-full rounded border border-[#2C2C31] bg-[#1C1C21] py-2.5 pl-10 pr-3 text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all"
                  placeholder="••••••••"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#D3131B] hover:bg-[#b01016] text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="w-full bg-transparent border border-[#2C2C31] hover:border-white text-white font-bold rounded-lg py-3 cursor-pointer transition-all active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

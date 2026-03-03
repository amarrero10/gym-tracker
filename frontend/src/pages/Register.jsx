import api from "../api/axios"; // baseURL "/api"
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldUser, LockKeyhole, UserPlus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

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

      const res = await api.post("/auth/register", {
        username,
        password,
        displayName,
      });

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
      <div className="flex flex-col h-1/2 w-1/4 items-center rounded-3xl shadow-2xl">
        <div className="p-4 bg-gray-500/20 rounded-full mt-6">
          <UserPlus className="h-10 w-10" />
        </div>

        <h2 className="text-2xl py-6">Create an account</h2>

        {errMsg && (
          <div className="w-4/5 mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {errMsg}
          </div>
        )}

        <form
          className="w-full flex flex-col items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="relative flex items-center">
            <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className="rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
              placeholder="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="relative flex items-center">
            <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className="rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
              placeholder="display name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="relative flex items-center">
            <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className="rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
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
            <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className="rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
              placeholder="confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <button
            disabled={loading}
            className="bg-slate-200 px-10 py-2 rounded-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link className="text-indigo-600 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

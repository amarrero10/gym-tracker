import api from "../api/axios"; // if you created it (recommended)
import { LockKeyhole, LogIn, ShieldUser } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col h-1/3 w-1/4 items-center rounded-3xl shadow-2xl">
        <div className="p-4 bg-gray-500/20 rounded-full mt-6">
          <LogIn className="h-10 w-10" />
        </div>

        <h2 className="text-2xl py-6">Sign in with username</h2>

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
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="relative flex items-center">
            <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className="rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
              placeholder="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="bg-slate-200 px-10 py-2 rounded-lg cursor-pointer">
            Sign In
          </button>
        </form>
        <p className="text-sm text-gray-600">
          Need to create an account?{" "}
          <Link className="text-indigo-600 hover:underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

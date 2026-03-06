import api from "../api/axios"; // if you created it (recommended)
import { LockKeyhole, LogIn, ShieldUser } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col w-screen h-screen items-center  ">
        <img className=" h-27.5 mt-10" src={logo} alt="Atlas logo"></img>
        <p className="text-[12px] text-[#9AA0AA] ">
          Track lifts. Hit PRs. Stay consistent.
        </p>
        <hr className="w-87.5 h-px border-0 my-4 bg-[#2A2A33]" />

        {errMsg && (
          <div className="w-4/5 mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {errMsg}
          </div>
        )}
        <div className=" w-screen px-4">
          <form
            className=" flex flex-col gap-5 pt-2 pb-6"
            onSubmit={handleSubmit}
          >
            <div className=" bg-[#14141A] rounded-2xl p-4">
              <p className="text-[#F5F6F7] text-[12px] pb-2 ">Welcome back</p>
              <p className="text-[#9AA0AA] text-[12px] pb-4">
                Log workouts in seconds, with timers & history.
              </p>
              <div className="relative flex items-center pb-4 ">
                <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-[#9AA0AA]" />
                <input
                  className="rounded-xl border border-[#9AA0AA] bg-[#121216] py-2 pl-10 pr-3 text-[#9AA0AA] shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md w-full"
                  placeholder="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative flex items-center pb-3">
                <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-[#9AA0AA]" />
                <input
                  className="rounded-xl border border-[#9AA0AA] bg-[#121216] py-2 pl-10 pr-3 text-[#9AA0AA] shadow-sm
                         focus:border-indigo-500 focus:ring-indigo-500 sm:text-md w-full"
                  placeholder="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button className="bg-[#7A1218] text-[#FFFFFF] text-[12px] px-10 py-4 rounded-2xl cursor-pointer mt-32">
              Sign In
            </button>
          </form>
        </div>
        <div className=" px-4 w-screen">
          <button
            onClick={handleRegister}
            className="border-[#2A2A33] border-2 w-full   text-[#FFFFFF] text-[12px] px-10 py-4 rounded-2xl cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

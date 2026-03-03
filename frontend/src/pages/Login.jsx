import axios from "axios";
import { LockKeyhole, LogIn, ShieldUser } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      console.log("Login successful: ", response.data);
    } catch (error) {
      console.log("Error trying to sign in: ", error);
    }
  };
  return (
    <div className=" h-screen w-screen flex items-center justify-center ">
      <div className=" flex flex-col  h-1/3 w-1/4 items-center rounded-3xl shadow-2xl  ">
        <div className=" p-4 bg-gray-500/20 rounded-full mt-6">
          <LogIn className="   h-10 w-10" />
        </div>
        <h2 className=" text-2xl py-6">Sign in with username</h2>
        <form
          className=" w-full flex flex-col items-center gap-5 "
          onSubmit={handleSubmit}
        >
          <div className=" relative flex items-center ">
            <ShieldUser className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400 " />
            <input
              className="  rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm 
          focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
              placeholder="username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className=" relative flex items-center">
            <LockKeyhole className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              className=" rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 shadow-sm 
          focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
              placeholder="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="  bg-slate-200 px-10 py-2 rounded-lg cursor-pointer">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

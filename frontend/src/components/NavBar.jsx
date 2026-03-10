// import { useAuth } from "../auth/AuthContext";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  // const { user } = useAuth();

  return (
    <div className="h-14 flex items-center  justify-between px-4 fixed bottom-0 left-0 right-0 text-[#F5F6F7] text-[12px] bg-[#121216] rounded-2xl w-[90%] mx-auto">
      <NavLink
        className={({ isActive }) =>
          `${isActive ? "  text-sm underline decoration-[#7A1218] underline-offset-8" : ""}`
        }
        to="/"
      >
        Home
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `${isActive ? "  text-sm underline decoration-[#7A1218] underline-offset-8" : ""}`
        }
        to="/session"
      >
        Workout
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `${isActive ? "  text-sm underline decoration-[#7A1218] underline-offset-8" : ""}`
        }
        to="/plans"
      >
        Plans
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `${isActive ? "  text-sm underline decoration-[#7A1218] underline-offset-8" : ""}`
        }
        to="/progress"
      >
        Progress
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `${isActive ? "  text-sm underline decoration-[#7A1218] underline-offset-8" : ""}`
        }
        to="/user"
      >
        Profile
      </NavLink>
    </div>
  );
}

// onClick={() => {
//   logout();
//   navigate("/login", { replace: true });
// }}

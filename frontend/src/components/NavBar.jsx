import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b">
      <div>My App</div>
      <div className="flex items-center gap-3">
        <span>{user?.displayName ?? user?.username}</span>
        <button
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="px-3 py-1 rounded bg-slate-200 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

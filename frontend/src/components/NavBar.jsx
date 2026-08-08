import { NavLink } from "react-router-dom";
import { Home, Dumbbell, ClipboardList, LineChart, User } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/session", label: "Workout", icon: Dumbbell },
  { to: "/plans", label: "Plans", icon: ClipboardList },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/user", label: "Profile", icon: User },
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around bg-[#0C0C0E] border-t border-[#2C2C31]">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-full pt-1 border-t-2 transition-all active:scale-90 ${
                isActive
                  ? "text-[#D3131B] border-[#D3131B]"
                  : "text-[#9BA1A6] border-transparent hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
                  strokeWidth={2}
                />
                <span className="font-mono text-[10px] uppercase tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

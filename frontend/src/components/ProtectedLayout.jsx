import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function ProtectedLayout() {
  return (
    <>
      <NavBar />
      <div className="pb-24 bg-[#0C0C0E] min-h-screen">
        <Outlet />
      </div>
    </>
  );
}

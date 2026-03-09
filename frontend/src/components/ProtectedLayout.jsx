import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function ProtectedLayout() {
  return (
    <>
      <NavBar />
      <div className="pb-24">
        <Outlet />
      </div>
    </>
  );
}

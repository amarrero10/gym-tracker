import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function ProtectedLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

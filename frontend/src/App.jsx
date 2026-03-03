import { Route, Routes } from "react-router";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="sign-in" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;

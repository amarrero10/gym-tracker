import { Route, Routes } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequireAuth from "./auth/RequireAuth";
import Register from "./pages/Register";
import ProtectedLayout from "./components/ProtectedLayout";
import PlanDetail from "./pages/PlanDetail";
import Session from "./pages/Session";
import Set from "./pages/Set";
import EditSet from "./pages/EditSet";
import Plans from "./pages/Plans";
import CreatePlan from "./pages/CreatePlan";
import Sessions from "./pages/Sessions";
import Progress from "./pages/Progress";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session" element={<Sessions />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/user" element={<UserProfile />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/create" element={<CreatePlan />} />
            <Route path="/plans/:id" element={<PlanDetail />} />
            <Route path="/session/:id" element={<Session />} />
            <Route path="/session/:sessionId/set/:setId/exercise/:exerciseId" element={<Set />} />
            <Route path="/session/:sessionId/exercise/:sessionExerciseId/edit" element={<EditSet />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;

{
  /* <Route element={<ProtectedLayout />}></Route>; */
}

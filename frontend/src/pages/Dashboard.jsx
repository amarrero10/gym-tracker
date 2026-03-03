import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  console.log(user);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Welcome, {user?.displayName} with user id of: {user.id}
      </p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;

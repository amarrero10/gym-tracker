import { useAuth } from "../auth/AuthContext";
import Plans from "../components/Plans";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Welcome, {user?.displayName} with user id of: {user.id}
      </p>
      <Plans />
    </div>
  );
};

export default Dashboard;

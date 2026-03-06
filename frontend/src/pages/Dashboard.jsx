import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [openDayKey, setOpenDayKey] = useState(null);
  const [inProgressSession, setInProgressSession] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [completedSessions, setCompletedSessions] = useState([]);

  useEffect(() => {
    const getPlans = async () => {
      try {
        const res = await api.get("/plans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPlans(res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };

    getPlans();
  }, [user, token]);

  useEffect(() => {
    const date = new Date();
    setGreeting(date.getHours());

    const active = plans.find((a) => a.isActive === true) || null;
    setActivePlan(active);

    if (!active?._id) return;

    const fetchSessions = async () => {
      try {
        setLoading(true);

        const [inProgressRes, completedRes] = await Promise.all([
          api.get(`/sessions/in-progress?planId=${active._id}`),
          api.get(`/sessions/completed-sessions?planId=${active._id}`), // your endpoint for completed
        ]);

        console.log("COMPLETED SESH ", completedRes.data.sessions);

        setActiveSession(inProgressRes.data.session ?? null);
        setCompletedSessions(completedRes.data.sessions ?? []);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [plans]);

  if (error) return <div className=" text-white">Error: {error.message}</div>;
  if (loading)
    return (
      <div class="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
    );

  return (
    <div className=" px-3">
      <h1 className="text-[#F5F6F7] text-lg pt-10">Dashboard</h1>
      <p className="text-[#9AA0AA] ">
        {greeting < 12
          ? `Good morning, ${user?.displayName}`
          : greeting < 18
            ? `Good afternoon, ${user?.displayName}`
            : `Good evening, ${user?.displayName}`}
      </p>

      <hr className="w-87.5 h-px border-0 my-6 bg-[#2A2A33]" />

      <div className="bg-[#14141A] rounded-2xl p-4 mb-6">
        <p className="text-white py-2"> Current Plan: {activePlan?.name}</p>
        <button className="bg-[#7A1218] text-[#FFFFFF]  w-1/2 px-10 py-4 rounded-2xl cursor-pointer mt-4">
          Plan Overview
        </button>
      </div>

      {/* NEXT WORKOUT DIV */}
      <div className="bg-[#14141A] rounded-2xl p-4">
        <p className="text-[#9AA0AA] py-4">Next workout</p>
        <p className="text-white pb-2">{activeSession?.title}</p>
        <p className="text-[#9AA0AA]">
          {activeSession?.exercises.length} exercises
        </p>
        <button className="bg-[#7A1218] text-[#FFFFFF]  w-1/2 px-10 py-4 rounded-2xl cursor-pointer mt-4">
          Start
        </button>
      </div>

      {/* Recent Sessions */}
      <p className="text-white pb-2 my-6">Recent sessions</p>
      {completedSessions.map((s) => (
        <div className="bg-[#14141A] rounded-2xl p-4" key={s._id}>
          <p className="text-white pb-2"> {s.title} </p>
          <p className="text-white pb-2">
            Completed:{" "}
            {new Date(s.completedAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

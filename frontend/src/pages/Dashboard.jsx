import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [completedSessions, setCompletedSessions] = useState([]);

  const getPlans = useCallback(async () => {
    try {
      const res = await api.get("/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data);
      setLoading(false);
    } catch (error) {
      setError(error);
    }
  }, [token]);

  useEffect(() => {
    getPlans();
  }, [getPlans]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") getPlans();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [getPlans]);

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

  const goToPlanDetails = () => {
    navigate(`/plans/${activePlan?._id}`);
  };

  const goToSession = () => {
    navigate(`/session/${activeSession?._id}`);
  };

  const completePlan = async () => {
    try {
      await api.patch(
        `/plans/${activePlan._id}`,
        { completedAt: new Date(), isActive: false },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActivePlan((prev) => ({
        ...prev,
        completedAt: new Date(),
        isActive: false,
      }));
    } catch (error) {
      console.error("Error completing plan:", error);
    }
  };

  if (error)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white">Error: {error.message}</div>
      </div>
    );
  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-t-4 border-[#D3131B] rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="px-4 pt-10 animate-fade-in-up">
      <h1 className="text-white text-2xl font-extrabold tracking-tight">
        {greeting < 12
          ? `Good morning, ${user?.displayName}`
          : greeting < 18
            ? `Good afternoon, ${user?.displayName}`
            : `Good evening, ${user?.displayName}`}
      </h1>

      <div className="h-px bg-[#2C2C31] my-6" />

      {activePlan && (
        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4">
          <span className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase">
            Current Plan
          </span>
          <p className="text-white font-bold text-lg mt-1">{activePlan.name}</p>
          <button
            onClick={goToPlanDetails}
            className="mt-4 bg-[#D3131B] hover:bg-[#b01016] text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98] shadow-[0_0_15px_rgba(211,19,27,0.2)]"
          >
            Plan Overview
          </button>
        </div>
      )}

      {/* NEXT WORKOUT DIV */}
      <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4">
        {!activePlan ? (
          <>
            <p className="text-white font-bold pb-1">Ready to get started?</p>
            <p className="text-[#9BA1A6] text-sm pb-4">
              Create a plan to begin tracking your workouts.
            </p>
            <button
              onClick={() => navigate("/plans")}
              className="bg-[#D3131B] hover:bg-[#b01016] text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98] shadow-[0_0_15px_rgba(211,19,27,0.2)]"
            >
              Create a Plan
            </button>
          </>
        ) : activePlan?.completedAt ? (
          <>
            <p className="text-green-400 font-bold pb-1">Plan Complete!</p>
            <p className="text-white pb-1">
              You crushed it! {activePlan.name} is done.
            </p>
            <p className="text-[#9BA1A6] text-sm pb-4">
              Head to Plans to start your next one.
            </p>
            <button
              onClick={() => navigate("/plans")}
              className="bg-[#D3131B] hover:bg-[#b01016] text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98] shadow-[0_0_15px_rgba(211,19,27,0.2)]"
            >
              Start New Plan
            </button>
          </>
        ) : activeSession ? (
          <>
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase">
                Next workout
              </span>
              <span className="bg-[#2F363A] text-white font-mono text-[10px] px-2 py-1 rounded">
                In Progress
              </span>
            </div>
            <p className="text-white font-bold text-lg mt-2">{activeSession.title}</p>
            <p className="text-[#9BA1A6] text-sm mt-1">
              {activeSession.exercises.length} exercises
            </p>
            <button
              onClick={goToSession}
              className="mt-4 bg-[#D3131B] hover:bg-[#b01016] text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98] shadow-[0_0_15px_rgba(211,19,27,0.2)] flex items-center gap-2"
            >
              Go to workout
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : completedSessions.length === 0 ? (
          <>
            <span className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase">
              Next workout
            </span>
            <p className="text-white font-bold text-lg mt-2">Ready to start?</p>
            <p className="text-[#9BA1A6] text-sm pb-4 mt-1">
              Head to your plan overview to begin your first workout.
            </p>
            <button
              onClick={goToPlanDetails}
              className="bg-[#D3131B] hover:bg-[#b01016] text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98] shadow-[0_0_15px_rgba(211,19,27,0.2)]"
            >
              Plan Overview
            </button>
          </>
        ) : (
          <>
            <span className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase">
              Next workout
            </span>
            <p className="text-white font-bold text-lg mt-2">All workouts completed!</p>
            <p className="text-[#9BA1A6] text-sm pb-4 mt-1">
              You've finished all sessions in your current plan.
            </p>
            <button
              onClick={completePlan}
              className="bg-[#D3131B] hover:bg-[#b01016] text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98] shadow-[0_0_15px_rgba(211,19,27,0.2)]"
            >
              Complete Plan
            </button>
          </>
        )}
      </div>

      {/* Recent Sessions */}
      {activePlan && (
        <>
          <p className="text-white font-bold my-6">Recent sessions</p>
          <div className="flex flex-col gap-2 mb-4">
            {completedSessions.map((s) => (
              <div
                className="bg-[#090F13] border border-[#2C2C31] rounded-lg p-4 flex items-center justify-between"
                key={s._id}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-[#2F363A] flex items-center justify-center border border-[#2C2C31] flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#9BA1A6]" />
                  </div>
                  <div>
                    <p className="text-white leading-tight">{s.title}</p>
                    <p className="font-mono text-[10px] text-[#9BA1A6] mt-1">Completed</p>
                  </div>
                </div>
                <p className="font-mono text-xs text-[#9BA1A6]">
                  {new Date(s.completedAt).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

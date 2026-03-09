import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/plans", { headers });
        setPlans(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  const deletePlan = async (e, plan) => {
    e.stopPropagation();
    try {
      await api.delete(`/plans/${plan._id}`, { headers });
      setPlans((prev) => prev.filter((p) => p._id !== plan._id));
      toast.success(`"${plan.name}" deleted`);
    } catch (err) {
      console.error("Error deleting plan:", err);
      toast.error("Failed to delete plan");
    }
  };

  const activatePlan = async (e, planId) => {
    e.stopPropagation();
    try {
      const currentActive = plans.find((p) => p.isActive && !p.completedAt);
      if (currentActive) {
        await api.patch(`/plans/${currentActive._id}`, { isActive: false }, { headers });
      }
      await api.patch(`/plans/${planId}`, { isActive: true }, { headers });
      setPlans((prev) =>
        prev.map((p) => {
          if (p._id === planId) return { ...p, isActive: true };
          if (p._id === currentActive?._id) return { ...p, isActive: false };
          return p;
        })
      );
    } catch (err) {
      console.error("Error activating plan:", err);
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
        <div className="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );

  const activePlans = plans.filter((p) => p.isActive && !p.completedAt);
  const inactivePlans = plans.filter((p) => !p.isActive && !p.completedAt);
  const completedPlans = plans.filter((p) => p.completedAt);

  return (
    <div className="px-3 pt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-[#F5F6F7] text-lg">Plans</h1>
        <button
          onClick={() => navigate("/plans/create")}
          className="bg-[#7A1218] text-white text-sm px-4 py-2 rounded-xl"
        >
          + Create
        </button>
      </div>

      <hr className="h-px border-0 my-6 bg-[#2A2A33]" />

      {activePlans.length > 0 && (
        <>
          <p className="text-[#9AA0AA] text-sm mb-3">Active</p>
          {activePlans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => navigate(`/plans/${plan._id}`)}
              className="bg-[#14141A] rounded-2xl p-4 mb-4 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{plan.name}</p>
                  <p className="text-[#9AA0AA] text-sm mt-1">
                    {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"} · {plan.daysPerWeek} days/week
                  </p>
                </div>
                <button
                  onClick={(e) => deletePlan(e, plan)}
                  className="text-xs text-zinc-400 border border-zinc-700 rounded-full px-3 py-1 shrink-0 ml-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {inactivePlans.length > 0 && (
        <>
          <p className="text-[#9AA0AA] text-sm mb-3 mt-2">Not started</p>
          {inactivePlans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => navigate(`/plans/${plan._id}`)}
              className="bg-[#14141A] rounded-2xl p-4 mb-4 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{plan.name}</p>
                  <p className="text-[#9AA0AA] text-sm mt-1">
                    {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"} · {plan.daysPerWeek} days/week
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button
                    onClick={(e) => activatePlan(e, plan._id)}
                    className="text-xs text-white bg-[#7A1218] rounded-full px-3 py-1"
                  >
                    Set Active
                  </button>
                  <button
                    onClick={(e) => deletePlan(e, plan)}
                    className="text-xs text-zinc-400 border border-zinc-700 rounded-full px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {completedPlans.length > 0 && (
        <>
          <p className="text-[#9AA0AA] text-sm mb-3 mt-2">Completed</p>
          {completedPlans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => navigate(`/plans/${plan._id}`)}
              className="bg-[#14141A] rounded-2xl p-4 mb-4 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <p className="text-white font-medium">{plan.name}</p>
                <span className="text-xs text-green-400 border border-green-400 rounded-full px-2 py-0.5">
                  Done
                </span>
              </div>
              <p className="text-[#9AA0AA] text-sm mt-1">
                {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"} · {plan.daysPerWeek} days/week
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Completed{" "}
                {new Date(plan.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </>
      )}

      {plans.length === 0 && (
        <p className="text-[#9AA0AA] text-center mt-10">No plans yet.</p>
      )}
      <Toaster />
    </div>
  );
};

export default Plans;

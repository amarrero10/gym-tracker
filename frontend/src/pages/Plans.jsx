import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Plus } from "lucide-react";

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
        <div className="h-12 w-12 border-4 border-t-4 border-[#D3131B] rounded-full animate-spin" />
      </div>
    );

  const activePlans = plans.filter((p) => p.isActive && !p.completedAt);
  const inactivePlans = plans.filter((p) => !p.isActive && !p.completedAt);
  const completedPlans = plans.filter((p) => p.completedAt);

  return (
    <div className="px-4 pt-10 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-extrabold tracking-tight">Plans</h1>
        <button
          onClick={() => navigate("/plans/create")}
          className="bg-[#D3131B] hover:bg-[#b01016] text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer transition active:scale-[0.98] flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      <div className="h-px bg-[#2C2C31] my-6" />

      {activePlans.length > 0 && (
        <>
          <p className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase mb-3">
            Active
          </p>
          {activePlans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => navigate(`/plans/${plan._id}`)}
              className="bg-[#141417] border-t-2 border-t-[#D3131B] border-x border-b border-[#2C2C31] rounded-lg p-4 mb-4 cursor-pointer shadow-[0_0_5px_rgba(211,19,27,0.2)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-bold">{plan.name}</p>
                  <p className="text-[#9BA1A6] text-sm mt-1">
                    {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"} · {plan.daysPerWeek} days/week
                  </p>
                </div>
                <button
                  onClick={(e) => deletePlan(e, plan)}
                  className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] rounded-full px-3 py-1 shrink-0 ml-2 hover:text-white transition-colors"
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
          <p className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase mb-3 mt-2">
            Not started
          </p>
          {inactivePlans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => navigate(`/plans/${plan._id}`)}
              className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 cursor-pointer hover:border-[#47464b] transition hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-bold">{plan.name}</p>
                  <p className="text-[#9BA1A6] text-sm mt-1">
                    {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"} · {plan.daysPerWeek} days/week
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button
                    onClick={(e) => activatePlan(e, plan._id)}
                    className="font-mono text-[10px] uppercase text-white bg-[#D3131B] hover:bg-[#b01016] rounded-full px-3 py-1 transition-colors"
                  >
                    Set Active
                  </button>
                  <button
                    onClick={(e) => deletePlan(e, plan)}
                    className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] rounded-full px-3 py-1 hover:text-white transition-colors"
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
          <p className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase mb-3 mt-2">
            Completed
          </p>
          {completedPlans.map((plan) => (
            <div
              key={plan._id}
              onClick={() => navigate(`/plans/${plan._id}`)}
              className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 cursor-pointer hover:border-[#47464b] transition hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start">
                <p className="text-white font-bold">{plan.name}</p>
                <span className="font-mono text-[10px] uppercase text-green-400 border border-green-400/40 bg-green-900/20 rounded px-2 py-0.5">
                  Done
                </span>
              </div>
              <p className="text-[#9BA1A6] text-sm mt-1">
                {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"} · {plan.daysPerWeek} days/week
              </p>
              <p className="font-mono text-[10px] text-[#9BA1A6] mt-1">
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
        <p className="text-[#9BA1A6] text-center mt-10">No plans yet.</p>
      )}
      <Toaster />
    </div>
  );
};

export default Plans;

import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";
import { ChevronUp, ChevronDown } from "lucide-react";

const Sessions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedByPlan, setGroupedByPlan] = useState([]);
  const [collapsedPlans, setCollapsedPlans] = useState({});

  const togglePlan = (planId) =>
    setCollapsedPlans((prev) => ({ ...prev, [planId]: !prev[planId] }));

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/sessions");
      const sessions = res.data.sessions ?? [];

      // Group by plan
      const planMap = new Map();
      sessions.forEach((s) => {
        const planId = s.planId?._id ?? "unknown";
        const planName = s.planId?.name ?? "Unknown Plan";
        if (!planMap.has(planId)) {
          planMap.set(planId, { planId, planName, inProgress: [], completed: [] });
        }
        if (s.status === "in_progress") {
          planMap.get(planId).inProgress.push(s);
        } else {
          planMap.get(planId).completed.push(s);
        }
      });

      // Sort completed sessions by weekNumber asc within each plan
      planMap.forEach((plan) => {
        plan.completed.sort((a, b) => a.weekNumber - b.weekNumber || a.dayNumber - b.dayNumber);
        plan.inProgress.sort((a, b) => a.weekNumber - b.weekNumber || a.dayNumber - b.dayNumber);
      });

      const plans = Array.from(planMap.values());
      setGroupedByPlan(plans);

      // Collapse plans with no in-progress sessions by default
      const initialCollapsed = {};
      plans.forEach((p) => {
        if (p.inProgress.length === 0) initialCollapsed[p.planId] = true;
      });
      setCollapsedPlans(initialCollapsed);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
      <h1 className="text-white text-2xl font-extrabold tracking-tight">Workouts</h1>
      <p className="text-[#9BA1A6] mt-1">Your training history</p>

      <div className="h-px bg-[#2C2C31] my-6" />

      {groupedByPlan.length === 0 ? (
        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4">
          <p className="text-white font-bold pb-1">No workouts yet</p>
          <p className="text-[#9BA1A6] text-sm pb-4">
            Start a session from your plan to see your history here.
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="bg-[#D3131B] hover:bg-[#b01016] text-white px-6 py-3 rounded-lg cursor-pointer transition active:scale-[0.98]"
          >
            View Plans
          </button>
        </div>
      ) : (
        groupedByPlan.map((plan) => {
          const isCollapsed = collapsedPlans[plan.planId];

          const byWeek = new Map();
          plan.completed.forEach((s) => {
            if (!byWeek.has(s.weekNumber)) byWeek.set(s.weekNumber, []);
            byWeek.get(s.weekNumber).push(s);
          });

          return (
            <div key={plan.planId} className="mb-4">
              <button
                onClick={() => togglePlan(plan.planId)}
                className="w-full flex justify-between items-center bg-[#141417] border border-[#2C2C31] rounded-lg px-4 py-3 mb-3 cursor-pointer hover:bg-[#1C1C21] transition-colors"
              >
                <p className="text-white font-bold capitalize">{plan.planName}</p>
                <span className="text-[#9BA1A6]">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </span>
              </button>

              {!isCollapsed && (
                <div className="animate-fade-in-up">
                  {/* In-progress sessions */}
                  {plan.inProgress.map((s) => (
                    <div
                      key={s._id}
                      className="bg-[#141417] border-t-2 border-t-[#D3131B] border-x border-b border-[#2C2C31] rounded-lg p-4 mb-3 shadow-[0_0_15px_rgba(211,19,27,0.1)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold">{s.title}</p>
                        <span className="font-mono text-[10px] text-[#D3131B] uppercase tracking-wide">
                          In Progress
                        </span>
                      </div>
                      <p className="text-[#9BA1A6] text-sm mb-1">
                        Week {s.weekNumber} · Day {s.dayNumber}
                      </p>
                      <p className="text-[#9BA1A6] text-sm mb-3">
                        {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={() => navigate(`/session/${s._id}`)}
                        className="bg-[#D3131B] hover:bg-[#b01016] text-white px-6 py-2 rounded-lg cursor-pointer text-sm transition-colors"
                      >
                        Resume Workout
                      </button>
                    </div>
                  ))}

                  {/* Completed sessions grouped by week */}
                  {Array.from(byWeek.entries()).map(([week, sessions]) => (
                    <div key={week} className="mb-4">
                      <p className="font-mono text-[10px] text-[#9BA1A6] uppercase tracking-widest mb-2">
                        Week {week}
                      </p>
                      {sessions.map((s) => (
                        <div key={s._id} className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-bold">{s.title}</p>
                            <span className="font-mono text-xs text-[#9BA1A6]">
                              {new Date(s.completedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-[#9BA1A6] text-sm mb-2">Day {s.dayNumber}</p>
                          <div className="space-y-1">
                            {s.exercises.map((ex) => {
                              const completedSets = ex.sets.filter((set) => set.isCompleted);
                              return (
                                <p key={ex._id} className="text-[#9BA1A6] text-xs">
                                  {completedSets.length} set{completedSets.length !== 1 ? "s" : ""}{" "}
                                  logged
                                  {completedSets.length > 0 && (
                                    <span>
                                      {" "}· {completedSets[0].weight}lb × {completedSets[0].reps} reps
                                    </span>
                                  )}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Sessions;

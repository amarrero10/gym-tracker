import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

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
        <div className="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="px-3">
      <h1 className="text-[#F5F6F7] text-lg pt-10">Workouts</h1>
      <p className="text-[#9AA0AA]">Your training history</p>

      <hr className="w-87.5 h-px border-0 my-6 bg-[#2A2A33]" />

      {groupedByPlan.length === 0 ? (
        <div className="bg-[#14141A] rounded-2xl p-4">
          <p className="text-white pb-1">No workouts yet</p>
          <p className="text-[#9AA0AA] text-sm pb-4">
            Start a session from your plan to see your history here.
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="bg-[#7A1218] text-white w-1/2 px-10 py-4 rounded-2xl cursor-pointer"
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
                className="w-full flex justify-between items-center bg-[#14141A] rounded-2xl px-4 py-3 mb-3 cursor-pointer"
              >
                <p className="text-white text-base font-semibold capitalize">{plan.planName}</p>
                <span className="text-[#9AA0AA] text-xs">{isCollapsed ? "▼" : "▲"}</span>
              </button>

              {!isCollapsed && (
                <div>
                  {/* In-progress sessions */}
                  {plan.inProgress.map((s) => (
                    <div
                      key={s._id}
                      className="bg-[#14141A] rounded-2xl p-4 mb-3 border border-[#7A1218]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{s.title}</p>
                        <span className="text-xs text-[#7A1218] font-semibold uppercase tracking-wide">
                          In Progress
                        </span>
                      </div>
                      <p className="text-[#9AA0AA] text-sm mb-1">
                        Week {s.weekNumber} · Day {s.dayNumber}
                      </p>
                      <p className="text-[#9AA0AA] text-sm mb-3">
                        {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={() => navigate(`/session/${s._id}`)}
                        className="bg-[#7A1218] text-white px-6 py-2 rounded-xl cursor-pointer text-sm"
                      >
                        Resume Workout
                      </button>
                    </div>
                  ))}

                  {/* Completed sessions grouped by week */}
                  {Array.from(byWeek.entries()).map(([week, sessions]) => (
                    <div key={week} className="mb-4">
                      <p className="text-[#9AA0AA] text-xs uppercase tracking-widest mb-2">
                        Week {week}
                      </p>
                      {sessions.map((s) => (
                        <div key={s._id} className="bg-[#14141A] rounded-2xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium">{s.title}</p>
                            <span className="text-xs text-[#9AA0AA]">
                              {new Date(s.completedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-[#9AA0AA] text-sm mb-2">Day {s.dayNumber}</p>
                          <div className="space-y-1">
                            {s.exercises.map((ex) => {
                              const completedSets = ex.sets.filter((set) => set.isCompleted);
                              return (
                                <p key={ex._id} className="text-[#9AA0AA] text-xs">
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

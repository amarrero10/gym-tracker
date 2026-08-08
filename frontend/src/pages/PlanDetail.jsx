import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../api/axios";
import { ChevronUp, ChevronDown } from "lucide-react";

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [exerciseMap, setExerciseMap] = useState({});
  const [completedMap, setCompletedMap] = useState({});
  const [inProgressMap, setInProgressMap] = useState({});
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openWeeks, setOpenWeeks] = useState({});
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const planRes = await api.get(`/plans/${id}`, { headers });
        const planData = planRes.data;
        setPlan(planData);
        if (planData.weeks?.length) setOpenWeeks({ 0: true });

        // Collect unique exercise IDs across all weeks/days
        const exerciseIds = [
          ...new Set(
            planData.weeks.flatMap((w) =>
              w.days.flatMap((d) => d.exercises.map((e) => String(e.exerciseId?._id ?? e.exerciseId)))
            )
          ),
        ];

        const [exerciseResults, completedRes, sessionsRes, progressRes] = await Promise.all([
          Promise.all(exerciseIds.map((eid) => api.get(`/exercises/${eid}`, { headers }))),
          api.get(`/sessions/completed-sessions?planId=${id}`, { headers }),
          api.get(`/sessions`, { headers }),
          api.get(`/plans/${id}/progress`, { headers }),
        ]);

        // Build exerciseId -> exercise name map
        const map = {};
        exerciseResults.forEach((r) => {
          map[r.data._id] = r.data;
        });
        setExerciseMap(map);

        // Build { weekNumber: { dayNumber: true } } map from completed sessions
        const cMap = {};
        for (const s of completedRes.data.sessions ?? []) {
          if (!cMap[s.weekNumber]) cMap[s.weekNumber] = {};
          cMap[s.weekNumber][s.dayNumber] = true;
        }
        setCompletedMap(cMap);

        // Build { weekNumber: { dayNumber: sessionId } } map from in-progress sessions for this plan
        const ipMap = {};
        const planSessions = (sessionsRes.data.sessions ?? []).filter(
          (s) => (s.planId?._id ?? s.planId) === id && s.status === "in_progress"
        );
        for (const s of planSessions) {
          if (!ipMap[s.weekNumber]) ipMap[s.weekNumber] = {};
          ipMap[s.weekNumber][s.dayNumber] = s._id;
        }
        setInProgressMap(ipMap);

        setProgress(progressRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, token]);

  const toggleWeek = (i) => {
    setOpenWeeks((prev) => ({ ...prev, [i]: !prev[i] }));
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
      {/* Header */}
      <p className="text-white text-lg font-extrabold">{plan.name}</p>
      {plan.completedAt && (
        <p className="text-green-400 text-xs mt-1">
          Completed{" "}
          {new Date(plan.completedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      {/* Summary pills */}
      <div className="flex gap-2 mt-3 mb-6 flex-wrap">
        <span className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] bg-[#1C1C21] rounded px-3 py-1">
          {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"}
        </span>
        <span className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] bg-[#1C1C21] rounded px-3 py-1">
          {plan.daysPerWeek} days / week
        </span>
        <span className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] bg-[#1C1C21] rounded px-3 py-1">
          {plan.weeks.reduce(
            (acc, w) => acc + w.days.reduce((a, d) => a + d.exercises.length, 0),
            0
          )}{" "}
          total exercises
        </span>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[11px] text-[#9BA1A6] uppercase">Plan Progress</span>
            <span className="font-mono text-[11px] text-[#D3131B]">{progress.completedPercent}%</span>
          </div>
          <div className="w-full bg-[#1C1C21] rounded-full h-2 mb-2">
            <div
              className="bg-[#D3131B] h-2 rounded-full transition-all"
              style={{ width: `${progress.completedPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#9BA1A6]">
            <span>{progress.completedCount} of {progress.totalDays} sessions done</span>
          </div>
        </div>
      )}

      {/* Weeks */}
      {plan.weeks.map((week, wi) => (
        <div key={week._id} className="mb-3">
          <button
            onClick={() => toggleWeek(wi)}
            className="w-full flex justify-between items-center bg-[#141417] border border-[#2C2C31] rounded-lg px-4 py-3 cursor-pointer hover:bg-[#1C1C21] transition-colors"
          >
            <p className="text-white font-bold">Week {week.weekNumber}</p>
            <span className="text-[#9BA1A6] text-sm flex items-center gap-1">
              {week.days.length} {week.days.length === 1 ? "day" : "days"}{" "}
              {openWeeks[wi] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {openWeeks[wi] && (
            <div className="mt-2 flex flex-col gap-2 animate-fade-in-up">
              {week.days.map((day) => {
                const isDayCompleted = completedMap[week.weekNumber]?.[day.dayNumber];
                const isInProgress = inProgressMap[week.weekNumber]?.[day.dayNumber];
                return (
                  <div
                    key={day._id}
                    className={`bg-[#0C0C0E] border border-[#2C2C31] rounded-lg px-4 py-3 ${isInProgress ? "border-t-2 border-t-[#D3131B] shadow-[0_0_15px_rgba(211,19,27,0.1)]" : ""}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-white font-bold">{day.title}</p>
                      {isDayCompleted ? (
                        <span className="font-mono text-[10px] uppercase text-green-400 border border-green-900/50 bg-green-900/20 rounded px-2 py-0.5">
                          Completed
                        </span>
                      ) : isInProgress ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase text-[#D3131B] border border-[#D3131B]/50 rounded px-2 py-0.5">
                            In Progress
                          </span>
                          <button
                            onClick={() => navigate(`/session/${isInProgress}`)}
                            className="font-mono text-[10px] uppercase bg-[#D3131B] hover:bg-[#b01016] text-white rounded px-3 py-1 cursor-pointer transition active:scale-[0.98]"
                          >
                            Begin
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] rounded px-2 py-0.5">
                          Not done
                        </span>
                      )}
                    </div>
                    {day.exercises.map((ex) => {
                      const exercise = exerciseMap[String(ex.exerciseId?._id ?? ex.exerciseId)];
                      return (
                        <div
                          key={ex._id}
                          className="flex justify-between text-sm py-2 border-t border-[#1C1C21] first:border-0"
                        >
                          <span className="text-white capitalize">{exercise?.name ?? "—"}</span>
                          <span className="font-mono text-xs text-[#9BA1A6]">
                            {ex.targetSets} sets · {ex.targetRepsMin}–{ex.targetRepsMax} reps
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlanDetail;

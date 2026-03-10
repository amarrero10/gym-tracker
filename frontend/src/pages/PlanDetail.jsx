import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../api/axios";

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
        <div className="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="px-4 mt-10">
      {/* Header */}
      <p className="text-white text-lg font-semibold">{plan.name}</p>
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
        <span className="text-xs text-zinc-400 border border-zinc-700 rounded-full px-3 py-1">
          {plan.weeksCount} {plan.weeksCount === 1 ? "week" : "weeks"}
        </span>
        <span className="text-xs text-zinc-400 border border-zinc-700 rounded-full px-3 py-1">
          {plan.daysPerWeek} days / week
        </span>
        <span className="text-xs text-zinc-400 border border-zinc-700 rounded-full px-3 py-1">
          {plan.weeks.reduce(
            (acc, w) => acc + w.days.reduce((a, d) => a + d.exercises.length, 0),
            0
          )}{" "}
          total exercises
        </span>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="mb-6">
          <div className="w-full bg-[#2A2A33] rounded-full h-2 mb-2">
            <div
              className="bg-[#7A1218] h-2 rounded-full transition-all"
              style={{ width: `${progress.completedPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#9AA0AA]">
            <span>{progress.completedCount} of {progress.totalDays} sessions done</span>
            <span>{progress.completedPercent}%</span>
          </div>
        </div>
      )}

      <hr className="h-px border-0 mb-6 bg-[#2A2A33]" />

      {/* Weeks */}
      {plan.weeks.map((week, wi) => (
        <div key={week._id} className="mb-3">
          <button
            onClick={() => toggleWeek(wi)}
            className="w-full flex justify-between items-center bg-[#14141A] rounded-2xl px-4 py-3"
          >
            <p className="text-white font-medium">Week {week.weekNumber}</p>
            <span className="text-zinc-400 text-sm">
              {week.days.length} {week.days.length === 1 ? "day" : "days"}{" "}
              {openWeeks[wi] ? "▲" : "▼"}
            </span>
          </button>

          {openWeeks[wi] && (
            <div className="mt-2 pl-2 flex flex-col gap-2">
              {week.days.map((day) => {
                const isDayCompleted = completedMap[week.weekNumber]?.[day.dayNumber];
                return (
                  <div key={day._id} className="bg-zinc-900 rounded-2xl px-4 py-3">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-white font-medium">{day.title}</p>
                      {isDayCompleted ? (
                        <span className="text-xs text-green-400 border border-green-400 rounded-full px-2 py-0.5">
                          Completed
                        </span>
                      ) : inProgressMap[week.weekNumber]?.[day.dayNumber] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7A1218] border border-[#7A1218] rounded-full px-2 py-0.5">
                            In Progress
                          </span>
                          <button
                            onClick={() => navigate(`/session/${inProgressMap[week.weekNumber][day.dayNumber]}`)}
                            className="text-xs bg-[#7A1218] text-white rounded-full px-3 py-0.5 cursor-pointer"
                          >
                            Begin
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 border border-zinc-700 rounded-full px-2 py-0.5">
                          Not done
                        </span>
                      )}
                    </div>
                    {day.exercises.map((ex) => {
                      const exercise = exerciseMap[String(ex.exerciseId?._id ?? ex.exerciseId)];
                      return (
                        <div
                          key={ex._id}
                          className="flex justify-between text-sm py-2 border-t border-zinc-800 first:border-0"
                        >
                          <span className="text-white">{exercise?.name ?? "—"}</span>
                          <span className="text-zinc-400">
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

import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const SessionCalendar = ({ completedDates }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const dateSet = new Set(completedDates);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isCompleted = (d) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return dateSet.has(key);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="text-[#9AA0AA] hover:text-white px-2 py-1 cursor-pointer"
        >
          ‹
        </button>
        <p className="text-white text-sm font-medium">{monthLabel}</p>
        <button
          onClick={nextMonth}
          className="text-[#9AA0AA] hover:text-white px-2 py-1 cursor-pointer"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[#9AA0AA] text-xs">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`
              h-8 flex items-center justify-center rounded-lg text-xs
              ${d === null ? "" : isCompleted(d) ? "bg-green-600 text-white font-semibold" : isToday(d) ? "bg-[#2A2A33] text-white" : "text-[#9AA0AA]"}
            `}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
      {completedDates.length > 0 && (
        <p className="text-[#9AA0AA] text-xs mt-3 text-center">
          {completedDates.length} workout
          {completedDates.length !== 1 ? "s" : ""} completed
        </p>
      )}
    </div>
  );
};

const WeightChart = ({ entries }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const W = 300;
  const H = 120;
  const padX = 8;
  const padY = 12;

  const weights = entries.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const toX = (i) => padX + (i / (entries.length - 1)) * (W - padX * 2);
  const toY = (w) => padY + (1 - (w - minW) / range) * (H - padY * 2);

  const points = entries.map((e, i) => `${toX(i)},${toY(e.weight)}`).join(" ");
  const labelIndices = [
    0,
    Math.floor((entries.length - 1) / 2),
    entries.length - 1,
  ];

  const tooltip = (() => {
    if (hoveredIndex === null) return null;
    const entry = entries[hoveredIndex];
    const cx = toX(hoveredIndex);
    const cy = toY(entry.weight);
    const tipW = 72;
    const tipH = 34;
    const tipX = cx > W / 2 ? cx - tipW - 10 : cx + 10;
    const tipY = Math.max(padY, cy - tipH / 2);
    const dateLabel = new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return (
      <g>
        <rect
          x={tipX}
          y={tipY}
          width={tipW}
          height={tipH}
          rx="5"
          fill="#1E1E28"
        />
        <text
          x={tipX + tipW / 2}
          y={tipY + 13}
          fill="#F5F6F7"
          fontSize="9"
          textAnchor="middle"
          fontWeight="600"
        >
          {entry.weight} lbs
        </text>
        <text
          x={tipX + tipW / 2}
          y={tipY + 26}
          fill="#9AA0AA"
          fontSize="8"
          textAnchor="middle"
        >
          {dateLabel}
        </text>
      </g>
    );
  })();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      {[0, 0.5, 1].map((t) => {
        const y = padY + t * (H - padY * 2);
        return (
          <g key={t}>
            <line
              x1={padX}
              x2={W - padX}
              y1={y}
              y2={y}
              stroke="#2A2A33"
              strokeWidth="1"
            />
            <text
              x={padX}
              y={y - 3}
              fill="#9AA0AA"
              fontSize="8"
              textAnchor="start"
            >
              {(maxW - t * range).toFixed(1)}
            </text>
          </g>
        );
      })}

      <polyline
        points={`${toX(0)},${H - padY} ${points} ${toX(entries.length - 1)},${H - padY}`}
        fill="#7A1218"
        fillOpacity="0.15"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#7A1218"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {entries.map((e, i) => (
        <circle
          key={e._id}
          cx={toX(i)}
          cy={toY(e.weight)}
          r={hoveredIndex === i ? 5 : 3}
          fill="#7A1218"
          style={{ transition: "r 0.1s" }}
        />
      ))}

      {/* Invisible larger hit areas for easier touch/hover */}
      {entries.map((e, i) => (
        <circle
          key={`hit-${e._id}`}
          cx={toX(i)}
          cy={toY(e.weight)}
          r="14"
          fill="transparent"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          onTouchStart={(ev) => {
            ev.preventDefault();
            setHoveredIndex(i);
          }}
          onTouchEnd={() => setHoveredIndex(null)}
        />
      ))}

      {tooltip}

      {labelIndices.map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={H}
          fill="#9AA0AA"
          fontSize="8"
          textAnchor={
            i === 0 ? "start" : i === entries.length - 1 ? "end" : "middle"
          }
        >
          {new Date(entries[i].date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </text>
      ))}
    </svg>
  );
};

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planProgress, setPlanProgress] = useState(null);
  const [activePlanName, setActivePlanName] = useState("");
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [personalRecords, setPersonalRecords] = useState([]);

  // Weight tracking state
  const [completedDates, setCompletedDates] = useState([]);

  // Weight tracking state
  const [weightEntries, setWeightEntries] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightDate, setWeightDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editWeight, setEditWeight] = useState("");
  const [editDate, setEditDate] = useState("");

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);

      const [plansRes, sessionsRes, weightRes] = await Promise.all([
        api.get("/plans"),
        api.get("/sessions"),
        api.get("/weight"),
      ]);

      const plans = plansRes.data ?? [];
      const sessions = sessionsRes.data.sessions ?? [];
      setWeightEntries(weightRes.data.entries ?? []);

      // Active plan progress
      const activePlan = plans.find((p) => p.isActive);
      if (activePlan) {
        setActivePlanName(activePlan.name);
        const progressRes = await api.get(`/plans/${activePlan._id}/progress`);
        setPlanProgress(progressRes.data);
      }

      // Overall stats from all completed sessions
      const completed = sessions.filter((s) => s.status === "completed");
      setTotalWorkouts(completed.length);

      let volume = 0;
      const prMap = new Map();

      completed.forEach((session) => {
        session.exercises.forEach((ex) => {
          const exName = ex.exerciseId?.name ?? "Unknown";
          const exId = ex.exerciseId?._id ?? ex.exerciseId;

          ex.sets.forEach((set) => {
            if (!set.isCompleted) return;
            const w = set.weight ?? 0;
            const r = set.reps ?? 0;
            volume += w * r;

            const current = prMap.get(exId);
            if (
              !current ||
              w > current.maxWeight ||
              (w === current.maxWeight && r > current.maxReps)
            ) {
              prMap.set(exId, { name: exName, maxWeight: w, maxReps: r });
            }
          });
        });
      });

      setTotalVolume(volume);

      const dates = completed
        .filter((s) => s.completedAt)
        .map((s) => new Date(s.completedAt).toISOString().slice(0, 10));
      setCompletedDates(dates);

      const sorted = Array.from(prMap.values())
        .filter((pr) => pr.maxWeight > 0)
        .sort((a, b) => b.maxWeight - a.maxWeight)
        .slice(0, 10);
      setPersonalRecords(sorted);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightInput || !weightDate) return;
    try {
      setLoggingWeight(true);
      const res = await api.post("/weight", {
        weight: parseFloat(weightInput),
        unit: "lbs",
        date: weightDate,
      });
      setWeightEntries((prev) =>
        [...prev, res.data.entry].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        ),
      );
      setWeightInput("");
    } catch (err) {
      console.error("Error logging weight:", err);
    } finally {
      setLoggingWeight(false);
    }
  };

  const handleEditStart = (entry) => {
    setEditingId(entry._id);
    setEditWeight(String(entry.weight));
    setEditDate(new Date(entry.date).toISOString().slice(0, 10));
  };

  const handleEditSave = async (id) => {
    try {
      const res = await api.patch(`/weight/${id}`, {
        weight: parseFloat(editWeight),
        date: editDate,
      });
      setWeightEntries((prev) =>
        prev
          .map((e) => (e._id === id ? res.data.entry : e))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      );
      setEditingId(null);
    } catch (err) {
      console.error("Error updating weight entry:", err);
    }
  };

  const handleDeleteWeight = async (id) => {
    try {
      await api.delete(`/weight/${id}`);
      setWeightEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting weight entry:", err);
    }
  };

  const formatVolume = (lbs) => {
    if (lbs >= 1000) return `${(lbs / 1000).toFixed(1)}k`;
    return lbs.toLocaleString();
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });

  // Compute weight change from first to last entry
  const weightChange =
    weightEntries.length >= 2
      ? (
          weightEntries[weightEntries.length - 1].weight -
          weightEntries[0].weight
        ).toFixed(1)
      : null;

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
      <h1 className="text-[#F5F6F7] text-lg pt-10">Progress</h1>
      <p className="text-[#9AA0AA]">Your stats at a glance</p>

      <hr className="w-87.5 h-px border-0 my-6 bg-[#2A2A33]" />

      {/* Active plan completion */}
      {planProgress ? (
        <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
          <p className="text-[#9AA0AA] text-sm mb-1">Current Plan</p>
          <p className="text-white font-medium capitalize mb-3">
            {activePlanName}
          </p>
          <div className="w-full bg-[#2A2A33] rounded-full h-2 mb-2">
            <div
              className="bg-[#7A1218] h-2 rounded-full transition-all"
              style={{ width: `${planProgress.completedPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#9AA0AA] mt-1">
            <span>{planProgress.completedCount} sessions done</span>
            <span>{planProgress.completedPercent}%</span>
          </div>
          {planProgress.isComplete && (
            <p className="text-green-400 text-sm mt-2">Plan complete!</p>
          )}
        </div>
      ) : (
        <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
          <p className="text-[#9AA0AA] text-sm">No active plan</p>
          <p className="text-white text-sm mt-1">
            Set a plan as active to track your completion progress.
          </p>
        </div>
      )}

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#14141A] rounded-2xl p-4">
          <p className="text-[#9AA0AA] text-xs mb-1">Total Workouts</p>
          <p className="text-white text-2xl font-semibold">{totalWorkouts}</p>
        </div>
        <div className="bg-[#14141A] rounded-2xl p-4">
          <p className="text-[#9AA0AA] text-xs mb-1">Total Volume</p>
          <p className="text-white text-2xl font-semibold">
            {formatVolume(totalVolume)}
          </p>
          <p className="text-[#9AA0AA] text-xs">lbs lifted</p>
        </div>
      </div>

      {/* Weight Tracking */}
      <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium">Body Weight</p>
          {weightChange !== null && (
            <span
              className={`text-xs font-semibold ${
                parseFloat(weightChange) < 0
                  ? "text-green-400"
                  : parseFloat(weightChange) > 0
                    ? "text-red-400"
                    : "text-[#9AA0AA]"
              }`}
            >
              {parseFloat(weightChange) > 0 ? "+" : ""}
              {weightChange} {weightEntries[0]?.unit ?? "lbs"}
            </span>
          )}
        </div>

        {/* Chart — only when >= 5 entries */}
        {weightEntries.length >= 5 && (
          <div className="mb-4">
            <WeightChart entries={weightEntries} />
          </div>
        )}

        {/* Log form */}
        <form onSubmit={handleLogWeight} className="flex gap-2 mb-4">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="lbs"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="bg-[#1E1E28] text-white text-sm rounded-xl px-3 py-2 w-20 outline-none"
          />
          <input
            type="date"
            value={weightDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setWeightDate(e.target.value)}
            className="bg-[#1E1E28] text-[#9AA0AA] text-sm rounded-xl px-3 py-2 flex-1 outline-none"
          />
          <button
            type="submit"
            disabled={loggingWeight || !weightInput}
            className="bg-[#7A1218] text-white text-sm px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
          >
            Log
          </button>
        </form>

        {/* Entry list */}
        {weightEntries.length === 0 ? (
          <p className="text-[#9AA0AA] text-sm">
            No entries yet. Log your first weigh-in above.
          </p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {[...weightEntries].reverse().map((entry) =>
              editingId === entry._id ? (
                <div key={entry._id} className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="bg-[#1E1E28] text-white text-sm rounded-xl px-3 py-1.5 w-20 outline-none"
                  />
                  <input
                    type="date"
                    value={editDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="bg-[#1E1E28] text-[#9AA0AA] text-sm rounded-xl px-3 py-1.5 flex-1 outline-none"
                  />
                  <button
                    onClick={() => handleEditSave(entry._id)}
                    className="text-green-400 text-xs cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-[#9AA0AA] text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  key={entry._id}
                  className="flex items-center justify-between"
                >
                  <p className="text-[#9AA0AA] text-sm">
                    {formatDate(entry.date)}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-white text-sm font-medium">
                      {entry.weight} lbs
                    </p>
                    <button
                      onClick={() => handleEditStart(entry)}
                      className="text-[#9AA0AA] text-xs hover:text-white cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWeight(entry._id)}
                      className="text-[#9AA0AA] text-xs hover:text-red-400 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Personal Records */}
      <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
        <p className="text-white font-medium mb-3">Personal Records</p>
        {personalRecords.length === 0 ? (
          <p className="text-[#9AA0AA] text-sm">
            Complete some sets to see your best lifts here.
          </p>
        ) : (
          <div className="space-y-3">
            {personalRecords.map((pr, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-[#9AA0AA] text-sm capitalize">{pr.name}</p>
                <p className="text-white text-sm font-medium">
                  {pr.maxWeight} lb × {pr.maxReps}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Calendar */}
      <div className="bg-[#14141A] rounded-2xl p-4 mb-4">
        <p className="text-white font-medium mb-3">Workout Calendar</p>
        {completedDates.length === 0 ? (
          <p className="text-[#9AA0AA] text-sm">
            Complete a session to see it highlighted here.
          </p>
        ) : (
          <SessionCalendar completedDates={completedDates} />
        )}
      </div>
    </div>
  );
};

export default Progress;

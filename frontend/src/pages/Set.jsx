import { useNavigate, useParams } from "react-router";
import UseTimer from "../components/UseTimer";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ChevronLeft } from "lucide-react";

const Set = () => {
  const { sessionId, setId, exerciseId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);
  const [sets, setSets] = useState([]);
  const [completedSets, setCompletedSets] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSession(res.data);

        const ex = res.data.exercises.find((e) => e._id === setId);
        if (ex) setRowCount(ex.targetSets);

        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };

    getSession();
  }, [token, sessionId, setId]);

  useEffect(() => {
    if (!session?._id) return;
    const getExercise = async () => {
      try {
        const res = await api.get(`/exercises/${exerciseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExercise(res.data);
        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };
    getExercise();
  }, [token, exerciseId, session?._id]);

  const set = session?.exercises.find((e) => e._id === setId);

  const updateSet = (i, field, value) => {
    setSets((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeRow = (i) => {
    setSets((prev) => prev.filter((_, idx) => idx !== i));
    setCompletedSets((prev) => prev.filter((_, idx) => idx !== i));
    setRowCount((n) => Math.max(0, n - 1));
  };

  const completeExercise = async () => {
    try {
      for (let i = 0; i < sets.length; i++) {
        await api.post(
          `/sessions/${sessionId}/exercises/${setId}/sets`,
          {
            weight: sets[i].weight,
            reps: sets[i].reps,
            isCompleted: completedSets[i] ?? false,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setSets([]);
      setCompletedSets([]);
      toast.success("Set Completed!", { icon: "💪" });
      setTimeout(() => navigate(`/session/${sessionId}`), 1500);
    } catch (error) {
      console.error("Error saving sets:", error);
    }
  };

  const isComplete =
    rowCount > 0 &&
    completedSets.filter(Boolean).length >= rowCount &&
    sets.length >= rowCount &&
    !sets.some((s) => !s?.weight || !s?.reps);

  if (error)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-white">Error: {error.message}</div>
      </div>
    );
  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-t-4 border-[#7A1218] rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="bg-[#0D0D12]">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(`/session/${sessionId}`)}
          className="flex items-center gap-1 text-[#9AA0AA] mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-white text-xl font-semibold">{exercise?.name}</h1>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="bg-[#1E1E28] text-[#9AA0AA] text-sm rounded-full px-3 py-1">
            {set?.targetSets} {set?.targetSets === 1 ? "set" : "sets"}
          </span>
          <span className="bg-[#1E1E28] text-[#9AA0AA] text-sm rounded-full px-3 py-1">
            {set?.targetRepsMin}–{set?.targetRepsMax} reps
          </span>
          {set?.restSeconds && (
            <span className="bg-[#1E1E28] text-[#9AA0AA] text-sm rounded-full px-3 py-1">
              {set.restSeconds}s rest
            </span>
          )}
        </div>
      </div>

      {/* Set table */}
      <div className="px-4 pb-6">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2.5rem] gap-2 px-2 mb-2">
          <span className="text-zinc-500 text-xs text-center">Set</span>
          <span className="text-zinc-500 text-xs text-center">Reps</span>
          <span className="text-zinc-500 text-xs text-center">Weight</span>
          <span className="text-zinc-500 text-xs text-center">Done</span>
          <span></span>
        </div>

        <div className="space-y-2">
          {Array.from({ length: rowCount }, (_, i) => {
            const isDone = completedSets[i];
            return (
              <div
                key={i}
                className={`grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2.5rem] gap-2 items-center px-2 py-2 rounded-2xl transition-colors ${
                  isDone ? "bg-[#7A1218]/20" : "bg-[#14141A]"
                }`}
              >
                {/* Set number */}
                <span
                  className={`text-sm font-medium text-center ${isDone ? "text-[#7A1218]" : "text-zinc-400"}`}
                >
                  {i + 1}
                </span>

                {/* Reps input */}
                <input
                  type="number"
                  inputMode="numeric"
                  name="reps"
                  value={sets[i]?.reps ?? ""}
                  onChange={(e) => updateSet(i, "reps", e.target.value)}
                  placeholder="–"
                  min="0"
                  className="bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center text-base py-3 w-full outline-none focus:border-[#7A1218]"
                />

                {/* Weight input */}
                <input
                  type="number"
                  inputMode="decimal"
                  name="weight"
                  value={sets[i]?.weight ?? ""}
                  onChange={(e) => updateSet(i, "weight", e.target.value)}
                  placeholder="–"
                  min="0"
                  step="2.5"
                  className="bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center text-base py-3 w-full outline-none focus:border-[#7A1218]"
                />

                {/* Done toggle */}
                <button
                  onClick={() =>
                    setCompletedSets((prev) => {
                      const next = [...prev];
                      next[i] = !next[i];
                      return next;
                    })
                  }
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold transition-colors cursor-pointer ${
                    isDone
                      ? "bg-[#7A1218] text-white"
                      : "border border-zinc-600 text-zinc-500"
                  }`}
                >
                  {isDone ? "✓" : ""}
                </button>

                {/* Remove row */}
                <button
                  onClick={() => removeRow(i)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 text-xl cursor-pointer rounded-xl"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Add set button */}
        <button
          onClick={() => setRowCount((n) => n + 1)}
          className="mt-3 w-full py-4 text-[#9AA0AA] text-sm border border-zinc-700 rounded-2xl cursor-pointer"
        >
          + Add Set
        </button>

        <button
          onClick={completeExercise}
          disabled={!isComplete}
          className="mt-4 w-full py-4 rounded-2xl text-white text-base font-semibold bg-[#7A1218] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Complete Exercise
        </button>
      </div>

      <UseTimer repSeconds={set?.restSeconds} />
      <Toaster position="top-center" />
    </div>
  );
};

export default Set;

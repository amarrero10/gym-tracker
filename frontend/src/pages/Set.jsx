import { useNavigate, useParams } from "react-router";
import UseTimer from "../components/UseTimer";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ChevronLeft, Plus, Check, X } from "lucide-react";

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
        <div className="h-12 w-12 border-4 border-t-4 border-[#D3131B] rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="bg-[#0C0C0E] animate-fade-in-up">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(`/session/${sessionId}`)}
          className="flex items-center gap-1 text-[#9BA1A6] hover:text-white mb-4 cursor-pointer transition active:scale-[0.98]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-white text-xl font-extrabold uppercase tracking-tight">
          {exercise?.name}
        </h1>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="bg-[#1C1C21] border border-[#2C2C31] text-[#9BA1A6] font-mono text-xs rounded px-3 py-1">
            {set?.targetSets} {set?.targetSets === 1 ? "set" : "sets"}
          </span>
          <span className="bg-[#1C1C21] border border-[#2C2C31] text-[#9BA1A6] font-mono text-xs rounded px-3 py-1">
            {set?.targetRepsMin}–{set?.targetRepsMax} reps
          </span>
          {set?.restSeconds && (
            <span className="bg-[#1C1C21] border border-[#2C2C31] text-[#9BA1A6] font-mono text-xs rounded px-3 py-1">
              {set.restSeconds}s rest
            </span>
          )}
        </div>
      </div>

      {/* Set table */}
      <div className="px-4 pb-6">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2.5rem] gap-2 px-2 mb-2">
          <span className="font-mono text-[10px] text-[#9BA1A6] uppercase text-center">Set</span>
          <span className="font-mono text-[10px] text-[#9BA1A6] uppercase text-center">Reps</span>
          <span className="font-mono text-[10px] text-[#9BA1A6] uppercase text-center">Weight</span>
          <span className="font-mono text-[10px] text-[#9BA1A6] uppercase text-center">Done</span>
          <span></span>
        </div>

        <div className="space-y-2">
          {Array.from({ length: rowCount }, (_, i) => {
            const isDone = completedSets[i];
            return (
              <div
                key={i}
                className={`grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2.5rem] gap-2 items-center px-2 py-2 rounded-lg border transition-colors ${
                  isDone ? "bg-[#D3131B]/10 border-[#D3131B]/40" : "bg-[#141417] border-[#2C2C31]"
                }`}
              >
                {/* Set number */}
                <span
                  className={`font-mono text-sm font-bold text-center ${isDone ? "text-[#D3131B]" : "text-[#9BA1A6]"}`}
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
                  className="bg-[#1C1C21] border border-[#2C2C31] rounded text-white text-center text-base py-3 w-full outline-none focus:border-[#D3131B] transition-all"
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
                  className="bg-[#1C1C21] border border-[#2C2C31] rounded text-white text-center text-base py-3 w-full outline-none focus:border-[#D3131B] transition-all"
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
                  className={`w-12 h-12 rounded flex items-center justify-center font-semibold transition active:scale-[0.98] cursor-pointer ${
                    isDone
                      ? "bg-[#D3131B] text-white"
                      : "border border-[#2C2C31] text-[#9BA1A6]"
                  }`}
                >
                  {isDone && <Check className="w-5 h-5" />}
                </button>

                {/* Remove row */}
                <button
                  onClick={() => removeRow(i)}
                  className="w-10 h-10 flex items-center justify-center text-[#9BA1A6] hover:text-white cursor-pointer rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add set button */}
        <button
          onClick={() => setRowCount((n) => n + 1)}
          className="mt-3 w-full py-4 text-[#9BA1A6] text-sm border border-[#2C2C31] rounded-lg cursor-pointer hover:bg-[#1C1C21] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>

        <button
          onClick={completeExercise}
          disabled={!isComplete}
          className="mt-4 w-full py-4 rounded-lg text-white text-base font-bold bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition active:scale-[0.98] uppercase tracking-wide"
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

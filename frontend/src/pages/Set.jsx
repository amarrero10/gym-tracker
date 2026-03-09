import { useNavigate, useParams } from "react-router";
import UseTimer from "../components/UseTimer";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const Set = () => {
  const { sessionId, setId, exerciseId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);
  const [sets, setSets] = useState([]);
  const [completedSets, setCompletedSets] = useState([]);
  const [extraSets, setExtraSets] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSession(res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };

    getSession();
  }, [token, sessionId]);

  useEffect(() => {
    if (!session?._id) return;
    const getExercises = async () => {
      try {
        const res = await api.get(`/exercises/${exerciseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setExercise(res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };

    getExercises();
  }, [token, exerciseId, session?._id]);

  const set = session?.exercises.find((e) => e._id === setId);

  const updateSet = (i, field, value) => {
    setSets((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
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
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error("Error saving sets:", error);
    }
  };

  if (error)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className=" text-white">Error: {error.message}</div>
      </div>
    );
  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className=" px-4 mt-10">
      <div className=" text-white">{exercise?.name}</div>
      <div>
        <p className=" text-[#9AA0AA]">
          Target: {set?.targetSets} {set?.targetSets > 1 ? "sets" : "set"} •{" "}
          {set?.targetRepsMin}-{set?.targetRepsMax} reps
        </p>
      </div>
      {set?.restSeconds && (
        <div>
          <p className=" text-[#9AA0AA]">Rest: {set?.restSeconds} sec</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-2xl px-2 py-2 font-sans text-white mt-6">
        <div className="grid grid-cols-4 mb-3 text-zinc-400 text-sm text-center">
          <span>Set</span>
          <span>Reps</span>
          <span>Weight</span>
          <span>Done</span>
        </div>
        {Array.from({ length: (set?.targetSets ?? 0) + extraSets }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 mb-3 text-zinc-400 text-sm text-center"
          >
            <span className="text-zinc-400 text-sm">{i + 1}</span>

            <input
              type="number"
              name="reps"
              value={sets[i]?.reps ?? ""}
              onChange={(e) => updateSet(i, "reps", e.target.value)}
              placeholder="0"
              className="bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center py-2 mr-2 outline-none"
            />

            <input
              type="number"
              placeholder="0"
              name="weight"
              value={sets[i]?.weight ?? ""}
              onChange={(e) => updateSet(i, "weight", e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center py-2 outline-none"
            />

            <button
              className={`${completedSets[i] ? "bg-red-900 border border-zinc-700 rounded-xl w-10 h-10 flex items-center justify-center text-white mx-auto" : "border-bg-slate-400 border rounded-xl w-10 h-10 flex items-center justify-center mx-auto"}`}
              onClick={() => {
                setCompletedSets((prev) => {
                  const next = [...prev];
                  next[i] = !next[i];
                  return next;
                });
              }}
            >
              {completedSets[i] ? "✓" : " "}
            </button>
          </div>
        ))}

        <button
          onClick={() => setExtraSets((n) => n + 1)}
          className="w-full mt-1 mb-1 py-2 text-zinc-400 text-sm border border-zinc-700 rounded-xl"
        >
          + Add Set
        </button>
      </div>

      <button
        onClick={completeExercise}
        disabled={
          completedSets.filter(Boolean).length < (set?.targetSets ?? 0) + extraSets ||
          sets.length < (set?.targetSets ?? 0) + extraSets ||
          sets.some((s) => !s?.weight || !s?.reps)
        }
        className="mt-4 w-full py-3 rounded-xl text-white font-semibold bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Complete Exercise
      </button>

      <UseTimer repSeconds={set?.restSeconds} />
      <Toaster />
    </div>
  );
};

export default Set;

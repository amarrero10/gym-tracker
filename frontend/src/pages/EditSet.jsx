import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Check, X } from "lucide-react";

const EditSet = () => {
  const { sessionId, sessionExerciseId } = useParams();
  const [session, setSession] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessionData = res.data;
        setSession(sessionData);
        const exercise = sessionData.exercises.find((e) => e._id === sessionExerciseId);
        setSets(exercise?.sets.map((s) => ({ ...s })) ?? []);
        setLoading(false);
      } catch (err) {
        setError(err);
      }
    };
    fetchSession();
  }, [sessionId, sessionExerciseId, token]);

  const updateSet = (i, field, value) => {
    setSets((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const deleteSet = async (setId) => {
    try {
      await api.delete(
        `/sessions/${sessionId}/exercises/${sessionExerciseId}/sets/${setId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSets((prev) => prev.filter((s) => s._id !== setId));
      toast.success("Set removed.");
    } catch (err) {
      console.error("Error deleting set:", err);
      toast.error("Failed to remove set.");
    }
  };

  const saveChanges = async () => {
    try {
      for (const s of sets) {
        await api.patch(
          `/sessions/${sessionId}/exercises/${sessionExerciseId}/sets/${s._id}`,
          { weight: s.weight, reps: s.reps, isCompleted: s.isCompleted },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      toast.success("Changes saved!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("Error saving changes:", err);
      toast.error("Failed to save changes.");
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

  const exercise = session?.exercises.find((e) => e._id === sessionExerciseId);

  return (
    <div className="px-4 pt-10 animate-fade-in-up">
      <h1 className="text-white text-lg font-extrabold mb-1">Edit Sets</h1>
      <p className="text-[#9BA1A6] text-sm mb-6">
        {exercise?.targetSets} sets • {exercise?.targetRepsMin}-{exercise?.targetRepsMax} reps
      </p>

      {sets.length === 0 ? (
        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg px-4 py-6 text-center">
          <p className="text-[#9BA1A6] text-sm">No sets logged.</p>
        </div>
      ) : (
        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg px-2 py-2 text-white">
          <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2rem] mb-3 font-mono text-[10px] text-[#9BA1A6] uppercase text-center gap-1">
            <span>Set</span>
            <span>Weight</span>
            <span>Reps</span>
            <span>Done</span>
            <span></span>
          </div>
          {sets.map((s, i) => (
            <div
              key={s._id}
              className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2rem] mb-3 text-sm text-center gap-1 items-center"
            >
              <span className="font-mono text-[#9BA1A6] text-sm">{i + 1}</span>
              <input
                type="number"
                value={s.weight ?? ""}
                onChange={(e) => updateSet(i, "weight", e.target.value)}
                className="bg-[#1C1C21] border border-[#2C2C31] rounded text-white text-center py-2 outline-none focus:border-[#D3131B] transition-all"
              />
              <input
                type="number"
                value={s.reps ?? ""}
                onChange={(e) => updateSet(i, "reps", e.target.value)}
                className="bg-[#1C1C21] border border-[#2C2C31] rounded text-white text-center py-2 outline-none focus:border-[#D3131B] transition-all"
              />
              <button
                className={`rounded w-10 h-10 flex items-center justify-center mx-auto cursor-pointer transition active:scale-[0.98] ${s.isCompleted ? "bg-[#D3131B] text-white" : "border border-[#2C2C31] text-[#9BA1A6]"}`}
                onClick={() => updateSet(i, "isCompleted", !s.isCompleted)}
              >
                {s.isCompleted && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteSet(s._id)}
                className="text-[#9BA1A6] hover:text-red-400 cursor-pointer flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-lg text-white font-bold border border-[#2C2C31] cursor-pointer hover:bg-[#1C1C21] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={saveChanges}
          disabled={sets.length === 0}
          className="flex-1 py-3 rounded-lg text-white font-bold bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 cursor-pointer transition active:scale-[0.98]"
        >
          Save Changes
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default EditSet;

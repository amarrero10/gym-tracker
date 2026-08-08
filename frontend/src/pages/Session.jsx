import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api/axios";
import useExercises from "../hooks/useExercises";
import { Dumbbell, ArrowRight } from "lucide-react";

const Session = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exerciseDetails, setExerciseDetails] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Substitute state
  const [substituteFor, setSubstituteFor] = useState(null); // sessionExercise._id
  const { exercises: allExercises, loading: loadingExercises, refetch: fetchAllExercises } = useExercises({ lazy: true });
  const [exerciseSearch, setExerciseSearch] = useState("");

  const fetchSession = useCallback(async () => {
    try {
      const res = await api.get(`/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSession(res.data);
      setLoading(false);
    } catch (error) {
      setError(error);
    }
  }, [id, token]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchSession();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchSession]);

  useEffect(() => {
    if (!session?._id) return;

    const getExercises = async () => {
      try {
        setLoading(true);
        const exerciseIds = (session.exercises ?? []).map((e) =>
          String(e.exerciseId?._id ?? e.exerciseId ?? e._id),
        );
        const results = await Promise.all(exerciseIds.map((eid) => api.get(`/exercises/${eid}`)));
        setExerciseDetails(results.map((r) => r.data));
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    getExercises();
  }, [session?._id, session?.exercises]);

  const goToSet = (setId, exerciseId) => {
    navigate(`/session/${session?._id}/set/${setId}/exercise/${exerciseId}`);
  };

  const allDone = session?.exercises.every(
    (e) => e.skipped || e.sets.length >= e.targetSets,
  );

  const finishSession = async () => {
    try {
      await api.post(
        `/sessions/${id}/finish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/");
    } catch (error) {
      console.error("Error finishing session:", error);
    }
  };

  const handleSkipExercise = async (sessionExerciseId) => {
    try {
      const res = await api.patch(
        `/sessions/${id}/exercises/${sessionExerciseId}/skip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSession(res.data);
    } catch (err) {
      console.error("Error skipping exercise:", err);
    }
  };

  const openSubstitute = async (sessionExerciseId) => {
    setSubstituteFor(sessionExerciseId);
    setExerciseSearch("");
    if (allExercises.length === 0) {
      await fetchAllExercises();
    }
  };

  const handleSubstitute = async (newExerciseId) => {
    try {
      const res = await api.patch(
        `/sessions/${id}/exercises/${substituteFor}/substitute`,
        { newExerciseId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSession(res.data);
      setSubstituteFor(null);
      setExerciseSearch("");
    } catch (err) {
      console.error("Error substituting exercise:", err);
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

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  );

  return (
    <div className="px-4 pt-10 animate-fade-in-up">
      <div>
        <h1 className="text-white text-2xl font-extrabold tracking-tight">Active Workout</h1>
        <p className="text-[#9BA1A6] mt-1">{session.title}</p>
        <div className="h-px bg-[#2C2C31] my-6" />
      </div>
      <p className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase mb-4">Up next</p>

      {exerciseDetails.map((e, i) => {
        const sessionExercise = session?.exercises[i];
        const isCompleted = sessionExercise?.sets.length >= sessionExercise?.targetSets;
        const isSkipped = sessionExercise?.skipped;

        return (
          <div
            className={`bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 ${!isSkipped && !isCompleted ? "border-t-2 border-t-[#D3131B]" : ""}`}
            key={e._id}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-white font-bold uppercase tracking-tight">{e.name}</p>
              <div className="flex items-center gap-2">
                {isSkipped ? (
                  <span className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] rounded px-2 py-0.5">
                    Skipped
                  </span>
                ) : isCompleted ? (
                  <>
                    <span className="font-mono text-[10px] uppercase text-green-400 border border-green-900/50 bg-green-900/20 rounded px-2 py-0.5">
                      Completed
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/session/${id}/exercise/${sessionExercise._id}/edit`)
                      }
                      className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] rounded px-2 py-0.5 cursor-pointer hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <Dumbbell className="w-5 h-5 text-[#9BA1A6]" />
                )}
              </div>
            </div>

            <p className="text-[#9BA1A6] text-sm">{sessionExercise?.targetSets} sets</p>
            <p className="text-[#9BA1A6] text-sm mb-3">
              {sessionExercise?.targetRepsMin} - {sessionExercise?.targetRepsMax} reps
            </p>

            {!isSkipped && !isCompleted && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => session?._id && goToSet(sessionExercise._id, e._id)}
                  className="bg-[#D3131B] hover:bg-[#b01016] text-white font-bold py-2 px-4 rounded cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-2 flex-grow"
                >
                  Log <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSkipExercise(sessionExercise._id)}
                  className="font-mono text-[10px] uppercase text-white border border-[#2C2C31] rounded px-3 py-2 cursor-pointer hover:bg-[#1C1C21] transition-colors"
                >
                  Skip move
                </button>
                <button
                  onClick={() => openSubstitute(sessionExercise._id)}
                  className="font-mono text-[10px] uppercase text-white border border-[#2C2C31] rounded px-3 py-2 cursor-pointer hover:bg-[#1C1C21] transition-colors"
                >
                  Substitute
                </button>
              </div>
            )}

            {isCompleted && !isSkipped && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[#9BA1A6] text-sm">Done ✓</span>
                <button
                  onClick={() => openSubstitute(sessionExercise._id)}
                  className="font-mono text-[10px] uppercase text-[#9BA1A6] border border-[#2C2C31] rounded px-3 py-1 cursor-pointer hover:text-white transition-colors"
                >
                  Substitute
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={finishSession}
        disabled={!allDone}
        className="mt-2 w-full py-4 rounded-lg text-white font-bold bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition active:scale-[0.98] uppercase tracking-wide"
      >
        Complete Workout
      </button>

      {!allDone && (
        <button
          onClick={finishSession}
          className="mt-3 w-full py-4 rounded-lg text-[#D3131B] text-sm border border-[#2C2C31] cursor-pointer hover:bg-[#1C1C21] transition-colors uppercase tracking-wide font-bold"
        >
          Skip Workout
        </button>
      )}

      {/* Substitute exercise full-screen overlay */}
      {substituteFor && (
        <div className="fixed inset-0 bg-[#0C0C0E] z-50 flex flex-col animate-fade-in-up">
          <div className="px-4 pt-10 pb-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-white text-lg font-bold">Select Exercise</p>
              <button
                onClick={() => setSubstituteFor(null)}
                className="text-[#9BA1A6] hover:text-white text-sm cursor-pointer transition active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full bg-[#1C1C21] border border-[#2C2C31] text-white rounded px-4 py-3 outline-none text-sm focus:border-[#D3131B] transition-all"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {loadingExercises ? (
              <div className="flex justify-center pt-10">
                <div className="h-8 w-8 border-4 border-t-4 border-[#D3131B] rounded-full animate-spin" />
              </div>
            ) : filteredExercises.length === 0 ? (
              <p className="text-[#9BA1A6] text-sm text-center pt-10">No exercises found</p>
            ) : (
              filteredExercises.map((ex) => (
                <button
                  key={ex._id}
                  onClick={() => handleSubstitute(ex._id)}
                  className="w-full text-left bg-[#141417] border border-[#2C2C31] rounded px-4 py-3 mb-2 cursor-pointer hover:bg-[#1C1C21] transition-colors"
                >
                  <p className="text-white text-sm">{ex.name}</p>
                  {ex.muscleGroup && (
                    <p className="text-[#9BA1A6] text-xs mt-0.5">{ex.muscleGroup}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Session;

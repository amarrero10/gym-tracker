import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api/axios";

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
  const [allExercises, setAllExercises] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [loadingExercises, setLoadingExercises] = useState(false);

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
      setLoadingExercises(true);
      try {
        const res = await api.get("/exercises");
        setAllExercises(res.data);
      } finally {
        setLoadingExercises(false);
      }
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
        <div className="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  );

  return (
    <div className="px-4 mt-10">
      <div>
        <p className="text-white">Workout</p>
        <p className="text-[#9AA0AA]">{session.title}</p>
        <hr className="w-87.5 h-px border-0 my-6 bg-[#2A2A33]" />
      </div>
      <p className="text-white mb-6">Up next</p>

      {exerciseDetails.map((e, i) => {
        const sessionExercise = session?.exercises[i];
        const isCompleted = sessionExercise?.sets.length >= sessionExercise?.targetSets;
        const isSkipped = sessionExercise?.skipped;

        return (
          <div className="bg-[#14141A] rounded-2xl p-4 mb-4" key={e._id}>
            <div className="flex justify-between items-center mb-1">
              <p className="text-white">{e.name}</p>
              <div className="flex items-center gap-2">
                {isSkipped ? (
                  <span className="text-xs text-zinc-400 border border-zinc-600 rounded-full px-2 py-0.5">
                    Skipped
                  </span>
                ) : isCompleted ? (
                  <>
                    <span className="text-xs text-green-400 border border-green-400 rounded-full px-2 py-0.5">
                      Completed
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/session/${id}/exercise/${sessionExercise._id}/edit`)
                      }
                      className="text-xs text-zinc-400 border border-zinc-600 rounded-full px-2 py-0.5 cursor-pointer"
                    >
                      Edit
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <p className="text-[#9AA0AA] text-sm">{sessionExercise?.targetSets} sets</p>
            <p className="text-[#9AA0AA] text-sm mb-3">
              {sessionExercise?.targetRepsMin} - {sessionExercise?.targetRepsMax} reps
            </p>

            {!isSkipped && !isCompleted && (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => session?._id && goToSet(sessionExercise._id, e._id)}
                  className="text-[#9AA0AA]"
                >
                  Log →
                </button>
                <button
                  onClick={() => handleSkipExercise(sessionExercise._id)}
                  className="text-xs text-zinc-400 border border-zinc-600 rounded-full px-3 py-1 cursor-pointer"
                >
                  Skip move
                </button>
                <button
                  onClick={() => openSubstitute(sessionExercise._id)}
                  className="text-xs text-zinc-400 border border-zinc-600 rounded-full px-3 py-1 cursor-pointer"
                >
                  Substitute
                </button>
              </div>
            )}

            {isCompleted && !isSkipped && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[#9AA0AA] text-sm">Done ✓</span>
                <button
                  onClick={() => openSubstitute(sessionExercise._id)}
                  className="text-xs text-zinc-400 border border-zinc-600 rounded-full px-3 py-1 cursor-pointer"
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
        className="mt-2 w-full py-3 rounded-xl text-white font-semibold bg-[#7A1218] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Complete Workout
      </button>

      {!allDone && (
        <button
          onClick={finishSession}
          className="mt-3 w-full py-3 rounded-xl text-zinc-400 text-sm border border-zinc-700 cursor-pointer"
        >
          Skip Workout
        </button>
      )}

      {/* Substitute exercise full-screen overlay */}
      {substituteFor && (
        <div className="fixed inset-0 bg-[#0D0D12] z-50 flex flex-col">
          <div className="px-4 pt-10 pb-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-white text-lg font-semibold">Select Exercise</p>
              <button
                onClick={() => setSubstituteFor(null)}
                className="text-[#9AA0AA] text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full bg-[#14141A] text-white rounded-xl px-4 py-3 outline-none text-sm"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {loadingExercises ? (
              <div className="flex justify-center pt-10">
                <div className="h-8 w-8 border-4 border-t-4 border-[#7A1218] rounded-full animate-spin" />
              </div>
            ) : filteredExercises.length === 0 ? (
              <p className="text-[#9AA0AA] text-sm text-center pt-10">No exercises found</p>
            ) : (
              filteredExercises.map((ex) => (
                <button
                  key={ex._id}
                  onClick={() => handleSubstitute(ex._id)}
                  className="w-full text-left bg-[#14141A] rounded-xl px-4 py-3 mb-2 cursor-pointer"
                >
                  <p className="text-white text-sm">{ex.name}</p>
                  {ex.muscleGroup && (
                    <p className="text-[#9AA0AA] text-xs mt-0.5">{ex.muscleGroup}</p>
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

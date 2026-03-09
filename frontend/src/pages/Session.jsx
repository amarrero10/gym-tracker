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

        const results = await Promise.all(exerciseIds.map((id) => api.get(`/exercises/${id}`)));

        const exerciseDetails = results.map((r) => r.data);

        // store separately (recommended)
        setExerciseDetails(exerciseDetails);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    getExercises();
  }, [session?._id, session?.exercises]);

  console.log("EXERCISES", exerciseDetails);

  const goToSet = (setId, exerciseId) => {
    navigate(`/session/${session?._id}/set/${setId}/exercise/${exerciseId}`);
  };

  const allExercisesCompleted = session?.exercises.every(
    (e) => e.sets.length >= e.targetSets,
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
      <div>
        <p className=" text-white">Workout</p>
        <p className=" text-[#9AA0AA]">{session.title}</p>
        <hr className="w-87.5 h-px border-0 my-6 bg-[#2A2A33]" />
      </div>
      <p className=" text-white mb-6">Up next</p>

      {exerciseDetails.map((e, i) => {
        const sessionExercise = session?.exercises[i];
        const isCompleted = sessionExercise?.sets.length >= sessionExercise?.targetSets;
        return (
          <div className="bg-[#14141A] rounded-2xl p-4 mb-4" key={e._id}>
            <div className="flex justify-between items-center">
              <p className="text-white">{e.name}</p>
              {isCompleted && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400 border border-green-400 rounded-full px-2 py-0.5">
                    Completed
                  </span>
                  <button
                    onClick={() => navigate(`/session/${id}/exercise/${sessionExercise._id}/edit`)}
                    className="text-xs text-zinc-400 border border-zinc-600 rounded-full px-2 py-0.5"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <p className="text-[#9AA0AA]">{sessionExercise?.targetSets} sets</p>
            <p className="text-[#9AA0AA]">
              {sessionExercise?.targetRepsMin} - {sessionExercise?.targetRepsMax} reps
            </p>
            <button
              disabled={!session?._id || isCompleted}
              onClick={() => session?._id && goToSet(sessionExercise._id, e._id)}
              className="text-[#9AA0AA] disabled:opacity-40"
            >
              {isCompleted ? "Done ✓" : "Log →"}
            </button>
          </div>
        );
      })}

      <button
        onClick={finishSession}
        disabled={!allExercisesCompleted}
        className="mt-2 w-full py-3 rounded-xl text-white font-semibold bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Complete Workout
      </button>
    </div>
  );
};

export default Session;

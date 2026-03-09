import { useParams } from "react-router";
import UseTimer from "../components/UseTimer";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Set = () => {
  const { sessionId, setId, exerciseId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);
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

  console.log("SESSION ", set);
  console.log("Exercise", exercise);

  const time = new Date();
  time.setSeconds(time.getSeconds() + 150);

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
    <div className=" px-4">
      <div className=" text-white">{exercise?.name}</div>
      <div className=" text-[#9AA0AA]">
        Target: {set?.targetSets} {set?.targetSets > 1 ? "sets" : "set"} • {set?.targetRepsMin}-
        {set?.targetRepsMax} reps
      </div>
      <div className="bg-zinc-900 rounded-2xl px-2 py-2 font-sans text-white">
        <div className="grid grid-cols-4 mb-3 text-zinc-400 text-sm text-center">
          <span>Set</span>
          <span>Weight</span>
          <span>Reps</span>
          <span>Done</span>
        </div>
        {Array.from({ length: set?.targetSets }, (_, i) => (
          <div className="grid grid-cols-4 mb-3 text-zinc-400 text-sm text-center">
            <span className="text-zinc-400 text-sm">{i + 1}</span>

            <input
              type="number"
              defaultValue={185}
              className="bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center py-2 mr-2 outline-none"
            />

            <input
              type="number"
              defaultValue={6}
              className="bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center py-2 outline-none"
            />

            <button className="bg-red-900 border border-zinc-700 rounded-xl w-10 h-10 flex items-center justify-center text-white mx-auto">
              ✓
            </button>
          </div>
        ))}
      </div>
      <div className=" bg-zinc-900"></div>
      <UseTimer expiryTimestamp={time} />
    </div>
  );
};

export default Set;

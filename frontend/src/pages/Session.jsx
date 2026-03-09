import { useEffect, useState } from "react";
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

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await api.get(`/sessions/${id}`, {
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
  }, [token, id]);

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

      {exerciseDetails.map((e, i) => (
        <div className="bg-[#14141A] rounded-2xl p-4 mb-4" key={e._id}>
          <p className=" text-white"> {e.name} </p>
          <p className="text-[#9AA0AA]">{session?.exercises[i].targetSets} sets</p>
          <p className="text-[#9AA0AA]">
            {" "}
            {session?.exercises[i].targetRepsMin} - {session?.exercises[i].targetRepsMax} reps
          </p>
          <button
            disabled={!session?._id}
            onClick={() => session?._id && goToSet(session?.exercises[i]._id, e._id)}
            className="text-[#9AA0AA]"
          >
            Log →
          </button>
        </div>
      ))}
    </div>
  );
};

export default Session;

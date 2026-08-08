import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

export default function useExercises({ lazy = false } = {}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(!lazy);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/exercises");
      setExercises(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!lazy) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { exercises, setExercises, loading, refetch };
}

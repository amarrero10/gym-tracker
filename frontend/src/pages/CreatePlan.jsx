import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";

const defaultExerciseForm = {
  exerciseId: "",
  targetSets: "",
  targetRepsMin: "",
  targetRepsMax: "",
  restSeconds: "",
  notes: "",
};

const CreatePlan = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Step 1 state
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [weeksCount, setWeeksCount] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState(1);
  const [isActive, setIsActive] = useState(false);

  // Step 2 state
  const [weeks, setWeeks] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState("");

  // Per-day exercise adder: { weekIdx, dayIdx } or null
  const [addingTo, setAddingTo] = useState(null);
  const [exerciseForm, setExerciseForm] = useState(defaultExerciseForm);

  // Inline create-exercise sub-form
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [newExForm, setNewExForm] = useState({ name: "", muscleGroup: "", movementPattern: "", equipment: "" });
  const [newExError, setNewExError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get("/exercises", { headers });
        setExercises(res.data);
      } catch (err) {
        console.error("Error fetching exercises:", err);
      }
    };
    fetchExercises();
  }, []);

  const goToStep2 = () => {
    if (!name.trim()) return;
    const generated = Array.from({ length: Number(weeksCount) }, (_, wi) => ({
      weekNumber: wi + 1,
      days: Array.from({ length: Number(daysPerWeek) }, (_, di) => ({
        dayNumber: di + 1,
        title: "",
        exercises: [],
      })),
    }));
    setWeeks(generated);
    setStep(2);
  };

  const updateDayTitle = (wi, di, value) => {
    setWeeks((prev) => {
      const next = prev.map((w) => ({ ...w, days: w.days.map((d) => ({ ...d })) }));
      next[wi].days[di].title = value;
      return next;
    });
  };

  const openAddExercise = (wi, di) => {
    setAddingTo({ wi, di });
    setExerciseForm(defaultExerciseForm);
    setExerciseSearch("");
  };

  const closeAddExercise = () => {
    setAddingTo(null);
    setExerciseForm(defaultExerciseForm);
    setExerciseSearch("");
    setCreatingExercise(false);
    setNewExForm({ name: "", muscleGroup: "", movementPattern: "", equipment: "" });
    setNewExError(null);
  };

  const submitNewExercise = async () => {
    const name = newExForm.name.trim().toLowerCase();
    const duplicate = exercises.find((e) => e.name.toLowerCase() === name);
    if (duplicate) {
      setNewExError("An exercise with this name already exists.");
      return;
    }
    try {
      await api.post("/exercises", newExForm, { headers });
      const res = await api.get("/exercises", { headers });
      setExercises(res.data);
      const created = res.data.find((e) => e.name === name);
      if (created) {
        setExerciseForm((prev) => ({ ...prev, exerciseId: created._id }));
        setExerciseSearch(created.name);
      }
      setCreatingExercise(false);
      setNewExForm({ name: "", muscleGroup: "", movementPattern: "", equipment: "" });
      setNewExError(null);
    } catch (err) {
      setNewExError(err.response?.data?.message ?? "Error creating exercise");
    }
  };

  const confirmAddExercise = (wi, di) => {
    if (!exerciseForm.exerciseId || !exerciseForm.targetSets || !exerciseForm.targetRepsMin || !exerciseForm.targetRepsMax) return;
    setWeeks((prev) => {
      const next = prev.map((w) => ({ ...w, days: w.days.map((d) => ({ ...d, exercises: [...d.exercises] })) }));
      const day = next[wi].days[di];
      day.exercises.push({
        exerciseId: exerciseForm.exerciseId,
        orderIndex: day.exercises.length,
        targetSets: Number(exerciseForm.targetSets),
        targetRepsMin: Number(exerciseForm.targetRepsMin),
        targetRepsMax: Number(exerciseForm.targetRepsMax),
        restSeconds: exerciseForm.restSeconds ? Number(exerciseForm.restSeconds) : undefined,
        notes: exerciseForm.notes || undefined,
      });
      return next;
    });
    closeAddExercise();
  };

  const removeExercise = (wi, di, ei) => {
    setWeeks((prev) => {
      const next = prev.map((w) => ({ ...w, days: w.days.map((d) => ({ ...d, exercises: [...d.exercises] })) }));
      next[wi].days[di].exercises.splice(ei, 1);
      // Fix orderIndex after removal
      next[wi].days[di].exercises = next[wi].days[di].exercises.map((ex, i) => ({ ...ex, orderIndex: i }));
      return next;
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post(
        "/plans",
        { name: name.trim(), weeksCount: Number(weeksCount), daysPerWeek: Number(daysPerWeek), weeks, isActive },
        { headers }
      );

      // Create a session for every week/day combination
      const planId = data.newPlan._id;
      for (let w = 1; w <= Number(weeksCount); w++) {
        for (let d = 1; d <= Number(daysPerWeek); d++) {
          await api.post(
            "/sessions/start",
            { planId, weekNumber: w, dayNumber: d },
            { headers }
          );
        }
      }

      navigate("/plans");
    } catch (err) {
      setError(err.response?.data?.message ?? "Error creating plan");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const getExerciseName = (id) => exercises.find((e) => e._id === id)?.name ?? id;

  if (step === 1) {
    return (
      <div className="px-4 pt-10">
        <button onClick={() => navigate("/plans")} className="text-zinc-400 text-sm mb-6">
          ← Back
        </button>
        <h1 className="text-white text-lg font-semibold mb-1">New Plan</h1>
        <p className="text-zinc-400 text-sm mb-6">Set up the basics first.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-zinc-400 text-sm">Plan name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 5 Day Push Pull"
              className="w-full mt-1 bg-[#14141A] text-white rounded-xl px-4 py-3 border border-zinc-700 outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-zinc-400 text-sm">Weeks</label>
              <input
                type="number"
                min={1}
                value={weeksCount}
                onChange={(e) => setWeeksCount(e.target.value)}
                className="w-full mt-1 bg-[#14141A] text-white rounded-xl px-4 py-3 border border-zinc-700 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-zinc-400 text-sm">Days / week</label>
              <input
                type="number"
                min={1}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                className="w-full mt-1 bg-[#14141A] text-white rounded-xl px-4 py-3 border border-zinc-700 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#14141A] rounded-xl px-4 py-3 border border-zinc-700">
            <span className="text-white text-sm">Set as active plan</span>
            <button
              onClick={() => setIsActive((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors ${isActive ? "bg-[#7A1218]" : "bg-zinc-700"}`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full mx-0.5 transition-transform ${isActive ? "translate-x-6" : ""}`}
              />
            </button>
          </div>

          <button
            onClick={goToStep2}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold bg-[#7A1218] disabled:opacity-40 mt-2"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10">
      <button onClick={() => setStep(1)} className="text-zinc-400 text-sm mb-6">
        ← Back
      </button>
      <h1 className="text-white text-lg font-semibold mb-1">{name}</h1>
      <p className="text-zinc-400 text-sm mb-6">
        {weeksCount} {weeksCount === 1 ? "week" : "weeks"} · {daysPerWeek} days/week
      </p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {weeks.map((week, wi) => (
        <div key={wi} className="mb-6">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-3">Week {week.weekNumber}</p>

          {week.days.map((day, di) => (
            <div key={di} className="bg-[#14141A] rounded-2xl p-4 mb-3">
              <p className="text-zinc-400 text-xs mb-2">Day {day.dayNumber}</p>
              <input
                value={day.title}
                onChange={(e) => updateDayTitle(wi, di, e.target.value)}
                placeholder="e.g. Upper Body"
                className="w-full bg-zinc-900 text-white rounded-xl px-4 py-2 border border-zinc-700 outline-none text-sm mb-3"
              />

              {day.exercises.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="flex justify-between items-center bg-zinc-900 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-white text-sm">{getExerciseName(ex.exerciseId)}</p>
                        <p className="text-zinc-400 text-xs">
                          {ex.targetSets} sets · {ex.targetRepsMin}–{ex.targetRepsMax} reps
                          {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExercise(wi, di, ei)}
                        className="text-zinc-500 text-sm px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addingTo?.wi === wi && addingTo?.di === di ? (
                <div className="bg-zinc-900 rounded-xl p-3 flex flex-col gap-2">
                  {!creatingExercise ? (
                    <>
                      <input
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                        placeholder="Search exercise..."
                        className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                      {exerciseSearch && (
                        <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
                          {filteredExercises.map((e) => (
                            <button
                              key={e._id}
                              onClick={() => {
                                setExerciseForm((prev) => ({ ...prev, exerciseId: e._id }));
                                setExerciseSearch(e.name);
                              }}
                              className={`text-left px-3 py-2 rounded-lg text-sm ${exerciseForm.exerciseId === e._id ? "bg-[#7A1218] text-white" : "text-zinc-300 bg-zinc-800"}`}
                            >
                              {e.name}
                            </button>
                          ))}
                          {filteredExercises.length === 0 && (
                            <p className="text-zinc-500 text-xs px-2 py-1">No matches found.</p>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => { setCreatingExercise(true); setNewExError(null); }}
                        className="text-xs text-[#7A1218] border border-[#7A1218] rounded-xl px-3 py-2 text-left"
                      >
                        + Create new exercise
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-sm font-medium">New Exercise</p>
                      {newExError && <p className="text-red-400 text-xs">{newExError}</p>}
                      <input
                        value={newExForm.name}
                        onChange={(e) => setNewExForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Exercise name"
                        className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                      <input
                        value={newExForm.muscleGroup}
                        onChange={(e) => setNewExForm((p) => ({ ...p, muscleGroup: e.target.value }))}
                        placeholder="Muscle group (e.g. chest)"
                        className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                      <input
                        value={newExForm.movementPattern}
                        onChange={(e) => setNewExForm((p) => ({ ...p, movementPattern: e.target.value }))}
                        placeholder="Movement pattern (e.g. push)"
                        className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                      <input
                        value={newExForm.equipment}
                        onChange={(e) => setNewExForm((p) => ({ ...p, equipment: e.target.value }))}
                        placeholder="Equipment (e.g. barbell)"
                        className="w-full bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => { setCreatingExercise(false); setNewExError(null); }}
                          className="flex-1 py-2 rounded-xl text-white text-sm border border-zinc-700"
                        >
                          Back
                        </button>
                        <button
                          onClick={submitNewExercise}
                          disabled={!newExForm.name.trim() || !newExForm.muscleGroup.trim() || !newExForm.movementPattern.trim() || !newExForm.equipment.trim()}
                          className="flex-1 py-2 rounded-xl text-white text-sm bg-[#7A1218] disabled:opacity-40"
                        >
                          Create &amp; Select
                        </button>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-zinc-400 text-xs">Sets</label>
                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.targetSets}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, targetSets: e.target.value }))}
                        className="w-full mt-0.5 bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-zinc-400 text-xs">Reps min</label>
                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.targetRepsMin}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, targetRepsMin: e.target.value }))}
                        className="w-full mt-0.5 bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-zinc-400 text-xs">Reps max</label>
                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.targetRepsMax}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, targetRepsMax: e.target.value }))}
                        className="w-full mt-0.5 bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-zinc-400 text-xs">Rest (seconds)</label>
                      <input
                        type="number"
                        min={0}
                        value={exerciseForm.restSeconds}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, restSeconds: e.target.value }))}
                        className="w-full mt-0.5 bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-zinc-400 text-xs">Notes (optional)</label>
                      <input
                        value={exerciseForm.notes}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, notes: e.target.value }))}
                        className="w-full mt-0.5 bg-zinc-800 text-white rounded-xl px-3 py-2 border border-zinc-700 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={closeAddExercise}
                      className="flex-1 py-2 rounded-xl text-white text-sm border border-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmAddExercise(wi, di)}
                      disabled={!exerciseForm.exerciseId || !exerciseForm.targetSets || !exerciseForm.targetRepsMin || !exerciseForm.targetRepsMax}
                      className="flex-1 py-2 rounded-xl text-white text-sm bg-[#7A1218] disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAddExercise(wi, di)}
                  className="text-sm text-zinc-400 border border-zinc-700 rounded-xl px-4 py-2 w-full"
                >
                  + Add Exercise
                </button>
              )}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full py-3 rounded-xl text-white font-semibold bg-[#7A1218] disabled:opacity-40 mb-4"
      >
        {submitting ? "Creating..." : "Create Plan"}
      </button>
    </div>
  );
};

export default CreatePlan;

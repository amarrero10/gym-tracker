import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import useExercises from "../hooks/useExercises";
import ExerciseForm from "../components/ExerciseForm";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

const defaultExerciseForm = {
  exerciseId: "",
  targetSets: "",
  targetRepsMin: "",
  targetRepsMax: "",
  restSeconds: "",
  notes: "",
};

const inputClass =
  "w-full bg-[#1C1C21] border border-[#2C2C31] rounded text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all";
const labelClass = "font-mono text-[10px] tracking-wide text-[#9BA1A6] uppercase";

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
  const { exercises, refetch: refetchExercises } = useExercises();
  const [exerciseSearch, setExerciseSearch] = useState("");

  // Per-day exercise adder: { weekIdx, dayIdx } or null
  const [addingTo, setAddingTo] = useState(null);
  const [exerciseForm, setExerciseForm] = useState(defaultExerciseForm);

  // Inline create-exercise sub-form
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [newExSubmitting, setNewExSubmitting] = useState(false);
  const [newExError, setNewExError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
    setNewExError(null);
  };

  const submitNewExercise = async (values) => {
    setNewExSubmitting(true);
    setNewExError(null);
    try {
      const res = await api.post("/exercises", values, { headers });
      const created = res.data.exercise;
      await refetchExercises();
      setExerciseForm((prev) => ({ ...prev, exerciseId: created._id }));
      setExerciseSearch(created.name);
      setCreatingExercise(false);
    } catch (err) {
      setNewExError(err.response?.data?.message ?? "Error creating exercise");
    } finally {
      setNewExSubmitting(false);
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

  const copyWeek1ToAll = () => {
    setWeeks((prev) => {
      const week1Days = prev[0].days;
      return prev.map((week, wi) => {
        if (wi === 0) return week;
        return {
          ...week,
          days: week.days.map((day, di) => ({
            ...day,
            title: week1Days[di]?.title ?? day.title,
            exercises: (week1Days[di]?.exercises ?? []).map((ex) => ({ ...ex })),
          })),
        };
      });
    });
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
      <div className="px-4 pt-10 animate-fade-in-up">
        <button
          onClick={() => navigate("/plans")}
          className="flex items-center gap-1 text-[#9BA1A6] hover:text-white text-sm mb-6 cursor-pointer transition active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-white text-2xl font-extrabold tracking-tight mb-1">New Plan</h1>
        <p className="text-[#9BA1A6] text-sm mb-6">Set up the basics first.</p>

        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Plan name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 5 Day Push Pull"
              className={`${inputClass} px-4 py-3`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Weeks</label>
              <input
                type="number"
                min={1}
                value={weeksCount}
                onChange={(e) => setWeeksCount(e.target.value)}
                className={`${inputClass} px-4 py-3`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Days / week</label>
              <input
                type="number"
                min={1}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                className={`${inputClass} px-4 py-3`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1C1C21] border border-[#2C2C31] rounded px-4 py-3">
            <span className="text-white text-sm">Set as active plan</span>
            <button
              onClick={() => setIsActive((v) => !v)}
              className={`w-11 h-6 rounded-full transition active:scale-[0.98] cursor-pointer ${isActive ? "bg-[#D3131B]" : "bg-[#2F363A]"}`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full mx-0.5 transition-transform ${isActive ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={goToStep2}
          disabled={!name.trim()}
          className="w-full py-3 rounded-lg text-white font-bold bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 mt-4 cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 pb-6 animate-fade-in-up">
      <button
        onClick={() => setStep(1)}
        className="flex items-center gap-1 text-[#9BA1A6] hover:text-white text-sm mb-6 cursor-pointer transition active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-white text-lg font-bold mb-1">{name}</h1>
      <p className="font-mono text-[10px] tracking-wide text-[#9BA1A6] uppercase mb-6">
        {weeksCount} {weeksCount === 1 ? "week" : "weeks"} · {daysPerWeek} days/week
      </p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {weeks.map((week, wi) => (
        <div key={wi} className="mb-6">
          <p className="font-mono text-[10px] tracking-widest text-[#9BA1A6] uppercase mb-3 border-b border-[#1C1C21] pb-2">
            Week {week.weekNumber}
          </p>

          {week.days.map((day, di) => (
            <div
              key={di}
              className="bg-[#141417] border border-[#2C2C31] border-t-2 border-t-[#D3131B] rounded-lg p-4 mb-3"
            >
              <p className="font-mono text-[10px] tracking-wide text-white uppercase mb-2">
                Day {day.dayNumber}
              </p>
              <input
                value={day.title}
                onChange={(e) => updateDayTitle(wi, di, e.target.value)}
                placeholder="e.g. Upper Body"
                className={`${inputClass} px-4 py-2 text-sm mb-3`}
              />

              {day.exercises.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {day.exercises.map((ex, ei) => (
                    <div
                      key={ei}
                      className="flex justify-between items-center bg-[#1C1C21] border border-[#2C2C31] rounded px-3 py-2"
                    >
                      <div>
                        <p className="text-white text-sm">{getExerciseName(ex.exerciseId)}</p>
                        <p className="text-[#9BA1A6] text-xs">
                          {ex.targetSets} sets · {ex.targetRepsMin}–{ex.targetRepsMax} reps
                          {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExercise(wi, di, ei)}
                        className="text-[#9BA1A6] hover:text-white text-sm px-2 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addingTo?.wi === wi && addingTo?.di === di ? (
                <div className="bg-[#0C0C0E] border border-[#1C1C21] rounded p-3 flex flex-col gap-2 animate-fade-in-up">
                  {!creatingExercise ? (
                    <>
                      <input
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                        placeholder="Search exercise..."
                        className={`${inputClass} bg-[#1C1C21] px-3 py-2 text-sm`}
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
                              className={`text-left px-3 py-2 rounded text-sm cursor-pointer transition active:scale-[0.98] ${exerciseForm.exerciseId === e._id ? "bg-[#D3131B] text-white" : "text-[#9BA1A6] bg-[#1C1C21] hover:bg-[#2F363A]"}`}
                            >
                              {e.name}
                            </button>
                          ))}
                          {filteredExercises.length === 0 && (
                            <p className="text-[#9BA1A6] text-xs px-2 py-1">No matches found.</p>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => { setCreatingExercise(true); setNewExError(null); }}
                        className="text-xs text-[#D3131B] border border-dashed border-[#5d3f3c] rounded px-3 py-2 text-left cursor-pointer hover:bg-[#1a2024] transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create new exercise
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-sm font-bold">New Exercise</p>
                      <ExerciseForm
                        key={`${wi}-${di}-new`}
                        onSubmit={submitNewExercise}
                        onCancel={() => { setCreatingExercise(false); setNewExError(null); }}
                        submitLabel="Create & Select"
                        submitting={newExSubmitting}
                        error={newExError}
                      />
                    </>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className={`${labelClass} block mb-1`}>Sets</label>
                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.targetSets}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, targetSets: e.target.value }))}
                        className={`${inputClass} bg-[#1C1C21] px-3 py-2 text-sm text-center`}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`${labelClass} block mb-1`}>Reps min</label>
                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.targetRepsMin}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, targetRepsMin: e.target.value }))}
                        className={`${inputClass} bg-[#1C1C21] px-3 py-2 text-sm text-center`}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`${labelClass} block mb-1`}>Reps max</label>
                      <input
                        type="number"
                        min={1}
                        value={exerciseForm.targetRepsMax}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, targetRepsMax: e.target.value }))}
                        className={`${inputClass} bg-[#1C1C21] px-3 py-2 text-sm text-center`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className={`${labelClass} block mb-1`}>Rest (seconds)</label>
                      <input
                        type="number"
                        min={0}
                        value={exerciseForm.restSeconds}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, restSeconds: e.target.value }))}
                        className={`${inputClass} bg-[#1C1C21] px-3 py-2 text-sm`}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`${labelClass} block mb-1`}>Notes (optional)</label>
                      <input
                        value={exerciseForm.notes}
                        onChange={(e) => setExerciseForm((p) => ({ ...p, notes: e.target.value }))}
                        className={`${inputClass} bg-[#1C1C21] px-3 py-2 text-sm`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={closeAddExercise}
                      className="flex-1 py-2 rounded text-white text-sm border border-[#2C2C31] cursor-pointer hover:bg-[#1C1C21] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmAddExercise(wi, di)}
                      disabled={!exerciseForm.exerciseId || !exerciseForm.targetSets || !exerciseForm.targetRepsMin || !exerciseForm.targetRepsMax}
                      className="flex-1 py-2 rounded text-white text-sm bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 cursor-pointer transition active:scale-[0.98]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAddExercise(wi, di)}
                  className="text-sm text-[#9BA1A6] border border-[#2C2C31] rounded px-4 py-2 w-full cursor-pointer hover:bg-[#1C1C21] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
              )}
            </div>
          ))}
        {wi === 0 && Number(weeksCount) > 1 && (
          <button
            onClick={copyWeek1ToAll}
            className="w-full py-2 mb-2 rounded text-sm text-white border border-[#2C2C31] hover:border-[#47464b] cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            Copy Week 1 to all weeks
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        </div>
      ))}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full py-3 rounded-lg text-white font-bold bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 mb-4 cursor-pointer transition active:scale-[0.98]"
      >
        {submitting ? "Creating..." : "Create Plan"}
      </button>
    </div>
  );
};

export default CreatePlan;

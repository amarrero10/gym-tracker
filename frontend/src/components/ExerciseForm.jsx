import { useState } from "react";

const inputClass =
  "w-full bg-[#1C1C21] border border-[#2C2C31] rounded text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all px-3 py-2 text-sm";
const labelClass = "font-mono text-[10px] tracking-wide text-[#9BA1A6] uppercase";

const emptyValues = { name: "", muscleGroup: "", movementPattern: "", equipment: "" };

const fields = [
  { key: "name", label: "Exercise Name", placeholder: "e.g. bench press" },
  { key: "muscleGroup", label: "Muscle Group", placeholder: "e.g. chest" },
  { key: "movementPattern", label: "Movement Pattern", placeholder: "e.g. push" },
  { key: "equipment", label: "Equipment", placeholder: "e.g. barbell" },
];

// Mount with a `key` prop (e.g. editingId ?? "new") when switching between
// creating and editing different exercises, so internal state resets cleanly.
const ExerciseForm = ({
  initialValues = emptyValues,
  onSubmit,
  onCancel,
  submitLabel = "Create",
  submitting = false,
  error = null,
}) => {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });

  const update = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    values.name.trim() &&
    values.muscleGroup.trim() &&
    values.movementPattern.trim() &&
    values.equipment.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      name: values.name.trim(),
      muscleGroup: values.muscleGroup.trim(),
      movementPattern: values.movementPattern.trim(),
      equipment: values.equipment.trim(),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          <label htmlFor={`exercise-${key}`} className={labelClass}>
            {label}
          </label>
          <input
            id={`exercise-${key}`}
            value={values[key]}
            onChange={update(key)}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded text-white text-sm border border-[#2C2C31] cursor-pointer hover:bg-[#1C1C21] transition active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="flex-1 py-2 rounded text-white text-sm bg-[#D3131B] hover:bg-[#b01016] disabled:opacity-40 cursor-pointer transition active:scale-[0.98]"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
};

export default ExerciseForm;

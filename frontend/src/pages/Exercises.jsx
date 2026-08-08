import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import useExercises from "../hooks/useExercises";
import ExerciseForm from "../components/ExerciseForm";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

const selectClass =
  "w-full bg-[#1C1C21] border border-[#2C2C31] rounded text-white outline-none focus:border-[#D3131B] transition-all px-2.5 py-2 text-xs capitalize";

const Exercises = () => {
  const navigate = useNavigate();
  const { exercises, setExercises, loading, refetch } = useExercises();

  const [search, setSearch] = useState("");
  const [filterMuscleGroup, setFilterMuscleGroup] = useState("");
  const [filterMovementPattern, setFilterMovementPattern] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const uniqueSorted = (key) =>
    [...new Set(exercises.map((e) => e[key]).filter(Boolean))].sort();
  const muscleGroups = uniqueSorted("muscleGroup");
  const movementPatterns = uniqueSorted("movementPattern");
  const equipmentOptions = uniqueSorted("equipment");

  const hasActiveFilters = filterMuscleGroup || filterMovementPattern || filterEquipment || search;

  const clearFilters = () => {
    setSearch("");
    setFilterMuscleGroup("");
    setFilterMovementPattern("");
    setFilterEquipment("");
    setPage(1);
  };

  const openCreate = () => {
    setCreating(true);
    setEditingId(null);
    setFormError(null);
  };

  const openEdit = (id) => {
    setEditingId(id);
    setCreating(false);
    setFormError(null);
  };

  const closeForms = () => {
    setCreating(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleCreate = async (values) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      await api.post("/exercises", values);
      toast.success("Exercise created.");
      setCreating(false);
      await refetch();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Error creating exercise.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (id, values) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      await api.put(`/exercises/${id}`, values);
      toast.success("Exercise updated.");
      setEditingId(null);
      await refetch();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Error updating exercise.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmAndDelete = async () => {
    const ex = confirmDelete;
    if (!ex) return;
    setDeleting(true);
    try {
      await api.delete(`/exercises/${ex._id}`);
      setExercises((prev) => prev.filter((e) => e._id !== ex._id));
      toast.success("Exercise deleted.");
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete exercise.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-t-4 border-[#D3131B] rounded-full animate-spin" />
      </div>
    );

  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (!filterMuscleGroup || e.muscleGroup === filterMuscleGroup) &&
      (!filterMovementPattern || e.movementPattern === filterMovementPattern) &&
      (!filterEquipment || e.equipment === filterEquipment),
  );

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedExercises = filteredExercises.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="px-4 pt-10 pb-6 animate-fade-in-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-[#9BA1A6] hover:text-white text-sm mb-6 cursor-pointer transition active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-extrabold tracking-tight">Exercises</h1>
        <button
          onClick={openCreate}
          className="bg-[#D3131B] hover:bg-[#b01016] text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer transition active:scale-[0.98] flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>
      <p className="text-[#9BA1A6] mt-1">Browse, edit, and create your exercise library</p>

      <div className="h-px bg-[#2C2C31] my-6" />

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA1A6]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search exercises..."
          className="w-full bg-[#1C1C21] border border-[#2C2C31] rounded text-white placeholder:text-[#9BA1A6] outline-none focus:border-[#D3131B] focus:shadow-[0_0_10px_rgba(211,19,27,0.2)] transition-all pl-9 pr-3 py-2.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        <select
          value={filterMuscleGroup}
          onChange={(e) => {
            setFilterMuscleGroup(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All groups</option>
          {muscleGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={filterMovementPattern}
          onChange={(e) => {
            setFilterMovementPattern(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All patterns</option>
          {movementPatterns.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filterEquipment}
          onChange={(e) => {
            setFilterEquipment(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All equipment</option>
          {equipmentOptions.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] text-[#9BA1A6] uppercase">
          {filteredExercises.length} exercise{filteredExercises.length === 1 ? "" : "s"}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="font-mono text-[10px] uppercase text-[#9BA1A6] hover:text-white cursor-pointer transition active:scale-[0.98]"
          >
            Clear filters
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 mb-4 animate-fade-in-up">
          <p className="text-white text-sm font-bold mb-3">New Exercise</p>
          <ExerciseForm
            key="new"
            onSubmit={handleCreate}
            onCancel={closeForms}
            submitLabel="Create"
            submitting={formSubmitting}
            error={formError}
          />
        </div>
      )}

      {filteredExercises.length === 0 ? (
        <p className="text-[#9BA1A6] text-center mt-10">No exercises found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pagedExercises.map((ex) =>
            editingId === ex._id ? (
              <div
                key={ex._id}
                className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 animate-fade-in-up"
              >
                <p className="text-white text-sm font-bold mb-3">Edit Exercise</p>
                <ExerciseForm
                  key={ex._id}
                  initialValues={ex}
                  onSubmit={(values) => handleUpdate(ex._id, values)}
                  onCancel={closeForms}
                  submitLabel="Save Changes"
                  submitting={formSubmitting}
                  error={formError}
                />
              </div>
            ) : (
              <div
                key={ex._id}
                className="bg-[#141417] border border-[#2C2C31] rounded-lg p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium capitalize truncate">{ex.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="font-mono text-[10px] uppercase text-[#9BA1A6] bg-[#1C1C21] border border-[#2C2C31] rounded px-2 py-0.5">
                      {ex.muscleGroup}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[#9BA1A6] bg-[#1C1C21] border border-[#2C2C31] rounded px-2 py-0.5">
                      {ex.movementPattern}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[#9BA1A6] bg-[#1C1C21] border border-[#2C2C31] rounded px-2 py-0.5">
                      {ex.equipment}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(ex._id)}
                    className="p-2 text-[#9BA1A6] hover:text-white cursor-pointer transition active:scale-[0.98]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(ex)}
                    className="p-2 text-[#9BA1A6] hover:text-red-400 cursor-pointer transition active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm text-white border border-[#2C2C31] rounded px-3 py-2 cursor-pointer hover:bg-[#1C1C21] transition active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <p className="font-mono text-[10px] text-[#9BA1A6] uppercase">
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm text-white border border-[#2C2C31] rounded px-3 py-2 cursor-pointer hover:bg-[#1C1C21] transition active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#141417] border border-[#2C2C31] rounded-lg p-5 max-w-sm w-full animate-fade-in-up">
            <p className="text-white font-bold mb-1">Delete exercise?</p>
            <p className="text-[#9BA1A6] text-sm mb-5">
              Delete <span className="text-white capitalize">"{confirmDelete.name}"</span>? This
              can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded text-white text-sm border border-[#2C2C31] cursor-pointer hover:bg-[#1C1C21] transition active:scale-[0.98] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded text-white text-sm bg-[#D3131B] hover:bg-[#b01016] cursor-pointer transition active:scale-[0.98] disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default Exercises;

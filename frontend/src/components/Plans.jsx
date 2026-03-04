import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const Plans = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [openDayKey, setOpenDayKey] = useState(null);

  useEffect(() => {
    const getPlans = async () => {
      setLoading(true);

      try {
        const res = await api.get("/plans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPlans(res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };

    getPlans();
  }, [user, token]);

  console.log("PLANS: ", plans);

  if (error) return <div>Error: {error.message}</div>;
  if (loading)
    return (
      <div class="h-12 w-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Plans</h1>
            <p className="text-sm text-gray-500">
              Select a plan to view its weeks and days.
            </p>
          </div>
          <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
            + New Plan
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 grid gap-6 lg:grid-cols-3">
        {/* Plans list */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Your plans
              </h2>
              <span className="text-xs text-gray-500">
                {plans.length} total
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {plans.map((plan) => {
                const isActive = plan._id === selectedPlanId;

                // quick stats for card
                const totalExercises =
                  plan.weeks?.reduce(
                    (acc, w) =>
                      acc +
                      (w.days?.reduce(
                        (a, d) => a + (d.exercises?.length ?? 0),
                        0,
                      ) ?? 0),
                    0,
                  ) ?? 0;

                return (
                  <button
                    key={plan._id}
                    onClick={() => {
                      setSelectedPlanId(plan._id);
                      setActiveWeek(1);
                      setOpenDayKey(null);
                    }}
                    className={[
                      "w-full text-left rounded-2xl border p-4 transition",
                      isActive
                        ? "border-black bg-gray-900 text-white"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div
                          className={
                            isActive
                              ? "text-white/70 text-sm"
                              : "text-gray-500 text-sm"
                          }
                        >
                          {plan.weeksCount}{" "}
                          {plan.weeksCount > 1 ? "weeks" : "week"} •{" "}
                          {plan.daysPerWeek} days/wk
                        </div>
                      </div>

                      <div
                        className={[
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {totalExercises} ex
                      </div>
                    </div>
                  </button>
                );
              })}

              {plans.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
                  No plans yet. Create your first plan.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan details */}
        <div className="lg:col-span-2">
          {(() => {
            const plan = plans.find((p) => p._id === selectedPlanId);

            if (!plan) {
              return (
                <div className="rounded-2xl border bg-white p-10 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="text-lg font-semibold text-gray-900">
                      Select a plan
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Choose a plan on the left to view weeks, days, and
                      exercises.
                    </p>
                  </div>
                </div>
              );
            }

            const week =
              plan.weeks?.find((w) => w.weekNumber === activeWeek) ??
              plan.weeks?.[0];

            return (
              <div className="rounded-2xl border bg-white">
                {/* Plan header */}
                <div className="p-5 border-b">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {plan.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {plan.weeksCount}{" "}
                        {plan.weeksCount > 1 ? "weeks" : "week"} •{" "}
                        {plan.daysPerWeek} days/week
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="rounded-xl border px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Week tabs */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.weeks?.map((w) => (
                      <button
                        key={w._id}
                        onClick={() => {
                          setActiveWeek(w.weekNumber);
                          setOpenDayKey(null);
                        }}
                        className={[
                          "rounded-full px-4 py-2 text-sm font-semibold border transition",
                          (week?.weekNumber ?? 1) === w.weekNumber
                            ? "bg-black text-white border-black"
                            : "bg-white hover:bg-gray-50",
                        ].join(" ")}
                      >
                        Week {w.weekNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days */}
                <div className="p-5 space-y-3">
                  {(week?.days ?? []).map((day) => {
                    const key = `${week.weekNumber}-${day.dayNumber}`;
                    const isOpen = openDayKey === key;

                    return (
                      <div
                        key={day._id}
                        className="rounded-2xl border overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenDayKey(isOpen ? null : key)}
                          className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white border flex items-center justify-center text-sm font-bold">
                              D{day.dayNumber}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-gray-900">
                                {day.title || `Day ${day.dayNumber}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {day.exercises?.length ?? 0} exercises
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-700">
                            {isOpen ? "Hide" : "View"}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-500">
                                    <th className="py-2 pr-4">#</th>
                                    <th className="py-2 pr-4">Exercise</th>
                                    <th className="py-2 pr-4">Sets</th>
                                    <th className="py-2 pr-4">Reps</th>
                                    <th className="py-2 pr-4">Rest</th>
                                    <th className="py-2 pr-4">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {(day.exercises ?? [])
                                    .slice()
                                    .sort((a, b) => a.orderIndex - b.orderIndex)
                                    .map((ex) => (
                                      <tr
                                        key={ex._id}
                                        className="text-gray-900"
                                      >
                                        <td className="py-3 pr-4 font-semibold">
                                          {ex.orderIndex + 1}
                                        </td>
                                        <td className="py-3 pr-4">
                                          <div className="font-semibold">
                                            Exercise name
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            ID:{" "}
                                            {String(
                                              ex.exerciseId?.$oid ??
                                                ex.exerciseId,
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                          {ex.targetSets}
                                        </td>
                                        <td className="py-3 pr-4">
                                          {ex.targetRepsMin}-{ex.targetRepsMax}
                                        </td>
                                        <td className="py-3 pr-4">
                                          {ex.restSeconds}s
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                          {ex.notes ? (
                                            ex.notes
                                          ) : (
                                            <span className="text-gray-400">
                                              —
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                                Start this day
                              </button>
                              <button className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                                Add exercise
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Plans;

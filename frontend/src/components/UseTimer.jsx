import { useEffect, useRef, useState } from "react";

const UseTimer = ({ repSeconds = 10, repIsRunning = false }) => {
  const [seconds, setSeconds] = useState(repSeconds);
  const [isRunning, setIsRunning] = useState(repIsRunning);
  const secondsRef = useRef(seconds);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (secondsRef.current <= 1) {
        clearInterval(interval);
        setSeconds(0);
        setIsRunning(false);
        return;
      }
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startStop = () => {
    // don't start if already at 0
    if (seconds <= 0) return;
    setIsRunning((r) => !r);
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(repSeconds);
  };

  return (
    <div className="bg-zinc-900 rounded-2xl px-4 py-4 mt-4 font-sans">
      <div className="text-zinc-400 text-sm mb-2">Rest Timer</div>
      <div className="text-white text-4xl font-bold text-center mb-4">{seconds}s</div>
      <div className="flex gap-3">
        <button
          onClick={startStop}
          disabled={seconds <= 0}
          className="flex-1 py-2 rounded-xl text-white font-semibold bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="flex-1 py-2 rounded-xl text-white font-semibold border border-zinc-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default UseTimer;

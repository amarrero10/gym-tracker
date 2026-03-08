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
    <div className=" text-white">
      <h1>{seconds}s</h1>
      <button onClick={startStop}>{isRunning ? "Pause" : "Start"}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default UseTimer;

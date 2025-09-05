import React, { useState, useEffect } from "react";
import { Play, Pause, StopCircle, RotateCcw } from "lucide-react"; // Using Lucide for cleaner icons

// Helper function to format time in HH:MM:SS:MM format
const formatTime = (timeInMilliseconds) => {
  const milliseconds = Math.floor((timeInMilliseconds % 1000) / 10)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((timeInMilliseconds / 1000) % 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeInMilliseconds / (1000 * 60)) % 60)
    .toString()
    .padStart(2, "0");
  const hours = Math.floor((timeInMilliseconds / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}:${milliseconds}`;
};

const TimeTracker = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10); // Update every 10ms for millisecond precision
      }, 10);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps((prevLaps) => [...prevLaps, time]);
    }
  };

  // Convert time to degrees for analog clock hands
  const secondDegrees = (time / 1000) * 6;
  const minuteDegrees = (time / (1000 * 60)) * 6;
  const hourDegrees = (time / (1000 * 60 * 60)) * 30;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">Time Tracker</h2>

      {/* Analog Clock */}
      <div className="relative w-40 h-40 rounded-full border-4 border-gray-700 mb-6 flex items-center justify-center bg-gray-800">
        <div
          className="absolute w-1 h-14 bg-red-500 origin-bottom transform transition-transform duration-100 ease-linear"
          style={{ transform: `rotate(${secondDegrees}deg)` }}
        />
        <div
          className="absolute w-1 h-12 bg-white origin-bottom transform transition-transform duration-500"
          style={{ transform: `rotate(${minuteDegrees}deg)` }}
        />
        <div
          className="absolute w-1 h-10 bg-white origin-bottom transform transition-transform duration-500"
          style={{ transform: `rotate(${hourDegrees}deg)` }}
        />
        <div className="absolute w-2 h-2 bg-white rounded-full" />
      </div>

      {/* Digital Time */}
      <div className="text-5xl font-mono font-extrabold mb-6 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        {formatTime(time)}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleStartPause}
          className={`p-4 rounded-full ${isRunning ? "bg-red-500" : "bg-green-500"} text-white shadow-lg transition-all hover:scale-110`}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={handleLap}
          className="p-4 rounded-full bg-blue-500 text-white shadow-lg transition-all hover:scale-110"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={handleStop}
          className="p-4 rounded-full bg-gray-700 text-white shadow-lg transition-all hover:scale-110"
        >
          <StopCircle size={24} />
        </button>
      </div>

      {/* Lap Times */}
      {laps.length > 0 && (
        <div className="mt-8 w-full max-w-xs">
          <ul className="divide-y divide-gray-700">
            {laps.map((lap, index) => (
              <li key={index} className="flex justify-between items-center py-2 text-sm text-gray-300">
                <span className="font-bold text-gray-400">Lap {index + 1}</span>
                <span>{formatTime(lap)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
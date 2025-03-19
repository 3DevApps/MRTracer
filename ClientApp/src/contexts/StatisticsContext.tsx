import { createContext, useState } from "react";

type StatisticsContextType = {
  fps: number;
  setFps: (fps: number) => void;
  averageFps: number;
  updateAverageFps: (averageFps: number) => void;
};

export const StatisticsContext = createContext({} as StatisticsContextType);

export const StatisticsContextProvider = ({ children }: any) => {
  const [fps, setFps] = useState(0);
  const [averageFpsInternal, setAverageFpsInternal] = useState(0);
  const [averageFpsCount, setAverageFpsCount] = useState(0);

  const updateAverageFps = (newFpsRecord: number) => {
    const value =
      (averageFpsInternal * averageFpsCount + newFpsRecord) /
      (averageFpsCount + 1);
    setAverageFpsInternal(value);
    setAverageFpsCount(averageFpsCount + 1);
  };

  return (
    <StatisticsContext.Provider
      value={{ fps, setFps, averageFps: averageFpsInternal, updateAverageFps }}
    >
      {children}
    </StatisticsContext.Provider>
  );
};

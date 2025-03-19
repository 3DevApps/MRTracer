import { createContext, useMemo, useState } from "react";

type JobSettingsContextType = {
  jobId: string | null;
  isAdmin: boolean;
  isDebugJob: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
};

export const JobSettingsContext = createContext({} as JobSettingsContextType);

export const JobSettingsContextProvider = ({ children }: any) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { isDebugJob, jobId } = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      jobId: urlParams.get("jobId"),
      isDebugJob: urlParams.get("debugJob") === "true",
    };
  }, [window.location.search]);

  return (
    <JobSettingsContext.Provider
      value={{ jobId, isAdmin, isDebugJob, setIsAdmin }}
    >
      {children}
    </JobSettingsContext.Provider>
  );
};

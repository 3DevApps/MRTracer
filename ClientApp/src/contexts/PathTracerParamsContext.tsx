import { createContext, useState } from "react";
import config from "../config/config";

type PathTracerParamsContextType = {
  exportStateToJSON: () => string;
  importStateFromJSON: (json: string) => void;
  loadBalancingAlgorithm: string;
  setLoadBalancingAlgorithm: (loadBalancingAlgorithm: string) => void;
  loadBalancingTaskSizeX: number;
  setLoadBalancingTaskSizeX: (loadBalancingTaskSize: number) => void;
  prevLoadBalancingTaskSizeX: number;
  setPrevLoadBalancingTaskSizeX: (prevLoadBalancingTaskSize: number) => void;
  loadBalancingTaskSizeY: number;
  setLoadBalancingTaskSizeY: (loadBalancingTaskSize: number) => void;
  prevLoadBalancingTaskSizeY: number;
  setPrevLoadBalancingTaskSizeY: (prevLoadBalancingTaskSize: number) => void;
  showTaskGrid: boolean;
  setShowTaskGrid: (showTaskDivision: boolean) => void;
  gpuNumber: number;
  setGpuNumber: (gpuNumber: number) => void;
  streamsPerGpu: number;
  setStreamsPerGpu: (streamsPerGpu: number) => void;
  samplesPerPixel: number;
  setSamplesPerPixel: (samplesPerPixel: number) => void;
  recursionDepth: number;
  setRecursionDepth: (recursionDepth: number) => void;
  width: number;
  setWidth: (width: number) => void;
  prevWidth: number;
  setPrevWidth: (prevWidth: number) => void;
  height: number;
  setHeight: (height: number) => void;
  prevHeight: number;
  setPrevHeight: (prevHeight: number) => void;
  threadBlockSizeX: number;
  setThreadBlockSizeX: (threadBlockSizeX: number) => void;
  prevThreadBlockSizeX: number;
  setPrevThreadBlockSizeX: (prevThreadBlockSizeX: number) => void;
  threadBlockSizeY: number;
  setThreadBlockSizeY: (threadBlockSizeY: number) => void;
  prevThreadBlockSizeY: number;
  setPrevThreadBlockSizeY: (prevThreadBlockSizeY: number) => void;
  scenePositionX: number;
  setScenePositionX: (scenePositionX: number) => void;
  scenePositionY: number;
  setScenePositionY: (scenePositionY: number) => void;
  scenePositionZ: number;
  setScenePositionZ: (scenePositionZ: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  yaw: number;
  setYaw: (yaw: number) => void;
  moveSpeed: number;
  setMoveSpeed: (moveSpeed: number) => void;
  kParam: number;
  setKParam: (kParam: number) => void;
};

export const PathTracerParamsContext = createContext(
  {} as PathTracerParamsContextType
);

export const PathTracerParamsContextProvider = ({ children }: any) => {
  const [gpuNumber, setGpuNumber] = useState(config.DEFAULT_GPU_NUMBER);
  const [streamsPerGpu, setStreamsPerGpu] = useState(
    config.DEFAULT_STREAMS_PER_GPU
  );
  const [samplesPerPixel, setSamplesPerPixel] = useState(
    config.DEFAULT_SAMPLES_PER_PIXEL
  );
  const [recursionDepth, setRecursionDepth] = useState(
    config.DEFAULT_RECURSION_DEPTH
  );
  const [width, setWidth] = useState(config.DEFAULT_IMAGE_RESOLUTION.WIDTH);
  const [prevWidth, setPrevWidth] = useState(
    config.DEFAULT_IMAGE_RESOLUTION.WIDTH
  );
  const [height, setHeight] = useState(config.DEFAULT_IMAGE_RESOLUTION.HEIGHT);
  const [prevHeight, setPrevHeight] = useState(
    config.DEFAULT_IMAGE_RESOLUTION.HEIGHT
  );
  const [threadBlockSizeX, setThreadBlockSizeX] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_X
  );
  const [prevThreadBlockSizeX, setPrevThreadBlockSizeX] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_X
  );
  const [threadBlockSizeY, setThreadBlockSizeY] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_Y
  );
  const [prevThreadBlockSizeY, setPrevThreadBlockSizeY] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_Y
  );
  const [loadBalancingAlgorithm, setLoadBalancingAlgorithm] = useState(
    config.DEFAULT_LOAD_BALANCING_ALGORITHM
  );
  const [loadBalancingTaskSizeX, setLoadBalancingTaskSizeX] = useState(1);
  const [prevLoadBalancingTaskSizeX, setPrevLoadBalancingTaskSizeX] =
    useState(1);
  const [loadBalancingTaskSizeY, setLoadBalancingTaskSizeY] = useState(1);
  const [prevLoadBalancingTaskSizeY, setPrevLoadBalancingTaskSizeY] =
    useState(1);
  const [showTaskGrid, setShowTaskGrid] = useState(true);
  const [scenePositionX, setScenePositionX] = useState(0);
  const [scenePositionY, setScenePositionY] = useState(0);
  const [scenePositionZ, setScenePositionZ] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [moveSpeed, setMoveSpeed] = useState(5);
  const [kParam, setKParam] = useState(2);

  const exportStateToJSON = () => {
    return JSON.stringify({
      gpuNumber,
      streamsPerGpu,
      samplesPerPixel,
      recursionDepth,
      width,
      height,
      threadBlockSizeX,
      threadBlockSizeY,
      loadBalancingAlgorithm,
      loadBalancingTaskSizeX,
      loadBalancingTaskSizeY,
      showTaskGrid,
      scenePositionX,
      scenePositionY,
      scenePositionZ,
      pitch,
      yaw,
      kParam,
    });
  };

  const importStateFromJSON = (json: string) => {
    const state = JSON.parse(json);
    setGpuNumber(state.gpuNumber);
    setStreamsPerGpu(state.streamsPerGpu);
    setSamplesPerPixel(state.samplesPerPixel);
    setRecursionDepth(state.recursionDepth);
    setWidth(state.width);
    setPrevWidth(state.width);
    setHeight(state.height);
    setPrevHeight(state.height);
    setThreadBlockSizeX(state.threadBlockSizeX);
    setPrevThreadBlockSizeX(state.threadBlockSizeX);
    setThreadBlockSizeY(state.threadBlockSizeY);
    setPrevThreadBlockSizeY(state.threadBlockSizeY);
    setLoadBalancingAlgorithm(state.loadBalancingAlgorithm);
    setLoadBalancingTaskSizeX(state.loadBalancingTaskSizeX);
    setPrevLoadBalancingTaskSizeX(state.loadBalancingTaskSizeX);
    setLoadBalancingTaskSizeY(state.loadBalancingTaskSizeY);
    setPrevLoadBalancingTaskSizeY(state.loadBalancingTaskSizeY);
    setShowTaskGrid(state.showTaskGrid);
    setScenePositionX(state.scenePositionX);
    setScenePositionY(state.scenePositionY);
    setScenePositionZ(state.scenePositionZ);
    setPitch(state.pitch);
    setYaw(state.yaw);
    setKParam(state.kParam);
  };

  return (
    <PathTracerParamsContext.Provider
      value={{
        exportStateToJSON,
        importStateFromJSON,
        loadBalancingAlgorithm,
        setLoadBalancingAlgorithm,
        loadBalancingTaskSizeX,
        setLoadBalancingTaskSizeX,
        prevLoadBalancingTaskSizeX,
        setPrevLoadBalancingTaskSizeX,
        loadBalancingTaskSizeY,
        setLoadBalancingTaskSizeY,
        prevLoadBalancingTaskSizeY,
        setPrevLoadBalancingTaskSizeY,
        showTaskGrid,
        setShowTaskGrid,
        gpuNumber,
        setGpuNumber,
        streamsPerGpu,
        setStreamsPerGpu,
        samplesPerPixel,
        setSamplesPerPixel,
        recursionDepth,
        setRecursionDepth,
        width,
        setWidth,
        prevWidth,
        setPrevWidth,
        height,
        setHeight,
        prevHeight,
        setPrevHeight,
        threadBlockSizeX,
        setThreadBlockSizeX,
        prevThreadBlockSizeX,
        setPrevThreadBlockSizeX,
        threadBlockSizeY,
        setThreadBlockSizeY,
        prevThreadBlockSizeY,
        setPrevThreadBlockSizeY,
        scenePositionX,
        setScenePositionX,
        scenePositionY,
        setScenePositionY,
        scenePositionZ,
        setScenePositionZ,
        pitch,
        setPitch,
        yaw,
        setYaw,
        moveSpeed,
        setMoveSpeed,
        kParam,
        setKParam,
      }}
    >
      {children}
    </PathTracerParamsContext.Provider>
  );
};

const wsProtocol = import.meta.env.VITE_DEV_MODE ? "ws" : "wss";
const httpProtocol = import.meta.env.VITE_DEV_MODE ? "http" : "https";

const config = {
  WS_SERVER_URL: "",
  HTTP_SERVER_URL: "",
  WS_STREAMING_SERVER_URL: "",
  DEFAULT_IMAGE_RESOLUTION: {
    WIDTH: 400,
    HEIGHT: 400,
  },
  DEFAULT_GPU_NUMBER: 1,
  DEFAULT_STREAMS_PER_GPU: 1,
  DEFAULT_SAMPLES_PER_PIXEL: 10,
  DEFAULT_RECURSION_DEPTH: 3,
  DEFAULT_THREAD_BLOCK_SIZE_X: 8,
  DEFAULT_THREAD_BLOCK_SIZE_Y: 8,
  LOAD_BALANCING_ALGORITHMS: [
    { value: "FSFL", label: "Tasks with fixed size and fixed layout" },
    { value: "DSFL", label: "Tasks with dynamic size and fixed layout" },
    { value: "DSDL", label: "Tasks with dynamic size and dynamic layout" },
  ],
  DEFAULT_LOAD_BALANCING_ALGORITHM: "FSFL",
  SERVER_URL: import.meta.env.VITE_DEV_MODE
    ? "localhost:8080"
    : "pathtracing-relay-server.klatka.it",
  STREAMING_SERVER_URL: import.meta.env.VITE_DEV_MODE
    ? "localhost:8081"
    : "pathtracing-streaming-server.klatka.it",
};

config.WS_SERVER_URL = `${wsProtocol}://${config.SERVER_URL}`;
config.HTTP_SERVER_URL = `${httpProtocol}://${config.SERVER_URL}`;
config.WS_STREAMING_SERVER_URL = `${wsProtocol}://${config.STREAMING_SERVER_URL}`;

export default config;

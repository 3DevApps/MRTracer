import config from "../config/config";

export class VideoStreamManager {
  private worker: Worker | null = null;
  private jobId: string;
  private canvas: HTMLCanvasElement;
  private hasStarted = false;

  constructor(jobId: string, canvas: HTMLCanvasElement) {
    this.jobId = jobId;
    this.canvas = canvas;

    this.start();
  }

  public async start() {
    if (this.hasStarted) {
      return;
    }
    this.hasStarted = true;

    // Create offscreen canvas
    const offscreen = this.canvas.transferControlToOffscreen();

    const wsUrl = `${config.WS_STREAMING_SERVER_URL}/?jobId=${this.jobId}`;
    // Create and initialize worker
    this.worker = new Worker(
      new URL("../workers/VideoDecoderWorker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    // Set up worker message handling
    this.worker.onmessage = (event) => {
      const { type, error } = event.data;

      switch (type) {
        case "error":
          console.error("Worker error:", error);
          break;

        case "wsConnected":
          console.log("WebSocket streaming connection has been opened!");
          break;

        case "wsDisconnected":
          console.log("WebSocket streaming connection has been closed!");
          break;
      }
    };

    // Initialize the worker with canvas and connection details
    this.worker.postMessage(
      {
        type: "init",
        data: {
          width: this.canvas.width,
          height: this.canvas.height,
          wsUrl,
          canvas: offscreen,
        },
      },
      [offscreen]
    );
  }

  public resize(width: number, height: number) {
    if (this.worker) {
      this.worker.postMessage({
        type: "resize",
        data: { newWidth: width, newHeight: height },
      });
    }
  }

  public stop() {
    if (this.worker) {
      this.worker.postMessage({ type: "close" });
      this.worker.terminate();
      this.worker = null;
    }
  }
}

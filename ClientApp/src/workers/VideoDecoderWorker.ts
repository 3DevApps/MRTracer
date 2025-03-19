import H264Decoder from "../utils/H264Decoder";

class VideoDecoderWorker {
  private decoder: H264Decoder | null = null;
  private websocket: WebSocket | null = null;
  private canvas: OffscreenCanvas | null = null;
  private ctx: OffscreenCanvasRenderingContext2D | null = null;

  constructor() {
    self.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent) {
    const { type, data } = event.data;

    switch (type) {
      case "init":
        const { width, height, wsUrl, canvas } = data;
        this.initializeDecoder(width, height, canvas);
        this.connectWebSocket(wsUrl);
        break;

      case "resize":
        const { newWidth, newHeight } = data;
        this.handleResize(newWidth, newHeight);
        break;

      case "close":
        this.cleanup();
        break;
    }
  }

  private initializeDecoder(
    width: number,
    height: number,
    canvas: OffscreenCanvas
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    if (!this.ctx) {
      throw new Error("Failed to get 2D context from OffscreenCanvas");
    }

    this.decoder = new H264Decoder(width, height, (frame: VideoFrame) =>
      this.handleFrame(frame)
    );
  }

  private handleFrame(frame: VideoFrame) {
    if (!this.ctx || !this.canvas) return;

    // Ensure canvas dimensions match frame
    if (
      this.canvas.width !== frame.displayWidth ||
      this.canvas.height !== frame.displayHeight
    ) {
      this.canvas.width = frame.displayWidth;
      this.canvas.height = frame.displayHeight;
    }

    // Draw the frame to canvas
    this.ctx.drawImage(frame, 0, 0);
  }

  private connectWebSocket(url: string) {
    this.websocket = new WebSocket(url);

    this.websocket.binaryType = "arraybuffer";

    this.websocket.onopen = () => {
      self.postMessage({ type: "wsConnected" });
    };

    this.websocket.onmessage = async (event) => {
      if (!this.decoder) return;

      try {
        const data = new Uint8Array(event.data);
        await this.decoder.decode(data);
      } catch (error) {
        self.postMessage({
          type: "error",
          error: "Failed to decode frame: " + (error as Error).message,
        });
      }
    };

    this.websocket.onerror = (error) => {
      self.postMessage({
        type: "error",
        error: "WebSocket error: " + error,
      });
    };

    this.websocket.onclose = () => {
      self.postMessage({ type: "wsDisconnected" });
    };
  }

  private handleResize(width: number, height: number) {
    if (this.decoder) {
      this.decoder.resetDecoder(width, height);
    }
  }

  private cleanup() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    if (this.decoder) {
      this.decoder.destroy();
      this.decoder = null;
    }
  }
}

// Initialize the worker
new VideoDecoderWorker();

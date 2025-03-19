import React, {
  useEffect,
  useCallback,
  MouseEventHandler,
  useRef,
  useContext,
} from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";
import { useMouseHandler } from "../../hooks/useMouseHandler";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import { VideoStreamManager } from "../../utils/VideoStreamManager";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";
import useProtobufTypes from "../../hooks/useProtobufTypes";

const MAX_SPEED = 100;
const SPEED_INCREMENT = 45 / 40;

function useKeyPressHandler() {
  const { sendRawMessage } = useWebSocketConnection();
  const { moveSpeed } = useContext(PathTracerParamsContext);
  const moveSpeedInternal = React.useRef(moveSpeed.toString());
  const initialKeyPressTimeoutMap = React.useRef<any>({});
  const keyPressIntervalMap = React.useRef<any>({});
  const { Event, CameraEvent } = useProtobufTypes();

  useEffect(() => {
    moveSpeedInternal.current = moveSpeed.toString();
  }, [moveSpeed]);

  // deprecated: speed is now controlled by the slider
  const increaseSpeed = useCallback(() => {
    const newSpeed = parseFloat(moveSpeedInternal.current) + SPEED_INCREMENT;
    moveSpeedInternal.current =
      newSpeed > MAX_SPEED ? MAX_SPEED.toString() : newSpeed.toString();
  }, []);

  const keyPressHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!Event || !CameraEvent) {
        return;
      }
      const key = event.key.toUpperCase();
      // increaseSpeed();
      let eventData = {};
      switch (key) {
        case "W":
          eventData = {
            // @ts-ignore
            type: CameraEvent.Type.FORWARD,
            moveSpeed: Number(moveSpeedInternal.current),
          };
          break;
        case "A":
          eventData = {
            // @ts-ignore
            type: CameraEvent.Type.LEFT,
            moveSpeed: Number(moveSpeedInternal.current),
          };
          break;
        case "S":
          eventData = {
            // @ts-ignore
            type: CameraEvent.Type.BACKWARD,
            moveSpeed: Number(moveSpeedInternal.current),
          };
          break;
        case "D":
          eventData = {
            // @ts-ignore
            type: CameraEvent.Type.RIGHT,
            moveSpeed: Number(moveSpeedInternal.current),
          };
          break;
        case "Q":
          eventData = {
            // @ts-ignore
            type: CameraEvent.Type.DOWN,
            moveSpeed: Number(moveSpeedInternal.current),
          };
          break;
        case "E":
          eventData = {
            // @ts-ignore
            type: CameraEvent.Type.UP,
            moveSpeed: Number(moveSpeedInternal.current),
          };
          break;
        case "[":
          if (!event.ctrlKey) {
            return;
          }
          // @ts-ignore
          eventData = { type: CameraEvent.Type.FOV_DECREASE };
          break;
        case "]":
          if (!event.ctrlKey) {
            return;
          }
          // @ts-ignore
          eventData = { type: CameraEvent.Type.FOV_INCREASE };
          break;
        default:
          return;
      }
      // @ts-ignore
      const cameraEventMessage = CameraEvent.create(eventData);
      const message = Event.create({
        // @ts-ignore
        type: Event.EventType.CAMERA_EVENT,
        camera: cameraEventMessage,
      });
      sendRawMessage(Event.encode(message).finish());
    },
    [moveSpeedInternal, sendRawMessage, increaseSpeed, Event, CameraEvent]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        keyPressIntervalMap.current[event.key] ||
        initialKeyPressTimeoutMap.current[event.key]
      ) {
        return;
      }
      keyPressHandler(event);
      initialKeyPressTimeoutMap.current[event.key] = setTimeout(() => {
        keyPressIntervalMap.current[event.key] = setInterval(() => {
          keyPressHandler(event);
        }, 50);
      }, 300);
    },
    [keyPressHandler]
  );

  const onKeyUp = useCallback((event: KeyboardEvent) => {
    clearInterval(keyPressIntervalMap.current[event.key]);
    delete keyPressIntervalMap.current[event.key];
    clearTimeout(initialKeyPressTimeoutMap.current[event.key]);
    delete initialKeyPressTimeoutMap.current[event.key];

    // moveSpeedInternal.current = MIN_SPEED.toString();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
}

function useFrameHandler(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const streamManager = useRef<VideoStreamManager | null>(null);
  const { jobId } = useContext(JobSettingsContext);
  const { width, height } = useContext(PathTracerParamsContext);

  useEffect(() => {
    if (canvasRef.current !== null && streamManager.current === null && jobId) {
      streamManager.current = new VideoStreamManager(jobId, canvasRef.current);
    }
  }, [canvasRef.current, jobId]);

  useEffect(() => {
    streamManager.current?.resize(width, height);
  }, [width, height]);
}

export default function RenderStream() {
  useKeyPressHandler();
  const { sendRawMessage } = useWebSocketConnection();
  const { width, height } = useContext(PathTracerParamsContext);
  const { Event } = useProtobufTypes();

  const mouseMoveHandler: MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      const { movementX, movementY } = e;
      // @ts-ignore
      const message = Event.create({
        // @ts-ignore
        type: Event.EventType.MOUSE_MOVE,
        mouseMove: {
          xOffset: movementX,
          yOffset: movementY,
        },
      });
      // @ts-ignore
      sendRawMessage(Event.encode(message).finish());
    },
    [sendRawMessage, Event]
  );
  const { handleMouseDown, handleMouseMove } =
    useMouseHandler(mouseMoveHandler);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFrameHandler(canvasRef);

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      <canvas
        id="renderCanvas"
        ref={canvasRef}
        width={width}
        height={height}
      ></canvas>
    </section>
  );
}

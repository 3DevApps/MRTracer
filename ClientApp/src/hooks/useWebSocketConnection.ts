import { useContext } from "react";
import { WebsocketContext } from "../contexts/WebsocketContext";

export function useWebSocketConnection() {
  return useContext(WebsocketContext);
}

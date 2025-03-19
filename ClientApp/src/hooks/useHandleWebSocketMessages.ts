import { useCallback, useContext, useEffect, useState } from "react";
import { RenderStatistics } from "../components/renderer-statistics/RenderStatistics";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { JobSettingsContext } from "../contexts/JobSettingsContext";
import { message as messageApi } from "antd";

export function useHandleWebSocketMessages() {
  const { message, sendMessage } = useContext(WebsocketContext);
  const { setIsAdmin, isDebugJob } = useContext(JobSettingsContext);
  const [renderStatistics, setRenderStatistics] = useState<RenderStatistics>(
    []
  );
  const [shouldOpenConnectionSetupModal, setShouldOpenConnectionSetupModal] =
    useState(false);

  const notifyUser = useCallback(
    (data: any) => (isDebugJob ? console.log(data) : messageApi.open(data)),
    [isDebugJob]
  );

  useEffect(() => {
    console.log("message", message);
    if (!message) {
      return;
    }
    const type = message[0];
    switch (type) {
      case "GET_CONNECTION_DETAILS":
        setShouldOpenConnectionSetupModal(true);
        break;
      case "CONNECTION_DETAILS_OK":
        setShouldOpenConnectionSetupModal(false);
        notifyUser({
          key: "Connection details",
          type: "success",
          content: "Connection details saved successfully",
        });
        break;
      case "RENDER_STATS":
        setRenderStatistics(message.splice(1));
        break;
      case "CONFIG":
        // jobId
        const url = new URL(window.location.href);
        url.searchParams.set("jobId", message[1]);
        window.history.pushState(null, "", url.toString());
        // isAdmin
        setIsAdmin(message[2] === "true");
        break;
      case "NOTIFICATION":
        switch (message[1]) {
          case "LOADING":
            notifyUser({
              key: message[2],
              type: "loading",
              content: message[3],
              duration: 0,
            });
            break;
          case "SUCCESS":
            notifyUser({
              key: message[2],
              type: "success",
              content: message[3],
            });
            break;
          case "ERROR":
            notifyUser({
              key: message[2],
              type: "error",
              content: message[3],
            });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }, [message, sendMessage, setIsAdmin, notifyUser]);

  return {
    renderStatistics,
    shouldOpenConnectionSetupModal,
    setShouldOpenConnectionSetupModal,
  };
}

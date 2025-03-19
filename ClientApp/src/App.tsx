import "./App.css";
import Header from "./components/header/Header";
import PathTracerSettings from "./components/path-tracer-settings/PathTracerSettings";
import RenderStream from "./components/renderer-stream/RenderStream";
import RenderStatistics from "./components/renderer-statistics/RenderStatistics";
import { useHandleWebSocketMessages } from "./hooks/useHandleWebSocketMessages";
import { WebsocketContextProvider } from "./contexts/WebsocketContext";
import { JobSettingsContextProvider } from "./contexts/JobSettingsContext";
import { PathTracerParamsContextProvider } from "./contexts/PathTracerParamsContext";
import { StatisticsContextProvider } from "./contexts/StatisticsContext";
import ConnectionSetupModal from "./components/connection-setup/ConnectionSetupModal";

function App() {
  const { renderStatistics, shouldOpenConnectionSetupModal } =
    useHandleWebSocketMessages();

  return (
    <main>
      <Header />
      <div className="main-view-wrapper">
        <PathTracerSettings />
        <RenderStream />
        <RenderStatistics renderStatistics={renderStatistics} />
        <ConnectionSetupModal isModalOpen={shouldOpenConnectionSetupModal} />
      </div>
    </main>
  );
}

export default function AppWrapper() {
  return (
    <WebsocketContextProvider>
      <JobSettingsContextProvider>
        <PathTracerParamsContextProvider>
          <StatisticsContextProvider>
            <App />
          </StatisticsContextProvider>
        </PathTracerParamsContextProvider>
      </JobSettingsContextProvider>
    </WebsocketContextProvider>
  );
}

const WebSocketMessageUtils = require("./WebSocketMessageUtils");

const uuidv4 = require("uuid").v4;

class WebSocketConnectionStateHandler {
  constructor(clients, jobManager) {
    this.clients = clients;
    this.jobManager = jobManager;
  }

  handleNewConnection(ws, req) {
    const parsedUrl = new URL(req.url, "http://com.example");

    const jobId = parsedUrl.searchParams.get("jobId") || uuidv4();
    ws._jobId = jobId;
    ws._isPathTracingClient = false;

    if (
      parsedUrl.searchParams.has("jobId") &&
      parsedUrl.searchParams.has("path-tracing-job")
    ) {
      this.clients.addPathTracingClient(
        parsedUrl.searchParams.get("jobId"),
        ws
      );
      ws._isPathTracingClient = true;
      return;
    }

    this.clients.addClientToJob(jobId, ws);
    const isFirstClient = this.clients.isAdmin(jobId, ws);

    ws.send(WebSocketMessageUtils.encodeMessage(["CONFIG", jobId, isFirstClient]));

    const isDebugJob = parsedUrl.searchParams.has("debugJob");

    ws._shouldConfigureJob = false;
    if (this.jobManager.registerJob(jobId) && isFirstClient && !isDebugJob) {
      ws._shouldConfigureJob = true;
      ws.send(WebSocketMessageUtils.encodeMessage(["GET_CONNECTION_DETAILS"]));
    }
  }

  handleConnectionClose(ws) {
    const isAdmin = this.clients.isAdmin(ws._jobId, ws);
    this.clients.removeClient(ws);
    if (!this.clients.getClients(ws._jobId)) {
      this.jobManager.killJob(ws._jobId);
    }

    if (isAdmin) {
      this.clients
        .getAdminClient(ws._jobId)
        ?.send(WebSocketMessageUtils.encodeMessage(["IS_ADMIN", true]));
    }
  }
}

module.exports = WebSocketConnectionStateHandler;

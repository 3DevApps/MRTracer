const WebSocketClientHandler = require("./src/WebSocketClientHandler.js");
const PathTracingJobManager = require("./src/PathTracingJobManager.js");
const WebSocketMessageHandler = require("./src/WebSocketMessageHandler.js");

const clients = new WebSocketClientHandler();
const jobManager = new PathTracingJobManager(clients);
const messageHandler = new WebSocketMessageHandler(clients, jobManager);

module.exports = {
  clients,
  jobManager,
  messageHandler,
};

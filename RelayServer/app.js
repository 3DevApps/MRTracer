require("dotenv").config({ path: __dirname + "/config/.env" });
const WebSocketServer = require("ws").WebSocketServer;
const WebSocketConnectionStateHandler = require("./src/WebSocketConnectionStateHandler.js");
const { clients, jobManager, messageHandler } = require("./instances.js");
const http = require("http");
const app = require("./src/HttpServer.js");

const PORT = process.env.NODE_ENV === "production" ? 22636 : 8080;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const connectionStateHandler = new WebSocketConnectionStateHandler(
  clients,
  jobManager
);

wss.on("connection", (ws, req) => {
  connectionStateHandler.handleNewConnection(ws, req);
  ws.on("message", (message) => messageHandler.handleMessage(ws, message));
  ws.on("close", () => connectionStateHandler.handleConnectionClose(ws));
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});
